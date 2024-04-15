import { useState } from 'react';
import { Button, Container, Dialog, Grid, IconButton, Slide, TextField, Toolbar, Typography, Autocomplete, Chip, Card, CardContent, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { WineData } from '../../../contexts/wine-context';
import useWineAPI from '../../../hooks/useWineAPI';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


interface SameWinesDialogProps {
    name: string;
}

const SameWinesDialog = (props: SameWinesDialogProps) => {
    const { name } = props;
    const [sameWines, setSameWines] = useState<WineData[]>([])
    const { listWinesByName } = useWineAPI();

    const findSameWinesByName = async () => {
        const sameWines = await listWinesByName(name);
        setSameWines(sameWines);
    }

    return (
        <>
            <Button variant="contained" sx={{ marginTop: '10px' }} onClick={findSameWinesByName}>
                Find same
            </Button>
            <Dialog fullWidth scroll="paper" onClose={() => setSameWines([])} open={sameWines.length !== 0}>
                <Container maxWidth="md" sx={{ padding: 2, pr: 1, pl: 1 }}>
                    {sameWines.map(wine => {
                        return (
                            <Paper elevation={3} key={wine.id} sx={{m: 1, mb: 2}}>
                                <Typography sx={{mb: 2}}>
                                    {wine.name} ({wine.vintage})<br />
                                    {wine.producer}<br />
                                    drunk_at: {wine.drunk_at}
                                </Typography>
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
                                {wine.cepages.length > 0 && (
                                    <Typography>
                                        cepages: {wine.cepages.map(cepage => cepage.abbreviation).join(', ')}
                                    </Typography>
                                )}
                                <Typography>
                                    note: {wine.note}
                                </Typography>
                            </Paper>
                        )
                    })}
                </Container>
            </Dialog>
        </>
    );
};

export default SameWinesDialog;
