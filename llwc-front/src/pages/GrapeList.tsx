import { Link, Navigate } from 'react-router-dom';
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
    IconButton,
    TextField,
    Dialog,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AppIcon from '../components/AppIcon';
import { useContext, useState } from 'react';
import { GrapeMasterAPI } from '../apis/GrapeMasterAPI';
import { UserContext } from '../contexts/user-context';
import { GrapeMasterContext } from '../contexts/grape-master-context';
import useGrapeMasterAPI from '../hooks/useGrapeMasterAPI';
import useUserAPI from '../hooks/useUserAPI';

export const GrapeList = () => {
    const userContext = useContext(UserContext);
    const grapeMasterContext = useContext(GrapeMasterContext);

    const { getGrapeMasterList } = useGrapeMasterAPI();
    useUserAPI();

    const [name, setName] = useState('');
    const [abbreviation, setAbbreviation] = useState('');
    const [createErrorMessage, setCreateErrorMessage] = useState('');
    const [grapeIdToDelete, setGrapeIdToDelete] = useState('');
    const [showDeleteButtons, setShowDeleteButtons] = useState(false);

    const addGrape = () => {
        setCreateErrorMessage('');
        GrapeMasterAPI.create({ name, abbreviation })
            .then(async () => {
                setName('');
                setAbbreviation('');
                await getGrapeMasterList();
            })
            .catch(err => {
                setCreateErrorMessage(err.response.data);
            });
    };

    const deleteGrape = (grapeId: string) => {
        GrapeMasterAPI.delete(grapeId)
            .then(async () => {
                await getGrapeMasterList();
            })
            .catch(err => {
                if (err.response.data[0] === 'Assigned grape, use force_delete.') {
                    setGrapeIdToDelete(grapeId);
                }
            });
    };

    const forceDelete = () => {
        GrapeMasterAPI.delete(grapeIdToDelete, true).then(async () => {
            await getGrapeMasterList();
            setGrapeIdToDelete('');
        });
    };

    if (userContext.isLoggedIn === false) {
        return <Navigate to="/login" />;
    }
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
                    <IconButton onClick={() => setShowDeleteButtons(prev => !prev)}>
                        <VisibilityIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md">
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Abbreviation</TableCell>
                                <TableCell>{showDeleteButtons && 'Delete'}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {grapeMasterContext.grapeMasterList.map(grape => (
                                <TableRow key={grape.id}>
                                    <TableCell>{grape.name}</TableCell>
                                    <TableCell>{grape.abbreviation}</TableCell>
                                    <TableCell sx={{ padding: 0 }}>
                                        {showDeleteButtons && (
                                            <IconButton
                                                onClick={() => {
                                                    deleteGrape(grape.id);
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
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
            {showDeleteButtons && (
                <Dialog
                    open={grapeIdToDelete !== ''}
                    onClose={() => {
                        setGrapeIdToDelete('');
                    }}
                >
                    <Typography>This grape is assigned to wines. Do you really want to delete it?</Typography>
                    <Button onClick={forceDelete}>DELETE</Button>
                </Dialog>
            )}
        </>
    );
};
