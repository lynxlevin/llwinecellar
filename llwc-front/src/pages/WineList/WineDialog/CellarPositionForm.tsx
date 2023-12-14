import React, { useContext } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { CellarContext } from '../../../contexts/cellar-context';
import { WineDialogAction } from '../../../hooks/useWineListPage';
import { ValidationErrorsType, apiErrorsType } from './WineDialog';

interface CellarPositionFormProps {
    cellarId: string | null;
    position: string | null;
    validationErrors: ValidationErrorsType;
    apiErrors: apiErrorsType;
    dontMove: boolean;
    setCellarId: React.Dispatch<React.SetStateAction<string | null>>;
    setPosition: React.Dispatch<React.SetStateAction<string | null>>;
    setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrorsType>>;
    setDontMove: React.Dispatch<React.SetStateAction<boolean>>;
    action: WineDialogAction;
}

const CellarPositionForm = (props: CellarPositionFormProps) => {
    const { cellarId, position, validationErrors, apiErrors, dontMove, setCellarId, setPosition, setValidationErrors, setDontMove, action } = props;

    const cellarContext = useContext(CellarContext);

    const noCellarCode = 'NOT_IN_CELLAR';

    const removeValidationError = (key: keyof ValidationErrorsType) => {
        setValidationErrors(current => {
            delete current[key];
            return current;
        });
    };

    return (
        <>
            <Grid item xs={9}>
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
                        {cellarContext.cellarList.map(cellar => (
                            <MenuItem key={cellar.id} value={cellar.id}>
                                {cellar.name}
                            </MenuItem>
                        ))}
                        <MenuItem value={noCellarCode}>{noCellarCode}</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            {action === 'edit' && (
                <Grid item xs={3}>
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
                            removeValidationError('position');
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
        </>
    );
};

export default CellarPositionForm;
