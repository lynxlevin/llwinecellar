import React, { useEffect, useState, useContext } from 'react';
import { AppBar, Button, Container, Dialog, Grid, IconButton, Slide, TextField, Toolbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { Cepage, WineData, WineContext } from '../../contexts/wine-context';
import { WineAPI } from '../../apis/WineAPI';
import useWineAPI from '../../hooks/useWineAPI';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface EditWineDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    selectedWineId: string;
}

interface ValidationErrorsType {
    cepages?: string;
}

const EditWineDialog = (props: EditWineDialogProps) => {
    const { isOpen, handleClose, selectedWineId } = props;

    const wineContext = useContext(WineContext);
    const selectedWine = wineContext.wineList.find(wine => wine.id === selectedWineId) as WineData;

    const { getWineList } = useWineAPI();

    const [tagTexts, setTagTexts] = useState<string[]>(selectedWine.tag_texts);
    const [name, setName] = useState<string>(selectedWine.name);
    const [producer, setProducer] = useState<string>(selectedWine.producer);
    const [vintage, setVintage] = useState<number>(selectedWine.vintage);
    const [country, setCountry] = useState<string>(selectedWine.country);
    const [region1, setRegion1] = useState<string>(selectedWine.region_1);
    const [region2, setRegion2] = useState<string>(selectedWine.region_2);
    const [region3, setRegion3] = useState<string>(selectedWine.region_3);
    const [region4, setRegion4] = useState<string>(selectedWine.region_4);
    const [region5, setRegion5] = useState<string>(selectedWine.region_5);
    const [cepages, setCepages] = useState<Cepage[]>(selectedWine.cepages);
    const [boughtAt, setBoughtAt] = useState<string | null>(selectedWine.bought_at);
    const [boughtFrom, setBoughtFrom] = useState<string>(selectedWine.bought_from);
    const [priceWithTax, setPriceWithTax] = useState<number>(selectedWine.price_with_tax);
    const [drunkAt, setDrunkAt] = useState<string | null>(selectedWine.drunk_at);
    const [note, setNote] = useState<string>(selectedWine.note);

    const [validationErrors, setValidationErrors] = useState<ValidationErrorsType>({});

    useEffect(() => {
        if (isOpen) {
            setTagTexts(selectedWine.tag_texts);
            setName(selectedWine.name);
            setProducer(selectedWine.producer);
            setVintage(selectedWine.vintage);
            setCountry(selectedWine.country);
            setRegion1(selectedWine.region_1);
            setRegion2(selectedWine.region_2);
            setRegion3(selectedWine.region_3);
            setRegion4(selectedWine.region_4);
            setRegion5(selectedWine.region_5);
            setCepages(selectedWine.cepages);
            setBoughtAt(selectedWine.bought_at);
            setBoughtFrom(selectedWine.bought_from);
            setPriceWithTax(selectedWine.price_with_tax);
            setDrunkAt(selectedWine.drunk_at);
            setNote(selectedWine.note);
            setValidationErrors({});
        }
    }, [isOpen, selectedWine]);

    const handleSave = async () => {
        if (Object.keys(validationErrors).length > 0) return;

        const data = {
            name: name,
            producer: producer,
            country: country,
            region_1: region1,
            region_2: region2,
            region_3: region3,
            region_4: region4,
            region_5: region5,
            cepages: cepages,
            vintage: vintage,
            bought_at: boughtAt,
            bought_from: boughtFrom,
            price_with_tax: priceWithTax,
            drunk_at: drunkAt,
            note: note,
            tag_texts: tagTexts,
        };
        await WineAPI.update(selectedWine.id, data);
        await getWineList();
        handleClose();
    };

    return (
        <Dialog fullScreen open={isOpen} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Sound
                    </Typography>
                    <Button autoFocus color="inherit" onClick={handleSave}>
                        save
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ marginTop: 3, marginBottom: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {/* MYMEMO(後日): use multiselect with chip https://mui.com/material-ui/react-select/#chip */}
                        {/* MYMEMO(後日): consider using _.throttle or _.debounce on all onChanges */}
                        {/* MYMEMO: show tag_master somewhere */}
                        <TextField
                            label="tag_texts"
                            defaultValue={selectedWine.tag_texts}
                            onChange={event => {
                                setTagTexts(event.target.value === '' ? [] : event.target.value.split(','));
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="name"
                            defaultValue={selectedWine.name}
                            onChange={event => {
                                setName(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={10}>
                        <TextField
                            label="producer"
                            defaultValue={selectedWine.producer}
                            onChange={event => {
                                setProducer(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            label="vintage"
                            defaultValue={selectedWine.vintage}
                            onChange={event => {
                                setVintage(Number(event.target.value));
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="country"
                            defaultValue={selectedWine.country}
                            onChange={event => {
                                setCountry(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="region_1"
                            defaultValue={selectedWine.region_1}
                            onChange={event => {
                                setRegion1(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="region_2"
                            defaultValue={selectedWine.region_2}
                            onChange={event => {
                                setRegion2(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="region_3"
                            defaultValue={selectedWine.region_3}
                            onChange={event => {
                                setRegion3(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="region_4"
                            defaultValue={selectedWine.region_4}
                            onChange={event => {
                                setRegion4(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="region_5"
                            defaultValue={selectedWine.region_5}
                            onChange={event => {
                                setRegion5(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="cepages"
                            error={Boolean(validationErrors.cepages)}
                            helperText={validationErrors.cepages ? validationErrors.cepages : ''}
                            defaultValue={
                                selectedWine.cepages.length > 0 ? JSON.stringify(selectedWine.cepages) : '[{"name":"","abbreviation":"","percentage":"100.0"}]'
                            }
                            // MYMEMO(後日): show grape_master somewhere
                            onChange={event => {
                                try {
                                    setCepages(JSON.parse(event.target.value || '[]'));
                                    setValidationErrors(current => {
                                        const { cepages, ...rest } = current;
                                        return rest;
                                    });
                                } catch (error) {
                                    if (error instanceof SyntaxError) {
                                        setValidationErrors(current => {
                                            return { ...current, cepages: (error as SyntaxError).message };
                                        });
                                    }
                                }
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="bought_at"
                            defaultValue={selectedWine.bought_at}
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
                            defaultValue={selectedWine.bought_from}
                            onChange={event => {
                                setBoughtFrom(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="price_with_tax"
                            defaultValue={selectedWine.price_with_tax}
                            onChange={event => {
                                setPriceWithTax(Number(event.target.value));
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="drunk_at"
                            defaultValue={selectedWine.drunk_at}
                            onChange={event => {
                                setDrunkAt(event.target.value || null);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="note"
                            defaultValue={selectedWine.note}
                            onChange={event => {
                                setNote(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                            multiline
                        />
                    </Grid>
                    {/* MYMEMO: add cellar and position with error from backend (to_space occupied) */}
                </Grid>
            </Container>
        </Dialog>
    );
};

export default EditWineDialog;
