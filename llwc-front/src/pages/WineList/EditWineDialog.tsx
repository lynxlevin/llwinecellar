import React, { useEffect, useState, useContext, useMemo } from 'react';
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
    Checkbox,
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
    position?: string;
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

    const initialValues = useMemo(() => {
        return {
            tagTexts: selectedWine ? selectedWine.tag_texts : [],
            name: selectedWine ? selectedWine.name : '',
            producer: selectedWine ? selectedWine.producer : '',
            vintage: selectedWine ? selectedWine.vintage : null,
            country: selectedWine ? selectedWine.country : null,
            region1: selectedWine ? selectedWine.region_1 : '',
            region2: selectedWine ? selectedWine.region_2 : '',
            region3: selectedWine ? selectedWine.region_3 : '',
            region4: selectedWine ? selectedWine.region_4 : '',
            region5: selectedWine ? selectedWine.region_5 : '',
            cepages: selectedWine ? selectedWine.cepages : [],
            boughtAt: selectedWine ? selectedWine.bought_at : null,
            boughtFrom: selectedWine ? selectedWine.bought_from : '',
            priceWithTax: selectedWine ? selectedWine.price_with_tax : null,
            drunkAt: selectedWine ? selectedWine.drunk_at : null,
            note: selectedWine ? selectedWine.note : '',
            cellarId: selectedWine ? selectedWine.cellar_id : 'MOVE_OUT_OF_CELLAR',
            position: selectedWine ? selectedWine.position : null,
            validationErrors: {},
            apiErrors: {},
            dontMove: true,
        };
    }, [selectedWine]);

    const [tagTexts, setTagTexts] = useState<string[]>(initialValues.tagTexts);
    const [name, setName] = useState<string>(initialValues.name);
    const [producer, setProducer] = useState<string>(initialValues.producer);
    const [vintage, setVintage] = useState<number | null>(initialValues.vintage);
    const [country, setCountry] = useState<string | null>(initialValues.country);
    const [region1, setRegion1] = useState<string>(initialValues.region1);
    const [region2, setRegion2] = useState<string>(initialValues.region2);
    const [region3, setRegion3] = useState<string>(initialValues.region3);
    const [region4, setRegion4] = useState<string>(initialValues.region4);
    const [region5, setRegion5] = useState<string>(initialValues.region5);
    const [cepages, setCepages] = useState<Cepage[]>(initialValues.cepages);
    const [boughtAt, setBoughtAt] = useState<string | null>(initialValues.boughtAt);
    const [boughtFrom, setBoughtFrom] = useState<string>(initialValues.boughtFrom);
    const [priceWithTax, setPriceWithTax] = useState<number | null>(initialValues.priceWithTax);
    const [drunkAt, setDrunkAt] = useState<string | null>(initialValues.drunkAt);
    const [note, setNote] = useState<string>(initialValues.note);
    const [cellarId, setCellarId] = useState<string | null>(initialValues.cellarId);
    const [position, setPosition] = useState<string | null>(initialValues.position);

    const [validationErrors, setValidationErrors] = useState<ValidationErrorsType>(initialValues.validationErrors);
    const [apiErrors, setApiErrors] = useState<apiErrorsType>(initialValues.apiErrors);

    const [dontMove, setDontMove] = useState<boolean>(initialValues.dontMove);

    useEffect(() => {
        if (isOpen) {
            setTagTexts(initialValues.tagTexts);
            setName(initialValues.name);
            setProducer(initialValues.producer);
            setVintage(initialValues.vintage);
            setCountry(initialValues.country);
            setRegion1(initialValues.region1);
            setRegion2(initialValues.region2);
            setRegion3(initialValues.region3);
            setRegion4(initialValues.region4);
            setRegion5(initialValues.region5);
            setCepages(initialValues.cepages);
            setBoughtAt(initialValues.boughtAt);
            setBoughtFrom(initialValues.boughtFrom);
            setPriceWithTax(initialValues.priceWithTax);
            setDrunkAt(initialValues.drunkAt);
            setNote(initialValues.note);
            setCellarId(initialValues.cellarId);
            setPosition(initialValues.position);
            setValidationErrors(initialValues.validationErrors);
            setApiErrors(initialValues.apiErrors);
            setDontMove(initialValues.dontMove);
        }
    }, [initialValues, isOpen]);

    const handleSave = async () => {
        if (Object.keys(validationErrors).length > 0 || !selectedWine) return;
        if (name === '') {
            setValidationErrors({ name: 'Name cannot be empty.' });
            return;
        }
        if (position === null && !dontMove && cellarId !== 'MOVE_OUT_OF_CELLAR') {
            setValidationErrors({ position: 'Position cannot be empty while a cellar is selected.' });
            return;
        }
        setApiErrors({});

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
            cellar_id: cellarId,
            position: position,
        };
        const newTagCreated = !tagTexts.every(tag => wineTagContext.wineTagList.includes(tag));
        if (dontMove) {
            // MYMEMO(後日): 汚い。null | undefined | string の使い分けはよろしくない。
            delete data.cellar_id;
            delete data.position;
        } else if (cellarId === 'MOVE_OUT_OF_CELLAR') {
            data.cellar_id = null;
            data.position = null;
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

    return (
        <Dialog fullScreen open={isOpen} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Edit
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
                            value={name}
                            onChange={event => {
                                if (event.target.value.length === 0) {
                                    setValidationErrors(current => {
                                        return { ...current, name: 'Name cannot be empty.' };
                                    });
                                } else {
                                    setValidationErrors(current => {
                                        const { name, ...rest } = current;
                                        return rest;
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
                            value={producer}
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
                            value={vintage ?? ''}
                            onChange={event => {
                                const value = event.target.value === '' ? null : Number(event.target.value);
                                setVintage(value);
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
                            value={country ?? ''}
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
                            value={region1}
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
                            value={region2}
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
                            value={region3}
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
                            value={region4}
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
                            value={region5}
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
                            value={cepages.length > 0 ? JSON.stringify(cepages) : '[{"name":"","abbreviation":"","percentage":"100.0"}]'}
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
                            label="price_with_tax"
                            value={priceWithTax ?? ''}
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
                            value={drunkAt ?? ''}
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
                            value={note}
                            onChange={event => {
                                setNote(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                            multiline
                        />
                    </Grid>
                    <Grid item xs={10}>
                        <Select
                            value={cellarId}
                            onChange={event => {
                                setCellarId(event.target.value);
                            }}
                            disabled={dontMove}
                        >
                            {cellarList.map(cellar => (
                                <MenuItem key={cellar[0]} value={cellar[0]}>
                                    {cellar[1]}
                                </MenuItem>
                            ))}
                            <MenuItem value="MOVE_OUT_OF_CELLAR">MOVE_OUT_OF_CELLAR</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={2}>
                        <Checkbox
                            checked={dontMove}
                            onChange={event => {
                                setDontMove(event.target.checked);
                            }}
                        />
                        don't move
                    </Grid>
                    <Grid item xs={12}>
                        {/* MYMEMO(後日): make this a select */}
                        <TextField
                            label="position"
                            value={position ?? ''}
                            onChange={event => {
                                if (cellarId === 'NOT_IN_CELLAR' || event.target.value !== '') {
                                    setValidationErrors(current => {
                                        const { position, ...rest } = current;
                                        return rest;
                                    });
                                }
                                setPosition(event.target.value || null);
                            }}
                            disabled={dontMove}
                            error={Boolean(apiErrors.position) || Boolean(validationErrors.position)}
                            helperText={apiErrors.position || validationErrors.position}
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
