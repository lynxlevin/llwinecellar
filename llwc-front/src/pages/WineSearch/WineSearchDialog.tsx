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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { Cepage, WineContext, WineSearchQuery } from '../../contexts/wine-context';
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
    const { searchWine } = useWineContext();

    const [cellarId, setCellarId] = useState<string | undefined>(wineContext.wineListQuery.cellarId);
    const [showStock, setShowStock] = useState<boolean>(true);
    const [showDrunk, setShowDrunk] = useState<boolean>(false);
    const [nameOrProducer, setNameOrProducer] = useState<string>('');
    const [regions, setRegions] = useState<WineRegionsObject>({
        country: null,
        region_1: '',
        region_2: '',
        region_3: '',
        region_4: '',
        region_5: '',
    });
    const [cepages, setCepages] = useState<Cepage[]>([]);
    // MYMEMO: add hasNote

    const handleSearch = () => {
        const query: WineSearchQuery = {
            show_stock: showStock,
            show_drunk: showDrunk,
        };
        if (cellarId !== '-' && cellarId !== 'NOT_IN_CELLAR') query.cellar_id = cellarId;
        if (cellarId === 'NOT_IN_CELLAR') query.out_of_cellars = true;
        if (nameOrProducer) query.name_or_producer = nameOrProducer;
        if (regions.country) query.country = regions.country;
        if (regions.region_1) query.region_1 = regions.region_1;
        if (regions.region_2) query.region_2 = regions.region_2;
        if (regions.region_3) query.region_3 = regions.region_3;
        if (regions.region_4) query.region_4 = regions.region_4;
        if (regions.region_5) query.region_5 = regions.region_5;
        if (cepages.length > 0) query.cepage_names = cepages.map(cepage => cepage.name);
        wineContext.setWineSearchQuery(query);
        searchWine(query);
        handleClose();
    };

    const resetQueries = () => {
        setCellarId('-');
        setShowStock(true);
        setShowDrunk(true);
        setNameOrProducer('');
        setRegions({
            country: null,
            region_1: '',
            region_2: '',
            region_3: '',
            region_4: '',
            region_5: '',
        });
        setCepages([]);
        wineContext.setWineSearchQuery({ show_drunk: true, show_stock: true });
    };

    return (
        <Dialog fullScreen open={isOpen} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar position='sticky'>
                <Toolbar>
                    <IconButton edge='start' color='inherit' onClick={handleClose} aria-label='close'>
                        <CloseIcon />
                    </IconButton>
                    <div style={{ flexGrow: 1 }} />
                    <Button color='inherit' onClick={resetQueries}>
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
                        // MYMEMO: This is a workaround for region form not updating on resetQueries. But without freeSolo, warning shows on WineDialog when entering new regions.
                        freeSolo={false}
                    />
                    <CepagesForm cepages={cepages} setCepages={setCepages} />
                </Grid>
            </Container>
        </Dialog>
    );
};

export default WineSearchDialog;
