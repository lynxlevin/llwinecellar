import React, { useContext, useState } from 'react';
import { AppBar, Button, Checkbox, Container, Dialog, FormControlLabel, Grid, IconButton, MenuItem, Select, Slide, TextField, Toolbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { ListWineQuery, WineAPI } from '../../apis/WineAPI';
import { WineContext } from '../../contexts/wine-context';
import { CellarContext } from '../../contexts/cellar-context';

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

    const [nameOrProducer, setNameOrProducer] = useState<string>('');
    const [cellarId, setCellarId] = useState<string | undefined>(wineContext.wineListQuery.cellarId);
    const [showStock, setShowStock] = useState<boolean>(true);
    const [showDrunk, setShowDrunk] = useState<boolean>(false);

    const handleSearch = async () => {
        const query: ListWineQuery = {
            show_stock: showStock,
            show_drunk: showDrunk,
        };
        if (nameOrProducer) query.name_or_producer = nameOrProducer;
        if (cellarId !== '-' && cellarId !== 'NOT_IN_CELLAR') query.cellar_id = cellarId;
        if (cellarId === 'NOT_IN_CELLAR') query.out_of_cellars = true;
        const res = await WineAPI.list(query);
        wineContext.setWineList(res.data.wines);
        handleClose();
    };


    const resetQueries = () => {
        setCellarId('-');
        setNameOrProducer('');
        setShowStock(true);
        setShowDrunk(true);
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
