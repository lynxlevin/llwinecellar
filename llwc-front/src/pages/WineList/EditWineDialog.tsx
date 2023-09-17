import React, { useEffect, useState, useContext } from 'react';
import {
    AppBar,
    Button,
    Container,
    Dialog,
    Grid,
    IconButton,
    Slide,
    TextField,
    Toolbar,
    Typography,
    Select,
    MenuItem,
    Autocomplete,
    Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { Cepage, WineContext } from '../../contexts/wine-context';
import { WineRequestBody, WineAPI } from '../../apis/WineAPI';
import useWineAPI from '../../hooks/useWineAPI';
import { AxiosError } from 'axios';
import { WineTagContext } from '../../contexts/wine-tag-context';
import useWineTagAPI from '../../hooks/useWineTagAPI';

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
    cellarList: string[][];
}

interface ValidationErrorsType {
    name?: string;
    cepages?: string;
}

interface apiErrorsType {
    country?: string;
    cellar_id?: string;
    position?: string;
}

const EditWineDialog = (props: EditWineDialogProps) => {
    const { isOpen, handleClose, selectedWineId, cellarList } = props;

    const wineContext = useContext(WineContext);
    const wineTagContext = useContext(WineTagContext);
    const selectedWine = wineContext.wineList.find(wine => wine.id === selectedWineId);

    const { getWineList } = useWineAPI();
    const { getWineTagList } = useWineTagAPI();

    const [tagTexts, setTagTexts] = useState<string[]>(selectedWine ? selectedWine.tag_texts : []);
    const [name, setName] = useState<string>(selectedWine ? selectedWine.name : '');
    const [producer, setProducer] = useState<string>(selectedWine ? selectedWine.producer : '');
    const [vintage, setVintage] = useState<number | null>(selectedWine ? selectedWine.vintage : null);
    const [country, setCountry] = useState<string | null>(selectedWine ? selectedWine.country : null);
    const [region1, setRegion1] = useState<string>(selectedWine ? selectedWine.region_1 : '');
    const [region2, setRegion2] = useState<string>(selectedWine ? selectedWine.region_2 : '');
    const [region3, setRegion3] = useState<string>(selectedWine ? selectedWine.region_3 : '');
    const [region4, setRegion4] = useState<string>(selectedWine ? selectedWine.region_4 : '');
    const [region5, setRegion5] = useState<string>(selectedWine ? selectedWine.region_5 : '');
    const [cepages, setCepages] = useState<Cepage[]>(selectedWine ? selectedWine.cepages : []);
    const [boughtAt, setBoughtAt] = useState<string | null>(selectedWine ? selectedWine.bought_at : null);
    const [boughtFrom, setBoughtFrom] = useState<string>(selectedWine ? selectedWine.bought_from : '');
    const [priceWithTax, setPriceWithTax] = useState<number | null>(selectedWine ? selectedWine.price_with_tax : null);
    const [drunkAt, setDrunkAt] = useState<string | null>(selectedWine ? selectedWine.drunk_at : null);
    const [note, setNote] = useState<string>(selectedWine ? selectedWine.note : '');
    const [cellarId, setCellarId] = useState<string | null>('DO_NOT_CHANGE_PLACE');
    const [position, setPosition] = useState<string | null>(selectedWine ? selectedWine.position : null);

    const [validationErrors, setValidationErrors] = useState<ValidationErrorsType>({});
    const [apiErrors, setApiErrors] = useState<apiErrorsType>({});

    useEffect(() => {
        if (isOpen && selectedWine) {
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
            setCellarId('DO_NOT_CHANGE_PLACE');
            setPosition(selectedWine.position);
            setValidationErrors({});
            setApiErrors({});
        }
    }, [isOpen, selectedWine]);

    const handleSave = async () => {
        if (Object.keys(validationErrors).length > 0 || !selectedWine) return;
        setApiErrors({});
        // MYMEMO(後日): create にある、name と position のバリデーションどうするか？

        const data: WineRequestBody = {
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
        const newTagCreated = !tagTexts.every(tag => wineTagContext.wineTagList.includes(tag));
        if (cellarId === 'MOVE_OUT_OF_CELLAR') {
            data.cellar_id = null;
            data.position = null;
        } else if (cellarId !== 'DO_NOT_CHANGE_PLACE') {
            // MYMEMO(後日): 汚い。null | undefined | string の使い分けはよろしくない。
            data.cellar_id = cellarId;
            data.position = position;
        }
        await WineAPI.update(selectedWine.id, data)
            .then(async _ => {
                await getWineList();
                if (newTagCreated) await getWineTagList();
                handleClose();
            })
            .catch((err: AxiosError<{ country?: string; cellar_id?: string; position?: string }>) => {
                setApiErrors(err.response!.data as unknown as { country: string });
            });
    };

    if (!selectedWine) {
        return <></>;
    }
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
                    <Button
                        autoFocus
                        color={Object.keys(validationErrors).length + Object.keys(apiErrors).length > 0 ? 'error' : 'inherit'}
                        onClick={handleSave}
                    >
                        save
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ marginTop: 3, marginBottom: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            options={wineTagContext.wineTagList}
                            value={tagTexts}
                            freeSolo
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => <Chip variant="outlined" label={option} {...getTagProps({ index })} />)
                            }
                            renderInput={params => <TextField {...params} variant="filled" label="tag_texts" />}
                            onChange={(event: any, newValue: string[]) => {
                                setTagTexts(newValue);
                            }}
                        />
                        {/* MYMEMO(後日): consider using _.throttle or _.debounce on all onChanges */}
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="name"
                            error={Boolean(validationErrors.name)}
                            helperText={validationErrors.name ? validationErrors.name : ''}
                            defaultValue={selectedWine.name}
                            onChange={event => {
                                if (event.target.value.length === 0) {
                                    setValidationErrors(current => {
                                        return { ...current, name: 'Name cannot be empty.' };
                                    });
                                }
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
                            error={Boolean(apiErrors.country)}
                            helperText={apiErrors.country}
                            defaultValue={selectedWine.country}
                            onChange={event => {
                                setCountry(event.target.value || null);
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
                                const value = event.target.value === '' ? null : Number(event.target.value);
                                setPriceWithTax(value);
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
                    <Grid item xs={12}>
                        <Select
                            value={cellarId}
                            onChange={event => {
                                setCellarId(event.target.value);
                            }}
                        >
                            {/* MYMEMO(後日): チェックにしたほうが良さそう */}
                            <MenuItem value="DO_NOT_CHANGE_PLACE">DO_NOT_CHANGE_PLACE</MenuItem>
                            {cellarList.map(cellar => (
                                <MenuItem key={cellar[0]} value={cellar[0]}>
                                    {cellar[1]}
                                </MenuItem>
                            ))}
                            <MenuItem value="MOVE_OUT_OF_CELLAR">MOVE_OUT_OF_CELLAR</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12}>
                        {/* MYMEMO(後日): make this a select */}
                        <TextField
                            label="position"
                            defaultValue={selectedWine.position}
                            onChange={event => {
                                setPosition(event.target.value || null);
                            }}
                            disabled={cellarId === 'DO_NOT_CHANGE_PLACE'}
                            error={Boolean(apiErrors.position)}
                            helperText={apiErrors.position}
                            variant="standard"
                            fullWidth
                            multiline
                        />
                    </Grid>
                </Grid>
            </Container>
        </Dialog>
    );
};

export default EditWineDialog;
