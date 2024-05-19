import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import { Link } from "react-router-dom";
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

export default function RoomPage() {
    const [highlightedMessage, setHighlightedMessage] = useState(null);

    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const navigate = useNavigate();
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
    const messagesEndRef = useRef(null);

    const handleMouseEnter = (messageId) => {
        setHighlightedMessage(messageId);
    };
    const handleMouseLeave = () => {
        setHighlightedMessage(null);
    };

    const handleMenuOpen = (event, messageId) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedMessage(messageId);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedMessage(null);
    };

    const scrollToBottom = (options) => {
        messagesEndRef.current?.scrollIntoView(options);
    };

    useEffect(() => {
        scrollToBottom({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomResponse, profileResponse] = await Promise.all([
                    api.get(`/api/rooms/${roomID}`),
                    api.get('/api/users/profile', { withCredentials: true })
                ]);

                const roomData = roomResponse.data;
                const currentUserID = profileResponse.data.user._id;
                const isUserParticipant = roomData.participants.some(participant => participant._id === currentUserID);

                if (!isUserParticipant) {
                    //console.log("non sei dentro")
                    navigate('/rooms');
                    return;
                }
                setRoomData(roomData);
                setCurrentUser(currentUserID);
                scrollToBottom();
                setError(null);
            } catch (error) {
                setError(error.response?.status === 500 ? 'Page not found' : 'Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            setRoomData(null);
            setCurrentUser(null);
            setError(null);
        };
    }, [roomID]);

    useEffect(() => {
        return () => {
            setMenuAnchorEl(null);
            setSelectedMessage(null);
        };
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
                        <Box sx={{ flex: 1, backgroundColor: "#222831" }}>
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
                                            <Divider variant="middle" style={{ backgroundColor: '#76ABAE' }} />
                                        </div>
                                    ))}
                                </Box>
                            )}
                            {/* Display error message if there's an error */}
                            {error && <div>{error}</div>}
                        </Box>

                        <Box sx={{ flex: 5, backgroundColor: '#31363F', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            {/* Room header */}
                            <Box sx={{ padding: theme.spacing(2), textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'white' }}>
                                    {roomData && roomData.room_name.toUpperCase()}
                                </Typography>
                            </Box>

                            <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: theme.spacing(2) }}>
                                <Box sx={{ position: 'fixed', zIndex: 999, backgroundColor: '#222831', width: isMobile ? '75%' : '80%' }}>
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
                                        <div onMouseEnter={() => handleMouseEnter(message._id)} onMouseLeave={handleMouseLeave} style={{ backgroundColor: '#222831', borderRadius: '16px', padding: '8px', maxWidth: '50%' }}> {/* Aggiunto borderRadius */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: message.sender_user._id === currentUser ? 'flex-end' : 'flex-start', marginBottom: theme.spacing(1) }}>
                                                {message.sender_user._id !== currentUser && (
                                                    <>
                                                        <Typography variant="body2" sx={{ color: '#76ABAE', marginRight: theme.spacing(1) }}>{message.sender_user.username}</Typography>
                                                        {highlightedMessage === message._id && (
                                                            <IconButton size="small" onClick={(event) => handleMenuOpen(event, message._id)} sx={{ color: 'white' }}>
                                                                <MoreVertIcon />
                                                            </IconButton>
                                                        )}
                                                        <Menu
                                                            anchorEl={menuAnchorEl}
                                                            open={Boolean(menuAnchorEl) && selectedMessage === message._id}
                                                            onClose={handleMenuClose}
                                                            PaperProps={{
                                                                elevation: 0,
                                                                sx: {
                                                                    backgroundColor: '#333',
                                                                    minWidth: '140px',
                                                                },
                                                            }}
                                                        >
                                                            <MenuItem onClick={handleMenuClose} sx={{ color: 'white', fontSize: '14px' }}>
                                                                <DeleteIcon sx={{ marginRight: '8px' }} />
                                                                Elimina
                                                            </MenuItem>
                                                        </Menu>

                                                    </>
                                                )}
                                                {message.sender_user._id === currentUser && (
                                                    <>
                                                        {highlightedMessage === message._id && (
                                                            <IconButton size="small" onClick={(event) => handleMenuOpen(event, message._id)} sx={{ color: 'white' }}>
                                                                <MoreVertIcon />
                                                            </IconButton>
                                                        )}
                                                        <Menu
                                                            anchorEl={menuAnchorEl}
                                                            open={Boolean(menuAnchorEl) && selectedMessage === message._id}
                                                            onClose={handleMenuClose}
                                                            PaperProps={{
                                                                elevation: 0,
                                                                sx: {
                                                                    backgroundColor: '#333',
                                                                    minWidth: '140px',
                                                                },
                                                            }}
                                                        >
                                                            <MenuItem onClick={handleMenuClose} sx={{ color: 'white', fontSize: '14px' }}>
                                                                <EditIcon sx={{ marginRight: '8px' }} />
                                                                Modifica
                                                            </MenuItem>
                                                            <MenuItem onClick={handleMenuClose} sx={{ color: 'white', fontSize: '14px' }}>
                                                                <DeleteIcon sx={{ marginRight: '8px' }} />
                                                                Elimina
                                                            </MenuItem>
                                                        </Menu>
                                                        <Typography variant="body2" sx={{ color: '#76ABAE', marginLeft: theme.spacing(1) }}>{message.sender_user.username} (TU)</Typography>
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
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Message input */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#31363F',
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
                                    multiline
                                    onKeyPress={handleKeyPress}
                                    placeholder="Write a message..."
                                    sx={{ color: 'white', backgroundColor: 'white', width: '80%' }}
                                    inputProps={{ style: { maxHeight: '40px' } }}
                                />
                                <IconButton onClick={handleSendMessage} sx={{ marginLeft: theme.spacing(1) , backgroundColor: '#76ABAE'}}>

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

