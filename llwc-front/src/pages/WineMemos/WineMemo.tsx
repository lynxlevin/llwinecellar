import styled from '@emotion/styled';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
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
        <StyledGrid item xs={12} sm={6} md={4}>
            <Card className='card'>
                <CardContent>
                    <div className='relative-div'>
                        <Typography className='memo-title'>{wineMemo.title}</Typography>
                        <IconButton className='edit-button' onClick={() => setIsEditWineMemoDialogOpen(true)}>
                            <EditIcon />
                        </IconButton>
                    </div>
                    <Typography className='memo-description'>{wineMemo.entry}</Typography>
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

    .memo-description {
        text-align: start;
        white-space: pre-wrap;
    }
`;

export default memo(WineMemo);
