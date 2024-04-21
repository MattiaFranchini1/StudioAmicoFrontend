import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Navbar from './Navbar.jsx';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import useMediaQuery from '@mui/material/useMediaQuery';
import axios from 'axios';
import api from '../services/api';

const HomePage = () => {
    const [gaugeValue, setGaugeValue] = useState(0);
    const [totalRooms, setTotalRooms] = useState(0);
    const [loading, setLoading] = useState(true); // Stato di caricamento
    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetching the number of rooms the user belongs to
                const response = await api.get('api/users/profile', { withCredentials: true });
                const userData = response.data.user;
                const roomsCount = userData.rooms.length;
                setGaugeValue(roomsCount);

                // Fetching the total number of rooms
                const totalRoomsResponse = await api.get('api/rooms/all');
                const totalRoomsData = totalRoomsResponse.data;
                const totalRoomsCount = totalRoomsData.length;
                setTotalRooms(totalRoomsCount);

                // Imposta lo stato di caricamento su false dopo aver completato il caricamento dei dati
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Se lo stato di caricamento è true, visualizza un messaggio di caricamento
    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    // Altrimenti, mostra il grafico e i dati
    return (
        <>
            <Navbar position="static" />
            <Container style={{ marginBottom: '120px' }}>
                <div style={{ width: '100%', height: isMobile ? '300px' : '300px', maxHeight: '500px', margin: 'auto', marginTop: 40 }}>
                    <Gauge
                        value={gaugeValue}
                        valueMax={totalRooms}
                        startAngle={-110}
                        endAngle={110}
                        sx={{
                            [`& .${gaugeClasses.valueText}`]: {
                                fontSize: isMobile ? '30px' : '40px',
                                transform: 'translate(0px, 0px)',
                            },
                            [`& .${gaugeClasses.valueArc}`]: {
                                fill: '#52b202',
                            },
                        }}
                        text={({ value, valueMax }) => `${value} / ${valueMax}`}
                    />
                </div>
                <Typography variant="h6" align="center" style={{ color: '#52b202', marginTop: '5px' }}>
                    Stanze a cui appartieni
                </Typography>
            </Container>
        </>
    );
};

export default HomePage;
