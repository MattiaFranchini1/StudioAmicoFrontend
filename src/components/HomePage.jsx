import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Navbar from './Navbar.jsx';

const HomePage = () => {
    return (
        <>
            <Navbar position="static" />
            <Container style={{ marginBottom: '120px' }}>
                <Typography variant="h2" gutterBottom style={{ color: '#1976d2', textAlign: 'center', paddingTop: '40px' }}>
                    HOMEPAGE DI STUDIO AMICO <i>(work in progress...)</i>
                </Typography>
            </Container>
        </>
    );
};

export default HomePage;

