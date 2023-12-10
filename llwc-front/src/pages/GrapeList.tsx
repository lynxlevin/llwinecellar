import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import AppIcon from '../components/AppIcon';
import { useEffect, useState } from 'react';
import { GrapeMasterAPI, GrapeMasterItem } from '../apis/GrapeMasterAPI';

export const GrapeList = () => {
    const [grapeList, setGrapeList] = useState<GrapeMasterItem[]>([]);

    useEffect(() => {
        const getGrapeList = async () => {
            const res = await GrapeMasterAPI.list();
            setGrapeList(res.data.grape_masters);
        };
        getGrapeList();
    }, [setGrapeList]);

    return (
        <>
            <AppBar
                position="absolute"
                color="default"
                elevation={0}
                sx={{
                    position: 'relative',
                    borderBottom: t => `1px solid ${t.palette.divider}`,
                }}
            >
                <Toolbar>
                    <Link to="/">
                        <AppIcon height={36} />
                    </Link>
                    <Typography sx={{ flex: '1 1 10%' }} variant="h6" color="inherit" noWrap>
                        GrapeList
                    </Typography>
                </Toolbar>
            </AppBar>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Abbreviation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {grapeList.map(grape => (
                            <TableRow key={grape.id}>
                                <TableCell>{grape.name}</TableCell>
                                <TableCell>{grape.abbreviation}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};
