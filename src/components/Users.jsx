import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  CircularProgress,
  Box,
  Rating,
  Divider,
  CardActionArea,
  TextField,
  useMediaQuery,
  useTheme,
  Skeleton,
} from '@mui/material';

const formatDate = (dateString) => {
  const registrationDate = new Date(dateString);
  return registrationDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
};

const UserCard = ({ user }) => {
    const { 
      _id, 
      username,
      profile_image_url,
      registered_at,
      teaching_review_total_stars,
      teaching_review_total_number,
      learning_review_total_stars,
      learning_review_total_number,
    } = user;
  
    const [imageError, setImageError] = useState(false);
  
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={_id}>
        <Card style={{ backgroundColor: '#212121', color: '#ffffff' }}>
          <CardActionArea style={{ padding: '1vh' }}>
            <Avatar
              alt={username}
              src={profile_image_url}
              sx={{
                width: '35%',
                height: 'auto',
                margin: '0 auto',
                border: '1.0px solid #64b5f6',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              }}
              onError={() => setImageError(true)}
            >
              {!profile_image_url || imageError ? (
                <Skeleton variant="circular" width={'35%'} height={'auto'} />
              ) : null}
            </Avatar>
            <CardContent>
              <Typography variant="subtitle1" align="center" sx={{ fontWeight: 'bold' }}>
                {username}
              </Typography>
              <Typography variant="body2" align="center" sx={{ color: '#ffffff' }}>
                {`Utente da ${formatDate(registered_at)}`}
              </Typography>
  
              <Divider variant="fullWidth" style={{ margin: '10px 0', backgroundColor: '#64b5f6' }} />
  
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <Typography variant="subtitle2" color="#64b5f6">
                  Teaching Stats
                </Typography>
                <Rating name="read-only" value={teaching_review_total_stars / teaching_review_total_number} readOnly size="small" precision={0.5}/>
                <Typography variant="subtitle2" color="#64b5f6">
                  ({teaching_review_total_number})
                </Typography>
              </div>
  
              <Divider variant="middle" style={{ margin: '10px', backgroundColor: '#64b5f6' }} />
  
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <Typography variant="subtitle2" color="#64b5f6">
                  Learning Stats
                </Typography>
                <Rating name="read-only" value={learning_review_total_stars / learning_review_total_number} readOnly size="small" precision={0.5}/>
                <Typography variant="subtitle2" color="#64b5f6">
                  ({learning_review_total_number})
                </Typography>
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };


const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minTeachingStars, setMinTeachingStars] = useState(0);
  const [minLearningStars, setMinLearningStars] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/users/', { withCredentials: true });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const filteredUsers = users.filter((user) => {
    const teachingStars = Math.round(user.teaching_review_total_stars / user.teaching_review_total_number * 2) / 2;
    const learningStars = Math.round(user.learning_review_total_stars / user.learning_review_total_number * 2) / 2;
  
    return (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      teachingStars >= minTeachingStars &&
      learningStars >= minLearningStars
    );
  });

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
          Caricamento in corso...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      minHeight="100vh"
      marginBottom="150px"
    >
      <Container>
        <Box
          mb={3}
          mt={3}
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems="center"
          bgcolor="#fff"
          p={2}
          borderRadius={8}
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
        >
          <TextField
            label="Cerca per nome"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: isMobile ? 16 : 0, flex: isMobile ? 1 : undefined, marginRight: isMobile ? 0 : 40 }} // Aggiunto marginRight
            InputProps={{
              style: { color: 'black' },
            }}
          />
          <Box
            display="flex"
            flexDirection={isMobile ? 'column' : 'row'}
            alignItems="center"
            justifyContent="space-between"
            flex={isMobile ? 1 : undefined}
          >
            <Typography variant="subtitle2" style={{ marginRight: isMobile ? 0 : 16, color: 'black' }}>
              Teaching Stars
            </Typography>
            <Box display="flex" alignItems="center" style={{ marginRight: isMobile ? 0 : 16 }}>
              <Rating
                name="filter-teaching-stars"
                value={minTeachingStars}
                onChange={(event, newValue) => setMinTeachingStars(newValue)}
                precision={0.5}
              />
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ marginLeft: 4, color: 'black' }}
              >
                {/*{minTeachingStars !== null ? minTeachingStars.toFixed(1) : ''}*/}
              </Typography>
            </Box>
            <Typography variant="subtitle2" style={{ marginLeft: isMobile ? 0 : 16, color: 'black' }}>
              Learning Stars
            </Typography>
            <Box display="flex" alignItems="center" style={{ marginLeft: isMobile ? 0 : 16 }}>
              <Rating
                name="filter-learning-stars"
                value={minLearningStars}
                onChange={(event, newValue) => setMinLearningStars(newValue)}
                precision={0.5}
              />
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ marginLeft: 4, color: 'black' }}
              >
                {/*{minLearningStars !== null ? minLearningStars.toFixed(1) : ''}*/}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Grid container spacing={3} justifyContent="center">
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default UserList;