import { useContext } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Chip, SelectChangeEvent, Box } from '@mui/material';
import { Cepage } from '../../../contexts/wine-context';
import { GrapeMasterContext } from '../../../contexts/grape-master-context';

interface CepagesFormProps {
    cepages: Cepage[];
    setCepages: React.Dispatch<React.SetStateAction<Cepage[]>>;
    showDetails?: boolean;
}

const CepagesForm = (props: CepagesFormProps) => {
    const { cepages, setCepages, showDetails = false } = props;
    const grapeMasterContext = useContext(GrapeMasterContext);

    return (
        <>
            <Grid item xs={12}>
                <FormControl sx={{ width: '100%' }}>
                    <InputLabel id='cepages-select-label' shrink>
                        cepages
                    </InputLabel>
                    <Select
                        labelId='cepages-select-label'
                        label='cepages'
                        multiple
                        value={cepages.map(cepage => cepage.name)}
                        onChange={(event: SelectChangeEvent<string[]>) => {
                            const {
                                target: { value },
                            } = event;
                            const grapes = typeof value === 'string' ? value.split(',') : value;
                            setCepages(cur =>
                                grapes.map((grape: string) => {
                                    const exists = cur.find(c => c.name === grape);
                                    if (exists) return exists;
                                    const abbreviation = grapeMasterContext.grapeMasterList.find(grapeMaster => grapeMaster.name === grape)!.abbreviation;
                                    const defaultTo100Percent = cepages.length === 0 && grapes.length === 1;
                                    return { name: grape, abbreviation, percentage: defaultTo100Percent ? '100' : '0' };
                                }),
                            );
                        }}
                        renderValue={selected => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map(value => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                    >
                        {grapeMasterContext.grapeMasterList.map(grape => (
                            <MenuItem key={grape.id} value={grape.name}>
                                {grape.name}({grape.abbreviation})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            {showDetails &&
                cepages.map((cepage, i) => (
                    <Grid item xs={6} key={i}>
                        <InputLabel id={`cepage-percentage-input-${i}`}>{cepage.name}</InputLabel>
                        <TextField
                            value={cepage.percentage}
                            type='number'
                            onChange={event => {
                                setCepages(cur => {
                                    return cur.map(c => {
                                        if (c.name === cepage.name) return { ...c, percentage: event.target.value };
                                        return c;
                                    });
                                });
                            }}
                        />
                    </Grid>
                ))}
            {cepages.length % 2 !== 0 && <Grid item xs={6} />}
        </>
    );
};

export default CepagesForm;
