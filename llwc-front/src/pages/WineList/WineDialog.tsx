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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Chip,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { CellarContext } from '../../contexts/cellar-context';
import { Cepage, WineData } from '../../contexts/wine-context';
import { WineRequestBody, WineAPI } from '../../apis/WineAPI';
import useWineAPI from '../../hooks/useWineAPI';
import { AxiosError } from 'axios';
import { WineTagContext } from '../../contexts/wine-tag-context';
import { WineRegionContext } from '../../contexts/wine-region-context';
import useWineTagAPI from '../../hooks/useWineTagAPI';
import { WineDialogAction } from '../../hooks/useWineListPage';
import useWineRegionAPI from '../../hooks/useWineRegionAPI';

const countries = [
    'France',
    'Italy',
    'Germany',
    'Luxembourg',
    'Spain',
    'Portugal',
    'Switzerland',
    'Austria',
    'England',
    'Hungary',
    'Bulgaria',
    'Slovenia',
    'Croatia',
    'Bosnia Herzegovina',
    'Macedonia',
    'Serbia',
    'Montenegro',
    'Czech Republic',
    'Slovak Republic',
    'Romania',
    'Malta',
    'Greece',
    'Japan',
    'Armenia',
    'Georgia',
    'Moldova',
    'Russia',
    'Ukraine',
    'America',
    'Mexico',
    'Canada',
    'Chile',
    'Argentina',
    'Brazil',
    'Uruguay',
    'Australia',
    'New Zealand',
    'Cyprus',
    'Israel',
    'Lebanon',
    'Turkey',
    'North Africa',
    'South Africa',
] as const;

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

const WineDialog = (props: WineDialogProps) => {
    const { isOpen, handleClose, selectedWine, action } = props;

    const cellarContext = useContext(CellarContext);
    const wineTagContext = useContext(WineTagContext);
    const wineRegionContext = useContext(WineRegionContext);

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
            priceWithTax: action === 'edit' ? selectedWine.price_with_tax : null,
            drunkAt: action === 'edit' ? selectedWine.drunk_at : null,
            note: action === 'edit' ? selectedWine.note : '',
            cellarId: selectedWine.cellar_id ?? noCellarCode,
            position: selectedWine.position,
            validationErrors: {},
            apiErrors: {},
            dontMove: action === 'edit',
        };
    }, [action, selectedWine]);

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

    const [cepagesInput, setCepagesInput] = useState<string>(JSON.stringify(initialValues.cepages));

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
            setCepagesInput(JSON.stringify(initialValues.cepages));
            setValidationErrors(initialValues.validationErrors);
            setApiErrors(initialValues.apiErrors);
            setDontMove(initialValues.dontMove);
        }
    }, [initialValues, isOpen]);

    const getWineRegionValue = () => {
        if (country === null) return null;

        let regionValue = country;
        if (region1) regionValue += `>${region1}`;
        if (region2) regionValue += `>${region2}`;
        if (region3) regionValue += `>${region3}`;
        if (region4) regionValue += `>${region4}`;
        if (region5) regionValue += `>${region5}`;

        return regionValue;
    };

    const addToCepagesInput = () => {
        // MYMEMO: no validation when there's emptyCepage in cepages
        const emptyCepage: Cepage = { name: '', abbreviation: '', percentage: '100.0' };
        const cepages_ = JSON.parse(cepagesInput);
        setCepagesInput(JSON.stringify([...cepages_, emptyCepage]));
    };

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
        if (action === 'edit' && dontMove) {
            // MYMEMO(後日): 汚い。null | undefined | string の使い分けはよろしくない。
            delete data.cellar_id;
            delete data.position;
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
                                    addValidationError({ name: 'Name cannot be empty.' });
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
                        <Autocomplete
                            options={countries}
                            value={country}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => <Chip variant="outlined" label={option} {...getTagProps({ index })} />)
                            }
                            renderInput={params => <TextField {...params} label="country" />}
                            onChange={(event: any, newValue: string | null) => {
                                setCountry(newValue);
                            }}
                        />
                        {/* MYMEMO(後日): consider using _.throttle or _.debounce on all onChanges */}
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
                        <Autocomplete
                            options={wineRegionContext.wineRegionList}
                            value={getWineRegionValue()}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => <Chip variant="outlined" label={option} {...getTagProps({ index })} />)
                            }
                            renderInput={params => <TextField {...params} label="wine_region" />}
                            onChange={(event: any, newValue: string | null) => {
                                if (newValue) {
                                    const [_country, _region1, _region2, _region3, _region4, _region5] = newValue.split('>');
                                    setCountry(_country);
                                    setRegion1(_region1 ?? '');
                                    setRegion2(_region2 ?? '');
                                    setRegion3(_region3 ?? '');
                                    setRegion4(_region4 ?? '');
                                    setRegion5(_region5 ?? '');
                                }
                            }}
                        />
                        {/* MYMEMO(後日): consider using _.throttle or _.debounce on all onChanges */}
                    </Grid>
                    <Grid item xs={10}>
                        <TextField
                            label="cepages"
                            error={Boolean(validationErrors.cepages)}
                            helperText={validationErrors.cepages ? validationErrors.cepages : ''}
                            value={cepagesInput}
                            // MYMEMO(後日): show grape_master somewhere
                            onChange={event => {
                                setCepagesInput(event.target.value);
                                try {
                                    setCepages(JSON.parse(event.target.value));
                                    setValidationErrors(current => {
                                        const { cepages, ...rest } = current;
                                        return rest;
                                    });
                                } catch (error) {
                                    if (error instanceof SyntaxError) {
                                        addValidationError({ cepages: (error as SyntaxError).message });
                                    }
                                }
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button onClick={addToCepagesInput}>Add</Button>
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
                    <Grid item xs={10}>
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
                    <Grid item xs={2}>
                        <Button onClick={fillDrunkAtAndMoveOutOfCellar}>Drink</Button>
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
                        <FormControl>
                            <InputLabel id="cellar-id-input-label" shrink>
                                cellar
                            </InputLabel>
                            <Select
                                labelId="cellar-id-input-label"
                                label="cellar"
                                value={cellarId}
                                onChange={event => {
                                    setCellarId(event.target.value);
                                }}
                                disabled={dontMove}
                            >
                                {cellarContext.list.map(cellar => (
                                    <MenuItem key={cellar.id} value={cellar.id}>
                                        {cellar.name}
                                    </MenuItem>
                                ))}
                                <MenuItem value={noCellarCode}>{noCellarCode}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    {action === 'edit' && (
                        <Grid item xs={2}>
                            <FormControlLabel
                                label="don't move"
                                control={
                                    <Checkbox
                                        checked={dontMove}
                                        onChange={event => {
                                            setDontMove(event.target.checked);
                                        }}
                                    />
                                }
                            />
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        {/* MYMEMO(後日): make this a select */}
                        <TextField
                            label="position"
                            value={position ?? ''}
                            onChange={event => {
                                if (cellarId === noCellarCode || event.target.value !== '') {
                                    setValidationErrors(current => {
                                        const { position, ...rest } = current;
                                        return rest;
                                    });
                                }
                                setPosition(event.target.value || null);
                            }}
                            disabled={cellarId === noCellarCode || dontMove}
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

export default WineDialog;
