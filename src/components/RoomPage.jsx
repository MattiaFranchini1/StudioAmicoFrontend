import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import { Link } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { useParams } from "react-router-dom";
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import io from 'socket.io-client';
import api from '../services/api';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Alert from "@mui/material/Alert";
import Grid from '@mui/material/Grid';

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

export default function RoomPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const { roomID } = useParams();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/api/rooms/${roomID}`);
                setRoomData(response.data);
                setError(null);
            } catch (error) {
                setError(error.response?.status === 500 ? 'Page not found' : 'Error fetching room data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            setRoomData(null);
            setError(null);
        };
    }, [roomID]);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const profileResponse = await api.get('/api/users/profile', { withCredentials: true });
                setCurrentUser(profileResponse.data.user._id);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        socket.emit('joinRoom', { room: roomID });

        socket.on('loadMessages', (messages) => {
            setMessages(messages);
        });

        socket.on('message', async (newMessage) => {
            try {
                const response = await api.get(`/api/users/${newMessage.sender_user}`);
                const senderUser = response.data;
                newMessage.sender_user = senderUser;
                setMessages(prevMessages => [...prevMessages, newMessage]);
            } catch (error) {
                console.error('Error fetching sender user details:', error);
            }
        });


        return () => {
            socket.off('loadMessages');
            socket.off('message');
        };
    }, [roomID]);


    const handleMessageChange = (event) => {
        setMessage(event.target.value);
    };

    const handleSendMessage = async () => {
        try {
            if (message.trim() !== '') {
                const profileResponse = await api.get('/api/users/profile', { withCredentials: true });
                const sender_id = profileResponse.data.user._id;

                socket.emit('sendMessage', { room: roomID, sender: sender_id, text: message });
                setMessage('');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <>
            <Navbar position="fixed" />
            <Box sx={{ display: 'flex', height: '100vh' }}>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
                        {/* Main content */}
                        <Box sx={{ flex: 1, backgroundColor: "#202225" }}>
                            {/* Hamburger menu button for mobile */}
                            {isMobile && (
                                <Box
                                    sx={{
                                        flex: 1,
                                        marginTop: "4rem"
                                    }}
                                >
                                    {/* Participants section */}
                                    {roomData && roomData.participants && roomData.participants.map((participant, index) => (
                                        <div key={index}> {/* Added key prop */}
                                            <Link to={`/user/${participant._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        marginBottom: theme.spacing(2),
                                                        marginTop: theme.spacing(2),
                                                        "&:hover": {
                                                            textDecoration: 'underline',
                                                            color: '#2196f3',
                                                        }
                                                    }}
                                                >
                                                    <Avatar src={participant.profile_image_url} title={participant.username} alt={participant.username} sx={{ width: theme.spacing(5), height: theme.spacing(5) }} />
                                                    {/* <Box sx={{ marginLeft: theme.spacing(1), "&:hover": { color: '#2196f3' } }}>{participant.username}</Box> */}
                                                </Box>
                                            </Link>
                                        </div>
                                    ))}
                                </Box>
                            )}
                            {/* For non-mobile, show Participants section inline */}
                            {!isMobile && (
                                <Box sx={{ flex: 1 }}>
                                    {/* Participants section */}
                                    <h2 style={{ marginLeft: '0.5rem' }}>Partecipanti</h2>
                                    {roomData && roomData.participants && roomData.participants.map((participant, index) => (
                                        <div key={index}> {/* Added key prop */}
                                            <Link to={`/user/${participant._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        marginLeft: "0.5rem",
                                                        marginBottom: theme.spacing(2),
                                                        marginTop: theme.spacing(2),
                                                        "&:hover": {
                                                            textDecoration: 'underline',
                                                            color: '#2196f3',
                                                        }
                                                    }}
                                                >
                                                    <Avatar src={participant.profile_image_url} alt={participant.username} sx={{ width: theme.spacing(5), height: theme.spacing(5) }} />
                                                    <Box sx={{ marginLeft: theme.spacing(1), "&:hover": { color: '#2196f3' } }}>{participant.username}</Box>
                                                </Box>
                                            </Link>
                                            <Divider variant="middle" style={{ backgroundColor: '#64b5f6' }} />
                                        </div>
                                    ))}
                                </Box>
                            )}
                            {/* Display error message if there's an error */}
                            {error && <div>{error}</div>}
                        </Box>

                        <Box sx={{ flex: 5, backgroundColor: '#2f3136', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            {/* Room header */}
                            <Box sx={{ padding: theme.spacing(2), textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'white' }}>
                                    {roomData && roomData.room_name.toUpperCase()}
                                </Typography>
                            </Box>

                            <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: theme.spacing(2) }}>
                                <Box sx={{ position: 'fixed', zIndex: 999, backgroundColor: '#202225', width: isMobile ? '75%' : '80%' }}>
                                    <Alert variant="outlined" icon={false} severity="info">



                                        <Grid container>
                                            <Grid item>
                                                <Typography variant="h6" sx={{ color: 'white' }}>
                                                    {`${roomData && roomData.room_name.toUpperCase()} --- `}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="h6" sx={{ color: 'white' }}>
                                                    https://meet.google.com/asj-frth-ksl
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Alert>
                                </Box>

                                <Box sx={{ marginTop: '100px' }}>
                                </Box>

                                {messages.map((message, index) => (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: message.sender_user._id === currentUser ? 'flex-end' : 'flex-start', marginBottom: theme.spacing(2) }}>
                                        {/* Avatar e nome sopra il messaggio */}
                                        <div style={{ display: 'flex', flexDirection: message.sender_user._id === currentUser ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: theme.spacing(1) }}>
                                            <Avatar src={message.sender_user.profile_image_url} alt={message.sender_user.username} sx={{ marginRight: theme.spacing(1), width: theme.spacing(4), height: theme.spacing(4) }}>
                                                {message.sender_user.username.charAt(0)}
                                            </Avatar>
                                        </div>
                                        <div style={{ backgroundColor: '#202225', borderRadius: '16px', padding: '8px', maxWidth: '50%' }}> {/* Aggiunto borderRadius */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: message.sender_user._id === currentUser ? 'flex-end' : 'flex-start', marginBottom: theme.spacing(1) }}>
                                                {message.sender_user._id !== currentUser && (
                                                    <>
                                                        <Typography variant="body2" sx={{ color: '#539fec', marginRight: theme.spacing(1) }}>{message.sender_user.username}</Typography>
                                                    </>
                                                )}
                                                {message.sender_user._id === currentUser && (
                                                    <>
                                                        <Typography variant="body2" sx={{ color: '#539fec', marginLeft: theme.spacing(1) }}>{message.sender_user.username} (TU)</Typography>
                                                    </>
                                                )}
                                            </div>
                                            <Typography variant="body1" sx={{ color: '#fff', marginBottom: theme.spacing(1), wordWrap: 'break-word' }}>
                                                {message.content}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#fff', textAlign: 'right' }}>
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </div>
                                    </div>
                                ))}
                            </Box>

                            {/* Message input */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#2f3136',
                                    padding: theme.spacing(1),
                                    borderTop: '1px solid #ccc',
                                    position: 'sticky',
                                    bottom: 0,
                                    zIndex: 1,
                                }}
                            >
                                <TextField
                                    value={message}
                                    onChange={handleMessageChange}
                                    variant="outlined"
                                    fullWidth
                                    onKeyPress={handleKeyPress}
                                    placeholder="Write a message..."
                                    sx={{ color: 'white', backgroundColor: 'white', width: '80%' }}
                                    inputProps={{ style: { maxHeight: '40px' } }}
                                />
                                <IconButton color="primary" onClick={handleSendMessage} sx={{ marginLeft: theme.spacing(1) }}>

                                    <SendIcon />
                                </IconButton>
                            </Box>
                        </Box>

                    </>
                )}
            </Box>
        </>
    );
}

