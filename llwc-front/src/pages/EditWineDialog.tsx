import React from 'react';
import { AppBar, Button, Container, Dialog, Grid, IconButton, Slide, TextField, Toolbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { Cepage, WineData } from '../hooks/useWineListPage';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface EditWineDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    selectedWine: WineData | undefined;
    getCepageAbbreviations: (cepages: Cepage[]) => string;
}

// MYMEMO: Grid sample https://github.com/mui/material-ui/blob/v5.14.8/docs/data/material/getting-started/templates/checkout/AddressForm.tsx
export default function EditWineDialog(props: EditWineDialogProps) {
    const { isOpen, handleClose, selectedWine, getCepageAbbreviations } = props;

    if (selectedWine === undefined) return <></>;
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
                    <Button autoFocus color="inherit" onClick={handleClose}>
                        save
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ marginTop: 3, marginBottom: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField label="tag_texts" defaultValue={selectedWine.tag_texts} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="name" defaultValue={selectedWine.name} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={10}>
                        <TextField label="producer" defaultValue={selectedWine.producer} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField label="vintage" defaultValue={selectedWine.vintage} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="country" defaultValue={selectedWine.country} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="region_1" defaultValue={selectedWine.region_1} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="region_2" defaultValue={selectedWine.region_2} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="region_3" defaultValue={selectedWine.region_3} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="region_4" defaultValue={selectedWine.region_4} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="region_5" defaultValue={selectedWine.region_5} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="cepages" defaultValue={getCepageAbbreviations(selectedWine.cepages)} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="bought_at" defaultValue={selectedWine.bought_at} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="bought_from" defaultValue={selectedWine.bought_from} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="price_with_tax" defaultValue={selectedWine.price_with_tax} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="drunk_at" defaultValue={selectedWine.drunk_at} variant="standard" fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="note" defaultValue={selectedWine.note} variant="standard" fullWidth multiline />
                    </Grid>
                </Grid>
            </Container>
        </Dialog>
    );
}
