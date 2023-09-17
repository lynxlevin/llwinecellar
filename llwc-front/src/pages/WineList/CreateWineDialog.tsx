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
import { Cepage } from '../../contexts/wine-context';
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

interface CreateWineDialogProps {
    isOpen: boolean;
    handleClose: () => void;
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

const CreateWineDialog = (props: CreateWineDialogProps) => {
    const { isOpen, handleClose, cellarList } = props;

    const wineTagContext = useContext(WineTagContext);

    const { getWineList } = useWineAPI();
    const { getWineTagList } = useWineTagAPI();

    const [tagTexts, setTagTexts] = useState<string[]>([]);
    const [name, setName] = useState<string>('');
    const [producer, setProducer] = useState<string>('');
    const [vintage, setVintage] = useState<number | null>(null);
    const [country, setCountry] = useState<string | null>(null);
    const [region1, setRegion1] = useState<string>('');
    const [region2, setRegion2] = useState<string>('');
    const [region3, setRegion3] = useState<string>('');
    const [region4, setRegion4] = useState<string>('');
    const [region5, setRegion5] = useState<string>('');
    const [cepages, setCepages] = useState<Cepage[]>([]);
    const [boughtAt, setBoughtAt] = useState<string | null>(null);
    const [boughtFrom, setBoughtFrom] = useState<string>('');
    const [priceWithTax, setPriceWithTax] = useState<number | null>(null);
    const [drunkAt, setDrunkAt] = useState<string | null>(null);
    const [note, setNote] = useState<string>('');
    const [cellarId, setCellarId] = useState<string | null>('NOT_IN_CELLAR');
    const [position, setPosition] = useState<string | null>(null);

    const [validationErrors, setValidationErrors] = useState<ValidationErrorsType>({});
    const [apiErrors, setApiErrors] = useState<apiErrorsType>({});

    useEffect(() => {
        if (isOpen) {
            setTagTexts([]);
            setName('');
            setProducer('');
            setVintage(null);
            setCountry(null);
            setRegion1('');
            setRegion2('');
            setRegion3('');
            setRegion4('');
            setRegion5('');
            setCepages([]);
            setBoughtAt(null);
            setBoughtFrom('');
            setPriceWithTax(null);
            setDrunkAt(null);
            setNote('');
            setCellarId(cellarList[0][0]);
            setPosition(null);
            setValidationErrors({});
            setApiErrors({});
        }
    }, [cellarList, isOpen]);

    const handleSave = async () => {
        if (Object.keys(validationErrors).length > 0) return;
        if (name === '') {
            setValidationErrors({ name: 'Name cannot be empty.' });
            return;
        }
        if (cellarId !== 'NOT_IN_CELLAR' && position === null) {
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
            position,
        };
        const newTagCreated = !tagTexts.every(tag => wineTagContext.wineTagList.includes(tag));
        if (cellarId === 'NOT_IN_CELLAR') {
            data.cellar_id = null;
            data.position = null;
        }
        await WineAPI.create(data)
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
                            defaultValue={''}
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
                            defaultValue={''}
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
                            defaultValue={null}
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
                            defaultValue={null}
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
                            defaultValue={''}
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
                            defaultValue={''}
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
                            defaultValue={''}
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
                            defaultValue={''}
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
                            defaultValue={''}
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
                            defaultValue={'[{"name":"","abbreviation":"","percentage":"100.0"}]'}
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
                            defaultValue={null}
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
                            defaultValue={''}
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
                            defaultValue={null}
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
                            defaultValue={null}
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
                            defaultValue={''}
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
                            {cellarList.map(cellar => (
                                <MenuItem key={cellar[0]} value={cellar[0]}>
                                    {cellar[1]}
                                </MenuItem>
                            ))}
                            <MenuItem value="NOT_IN_CELLAR">NOT_IN_CELLAR</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12}>
                        {/* MYMEMO(後日): make this a select */}
                        <TextField
                            label="position"
                            defaultValue={null}
                            onChange={event => {
                                if (cellarId === 'NOT_IN_CELLAR' || event.target.value !== '') {
                                    setValidationErrors(current => {
                                        const { position, ...rest } = current;
                                        return rest;
                                    });
                                }
                                setPosition(event.target.value || null);
                            }}
                            disabled={cellarId === 'NOT_IN_CELLAR'}
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

export default CreateWineDialog;
