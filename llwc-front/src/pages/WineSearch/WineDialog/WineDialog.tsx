import React, { useEffect, useState, useContext } from 'react';
import { AppBar, Button, Container, Dialog, Grid, IconButton, Slide, TextField, Toolbar, Typography, Autocomplete, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { Cepage, WineData } from '../../../contexts/wine-context';
import { WineRequestBody, WineAPI } from '../../../apis/WineAPI';
import useWineAPI from '../../../hooks/useWineAPI';
import { AxiosError } from 'axios';
import { WineTagContext } from '../../../contexts/wine-tag-context';
import useWineTagAPI from '../../../hooks/useWineTagAPI';
import { WineDialogAction } from '../../../hooks/useWineSearchPage';
import useWineRegionAPI from '../../../hooks/useWineRegionAPI';
import CepagesForm from './CepagesForm';
import RegionForm from './RegionForm';
import CellarPositionForm from './CellarPositionForm';
import SameWinesDialog from './SameWinesDialog';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface WineDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    selectedWine?: WineData;
    action: WineDialogAction;
}

export interface WineRegionsObject {
    country: string | null;
    region1: string;
    region2: string;
    region3: string;
    region4: string;
    region5: string;
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

const getLocaleISODateString = (date_?: Date) => {
    const date = date_ ? date_ : new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

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
    bought_at: getLocaleISODateString(),
    bought_from: '',
    price: null,
    drunk_at: null,
    note: '',
    tag_texts: [],
    cellar_id: noCellarCode,
    position: '',
}

const WineDialog = (props: WineDialogProps) => {
    const { isOpen, handleClose, selectedWine=SELECTED_WINE_DEFAULT, action } = props;

    const wineTagContext = useContext(WineTagContext);

    const { searchWine } = useWineAPI();
    const { getWineTagList } = useWineTagAPI();
    const { getWineRegionList } = useWineRegionAPI();

    const [tagTexts, setTagTexts] = useState<string[]>(selectedWine.tag_texts); // deep copy できてなさそう
    const [name, setName] = useState<string>(selectedWine.name);
    const [producer, setProducer] = useState<string>(selectedWine.producer);
    const [vintage, setVintage] = useState<number | null>(selectedWine.vintage);
    const [regions, setRegions] = useState<WineRegionsObject>({
        country: selectedWine.country,
        region1: selectedWine.region_1,
        region2: selectedWine.region_2,
        region3: selectedWine.region_3,
        region4: selectedWine.region_4,
        region5: selectedWine.region_5,
    })
    const [cepages, setCepages] = useState<Cepage[]>(selectedWine.cepages); // List of objects だから、中身のobjectはdeep copy できてないかも
    const [boughtAt, setBoughtAt] = useState<string | null>(selectedWine.bought_at);
    const [boughtFrom, setBoughtFrom] = useState<string>(selectedWine.bought_from);
    const [price, setPrice] = useState<number | null>(selectedWine.price);
    const [drunkAt, setDrunkAt] = useState<string | null>(selectedWine.drunk_at);
    const [note, setNote] = useState<string>(selectedWine.note);
    const [cellarId, setCellarId] = useState<string | null>(selectedWine.cellar_id);
    const [position, setPosition] = useState<string | null>(selectedWine.position);

    const [validationErrors, setValidationErrors] = useState<ValidationErrorsType>({});
    const [apiErrors, setApiErrors] = useState<apiErrorsType>({});

    const [dontMove, setDontMove] = useState<boolean>(action === 'edit');

    const fillDrunkAtAndMoveOutOfCellar = () => {
        if (!drunkAt) setDrunkAt(getLocaleISODateString());
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
            country: regions.country,
            region_1: regions.region1,
            region_2: regions.region2,
            region_3: regions.region3,
            region_4: regions.region4,
            region_5: regions.region5,
            cepages: cepages.sort((a, b) => Number(b.percentage)! - Number(a.percentage)!),
            vintage: vintage,
            bought_at: boughtAt,
            bought_from: boughtFrom,
            price: price,
            drunk_at: drunkAt,
            note: note,
            tag_texts: tagTexts,
            cellar_id: cellarId,
            position: position,
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
                    await searchWine();
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
                    await searchWine();
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
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
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
            <Container maxWidth="md" sx={{ marginTop: 3, marginBottom: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <SameWinesDialog name={name} producer={producer} />
                    </Grid>
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
                            onChange={(_, newValue: string[]) => {
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
                                    addValidationError({ name: 'Name cannot be empty.' });
                                } else {
                                    removeValidationError('name');
                                }
                                setName(event.target.value);
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={9}>
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
                    <Grid item xs={3}>
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
                    </Grid>
                    <RegionForm
                        regions={regions}
                        setRegions={setRegions}
                        showDetails
                    />
                    <CepagesForm cepages={cepages} setCepages={setCepages} showDetails />
                    <Grid item xs={8}>
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
                    <Grid item xs={4} sx={{ textAlign: 'center' }}>
                        <Button variant="contained" sx={{ marginTop: '10px' }} onClick={fillDrunkAtAndMoveOutOfCellar}>
                            Drink
                        </Button>
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
        </Dialog>
    );
};

export default WineDialog;
