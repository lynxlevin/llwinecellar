import React, { useState, useContext } from 'react';
import { AppBar, Button, Container, Dialog, Grid, IconButton, Slide, TextField, Toolbar, Typography, Autocomplete, Chip, Slider } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { Cepage, WineData } from '../../../contexts/wine-context';
import { WineRequestBody, WineAPI } from '../../../apis/WineAPI';
import { AxiosError } from 'axios';
import { WineTagContext } from '../../../contexts/wine-tag-context';
import useWineTagAPI from '../../../hooks/useWineTagAPI';
import { WineDialogAction } from '../../../hooks/useWineSearchPage';
import useWineRegionAPI from '../../../hooks/useWineRegionAPI';
import CepagesForm from './CepagesForm';
import RegionForm from './RegionForm';
import CellarPositionForm from './CellarPositionForm';
import SameWinesDialog from './SameWinesDialog';
import useWineContext from '../../../hooks/useWineContext';
import { format } from 'date-fns';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction='up' ref={ref} {...props} />;
});

interface WineDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    selectedWine?: WineData;
    action: WineDialogAction;
}

export interface WineRegionsObject {
    country: string | null;
    region_1: string;
    region_2: string;
    region_3: string;
    region_4: string;
    region_5: string;
}

export interface ValidationErrorsType {
    name?: string;
    cepages?: string;
    position?: string;
}

export interface apiErrorsType {
    country?: string;
    cellar_id?: string;
    position?: string;
}

const noCellarCode = 'NOT_IN_CELLAR';

const SELECTED_WINE_DEFAULT: WineData = {
    id: '',
    name: '',
    producer: '',
    country: null,
    region_1: '',
    region_2: '',
    region_3: '',
    region_4: '',
    region_5: '',
    cepages: [],
    vintage: null,
    bought_at: null,
    bought_from: '',
    price: null,
    drunk_at: null,
    note: '',
    tag_texts: [],
    cellar_id: noCellarCode,
    position: '',
    value: null,
};

const WineDialog = (props: WineDialogProps) => {
    const { isOpen, handleClose, selectedWine = SELECTED_WINE_DEFAULT, action } = props;

    const wineTagContext = useContext(WineTagContext);

    const { searchWine } = useWineContext();
    const { getWineTagList } = useWineTagAPI();
    const { getWineRegionList } = useWineRegionAPI();

    const [tagTexts, setTagTexts] = useState<string[]>(selectedWine.tag_texts);
    const [name, setName] = useState<string>(selectedWine.name);
    const [producer, setProducer] = useState<string>(selectedWine.producer);
    const [vintage, setVintage] = useState<number | null>(selectedWine.vintage);
    const [regions, setRegions] = useState<WineRegionsObject>({
        country: selectedWine.country,
        region_1: selectedWine.region_1,
        region_2: selectedWine.region_2,
        region_3: selectedWine.region_3,
        region_4: selectedWine.region_4,
        region_5: selectedWine.region_5,
    });
    const [cepages, setCepages] = useState<Cepage[]>(selectedWine.cepages);
    const [boughtAt, setBoughtAt] = useState<Date | null>(selectedWine.bought_at ? new Date(selectedWine.bought_at) : action === 'create' ? new Date() : null);
    const [boughtFrom, setBoughtFrom] = useState<string>(selectedWine.bought_from);
    const [price, setPrice] = useState<number | null>(selectedWine.price);
    const [drunkAt, setDrunkAt] = useState<Date | null>(selectedWine.drunk_at ? new Date(selectedWine.drunk_at) : null);
    const [note, setNote] = useState<string>(selectedWine.note);
    const [cellarId, setCellarId] = useState<string | null>(selectedWine.cellar_id ?? noCellarCode);
    const [position, setPosition] = useState<string | null>(selectedWine.position);
    const [value, setValue] = useState<number>(selectedWine.value ?? 0);

    const [validationErrors, setValidationErrors] = useState<ValidationErrorsType>({});
    const [apiErrors, setApiErrors] = useState<apiErrorsType>({});

    const [dontMove, setDontMove] = useState<boolean>(action === 'edit');

    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState<boolean>(false);

    const copyFromHistory = (data: WineData) => {
        setName(data.name);
        setProducer(data.producer);
        setRegions({
            country: data.country,
            region_1: data.region_1,
            region_2: data.region_2,
            region_3: data.region_3,
            region_4: data.region_4,
            region_5: data.region_5,
        });
        setCepages(data.cepages);
    };

    const fillDrunkAtAndMoveOutOfCellar = () => {
        if (!drunkAt) setDrunkAt(new Date());
        setDontMove(false);
        setCellarId(noCellarCode);
    };

    const addValidationError = (error: ValidationErrorsType) => {
        setValidationErrors(current => {
            return { ...current, ...error };
        });
    };

    const removeValidationError = (key: keyof ValidationErrorsType) => {
        setValidationErrors(current => {
            delete current[key];
            return current;
        });
    };

    const validateOnSave = (): boolean => {
        setApiErrors({});
        let isValid = true;

        if (Object.keys(validationErrors).length > 0) isValid = false;
        if (name === '') {
            addValidationError({ name: 'Name cannot be empty.' });
            isValid = false;
        }
        if (cellarId !== noCellarCode && position === null && !dontMove) {
            addValidationError({ position: 'Position cannot be empty while a cellar is selected.' });
            isValid = false;
        }
        return isValid;
    };

    const handleSave = async () => {
        if (!validateOnSave()) return;

        const data: WineRequestBody = {
            name: name,
            producer: producer,
            ...regions,
            cepages: cepages.sort((a, b) => Number(b.percentage)! - Number(a.percentage)!),
            vintage: vintage,
            bought_at: boughtAt ? format(boughtAt, 'yyyy-MM-dd') : null,
            bought_from: boughtFrom,
            price: price,
            drunk_at: drunkAt ? format(drunkAt, 'yyyy-MM-dd') : null,
            note: note,
            tag_texts: tagTexts,
            cellar_id: cellarId,
            position: position,
            value: value === 0 ? null : value,
        };
        if (action === 'edit' && dontMove) {
            // MYMEMO(後日): 汚い。null | undefined | string の使い分けはよろしくない。
            data.cellar_id = undefined;
            data.position = undefined;
        } else if (cellarId === noCellarCode) {
            data.cellar_id = null;
            data.position = null;
        }

        const newTagCreated = !tagTexts.every(tag => wineTagContext.wineTagList.includes(tag));
        if (action === 'create') {
            await WineAPI.create(data)
                .then(async _ => {
                    searchWine();
                    await getWineRegionList();
                    if (newTagCreated) await getWineTagList();
                    handleClose();
                })
                .catch((err: AxiosError<{ country?: string; cellar_id?: string; position?: string }>) => {
                    setApiErrors(err.response!.data as apiErrorsType);
                });
        } else if (action === 'edit') {
            await WineAPI.update(selectedWine.id, data)
                .then(async _ => {
                    searchWine();
                    await getWineRegionList();
                    if (newTagCreated) await getWineTagList();
                    handleClose();
                })
                .catch((err: AxiosError<{ country?: string; cellar_id?: string; position?: string }>) => {
                    setApiErrors(err.response!.data as apiErrorsType);
                });
        }
    };

    return (
        <Dialog fullScreen open={isOpen} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar position='sticky'>
                <Toolbar>
                    <IconButton edge='start' color='inherit' onClick={handleClose} aria-label='close'>
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
                        {action === 'create' ? 'Create' : 'Edit'}
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
            <Container maxWidth='md' sx={{ marginTop: 3, marginBottom: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Button variant='outlined' onClick={() => setIsNoteDialogOpen(true)}>
                            View note
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <SameWinesDialog name={name} producer={producer} copyFromHistory={copyFromHistory} action={action} />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            options={wineTagContext.wineTagList}
                            value={tagTexts}
                            freeSolo
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => <Chip variant='outlined' label={option} {...getTagProps({ index })} />)
                            }
                            renderInput={params => <TextField {...params} variant='filled' label='tag_texts' />}
                            onChange={(_, newValue: string[]) => {
                                setTagTexts(newValue);
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label='name'
                            error={Boolean(validationErrors.name)}
                            helperText={validationErrors.name ? validationErrors.name : ''}
                            value={name}
                            onChange={event => {
                                if (event.target.value.length === 0) {
                                    addValidationError({ name: 'Name cannot be empty.' });
                                } else {
                                    removeValidationError('name');
                                }
                                setName(event.target.value);
                            }}
                            variant='standard'
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={9}>
                        <TextField
                            label='producer'
                            value={producer}
                            onChange={event => {
                                setProducer(event.target.value);
                            }}
                            variant='standard'
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField
                            label='vintage'
                            value={vintage ?? ''}
                            onChange={event => {
                                const value = event.target.value === '' ? null : Number(event.target.value);
                                setVintage(value);
                            }}
                            variant='standard'
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={9}>
                        <DatePicker
                            label='bought_at'
                            onChange={(date: Date | null) => {
                                setBoughtAt(date);
                            }}
                            value={boughtAt}
                            showDaysOutsideCurrentMonth
                            closeOnSelect
                            slotProps={{ field: { clearable: true, onClear: () => setBoughtAt(null) } }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField
                            label='price'
                            value={price ?? ''}
                            onChange={event => {
                                const value = event.target.value === '' ? null : Number(event.target.value);
                                setPrice(value);
                            }}
                            variant='standard'
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        {/* MYMEMO: Change to autoComplete */}
                        <TextField
                            label='bought_from'
                            value={boughtFrom}
                            onChange={event => {
                                setBoughtFrom(event.target.value);
                            }}
                            variant='standard'
                            fullWidth
                        />
                    </Grid>
                    <RegionForm regions={regions} setRegions={setRegions} showDetails />
                    <CepagesForm cepages={cepages} setCepages={setCepages} showDetails />
                    <Grid item xs={8}>
                        <DatePicker
                            label='drunk_at'
                            value={drunkAt}
                            onChange={(date: Date | null) => {
                                setDrunkAt(date);
                            }}
                            showDaysOutsideCurrentMonth
                            closeOnSelect
                            slotProps={{ field: { clearable: true, onClear: () => setBoughtAt(null) } }}
                        />
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'center' }}>
                        <Button variant='contained' sx={{ marginTop: '10px' }} onClick={fillDrunkAtAndMoveOutOfCellar}>
                            Drink
                        </Button>
                    </Grid>
                    <CellarPositionForm
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
                    />
                </Grid>
            </Container>
            <Dialog fullWidth scroll='paper' onClose={() => setIsNoteDialogOpen(false)} open={isNoteDialogOpen}>
                <Container sx={{ padding: 2 }}>
                    <Typography>value</Typography>
                    <Slider
                        value={value}
                        min={0}
                        max={100}
                        sx={value === 0 ? { color: 'lightgrey' } : {}}
                        onChange={(_, newValue) => setValue(newValue as number)}
                    />
                    <TextField
                        label='note'
                        value={note}
                        onChange={event => {
                            setNote(event.target.value);
                        }}
                        variant='standard'
                        fullWidth
                        minRows={16}
                        multiline
                    />
                </Container>
            </Dialog>
        </Dialog>
    );
};

export default WineDialog;
