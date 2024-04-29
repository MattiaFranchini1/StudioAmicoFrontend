import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Navbar from './Navbar.jsx';
import { Box, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert, Divider, Avatar } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import api from '../services/api';
import { dateCalendarClasses } from '@mui/x-date-pickers';
import { Link } from 'react-router-dom';


const HomePage = () => {
    const [openAddEventDialog, setOpenAddEventDialog] = useState(false);
    const [openViewEventDialog, setOpenViewEventDialog] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', start: null, end: null });
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [titleOptions, setTitleOptions] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null); // Stato per memorizzare l'evento selezionato
    const [showToast, setShowToast] = useState(false); // Stato per mostrare/nascondere il toast
    const [messagesArray, setMessagesArray] = useState([]);
    const [username_loggato, setusername_loggato] = useState([]);
    const [visibleMessagesCount, setVisibleMessagesCount] = useState(5);

    // Funzione asincrona per ottenere le opzioni del titolo dalla chiamata API
    const fetchOptions = async () => {
        try {
            const response = await api.get('api/rooms', { withCredentials: true });
            setTitleOptions(response.data); // Memorizza le opzioni del titolo nello stato
            console.log(response.data)
            const messagesArray = response.data.reduce((acc, room) => {
                const roomMessages = room.messages.map(message => message);
                return acc.concat(roomMessages);
            }, []);

            // Ordina gli oggetti dei messaggi per timestamp
            messagesArray.sort((a, b) => {
                // Converti i timestamp in oggetti Date per consentire un ordinamento corretto
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                // Ordina in base al timestamp
                return dateB - dateA;
            });

            console.log(messagesArray);
            setMessagesArray(messagesArray)
            await fetchUserDetails(messagesArray);

        } catch (error) {
            console.error('Errore durante il recupero delle opzioni del titolo:', error);
        }
    };

    const fetchUserDetails = async (messages) => {
        try {
            // Ottieni gli ID univoci degli utenti e delle stanze da tutti i messaggi
            const userIds = Array.from(new Set(messages.map(message => message.sender_user)));
            const roomIds = Array.from(new Set(messages.map(message => message.room)));

            // Ottieni i dettagli degli utenti per ciascun ID
            const userDetailsPromises = userIds.map(userId => api.get(`/api/users/${userId}`));
            const roomsDetailsPromises = roomIds.map(roomId => api.get(`/api/rooms/${roomId}`));

            // Attendi il completamento di tutte le chiamate API
            const userDetailsResponses = await Promise.all(userDetailsPromises);
            const roomsDetailsResponses = await Promise.all(roomsDetailsPromises);

            // Costruisci un mappaggio degli ID utente ai dettagli dell'utente
            const userDetailsMap = userDetailsResponses.reduce((map, response) => {
                const user = response.data;
                map[user._id] = user;
                return map;
            }, {});

            // Costruisci un mappaggio degli ID stanza ai dettagli della stanza
            const roomsDetailsMap = roomsDetailsResponses.reduce((map, response) => {
                const room = response.data;
                map[room._id] = room;
                return map;
            }, {});

            // Aggiorna i dettagli degli utenti e delle stanze per ciascun messaggio
            const updatedMessages = messages.map(message => {
                const user = userDetailsMap[message.sender_user];
                const room = roomsDetailsMap[message.room];
                console.log(room)
                return {
                    ...message,
                    sender_name: user.username,
                    sender_profile_image: user.profile_image_url,
                    room_name: room.room_name // Aggiungi il nome della stanza al messaggio
                };
            });

            // Aggiorna lo stato dei messaggi con i dettagli aggiornati degli utenti e delle stanze
            setMessagesArray(updatedMessages);
            console.log(updatedMessages);
        } catch (error) {
            console.error('Errore durante il recupero dei dettagli degli utenti e delle stanze:', error);
        }
    };

    // Effettua la chiamata API quando il componente viene montato
    useEffect(() => {
        fetchOptions();
        fetchCalendarEvents(); // Ottieni gli eventi del calendario all'inizio
    }, []);

    // Funzione per ottenere gli eventi del calendario all'inizio
    const fetchCalendarEvents = async () => {
        try {
            const profileResponse = await api.get('/api/users/profile');
            const userId = profileResponse.data.user._id;
            setusername_loggato(profileResponse.data.user.username)
            const eventsResponse = await api.get(`/api/users/${userId}/events`);
            const events = eventsResponse.data;
            setCalendarEvents(events);
        } catch (error) {
            console.error('Errore durante il recupero degli eventi del calendario:', error);
        }
    };

    const handleOpenAddEventDialog = () => {
        setOpenAddEventDialog(true);
    };

    const handleCloseAddEventDialog = () => {
        setOpenAddEventDialog(false);
        setNewEvent({ title: '', start: null, end: null });
    };

    const handleOpenViewEventDialog = () => {
        setOpenViewEventDialog(true);
    };

    const handleCloseViewEventDialog = () => {
        setOpenViewEventDialog(false);
    };

    const handleAddEvent = async () => {
        try {
            // Effettua la chiamata API per aggiungere un nuovo evento
            const profileResponse = await api.get('/api/users/profile');
            const userId = profileResponse.data.user._id;
            const response = await api.post(`/api/users/${userId}/events`, {
                title: newEvent.title,
                start: newEvent.start,
                end: newEvent.end
            });
            const addedEvent = response.data;
            // Aggiorna lo stato degli eventi nel calendario con il nuovo evento aggiunto
            setCalendarEvents(prevEvents => [...prevEvents, addedEvent]);
            handleCloseAddEventDialog();
        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'evento:', error);
        }
    };

    // Funzione per gestire il click su un evento nel calendario
    const handleEventClick = (info) => {
        setSelectedEvent(info.event); // Imposta l'evento selezionato nello stato
        handleOpenViewEventDialog(); // Apre il dialogo per visualizzare le informazioni dell'evento selezionato
    };

    // Funzione per gestire la cancellazione di un evento
    const handleDeleteEvent = async () => {
        try {
            const eventId = selectedEvent._def.extendedProps._id;
            const profileResponse = await api.get('/api/users/profile');
            const userId = profileResponse.data.user._id;
            await api.delete(`/api/users/${userId}/events/${eventId}`);
            // Ricarica gli eventi del calendario dopo la cancellazione
            fetchCalendarEvents();
            setShowToast(true); // Mostra il toast
            handleCloseViewEventDialog(); // Chiude il dialogo
        } catch (error) {
            console.error('Errore durante la cancellazione dell\'evento:', error);
        }
    };

    return (
        <>
            <Navbar position="static" />
            <Box p={3} >
                <Grid container spacing={3}>
                    <Box p={3}>
                        <Grid container spacing={3} >
                            <Grid item xs={9}> {/* Tre quarti della pagina */}
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    events={calendarEvents}
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                    }}
                                    buttonText={{
                                        today: 'Oggi',
                                        month: 'Mese',
                                        week: 'Settimana',
                                        day: 'Giorno',
                                    }}
                                    height="auto"
                                    eventClick={handleEventClick}
                                />
                            </Grid>
                            <Grid item xs={3}> {/* Un quarto della pagina */}
                                <Box bgcolor="#212121" p={2} maxHeight={500} overflow="auto">
                                    <Typography variant="h6" gutterBottom style={{ color: '#ffffff' }}>Ultimi aggiornamenti dalle tue stanze...</Typography>
                                    <div style={{ marginBottom: '10px' }}>
                                        <Divider style={{ backgroundColor: '#64b5f6' }} />
                                    </div>
                                    {messagesArray.slice().filter(message => message.sender_name !== username_loggato).slice(0, visibleMessagesCount).map(message => (
                                        <div key={message._id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#424242', borderRadius: '5px' }}>
                                            <Grid container alignItems="center" spacing={2}>
                                                {/* Avatar */}
                                                <Grid item>
                                                    <Avatar src={message.sender_profile_image} alt="Avatar" />
                                                </Grid>
                                                {/* Informazioni e messaggio */}
                                                <Grid item xs>
                                                    <Link
                                                        to={`/room/${message.room}`}
                                                        style={{
                                                            textDecoration: 'none',
                                                            color: 'inherit',
                                                            borderBottom: '1px solid transparent',
                                                            transition: 'border-color 0.2s',
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget.style.borderColor = '#2196f3')}
                                                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                                                    >
                                                        <Typography variant="subtitle1" style={{ color: '#ffffff' }}>
                                                            {message.room_name}
                                                        </Typography>
                                                    </Link>
                                                    <Typography variant="body2" style={{ color: '#ffffff' }}>
                                                        <span style={{ color: '#64b5f6' }}> • </span> {message.sender_name}
                                                    </Typography>
                                                    <Typography variant="body2" style={{ color: '#ffffff' }}>
                                                        {message.content}
                                                    </Typography>
                                                </Grid>
                                                {/* Ora */}
                                                <Grid item>
                                                    <Typography variant="body2" style={{ color: '#ffffff' }}>
                                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </div>
                                    ))}

                                    {visibleMessagesCount < messagesArray.length && (
                                        <Button onClick={() => setVisibleMessagesCount(prevCount => prevCount + 5)}>
                                            Mostra altri
                                        </Button>
                                    )}

                                </Box>


                            </Grid>
                        </Grid>
                    </Box>

                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" onClick={handleOpenAddEventDialog}>Aggiungi nuovo evento</Button>
                    </Grid>
                </Grid>
            </Box>
            <Dialog open={openViewEventDialog} onClose={handleCloseViewEventDialog}>
                <DialogTitle>Dettagli Evento</DialogTitle>
                <DialogContent>
                    {selectedEvent && (
                        <div>
                            <Typography variant="h6">{selectedEvent.title}</Typography>
                            <Typography>{`Inizio: ${selectedEvent.start}`}</Typography>
                            <Typography>{`Fine: ${selectedEvent.end}`}</Typography>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseViewEventDialog} color="primary">
                        Chiudi
                    </Button>
                    <Button onClick={handleDeleteEvent} color="secondary">
                        Cancella
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openAddEventDialog} onClose={handleCloseAddEventDialog}>
                <DialogTitle>Aggiungi Evento</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="title"
                        label="Titolo"
                        select // Rendi il campo di input un menu a discesa
                        fullWidth
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    >
                        {titleOptions.map((option) => (
                            <MenuItem key={option._id} value={option.room_name}>
                                {option.room_name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Inizio"
                            value={newEvent.start}
                            onChange={(date) => setNewEvent({ ...newEvent, start: date })}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <TimePicker
                            label="Orario di inizio"
                            value={newEvent.start}
                            onChange={(time) => setNewEvent({ ...newEvent, start: time })}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <DatePicker
                            label="Fine"
                            value={newEvent.end}
                            onChange={(date) => setNewEvent({ ...newEvent, end: date })}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <TimePicker
                            label="Orario di fine"
                            value={newEvent.end}
                            onChange={(time) => setNewEvent({ ...newEvent, end: time })}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddEventDialog} color="primary">
                        Annulla
                    </Button>
                    <Button onClick={handleAddEvent} color="primary">
                        Aggiungi
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Snackbar per mostrare il toast */}
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={showToast}
                autoHideDuration={4000}
                onClose={() => setShowToast(false)}
            >
                <Alert onClose={() => setShowToast(false)} severity="info">
                    Evento cancellato con successo
                </Alert>
            </Snackbar>
        </>
    );
};

export default HomePage;
