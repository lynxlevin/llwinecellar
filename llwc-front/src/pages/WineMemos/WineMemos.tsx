import { Box, Container, Grid } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../contexts/user-context';
import useUserAPI from '../../hooks/useUserAPI';
import Diary from './WineMemo';
import WineMemoForm from './WineMemoForm';
import { IWineMemo, WineMemoAPI } from '../../apis/WineMemoAPI';
import WineMemosAppBar from './WineMemosAppBar';

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const WineMemos = () => {
    const userContext = useContext(UserContext);

    const [wineMemos, setWineMemos] = useState<IWineMemo[]>([]);
    const { handleLogout } = useUserAPI();

    const getWineMemos = () => {
        WineMemoAPI.list().then(({ data: { wine_memos } }) => {
            setWineMemos(wine_memos);
        });
    };

    useEffect(() => {
        if (userContext.isLoggedIn !== true) return;
        getWineMemos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userContext.isLoggedIn]);

    if (userContext.isLoggedIn === false) {
        return <Navigate to='/login' />;
    }
    return (
        <>
            <WineMemosAppBar handleLogout={handleLogout} />
            <main>
                <Box sx={{pt: 8, px: 1}}>
                    <WineMemoForm setWineMemos={setWineMemos} />
                    <Container sx={{ pt: 2, pb: 4 }} maxWidth='md'>
                        <Grid container spacing={4}>
                            {wineMemos.map(wineMemo => (
                                <Diary key={wineMemo.id} wineMemo={wineMemo} setWineMemos={setWineMemos} />
                            ))}
                        </Grid>
                    </Container>
                </Box>
            </main>
        </>
    );
};

export default WineMemos;
