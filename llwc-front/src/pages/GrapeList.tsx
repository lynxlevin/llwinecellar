import { Link } from 'react-router-dom';
import {
    AppBar,
    Container,
    Toolbar,
    Paper,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    TextField,
} from '@mui/material';
import AppIcon from '../components/AppIcon';
import { useEffect, useState } from 'react';
import { GrapeMasterAPI, GrapeMasterItem } from '../apis/GrapeMasterAPI';

export const GrapeList = () => {
    const [grapeList, setGrapeList] = useState<GrapeMasterItem[]>([]);
    const [name, setName] = useState('');
    const [abbreviation, setAbbreviation] = useState('');
    const [createErrorMessage, setCreateErrorMessage] = useState('');

    const getGrapeList = async () => {
        const res = await GrapeMasterAPI.list();
        setGrapeList(res.data.grape_masters);
    };

    const addGrape = () => {
        setCreateErrorMessage('');
        GrapeMasterAPI.create({ name, abbreviation })
            .then(async () => {
                setName('');
                setAbbreviation('');
                await getGrapeList();
            })
            .catch(err => {
                setCreateErrorMessage(err.response.data);
            });
    };

    useEffect(() => {
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
                    {/* <IconButton onClick={addGrape}>+</IconButton> */}
                </Toolbar>
            </AppBar>
            <Container maxWidth="md">
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
                            <TableRow>
                                <TableCell>
                                    <TextField
                                        error={createErrorMessage.length !== 0}
                                        helperText={createErrorMessage}
                                        label="name"
                                        value={name}
                                        onChange={event => {
                                            setName(event.target.value);
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        label="abbreviation"
                                        value={abbreviation}
                                        onChange={event => {
                                            setAbbreviation(event.target.value);
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button onClick={addGrape}>Submit</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </>
    );
};
