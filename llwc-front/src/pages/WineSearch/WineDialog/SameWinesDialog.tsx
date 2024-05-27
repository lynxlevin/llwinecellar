import { useState } from 'react';
import { Button, Container, Dialog, Typography, Paper, FormControlLabel, Switch, Stack } from '@mui/material';
import { WineData } from '../../../contexts/wine-context';
import useWineAPI from '../../../hooks/useWineAPI';
import { FindSameWinesQuery } from '../../../apis/WineAPI';
import { WineDialogAction } from '../../../hooks/useWineSearchPage';


interface SameWinesDialogProps {
    name: string;
    producer: string;
    copyFromHistory: (data: WineData) => void;
    action: WineDialogAction;
}

const SameWinesDialog = (props: SameWinesDialogProps) => {
    const { name, producer, copyFromHistory, action } = props;
    const [sameWines, setSameWines] = useState<WineData[]>([])
    const [searchKeys, setSearchKeys] = useState<{name: boolean, producer: boolean, fuzzy: boolean}>({name: true, producer: false, fuzzy: false});
    const { findSameWines } = useWineAPI();

    const search = async () => {
        if (!Object.values(searchKeys).some(key => key)) return;
        const query: FindSameWinesQuery = {is_drunk: true};
        if (searchKeys.name) query.name = name;
        if (searchKeys.producer) query.name = producer;
        if (searchKeys.fuzzy) query.name_or_producer = name + producer;
        const sameWines = await findSameWines(query);
        setSameWines(sameWines);
    }

    return (
        <>
            <Stack direction="row">
                <Button variant="contained" sx={{ marginTop: '10px' }} onClick={search}>
                    Find same
                </Button>
                <FormControlLabel labelPlacement='bottom' label='by name' control={<Switch checked={searchKeys.name} onChange={event => {setSearchKeys(prev => { return {...prev, name: event.target.checked, fuzzy: false}})}} />} />
                <FormControlLabel labelPlacement='bottom' label='by producer' control={<Switch checked={searchKeys.producer} onChange={event => {setSearchKeys(prev => { return {...prev, producer: event.target.checked, fuzzy: false}})}} />} />
                <FormControlLabel labelPlacement='bottom' label='fuzzy (name/producer)' control={<Switch checked={searchKeys.fuzzy} onChange={event => {setSearchKeys(prev => { return {fuzzy: event.target.checked, name: false, producer: false}})}} />} />
            </Stack>
            <Dialog fullWidth scroll="paper" onClose={() => setSameWines([])} open={sameWines.length !== 0}>
                <Container sx={{ padding: 2, pr: 1, pl: 1 }}>
                    {sameWines.map(wine => {
                        return (
                            <Paper elevation={3} key={wine.id} sx={{m: 1, mb: 2}}>
                                {action === 'create' && (
                                    <Button onClick={() => {copyFromHistory(wine); setSameWines([]);}} variant="contained" sx={{ ml: 'auto', display: 'block'}}>
                                        Copy
                                    </Button>
                                )}
                                {action === 'edit' ? (
                                    <Typography sx={{mb: 2}}>
                                        {wine.name} ({wine.vintage})<br />
                                        {wine.producer}<br />
                                        drunk_at: {wine.drunk_at}
                                    </Typography>
                                ) : (
                                    <Typography sx={{mb: 2}}>
                                        {wine.name} ({wine.vintage})<br />
                                        {wine.producer}
                                    </Typography>
                                )}
                                {action === 'edit' && (
                                    <>
                                        {wine.tag_texts.length > 0 && (
                                            <Typography>
                                                tag_texts: {wine.tag_texts.join(', ')}
                                            </Typography>
                                        )}
                                        <Typography>
                                            bought_at: {wine.bought_at}
                                        </Typography>
                                        <Typography>
                                            bought_from: {wine.bought_from}
                                        </Typography>
                                        <Typography>
                                            price: {wine.price}
                                        </Typography>
                                    </>
                                )}
                                {wine.cepages.length > 0 && (
                                    <Typography>
                                        cepages: {wine.cepages.map(cepage => cepage.abbreviation).join(', ')}
                                    </Typography>
                                )}
                                {action === 'edit' && (
                                    <Typography>
                                        note: {wine.note}
                                    </Typography>
                                )}
                            </Paper>
                        )
                    })}
                </Container>
            </Dialog>
        </>
    );
};

export default SameWinesDialog;
