import React, { useContext, useState } from 'react';
import {
    AppBar,
    Button,
    Checkbox,
    Container,
    Dialog,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    IconButton,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Slide,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { ALL_WINES_QUERY, Cepage, WineContext, WineSearchQuery } from '../../contexts/wine-context';
import { CellarContext } from '../../contexts/cellar-context';
import { WineRegionsObject } from './WineDialog/WineDialog';
import RegionForm from './WineDialog/RegionForm';
import CepagesForm from './WineDialog/CepagesForm';
import useWineContext from '../../hooks/useWineContext';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction='up' ref={ref} {...props} />;
});

interface WineSearchDialogProps {
    isOpen: boolean;
    handleClose: () => void;
}

const WineSearchDialog = (props: WineSearchDialogProps) => {
    const { isOpen, handleClose } = props;
    const wineContext = useContext(WineContext);
    const cellarContext = useContext(CellarContext);
    const { searchWine, setQuery, aggregation } = useWineContext();

    const [cellarId, setCellarId] = useState<string>(wineContext.wineSearchQuery.cellarId);
    const [showStock, setShowStock] = useState<boolean>(wineContext.wineSearchQuery.showStock);
    const [showDrunk, setShowDrunk] = useState<boolean>(wineContext.wineSearchQuery.showDrunk);
    const [nameOrProducer, setNameOrProducer] = useState<string>(wineContext.wineSearchQuery.nameOrProducer ?? '');
    const [regions, setRegions] = useState<WineRegionsObject>({
        country: wineContext.wineSearchQuery.country ?? null,
        region_1: wineContext.wineSearchQuery.region_1 ?? '',
        region_2: wineContext.wineSearchQuery.region_2 ?? '',
        region_3: wineContext.wineSearchQuery.region_3 ?? '',
        region_4: wineContext.wineSearchQuery.region_4 ?? '',
        region_5: wineContext.wineSearchQuery.region_5 ?? '',
    });
    const [cepages, setCepages] = useState<Cepage[]>([]); // MYMEMO: これだけcontextからとってこれてない
    const [drunkAt, setDrunkAt] = useState<{ gte: string; lte: string; }>({ gte: '', lte: '' });
    // MYMEMO: add hasNote

    const handleSearch = () => {
        const searchQuery: WineSearchQuery = {
            cellarId,
            showStock,
            showDrunk,
            nameOrProducer,
            ...regions,
            cepages,
            drunkAt,
        };
        searchWine(searchQuery);
        handleClose();
    };

    const setQueryForAll = () => {
        setCellarId(ALL_WINES_QUERY.cellarId);
        setShowStock(ALL_WINES_QUERY.showStock);
        setShowDrunk(ALL_WINES_QUERY.showDrunk);
        setNameOrProducer(ALL_WINES_QUERY.nameOrProducer);
        setRegions({
            country: ALL_WINES_QUERY.country,
            region_1: ALL_WINES_QUERY.region_1,
            region_2: ALL_WINES_QUERY.region_2,
            region_3: ALL_WINES_QUERY.region_3,
            region_4: ALL_WINES_QUERY.region_4,
            region_5: ALL_WINES_QUERY.region_5,
        });
        setCepages(ALL_WINES_QUERY.cepages);
        setQuery();
    };

    const resetQuery = () => {
        const firstCellarId = cellarContext.cellarList[0].id;
        setCellarId(firstCellarId);
        setShowStock(true);
        setShowDrunk(false);
        setNameOrProducer(ALL_WINES_QUERY.nameOrProducer);
        setRegions({
            country: ALL_WINES_QUERY.country,
            region_1: ALL_WINES_QUERY.region_1,
            region_2: ALL_WINES_QUERY.region_2,
            region_3: ALL_WINES_QUERY.region_3,
            region_4: ALL_WINES_QUERY.region_4,
            region_5: ALL_WINES_QUERY.region_5,
        });
        setCepages(ALL_WINES_QUERY.cepages);
        setQuery({ cellarId: firstCellarId, showDrunk: false, showStock: true });
    };

    return (
        <Dialog fullScreen open={isOpen} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar position='sticky'>
                <Toolbar>
                    <IconButton edge='start' color='inherit' onClick={handleClose} aria-label='close'>
                        <CloseIcon />
                    </IconButton>
                    <div style={{ flexGrow: 1 }} />
                    <Button color='inherit' onClick={setQueryForAll}>
                        All
                    </Button>
                    <Button color='inherit' onClick={resetQuery}>
                        Reset
                    </Button>
                    <Button color='inherit' variant='outlined' onClick={handleSearch}>
                        Search
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth='md' sx={{ marginTop: 3, marginBottom: 3 }}>
                <Grid container spacing={2}>
                    {cellarContext.cellarList.length > 2 ? (
                        <Grid item xs={6}>
                            <Select id='cellar-select' value={cellarId} onChange={event => setCellarId(event.target.value)} fullWidth>
                                {cellarContext.cellarList.map(cellar => (
                                    <MenuItem key={cellar.id} value={cellar.id}>
                                        {cellar.name}
                                    </MenuItem>
                                ))}
                                <MenuItem value='NOT_IN_CELLAR'>NOT_IN_CELLAR</MenuItem>
                                <MenuItem value='-'>ALL_WINES</MenuItem>
                            </Select>
                        </Grid>
                    ) : (
                        <Grid item xs={6}>
                            <FormControl>
                                <FormLabel>Cellar Select</FormLabel>
                                <RadioGroup name='cellar-select-radio-group' value={cellarId} onChange={event => setCellarId(event.target.value)}>
                                    {cellarContext.cellarList.map(cellar => (
                                        <FormControlLabel key={cellar.id} value={cellar.id} control={<Radio />} label={cellar.name} />
                                    ))}
                                    <FormControlLabel value='NOT_IN_CELLAR' control={<Radio />} label='NOT_IN_CELLAR' />
                                    <FormControlLabel value='-' control={<Radio />} label='ALL_WINES' />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    )}
                    <Grid item xs={3}>
                        <FormControlLabel control={<Checkbox checked={showStock} onChange={e => setShowStock(e.target.checked)} />} label='Stock' />
                    </Grid>
                    <Grid item xs={3}>
                        <FormControlLabel control={<Checkbox checked={showDrunk} onChange={e => setShowDrunk(e.target.checked)} />} label='Drunk' />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label='name/producer'
                            value={nameOrProducer}
                            onChange={event => {
                                setNameOrProducer(event.target.value);
                            }}
                            variant='standard'
                            fullWidth
                        />
                    </Grid>
                    <RegionForm
                        regions={regions}
                        setRegions={setRegions}
                        // MYMEMO: This is a workaround for region form not updating on setQueryForAll. But without freeSolo, warning shows on WineDialog when entering new regions.
                        freeSolo={false}
                    />
                    <CepagesForm cepages={cepages} setCepages={setCepages} />
                    <Grid item xs={6}>
                        <TextField
                            label='drunk_at_gte'
                            value={drunkAt.gte}
                            onChange={event => {
                                setDrunkAt(prev => { return { gte: event.target.value, lte: prev.lte }; });
                            }}
                            variant='standard'
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label='drunk_at_lte'
                            value={drunkAt.lte}
                            onChange={event => {
                                setDrunkAt(prev => { return { lte: event.target.value, gte: prev.gte }; });
                            }}
                            variant='standard'
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h4">Aggregation</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>Total Price: {aggregation.price.total.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>Average Price: {aggregation.price.average.toLocaleString()}</Typography>
                    </Grid>
                </Grid>
            </Container>
        </Dialog>
    );
};

export default WineSearchDialog;
