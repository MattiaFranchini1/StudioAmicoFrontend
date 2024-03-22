import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import api from '../services/api';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem'
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

const steps = ['Room Name', 'Class Level', 'Class Type', 'Subjects', 'Resume'];

const class_typeOptions = [
    'Informatica',
    'Meccanica',
    'Elettronica/Elettrotecnica',
    'Tessile',
    'Biennio',
];

const CreateRoom = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [roomData, setRoomData] = useState({
        room_name: '',
        subject: [],
        class_level: '',
        class_type: '',
        meet_link: '',
    });

    const handleNext = () => {
        if (validateStep()) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
            setOpenSnackbar(true);
        }
    };

    const validateStep = () => {
        const { room_name, class_level, class_type } = roomData;
        if (activeStep === 0 && room_name.trim() === '') {
            return false;
        }
        if (activeStep === 1 && !class_level) {
            return false;
        }
        if (activeStep === 2 && !class_type) {
            return false;
        }
        if (activeStep === 3 && roomData.subject.length === 0) {
            return false;
        }

        return true;
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleInputChange = (field, value) => {
        setRoomData((prevRoomData) => ({
            ...prevRoomData,
            [field]: field === 'subjects' ? value : value,
        }));
    };

    const handleCreateRoom = async () => {
        try {
            const response = await api.post('/api/rooms/', roomData, {withCredentials: true});
            console.log('Room created successfully:', response.data);
            window.location.href = '/rooms';
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    const getclass_typeOptions = () => {
        if (roomData.class_level === 1 || roomData.class_level === 2) {
            return ['Biennio'];
        } else {
            return class_typeOptions.filter(option => option !== 'Biennio');
        }
    };

    const getSubjectsOptions = () => {
        const { class_level, class_type } = roomData;

        if (class_type === 'Informatica') {
            if ((class_level == '3' || class_level == '4')) {
                return ['Italiano', 'Inglese', 'Informatica', 'Storia', 'Sistemi e reti', 'Telecomunicazioni', 'TEP', 'Matematica'];
            } else {
                return ['Italiano', 'Inglese', 'Informatica', 'Storia', 'Sistemi e reti', 'GEP', 'TEP', 'Matematica'];
            }
        } else if (class_type === 'Meccanica') {
            return ['Italiano', 'Inglese', 'Meccanica', 'Storia', 'Disegno', 'Tecnologie', 'Sistemi', 'Matematica'];
        } else if (class_type === 'Elettronica/Elettrotecnica') {
            return ['Italiano', 'Inglese', 'Elettronica', 'Storia', 'Tecnologie', 'Sistemi', 'Matematica'];
        } else if (class_type === 'Tessile') {
            return ['Italiano', 'Inglese', 'Economia', 'Storia', 'Ideazione e Progettazione', 'Tecnologie', 'Chimica ', 'Matematica'];
        } else {
            if ((class_level == '1')) {
                return ['Matematica', 'Italiano', 'Inglese', 'Fisica', 'Chimica', 'TTRG', 'Informatica', 'Storia', 'Diritto', 'Scienze'];
            } else {
                return ['Matematica', 'Italiano', 'Inglese', 'Fisica', 'Chimica', 'TTRG', 'STA', 'Storia', 'Diritto', 'Biologia', 'Geografia'];
            }
        }
    };

    return (
        <Container maxWidth="md" style={{ marginTop: '6vh', marginBottom: '20vh' }}>
            <Grid container justifyContent="center" alignItems="center" style={{ height: '100%' }}>
                <Paper elevation={3} style={{ padding: 20, borderRadius: 10, backgroundColor: 'white', width: '100%' }}>
                    <Grid container direction="column" alignItems="center" spacing={2}>
                        <Grid item>
                            <MeetingRoomIcon fontSize="large" color="primary" />
                        </Grid>
                        <Grid item>
                            <Typography variant="h4" gutterBottom>
                                Create a Room
                            </Typography>
                        </Grid>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        <Grid item>
                            <form>
                                {activeStep === 0 && (
                                    <TextField
                                        label="Room Name"
                                        fullWidth
                                        margin="normal"
                                        variant="outlined"
                                        value={roomData.room_name}
                                        onChange={(e) => handleInputChange('room_name', e.target.value)}
                                        required
                                    />
                                )}
                                {activeStep === 1 && (
                                    <TextField
                                        label="Class Level"
                                        fullWidth
                                        select
                                        margin="normal"
                                        variant="outlined"
                                        value={roomData.class_level}
                                        onChange={(e) => handleInputChange('class_level', e.target.value)}
                                        required
                                    >
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <MenuItem key={level} value={level}>
                                                {level}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                                {activeStep === 2 && (
                                    <TextField
                                        label="Class Type"
                                        fullWidth
                                        select
                                        margin="normal"
                                        variant="outlined"
                                        value={roomData.class_type}
                                        onChange={(e) => handleInputChange('class_type', e.target.value)}
                                        required
                                    >
                                        {getclass_typeOptions().map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                                {activeStep === 3 && (
                                    <Autocomplete
                                        multiple
                                        id="subjects"
                                        options={getSubjectsOptions()}
                                        value={roomData.subject}
                                        onChange={(event, newValue) => handleInputChange('subject', newValue)}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip label={option} {...getTagProps({ index })} />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Subjects"
                                                fullWidth
                                                margin="normal"
                                                variant="outlined"
                                                required
                                            />
                                        )}
                                    />
                                )}
                                {activeStep === 4 && (
                                    <Grid container direction="column" alignItems="center" spacing={2}>
                                        <Grid item>
                                            <Typography variant="h6">Summary</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1">Room Name: {roomData.room_name}</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1">Class Level: {roomData.class_level}</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1">Class Type: {roomData.class_type}</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1">Subjects: {roomData.subject.join(', ')}</Typography>
                                        </Grid>
                                    </Grid>
                                )}
                                <div style={{ marginTop: 35, display: 'flex', justifyContent: 'space-between' }}>
                                    {activeStep > 0 && (
                                        <Button variant="outlined" color="error" onClick={handleBack}>
                                            Back
                                        </Button>
                                    )}
                                    {activeStep < steps.length - 1 && (
                                        <Button variant="outlined" color="success" onClick={handleNext} style={{ marginLeft: 10 }}>
                                            Next
                                        </Button>
                                    )}
                                    {activeStep === steps.length - 1 && (
                                        <Button variant="contained" color="primary" onClick={handleCreateRoom} style={{ marginLeft: 10 }}>
                                            Create Room
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Grid>
                    </Grid>
                </Paper >
            </Grid >
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="warning">
                    Completa tutti i campi prima di procedere.
                </Alert>
            </Snackbar>
        </Container >
    );
};

export default CreateRoom;
