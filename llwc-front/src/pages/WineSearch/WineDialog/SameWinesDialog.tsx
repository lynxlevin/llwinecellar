import { useState } from 'react';
import { Button, Container, Dialog, Typography, Paper, FormControlLabel, Switch, Stack } from '@mui/material';
import { WineData } from '../../../contexts/wine-context';
import useWineAPI, { FindSameWinesQuery } from '../../../hooks/useWineAPI';
import { WineDialogAction } from '../../../hooks/useWineSearchPage';

interface SameWinesDialogProps {
    name: string;
    producer: string;
    copyFromHistory: (data: WineData) => void;
    action: WineDialogAction;
}

const SameWinesDialog = (props: SameWinesDialogProps) => {
    const { name, producer, copyFromHistory, action } = props;
    const [sameWines, setSameWines] = useState<WineData[] | undefined>();
    const [searchKeys, setSearchKeys] = useState<{ name: boolean; producer: boolean }>({
        name: action === 'edit',
        producer: false,
    });
    const { findSameWines } = useWineAPI();

    const search = async (props?: { name: boolean; producer: boolean }) => {
        const keys = props ?? searchKeys;
        const query: FindSameWinesQuery = { show_drunk: true, show_stock: action === 'create' };
        if (action === 'create') {
            query.name_or_producer = name + producer;
        } else {
            if (keys.name) query.name = name;
            if (keys.producer) query.producer = producer;
        }
        const sameWines = await findSameWines(query);
        setSameWines(sameWines);
    };

    const getWineRegionValue = (wine: WineData) => {
        if (wine.country === null) return null;

        let regionValue = wine.country;
        if (wine.region_1) regionValue += `>${wine.region_1}`;
        if (wine.region_2) regionValue += `>${wine.region_2}`;
        if (wine.region_3) regionValue += `>${wine.region_3}`;
        if (wine.region_4) regionValue += `>${wine.region_4}`;
        if (wine.region_5) regionValue += `>${wine.region_5}`;

        return regionValue;
    };

    return (
        <>
            <Stack direction='row'>
                <Button variant='contained' sx={{ marginTop: '10px' }} onClick={_ => search()}>
                    Find same{action === 'create' && ' (fuzzy)'}
                </Button>
            </Stack>
            <Dialog fullWidth scroll='paper' onClose={() => setSameWines(undefined)} open={sameWines !== undefined}>
                <Container sx={{ padding: 2, pr: 1, pl: 1 }}>
                    {action === 'edit' && (
                        <>
                            <FormControlLabel
                                labelPlacement='bottom'
                                label='by name'
                                control={
                                    <Switch
                                        checked={searchKeys.name && !searchKeys.producer}
                                        onChange={_ => {
                                            const keys = { name: true, producer: false };
                                            setSearchKeys(keys);
                                            search(keys);
                                        }}
                                    />
                                }
                            />
                            <FormControlLabel
                                labelPlacement='bottom'
                                label='by name and producer'
                                control={
                                    <Switch
                                        checked={searchKeys.name && searchKeys.producer}
                                        onChange={_ => {
                                            const keys = { name: true, producer: true };
                                            setSearchKeys(keys);
                                            search(keys);
                                        }}
                                    />
                                }
                            />
                            <FormControlLabel
                                labelPlacement='bottom'
                                label='by producer'
                                control={
                                    <Switch
                                        checked={searchKeys.producer && !searchKeys.name}
                                        onChange={_ => {
                                            const keys = { name: false, producer: true };
                                            setSearchKeys(keys);
                                            search(keys);
                                        }}
                                    />
                                }
                            />
                        </>
                    )}
                    {sameWines !== undefined &&
                        sameWines!.map(wine => {
                            return (
                                <Paper elevation={3} key={wine.id} sx={{ m: 1, mb: 2 }}>
                                    {action === 'create' && (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    copyFromHistory(wine);
                                                    setSameWines([]);
                                                }}
                                                variant='contained'
                                                sx={{ ml: 'auto', display: 'block' }}
                                            >
                                                Copy
                                            </Button>
                                            <Typography>
                                                {wine.name}
                                                <br />
                                                {wine.producer}
                                            </Typography>
                                            <Typography>{getWineRegionValue(wine)}</Typography>
                                            <Typography>cepages: {wine.cepages.map(cepage => cepage.name).join(', ')}</Typography>
                                        </>
                                    )}
                                    {action === 'edit' && (
                                        <>
                                            <Typography>
                                                {wine.name} ({wine.vintage})<br />
                                                {wine.producer}
                                                <br />
                                                drunk_at: {wine.drunk_at}
                                            </Typography>
                                            <Typography>tag_texts: {wine.tag_texts.join(', ')}</Typography>
                                            <Typography>bought_at: {wine.bought_at}</Typography>
                                            <Typography>bought_from: {wine.bought_from}</Typography>
                                            <Typography>price: {wine.price}</Typography>
                                            <Typography>cepages: {wine.cepages.map(cepage => cepage.name).join(', ')}</Typography>
                                            <Typography>note: {wine.note}</Typography>
                                        </>
                                    )}
                                </Paper>
                            );
                        })}
                </Container>
            </Dialog>
        </>
    );
};

export default SameWinesDialog;
