import styled from '@emotion/styled';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardContent, Grid, IconButton, TextField, Typography } from '@mui/material';
import { memo, useState } from 'react';
import EditDiaryDialog from './EditWineMemoDialog';
import { IWineMemo } from '../../apis/WineMemoAPI';

interface WineMemoProps {
    wineMemo: IWineMemo;
    setWineMemos: React.Dispatch<React.SetStateAction<IWineMemo[]>>;
}

const WineMemo = (props: WineMemoProps) => {
    const { wineMemo, setWineMemos } = props;

    const [isEditWineMemoDialogOpen, setIsEditWineMemoDialogOpen] = useState(false);

    return (
        <StyledGrid item xs={12} md={6}>
            <Card className='card'>
                <CardContent>
                    <div className='relative-div'>
                        <Typography className='memo-title'>{wineMemo.title}</Typography>
                        <IconButton className='edit-button' onClick={() => setIsEditWineMemoDialogOpen(true)}>
                            <EditIcon />
                        </IconButton>
                    </div>
                    <TextField value={wineMemo.entry} multiline maxRows={12} fullWidth disabled sx={{"& .MuiInputBase-input.Mui-disabled": {WebkitTextFillColor: "rgba(0, 0, 0, 0.87)"}}} />
                    {/* <Typography className='memo-description'>{wineMemo.entry}</Typography> */}
                </CardContent>
            </Card>
            {isEditWineMemoDialogOpen && (
                <EditDiaryDialog
                    onClose={() => {
                        setIsEditWineMemoDialogOpen(false);
                    }}
                    wineMemo={wineMemo}
                    setWineMemos={setWineMemos}
                />
            )}
        </StyledGrid>
    );
};

const StyledGrid = styled(Grid)`
    .card {
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .relative-div {
        position: relative;
    }

    .memo-title {
        padding-top: 8px;
        padding-bottom: 16px;
    }

    .edit-button {
        position: absolute;
        top: -8px;
        right: -7px;
    }
`;

export default memo(WineMemo);
