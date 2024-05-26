import React, { useContext, useState } from 'react';
import { AppBar, Button, Checkbox, Container, Dialog, FormControl, FormControlLabel, FormLabel, Grid, IconButton, MenuItem, Radio, RadioGroup, Select, Slide, TextField, Toolbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { Cepage, WineContext, WineSearchQuery } from '../../contexts/wine-context';
import { CellarContext } from '../../contexts/cellar-context';
import { WineRegionsObject } from './WineDialog/WineDialog';
import RegionForm from './WineDialog/RegionForm';
import CepagesForm from './WineDialog/CepagesForm';
import useWineAPI from '../../hooks/useWineAPI';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface WineSearchDialogProps {
    isOpen: boolean;
    handleClose: () => void;
}

const WineSearchDialog = (props: WineSearchDialogProps) => {
    const { isOpen, handleClose } = props;
    const wineContext = useContext(WineContext);
    const cellarContext = useContext(CellarContext);
    const { searchWine } = useWineAPI();

    const [cellarId, setCellarId] = useState<string | undefined>(wineContext.wineListQuery.cellarId);
    const [showStock, setShowStock] = useState<boolean>(true);
    const [showDrunk, setShowDrunk] = useState<boolean>(false);
    const [nameOrProducer, setNameOrProducer] = useState<string>('');
    const [regions, setRegions] = useState<WineRegionsObject>({
        country: null,
        region1: '',
        region2: '',
        region3: '',
        region4: '',
        region5: '',
    })
    const [cepages, setCepages] = useState<Cepage[]>([]);

    const handleSearch = async () => {
        const query: WineSearchQuery = {
            show_stock: showStock,
            show_drunk: showDrunk,
        };
        if (cellarId !== '-' && cellarId !== 'NOT_IN_CELLAR') query.cellar_id = cellarId;
        if (cellarId === 'NOT_IN_CELLAR') query.out_of_cellars = true;
        if (nameOrProducer) query.name_or_producer = nameOrProducer;
        if (regions.country) query.country = regions.country;
        // MYMEMO: maybe normalizing is not needed.
        if (regions.region1 !== '') query.region_1 = regions.region1.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (regions.region2 !== '') query.region_2 = regions.region2.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (regions.region3 !== '') query.region_3 = regions.region3.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (regions.region4 !== '') query.region_4 = regions.region4.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (regions.region5 !== '') query.region_5 = regions.region5.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (cepages.length > 0) query.cepage_names = cepages.map(cepage => cepage.name);
        wineContext.setWineSearchQuery(query);
        await searchWine(query);
        handleClose();
    };

    const resetQueries = () => {
        setCellarId('-');
        setShowStock(true);
        setShowDrunk(true);
        setNameOrProducer('');
        setRegions({
            country: null,
            region1: '',
            region2: '',
            region3: '',
            region4: '',
            region5: '',
        })
        setCepages([]);
        wineContext.setWineSearchQuery({show_drunk: true, show_stock: true});
    }

    return (
        <Dialog fullScreen open={isOpen} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <div style={{ flexGrow: 1 }} />
                    <Button color='inherit' variant='outlined' onClick={handleSearch}>
                        Search
                    </Button>
                    <Button color='inherit' onClick={resetQueries}>
                        Reset
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ marginTop: 3, marginBottom: 3 }}>
                <Grid container spacing={2}>
                    {cellarContext.cellarList.length > 2 ? (
                            <Grid item xs={6}>
                                <Select id="cellar-select" value={cellarId} onChange={event => setCellarId(event.target.value)} fullWidth>
                                    {cellarContext.cellarList.map(cellar => (
                                        <MenuItem key={cellar.id} value={cellar.id}>
                                            {cellar.name}
                                        </MenuItem>
                                    ))}
                                    <MenuItem value="NOT_IN_CELLAR">NOT_IN_CELLAR</MenuItem>
                                    <MenuItem value="-">ALL_WINES</MenuItem>
                                </Select>
                            </Grid>
                        ) : (
                            <Grid item xs={6}>
                                <FormControl>
                                    <FormLabel>Cellar Select</FormLabel>
                                    <RadioGroup
                                        name="cellar-select-radio-group"
                                        value={cellarId}
                                        onChange={event => setCellarId(event.target.value)}
                                    >
                                        {cellarContext.cellarList.map(cellar => (
                                            <FormControlLabel key={cellar.id} value={cellar.id} control={<Radio />} label={cellar.name} />
                                        ))}
                                        <FormControlLabel value="NOT_IN_CELLAR" control={<Radio />} label="NOT_IN_CELLAR" />
                                        <FormControlLabel value="-" control={<Radio />} label="ALL_WINES" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        )
                    }
                    <Grid item xs={3}>
                        <FormControlLabel control={<Checkbox checked={showStock} onChange={e => setShowStock(e.target.checked)} />} label="Stock" />
                    </Grid>
                    <Grid item xs={3}>
                        <FormControlLabel control={<Checkbox checked={showDrunk} onChange={e => setShowDrunk(e.target.checked)} />} label="Drunk" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="name/producer"
                            value={nameOrProducer}
                            onChange={event => {
                                setNameOrProducer(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <RegionForm
                        regions={regions}
                        setRegions={setRegions}
                        freeSolo={false}  // MYMEMO: This is a workaround for region form not updating on resetQueries. But without freeSolo, warning shows on WineDialog when entering new regions.
                    />
                    <CepagesForm cepages={cepages} setCepages={setCepages} />
                    {/* <Grid item xs={3}>
                        <TextField
                            label="vintage"
                            value={vintage ?? ''}
                            onChange={event => {
                                const value = event.target.value === '' ? null : Number(event.target.value);
                                setVintage(value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid> */}
                    {/* <Grid item xs={6}>
                        <TextField
                            label="bought_at"
                            value={boughtAt ?? ''}
                            onChange={event => {
                                setBoughtAt(event.target.value || null);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="bought_from"
                            value={boughtFrom}
                            onChange={event => {
                                setBoughtFrom(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="price"
                            value={price ?? ''}
                            onChange={event => {
                                const value = event.target.value === '' ? null : Number(event.target.value);
                                setPrice(value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid> */}
                    {/* <RegionForm
                        country={country}
                        region1={region1}
                        region2={region2}
                        region3={region3}
                        region4={region4}
                        region5={region5}
                        setCountry={setCountry}
                        setRegion1={setRegion1}
                        setRegion2={setRegion2}
                        setRegion3={setRegion3}
                        setRegion4={setRegion4}
                        setRegion5={setRegion5}
                    /> */}
                    {/* <CepagesForm cepages={cepages} setCepages={setCepages} /> */}
                    {/* <Grid item xs={8}>
                        <TextField
                            label="drunk_at"
                            value={drunkAt ?? ''}
                            onChange={event => {
                                setDrunkAt(event.target.value || null);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid> */}
                    {/* <CellarPositionForm
                        cellarId={cellarId}
                        position={position}
                        validationErrors={validationErrors}
                        apiErrors={apiErrors}
                        dontMove={dontMove}
                        setCellarId={setCellarId}
                        setPosition={setPosition}
                        setValidationErrors={setValidationErrors}
                        setDontMove={setDontMove}
                        action={action}
                    /> */}
                </Grid>
            </Container>
        </Dialog>
    );
};

export default WineSearchDialog;
