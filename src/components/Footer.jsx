import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import GitHubIcon from "@mui/icons-material/GitHub";
import SchoolIcon from "@mui/icons-material/School";
import { Link } from "react-router-dom";

export default function Footer() {
    const links = [
        {
            id: 1,
            name: 'Github Project',
            link: 'https://github.com/MattiaFranchini1/StudioAmicoFrontend',
        },
        {
            id: 2,
            name: 'ITIS Paleocapa',
            link: 'https://www.itispaleocapa.edu.it/',
        },
    ];

    return (
        <Box
            sx={{
                backgroundColor: '#1976d2',
                p: 2,
                minHeight: '8%',
                //position: 'fixed',
                bottom: 0,
                //width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            component="footer"
        >
            <Container maxWidth="sm">
                <Typography variant="body2" color="white" align="center">
                    {"Copyright © STUDIO AMICO "}
                    {new Date().getFullYear()}
                </Typography>

                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                    <a
                        href={links[0].link}
                        target="_blank"
                        alt={links[0].name}
                        title={links[0].name}
                        rel="noopener noreferrer"
                        style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}
                    >
                        <GitHubIcon />
                    </a>

                    <a
                        href={links[1].link}
                        target="_blank"
                        alt={links[1].name}
                        title={links[1].name}
                        rel="noopener noreferrer"
                        style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}
                    >
                        <SchoolIcon />
                    </a>

                    <Link to="/about" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>
                        About Us
                    </Link>
                </Box>
            </Container>
        </Box>
    );
}
