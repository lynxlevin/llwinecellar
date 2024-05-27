import React, { useEffect, useState, useContext, useMemo } from 'react';
import { AppBar, Button, Container, Dialog, Grid, IconButton, Slide, TextField, Toolbar, Typography, Autocomplete, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { Cepage, WineData } from '../../../contexts/wine-context';
import { WineRequestBody, WineAPI } from '../../../apis/WineAPI';
import useWineAPI from '../../../hooks/useWineAPI';
import { AxiosError } from 'axios';
import { WineTagContext } from '../../../contexts/wine-tag-context';
import useWineTagAPI from '../../../hooks/useWineTagAPI';
import { WineDialogAction } from '../../../hooks/useWineListPage';
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
    selectedWine: WineData;
    action: WineDialogAction;
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

const WineDialog = (props: WineDialogProps) => {
    const { isOpen, handleClose, selectedWine, action } = props;

    const wineTagContext = useContext(WineTagContext);

    const { getWineList } = useWineAPI();
    const { getWineTagList } = useWineTagAPI();
    const { getWineRegionList } = useWineRegionAPI();

    const noCellarCode = 'NOT_IN_CELLAR';

    const getLocaleISODateString = (date_?: Date) => {
        const date = date_ ? date_ : new Date();
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };

    const initialValues = useMemo(() => {
        return {
            tagTexts: action === 'edit' ? selectedWine.tag_texts : [],
            name: action === 'edit' ? selectedWine.name : '',
            producer: action === 'edit' ? selectedWine.producer : '',
            vintage: action === 'edit' ? selectedWine.vintage : null,
            country: action === 'edit' ? selectedWine.country : null,
            region1: action === 'edit' ? selectedWine.region_1 : '',
            region2: action === 'edit' ? selectedWine.region_2 : '',
            region3: action === 'edit' ? selectedWine.region_3 : '',
            region4: action === 'edit' ? selectedWine.region_4 : '',
            region5: action === 'edit' ? selectedWine.region_5 : '',
            cepages: action === 'edit' ? selectedWine.cepages : [],
            boughtAt: action === 'edit' ? selectedWine.bought_at : getLocaleISODateString(),
            boughtFrom: action === 'edit' ? selectedWine.bought_from : '',
            price: action === 'edit' ? selectedWine.price : null,
            drunkAt: action === 'edit' ? selectedWine.drunk_at : null,
            note: action === 'edit' ? selectedWine.note : '',
            cellarId: selectedWine.cellar_id ?? noCellarCode,
            position: selectedWine.position,
            validationErrors: {},
            apiErrors: {},
            dontMove: action === 'edit',
        };
    }, [action, selectedWine]);

    const [tagTexts, setTagTexts] = useState<string[]>(initialValues.tagTexts); // deep copy できてなさそう
    const [name, setName] = useState<string>(initialValues.name);
    const [producer, setProducer] = useState<string>(initialValues.producer);
    const [vintage, setVintage] = useState<number | null>(initialValues.vintage);
    const [country, setCountry] = useState<string | null>(initialValues.country);
    const [region1, setRegion1] = useState<string>(initialValues.region1);
    const [region2, setRegion2] = useState<string>(initialValues.region2);
    const [region3, setRegion3] = useState<string>(initialValues.region3);
    const [region4, setRegion4] = useState<string>(initialValues.region4);
    const [region5, setRegion5] = useState<string>(initialValues.region5);
    const [cepages, setCepages] = useState<Cepage[]>(initialValues.cepages); // List of objects だから、中身のobjectはdeep copy できてないかも
    const [boughtAt, setBoughtAt] = useState<string | null>(initialValues.boughtAt);
    const [boughtFrom, setBoughtFrom] = useState<string>(initialValues.boughtFrom);
    const [price, setPrice] = useState<number | null>(initialValues.price);
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
            setPrice(initialValues.price);
            setDrunkAt(initialValues.drunkAt);
            setNote(initialValues.note);
            setCellarId(initialValues.cellarId);
            setPosition(initialValues.position);
            setValidationErrors(initialValues.validationErrors);
            setApiErrors(initialValues.apiErrors);
            setDontMove(initialValues.dontMove);
        }
    }, [initialValues, isOpen]);

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
            country: country,
            region_1: region1,
            region_2: region2,
            region_3: region3,
            region_4: region4,
            region_5: region5,
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
                    await getWineList();
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
                    await getWineList();
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
                    />
                    <CepagesForm cepages={cepages} setCepages={setCepages} />
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
