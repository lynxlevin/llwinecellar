import React, { useContext } from 'react';
import { Grid, TextField, Autocomplete, Chip } from '@mui/material';
import { WineRegionContext } from '../../../contexts/wine-region-context';

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
    country: string | null;
    region1: string;
    region2: string;
    region3: string;
    region4: string;
    region5: string;
    setCountry: React.Dispatch<React.SetStateAction<string | null>>;
    setRegion1: React.Dispatch<React.SetStateAction<string>>;
    setRegion2: React.Dispatch<React.SetStateAction<string>>;
    setRegion3: React.Dispatch<React.SetStateAction<string>>;
    setRegion4: React.Dispatch<React.SetStateAction<string>>;
    setRegion5: React.Dispatch<React.SetStateAction<string>>;
}

const RegionForm = (props: RegionFormProps) => {
    const { country, region1, region2, region3, region4, region5, setCountry, setRegion1, setRegion2, setRegion3, setRegion4, setRegion5 } = props;

    const wineRegionContext = useContext(WineRegionContext);

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

    return (
        <>
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
        </>
    );
};

export default RegionForm;
