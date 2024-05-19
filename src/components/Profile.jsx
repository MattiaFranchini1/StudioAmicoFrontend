import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import api from '../services/api';
import Rating from '@mui/material/Rating';
import Link from '@mui/material/Link'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';


const UserProfile = () => {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProfile, setIsProfile] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [bioEditValue, setBioEditValue] = useState('');

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleBioEditChange = (event) => {
        setBioEditValue(event.target.value);
    };

    const updateUserBio = async (userId, newData) => {
        try {
            const response = await api.put(`/api/users/${userId}`, newData, { withCredentials: true });
            const updatedUserData = response.data;
            setUserData(updatedUserData);
        } catch (error) {
            console.error('Error updating user bio:', error);
        }
    };

    const handleSaveBio = () => {
        //console.log('Save the new bio:', bioEditValue);
        updateUserBio(id, { bio: bioEditValue });
        handleCloseModal();
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [userDataResponse, profileResponse] = await Promise.all([
                    api.get(`/api/users/${id}`, { withCredentials: true }),
                    api.get('/api/users/profile', { withCredentials: true })
                ]);

                const userData = userDataResponse.data;
                const profileData = profileResponse.data.user;
                setBioEditValue(userData.bio || '');

                setUserData(userData);

                if (profileData._id === id) {
                    setIsProfile(true);
                }

            } catch (error) {
                console.error('Error fetching user data or profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    useEffect(() => {
        //console.log('Updated value of isProfile:', isProfile);
    }, [isProfile]);

    if (loading) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress color="primary" size={80} thickness={4} />
                <Typography variant="h6" color="white" style={{ marginTop: 16 }}>
                    Loading profile...
                </Typography>
            </Box>
        );
    }

    if (!userData) {
        return <div>Error during data fetching.</div>;
    }

    return (
        <>
            <Navbar position="static" />
            <Grid container justifyContent="center" alignItems="center" style={{ minHeight: "80vh", marginBottom: "100px" }}>
                <Grid item xs={12} md={6}>
                    <Box display="flex" flexDirection="column" alignItems="center" height="50%" marginTop="5%">
                        <Avatar
                            alt={userData.username}
                            src={userData.profile_image_url.slice(0, -6)}
                            style={{ width: '50%', height: 'auto', maxWidth: 1000 }}
                        />
                        {isProfile && (
                            <Box marginTop={2}>
                                <Button sx={{backgroundColor: '#76ABAE', color: '#EEEEEE'}} onClick={handleOpenModal}>Edit profile</Button>
                            </Box>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Box padding={3}>
                        <Typography variant="h4">{userData.username} ({userData.class})</Typography>
                        <Link href={`mailto:${userData.email}`}>
                            {userData.email}
                        </Link>
                        <Typography variant="subtitle2">
                            Utente dal {new Date(userData.registered_at).toLocaleDateString()}
                        </Typography>
                        <Box marginTop={4} />
                        <Typography variant="body1" align="justify">{userData.bio}</Typography>

                        <Box display="flex" marginTop={7}>
                            {/* Teaching Stats */}
                            <Box>
                                <Typography variant="subtitle2">
                                    Teaching Stats
                                </Typography>
                                <Rating
                                    name="teaching-rating"
                                    value={userData.teaching_review_total_stars / userData.teaching_review_total_number}
                                    readOnly
                                    size="medium"
                                    precision={0.5}
                                />
                                <Typography variant="subtitle2">
                                    ({userData.teaching_review_total_number} reviews)
                                </Typography>
                            </Box>

                            {/* Learning Stats */}
                            <Box marginLeft={2}>
                                <Typography variant="subtitle2">
                                    Learning Stats
                                </Typography>
                                <Rating
                                    name="learning-rating"
                                    value={userData.learning_review_total_stars / userData.learning_review_total_number}
                                    readOnly
                                    size="medium"
                                    precision={0.5}
                                />
                                <Typography variant="subtitle2">
                                    ({userData.learning_review_total_number} reviews)
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Dialog open={openModal} onClose={handleCloseModal} PaperProps={{ sx: { width: '80%', maxWidth: 'md' } }}>
                    <DialogTitle>Edit Profile Bio</DialogTitle>
                    <DialogContent>
                        <TextField
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={bioEditValue}
                            onChange={handleBioEditChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal} color="error" variant="outlined">
                            Annulla
                        </Button>
                        <Button color="success" variant="contained" onClick={handleSaveBio}>
                            Conferma
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </>
    );
};

export default UserProfile;
