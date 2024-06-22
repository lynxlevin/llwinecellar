import React, { useContext } from 'react';
import { Grid, TextField, Autocomplete, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { WineRegionContext } from '../../../contexts/wine-region-context';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { WineRegionsObject } from './WineDialog';

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

interface RegionFormProps {
    regions: WineRegionsObject;
    setRegions: React.Dispatch<React.SetStateAction<WineRegionsObject>>;
    showDetails?: boolean;
    freeSolo?: boolean;
}

const RegionForm = (props: RegionFormProps) => {
    const { regions, setRegions, showDetails = false, freeSolo = true } = props;

    const wineRegionContext = useContext(WineRegionContext);

    const getWineRegionValue = () => {
        if (regions.country === null) return null;

        let regionValue = regions.country;
        for (const key of ['region_1', 'region_2', 'region_3', 'region_4', 'region_5'] as (keyof WineRegionsObject)[]) {
            if (regions[key]) regionValue += `>${regions[key]}`;
        }

        return regionValue;
    };

    return (
        <>
            <Grid item xs={12}>
                <Autocomplete
                    options={wineRegionContext.wineRegionList}
                    freeSolo={freeSolo}
                    value={getWineRegionValue()}
                    renderTags={(value: readonly string[], getTagProps) =>
                        value.map((option: string, index: number) => <Chip variant='outlined' label={option} {...getTagProps({ index })} />)
                    }
                    renderInput={params => <TextField {...params} label='wine_region' />}
                    onChange={(_, newValue: string | null) => {
                        if (newValue) {
                            const [country, region_1, region_2, region_3, region_4, region_5] = newValue.split('>');
                            setRegions({
                                country,
                                region_1: region_1 ?? '',
                                region_2: region_2 ?? '',
                                region_3: region_3 ?? '',
                                region_4: region_4 ?? '',
                                region_5: region_5 ?? '',
                            });
                        }
                    }}
                />
            </Grid>
            {showDetails && (
                <>
                    <Accordion disableGutters sx={{ width: '100%', ml: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>Region details</AccordionSummary>
                        <AccordionDetails sx={{ ml: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={countries}
                                        value={regions.country}
                                        renderTags={(value: readonly string[], getTagProps) =>
                                            value.map((option: string, index: number) => <Chip variant='outlined' label={option} {...getTagProps({ index })} />)
                                        }
                                        renderInput={params => <TextField {...params} label='country' />}
                                        onChange={(_, newValue: string | null) => {
                                            setRegions(prev => {
                                                return { ...prev, country: newValue };
                                            });
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label='region_1'
                                        value={regions.region_1}
                                        onChange={event => {
                                            setRegions(prev => {
                                                return { ...prev, region_1: event.target.value };
                                            });
                                        }}
                                        variant='standard'
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label='region_2'
                                        value={regions.region_2}
                                        onChange={event => {
                                            setRegions(prev => {
                                                return { ...prev, region_2: event.target.value };
                                            });
                                        }}
                                        variant='standard'
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label='region_3'
                                        value={regions.region_3}
                                        onChange={event => {
                                            setRegions(prev => {
                                                return { ...prev, region_3: event.target.value };
                                            });
                                        }}
                                        variant='standard'
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label='region_4'
                                        value={regions.region_4}
                                        onChange={event => {
                                            setRegions(prev => {
                                                return { ...prev, region_4: event.target.value };
                                            });
                                        }}
                                        variant='standard'
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label='region_5'
                                        value={regions.region_5}
                                        onChange={event => {
                                            setRegions(prev => {
                                                return { ...prev, region_5: event.target.value };
                                            });
                                        }}
                                        variant='standard'
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </>
            )}
        </>
    );
};

export default RegionForm;
