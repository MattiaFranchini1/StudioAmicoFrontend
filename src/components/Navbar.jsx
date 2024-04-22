import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import api from '../services/api';

const pages = ['Rooms', 'Users'];
const settings = ['Profile', 'Logout'];

function ResponsiveAppBar({ position }) {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [userRooms, setUserRooms] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  useEffect(() => {
    const fetchUserRooms = async () => {
      try {
        const response = await api.get('api/rooms', { withCredentials: true });
        setUserRooms(response.data);
      } catch (error) {
        console.error('Errore durante il recupero delle stanze:', error);
      }
    };

    fetchUserRooms();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('api/users/profile', { withCredentials: true });
        //console.log(response.data);
        setUserProfile(response.data.user);
      } catch (error) {
        console.error('Errore durante il recupero del profilo:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      await api.get('api/users/logout', { withCredentials: true });
      window.location.href = '/login';

      setUserProfile(null);
      handleCloseUserMenu();
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleRoomSelection = (event, value) => {
    if (value) {
      window.location.href = `/room/${value._id}`; // Redirect to the selected room
    }
  };

  return (
    <AppBar position={position}>
      <Container maxWidth="xxl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'black',
              textDecoration: 'none',
            }}
          >
            STUDIO AMICO
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >

              <MenuItem>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={userRooms}
                  getOptionLabel={(option) => option.room_name}
                  sx={{
                    width: 300,
                  }}
                  onChange={handleRoomSelection} // Call handleRoomSelection on selection change
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Le tue Stanze"
                    />
                  )}
                />
              </MenuItem>
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Link to={`/${page.toLowerCase()}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography textAlign="center">{page}</Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'black',
              textDecoration: 'none',
            }}
          >
            STUDIO AMICO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <MenuItem key={page} onClick={handleCloseNavMenu}>
                <Link to={`/${page.toLowerCase()}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography textAlign="center">{page}</Typography>
                </Link>
              </MenuItem>
            ))}

            <MenuItem sx={{ color: 'white' }}>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={userRooms}
                getOptionLabel={(option) => option.room_name}
                sx={{
                  width: 250,
                  '& .MuiOutlinedInput-root': {
                    borderColor: 'white',
                  },
                  '& .MuiAutocomplete-popupIndicator': {
                    color: 'white',
                  },
                  '& .MuiAutocomplete-input': {
                    color: 'white',
                  }
                }}
                onChange={handleRoomSelection} // Call handleRoomSelection on selection change
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Le tue Stanze"
                    InputLabelProps={{ style: { color: 'white' } }}
                  />
                )}
              />
            </MenuItem>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {userProfile && (
                  <Avatar alt={userProfile.username} src={userProfile.profile_image_url} />
                )}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={setting === 'Logout' ? handleLogout : handleCloseUserMenu}>
                  {setting === 'Profile' ? (
                    <Link to={userProfile ? `/user/${userProfile._id}` : '/'} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography textAlign="center">{setting}</Typography>
                    </Link>
                  ) : (
                    <Typography textAlign="center">{setting}</Typography>
                  )}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;