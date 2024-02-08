import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import InfoIcon from "@mui/icons-material/Info";
import Container from "@mui/material/Container";
import api from '../services/api';

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {

    window.location.href = `${api.defaults.baseURL}api/users/auth/google`;
  };

  return (

    <Container style={{ marginBottom: '120px' }}>
      <Typography
        variant="h4"
        align="center"
        mb={4}
        sx={{
          fontWeight: 700,
          color: '#1976d2',
          marginTop: "6vh",
        }}
      >
        STUDIO AMICO: ORGANIZZA, COLLABORA, AIUTA, ECCELLI NELLO STUDIO
      </Typography>

      <Card
        sx={{
          width: '75%',
          maxWidth: 400,
          margin: "auto",
          marginTop: "12vh",
          padding: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="h5" align="center" mb={2}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {" Accedi con l'account istituzionale"}
            </div>
          </Typography>


          <Button
            variant="contained"
            color="primary"
            onClick={handleGoogleLogin}
            startIcon={<AccountCircleIcon />}
            sx={{ mt: 2 }}
          >
            Accedi con Google
          </Button>

          <div style={{ display: "flex", alignItems: "center", marginTop: "40px" }}>
            <LockIcon fontSize="small" sx={{ marginRight: 0.5 }} />
            <Typography variant="body2" color="text.secondary" align="center" style={{ marginLeft: "5px" }}>
              I tuoi dati sono al sicuro.
            </Typography>
          </div>

          <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
            <InfoIcon fontSize="small" color="primary" sx={{ marginRight: 0.5 }} />
            <Typography variant="body2" color="text.secondary" align="center" style={{ marginLeft: "5px" }}>
              Nessuna informazione verrà condivisa.
            </Typography>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default GoogleLoginButton;
