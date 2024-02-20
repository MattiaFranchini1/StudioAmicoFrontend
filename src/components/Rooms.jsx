import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Importa Link da react-router-dom
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import api from '../services/api';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import PeopleIcon from '@mui/icons-material/People';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterClassType, setFilterClassType] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');



  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/api/users/profile", { withCredentials: true });
        //console.log(response.data)
        setUserProfile(response.data.user);
      } catch (error) {
        console.error("Errore nel recupero del profilo utente:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/rooms/all", { withCredentials: true });
        //console.log(response.data);

        const roomsWithUsers = await Promise.all(
          response.data.map(async (room) => {
            const userResponse = await api.get(`/api/users/${room.host_user}`, { withCredentials: true });
            //console.log(userResponse.data)
            const createdByUser = userResponse.data;

            return { ...room, host_user: createdByUser };
          })
        );

        setRooms(roomsWithUsers);
        setLoading(false);
      } catch (error) {
        console.error("Errore nella richiesta delle stanze:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isUserAlreadyJoined = (room) => {
    //console.log("PROFILOOO", userProfile)
    return userProfile && userProfile.rooms.includes(room._id);
  };

  const handleFilterNameChange = (event) => {
    setFilterName(event.target.value);
  };

  const handleFilterLevelChange = (event) => {
    setFilterLevel(event.target.value);
  };

  const handleFilterClassTypeChange = (event) => {
    setFilterClassType(event.target.value);
  };

  const handleOpenModal = (room) => {
    setSelectedRoom(room);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const filteredRooms = rooms.filter((room) => {
    const nameMatch = room.room_name.toLowerCase().includes(filterName.toLowerCase());
    //console.log("Anno classe ->", filterLevel)
    const levelMatch = !filterLevel || room.class_level === filterLevel;
    const classTypeMatch = !filterClassType || room.class_type.toLowerCase().includes(filterClassType.toLowerCase());

    return nameMatch && levelMatch && classTypeMatch;
  });

  const handleJoinRoom = async (roomId) => {
    try {
      await api.post(`/api/rooms/${roomId}/join`, {}, { withCredentials: true });
      window.location.reload();
      console.log('Unione alla stanza riuscita!');
    } catch (error) {
      console.error('Errore durante l\'unione alla stanza:', error);
    }
  };

  return (
    <Container maxWidth="xl" style={{ marginTop: 20, marginBottom: 150 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px' }}>

        <div style={{ marginRight: 10 }}>
          <InputBase
            placeholder="Search by room name"
            value={filterName}
            onChange={handleFilterNameChange}
          />
          <IconButton type="submit" aria-label="search">
            <SearchIcon />
          </IconButton>
        </div>

        <div style={{ marginRight: 10 }}>
          <Select
            value={filterLevel}
            onChange={handleFilterLevelChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
          >
            <MenuItem value="" disabled>
              Filter by Level
            </MenuItem>
            {[1, 2, 3, 4, 5].map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </Select>
        </div>

        <div style={{ marginRight: 10 }}>
          <InputBase
            placeholder="Filter by Class Type"
            value={filterClassType}
            onChange={handleFilterClassTypeChange}
          />
          <IconButton type="submit" aria-label="search">
            <SearchIcon />
          </IconButton>
        </div>
      </div>


      <div style={{ marginTop: 20 }}></div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <CircularProgress color="primary" size={80} thickness={4} />
            <Typography variant="h6" color="white" style={{ marginTop: 16 }}>
              Stiamo recuperando tutte le informazioni riguardo le stanze...
            </Typography>
          </Box>
        </div>
      ) : (
        <Grid container spacing={2}>
          {filteredRooms.map((room) => (
            <Grid item key={room._id} xs={12} sm={6} md={4} lg={3}>
              <Card style={{ marginBottom: 15 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h5"
                      color="text.primary"
                      align="center"
                      style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', textTransform: 'uppercase' }}
                    >
                      {room.room_name}
                    </Typography>
                  }
                  subheader={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Link
                        to={`/user/${room.host_user._id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          borderBottom: '1px solid transparent',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = '#2196f3')}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                      >
                        <Typography variant="body2" color="text.secondary" style={{ marginRight: 8 }}>
                          Created by {room.host_user.username}
                        </Typography>
                      </Link>
                      <Avatar
                        alt={room.host_user.username}
                        src={room.host_user.profile_image_url}
                        sx={{
                          width: 24,
                          height: 24,
                        }}
                      />
                    </div>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Class:</strong> {room.class_level}° {room.class_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Participants:</strong>
                        <Badge badgeContent={room.participants.length} color="primary" size="small">
                          <PeopleIcon fontSize="small" />
                        </Badge>
                      </Typography>
                    </Grid>
                  </Grid>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                    {room.subject.map((subject) => (
                      <Chip key={subject} label={subject} style={{ margin: 4, backgroundColor: '#c0c0c0' }} />
                    ))}
                  </div>
                </CardContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, marginRight: 10 }}>
                  {isUserAlreadyJoined(room) ? (
                    <Button variant="contained" color="success" disabled>
                      Già unito
                    </Button>
                  ) : (
                    <Button variant="outlined" color="primary" startIcon={<GroupAddOutlinedIcon />} onClick={() => handleOpenModal(room)}>
                      Unisciti
                    </Button>
                  )}
                </div>
              </Card>
            </Grid>
          ))}

{filteredRooms.map((room) => (
            <Grid item key={room._id} xs={12} sm={6} md={4} lg={3}>
              <Card style={{ marginBottom: 15 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h5"
                      color="text.primary"
                      align="center"
                      style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', textTransform: 'uppercase' }}
                    >
                      {room.room_name}
                    </Typography>
                  }
                  subheader={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Link
                        to={`/user/${room.host_user._id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          borderBottom: '1px solid transparent',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = '#2196f3')}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                      >
                        <Typography variant="body2" color="text.secondary" style={{ marginRight: 8 }}>
                          Created by {room.host_user.username}
                        </Typography>
                      </Link>
                      <Avatar
                        alt={room.host_user.username}
                        src={room.host_user.profile_image_url}
                        sx={{
                          width: 24,
                          height: 24,
                        }}
                      />
                    </div>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Class:</strong> {room.class_level}° {room.class_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Participants:</strong>
                        <Badge badgeContent={room.participants.length} color="primary" size="small">
                          <PeopleIcon fontSize="small" />
                        </Badge>
                      </Typography>
                    </Grid>
                  </Grid>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                    {room.subject.map((subject) => (
                      <Chip key={subject} label={subject} style={{ margin: 4, backgroundColor: '#c0c0c0' }} />
                    ))}
                  </div>
                </CardContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, marginRight: 10 }}>
                  {isUserAlreadyJoined(room) ? (
                    <Button variant="contained" color="success" disabled>
                      Già unito
                    </Button>
                  ) : (
                    <Button variant="outlined" color="primary" startIcon={<GroupAddOutlinedIcon />} onClick={() => handleOpenModal(room)}>
                      Unisciti
                    </Button>
                  )}
                </div>
              </Card>
            </Grid>
          ))}



{filteredRooms.map((room) => (
            <Grid item key={room._id} xs={12} sm={6} md={4} lg={3}>
              <Card style={{ marginBottom: 15 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h5"
                      color="text.primary"
                      align="center"
                      style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', textTransform: 'uppercase' }}
                    >
                      {room.room_name}
                    </Typography>
                  }
                  subheader={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Link
                        to={`/user/${room.host_user._id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          borderBottom: '1px solid transparent',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = '#2196f3')}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                      >
                        <Typography variant="body2" color="text.secondary" style={{ marginRight: 8 }}>
                          Created by {room.host_user.username}
                        </Typography>
                      </Link>
                      <Avatar
                        alt={room.host_user.username}
                        src={room.host_user.profile_image_url}
                        sx={{
                          width: 24,
                          height: 24,
                        }}
                      />
                    </div>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Class:</strong> {room.class_level}° {room.class_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Participants:</strong>
                        <Badge badgeContent={room.participants.length} color="primary" size="small">
                          <PeopleIcon fontSize="small" />
                        </Badge>
                      </Typography>
                    </Grid>
                  </Grid>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                    {room.subject.map((subject) => (
                      <Chip key={subject} label={subject} style={{ margin: 4, backgroundColor: '#c0c0c0' }} />
                    ))}
                  </div>
                </CardContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, marginRight: 10 }}>
                  {isUserAlreadyJoined(room) ? (
                    <Button variant="contained" color="success" disabled>
                      Già unito
                    </Button>
                  ) : (
                    <Button variant="outlined" color="primary" startIcon={<GroupAddOutlinedIcon />} onClick={() => handleOpenModal(room)}>
                      Unisciti
                    </Button>
                  )}
                </div>
              </Card>
            </Grid>
          ))}



{filteredRooms.map((room) => (
            <Grid item key={room._id} xs={12} sm={6} md={4} lg={3}>
              <Card style={{ marginBottom: 15 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h5"
                      color="text.primary"
                      align="center"
                      style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', textTransform: 'uppercase' }}
                    >
                      {room.room_name}
                    </Typography>
                  }
                  subheader={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Link
                        to={`/user/${room.host_user._id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          borderBottom: '1px solid transparent',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = '#2196f3')}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                      >
                        <Typography variant="body2" color="text.secondary" style={{ marginRight: 8 }}>
                          Created by {room.host_user.username}
                        </Typography>
                      </Link>
                      <Avatar
                        alt={room.host_user.username}
                        src={room.host_user.profile_image_url}
                        sx={{
                          width: 24,
                          height: 24,
                        }}
                      />
                    </div>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Class:</strong> {room.class_level}° {room.class_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Participants:</strong>
                        <Badge badgeContent={room.participants.length} color="primary" size="small">
                          <PeopleIcon fontSize="small" />
                        </Badge>
                      </Typography>
                    </Grid>
                  </Grid>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                    {room.subject.map((subject) => (
                      <Chip key={subject} label={subject} style={{ margin: 4, backgroundColor: '#c0c0c0' }} />
                    ))}
                  </div>
                </CardContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, marginRight: 10 }}>
                  {isUserAlreadyJoined(room) ? (
                    <Button variant="contained" color="success" disabled>
                      Già unito
                    </Button>
                  ) : (
                    <Button variant="outlined" color="primary" startIcon={<GroupAddOutlinedIcon />} onClick={() => handleOpenModal(room)}>
                      Unisciti
                    </Button>
                  )}
                </div>
              </Card>
            </Grid>
          ))}



{filteredRooms.map((room) => (
            <Grid item key={room._id} xs={12} sm={6} md={4} lg={3}>
              <Card style={{ marginBottom: 15 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h5"
                      color="text.primary"
                      align="center"
                      style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', textTransform: 'uppercase' }}
                    >
                      {room.room_name}
                    </Typography>
                  }
                  subheader={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Link
                        to={`/user/${room.host_user._id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          borderBottom: '1px solid transparent',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = '#2196f3')}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                      >
                        <Typography variant="body2" color="text.secondary" style={{ marginRight: 8 }}>
                          Created by {room.host_user.username}
                        </Typography>
                      </Link>
                      <Avatar
                        alt={room.host_user.username}
                        src={room.host_user.profile_image_url}
                        sx={{
                          width: 24,
                          height: 24,
                        }}
                      />
                    </div>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Class:</strong> {room.class_level}° {room.class_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Participants:</strong>
                        <Badge badgeContent={room.participants.length} color="primary" size="small">
                          <PeopleIcon fontSize="small" />
                        </Badge>
                      </Typography>
                    </Grid>
                  </Grid>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                    {room.subject.map((subject) => (
                      <Chip key={subject} label={subject} style={{ margin: 4, backgroundColor: '#c0c0c0' }} />
                    ))}
                  </div>
                </CardContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, marginRight: 10 }}>
                  {isUserAlreadyJoined(room) ? (
                    <Button variant="contained" color="success" disabled>
                      Già unito
                    </Button>
                  ) : (
                    <Button variant="outlined" color="primary" startIcon={<GroupAddOutlinedIcon />} onClick={() => handleOpenModal(room)}>
                      Unisciti
                    </Button>
                  )}
                </div>
              </Card>
            </Grid>
          ))}


{filteredRooms.map((room) => (
            <Grid item key={room._id} xs={12} sm={6} md={4} lg={3}>
              <Card style={{ marginBottom: 15 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h5"
                      color="text.primary"
                      align="center"
                      style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', textTransform: 'uppercase' }}
                    >
                      {room.room_name}
                    </Typography>
                  }
                  subheader={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Link
                        to={`/user/${room.host_user._id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          borderBottom: '1px solid transparent',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = '#2196f3')}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                      >
                        <Typography variant="body2" color="text.secondary" style={{ marginRight: 8 }}>
                          Created by {room.host_user.username}
                        </Typography>
                      </Link>
                      <Avatar
                        alt={room.host_user.username}
                        src={room.host_user.profile_image_url}
                        sx={{
                          width: 24,
                          height: 24,
                        }}
                      />
                    </div>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Class:</strong> {room.class_level}° {room.class_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Participants:</strong>
                        <Badge badgeContent={room.participants.length} color="primary" size="small">
                          <PeopleIcon fontSize="small" />
                        </Badge>
                      </Typography>
                    </Grid>
                  </Grid>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                    {room.subject.map((subject) => (
                      <Chip key={subject} label={subject} style={{ margin: 4, backgroundColor: '#c0c0c0' }} />
                    ))}
                  </div>
                </CardContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, marginRight: 10 }}>
                  {isUserAlreadyJoined(room) ? (
                    <Button variant="contained" color="success" disabled>
                      Già unito
                    </Button>
                  ) : (
                    <Button variant="outlined" color="primary" startIcon={<GroupAddOutlinedIcon />} onClick={() => handleOpenModal(room)}>
                      Unisciti
                    </Button>
                  )}
                </div>
              </Card>
            </Grid>
          ))}


{filteredRooms.map((room) => (
            <Grid item key={room._id} xs={12} sm={6} md={4} lg={3}>
              <Card style={{ marginBottom: 15 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h5"
                      color="text.primary"
                      align="center"
                      style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', textTransform: 'uppercase' }}
                    >
                      {room.room_name}
                    </Typography>
                  }
                  subheader={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Link
                        to={`/user/${room.host_user._id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          borderBottom: '1px solid transparent',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = '#2196f3')}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                      >
                        <Typography variant="body2" color="text.secondary" style={{ marginRight: 8 }}>
                          Created by {room.host_user.username}
                        </Typography>
                      </Link>
                      <Avatar
                        alt={room.host_user.username}
                        src={room.host_user.profile_image_url}
                        sx={{
                          width: 24,
                          height: 24,
                        }}
                      />
                    </div>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Class:</strong> {room.class_level}° {room.class_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.primary" align="center">
                        <strong>Participants:</strong>
                        <Badge badgeContent={room.participants.length} color="primary" size="small">
                          <PeopleIcon fontSize="small" />
                        </Badge>
                      </Typography>
                    </Grid>
                  </Grid>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                    {room.subject.map((subject) => (
                      <Chip key={subject} label={subject} style={{ margin: 4, backgroundColor: '#c0c0c0' }} />
                    ))}
                  </div>
                </CardContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, marginRight: 10 }}>
                  {isUserAlreadyJoined(room) ? (
                    <Button variant="contained" color="success" disabled>
                      Già unito
                    </Button>
                  ) : (
                    <Button variant="outlined" color="primary" startIcon={<GroupAddOutlinedIcon />} onClick={() => handleOpenModal(room)}>
                      Unisciti
                    </Button>
                  )}
                </div>
              </Card>
            </Grid>
          ))}


          
        </Grid>
      )}

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>{selectedRoom.room_name}</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler unirti a questa stanza?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="error" variant="outlined">
            Annulla
          </Button>
          <Button
            onClick={() => {
              handleJoinRoom(selectedRoom._id);
              handleCloseModal();
            }}
            color="success"
            variant="contained"
            autoFocus
          >
            Conferma
          </Button>
        </DialogActions>
      </Dialog>


    </Container>
  );
}
