import React, { useContext } from 'react';
import { Grid, TextField, Autocomplete, Chip } from '@mui/material';
import { WineRegionContext } from '../../../contexts/wine-region-context';
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
}

const RegionForm = (props: RegionFormProps) => {
    const { regions, setRegions, showDetails=false } = props;

    const wineRegionContext = useContext(WineRegionContext);

    const getWineRegionValue = () => {
        if (regions.country === null) return null;

        let regionValue = regions.country;
        if (regions.region1) regionValue += `>${regions.region1}`;
        if (regions.region2) regionValue += `>${regions.region2}`;
        if (regions.region3) regionValue += `>${regions.region3}`;
        if (regions.region4) regionValue += `>${regions.region4}`;
        if (regions.region5) regionValue += `>${regions.region5}`;

        return regionValue;
    };

    return (
        <>
            <Grid item xs={12}>
                <Autocomplete
                    options={wineRegionContext.wineRegionList}
                    freeSolo
                    value={getWineRegionValue()}
                    renderTags={(value: readonly string[], getTagProps) =>
                        value.map((option: string, index: number) => <Chip variant="outlined" label={option} {...getTagProps({ index })} />)
                    }
                    renderInput={params => <TextField {...params} label="wine_region" />}
                    onChange={(event: any, newValue: string | null) => {
                        if (newValue) {
                            const [country, region1, region2, region3, region4, region5] = newValue.split('>');
                            setRegions({
                                country,
                                region1: region1 ?? '',
                                region2: region2 ?? '',
                                region3: region3 ?? '',
                                region4: region4 ?? '',
                                region5: region5 ?? '',
                            });
                        }
                    }}
                />
                {/* MYMEMO(後日): consider using _.throttle or _.debounce on all onChanges */}
            </Grid>
            {showDetails && (
                <>
                    <Grid item xs={6}>
                        <Autocomplete
                            options={countries}
                            value={regions.country}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => <Chip variant="outlined" label={option} {...getTagProps({ index })} />)
                            }
                            renderInput={params => <TextField {...params} label="country" />}
                            onChange={(event: any, newValue: string | null) => {
                                setRegions(prev => {return {...prev, country: newValue};});
                            }}
                        />
                        {/* MYMEMO(後日): consider using _.throttle or _.debounce on all onChanges */}
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="region_1"
                            value={regions.region1}
                            onChange={event => {
                                setRegions(prev => {return {...prev, region1: event.target.value};});
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="region_2"
                            value={regions.region2}
                            onChange={event => {
                                setRegions(prev => {return {...prev, region2: event.target.value};});
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="region_3"
                            value={regions.region3}
                            onChange={event => {
                                setRegions(prev => {return {...prev, region3: event.target.value};});
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="region_4"
                            value={regions.region4}
                            onChange={event => {
                                setRegions(prev => {return {...prev, region4: event.target.value};});
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="region_5"
                            value={regions.region5}
                            onChange={event => {
                                setRegions(prev => {return {...prev, region5: event.target.value};});
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </Grid>
                </>
            )}
        </>
    );
};

export default RegionForm;
