import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Navbar from './Navbar.jsx';
import api from '../services/api';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/system';

const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [roomsData, setRoomsData] = useState(null);
    const [subjectsCount, setSubjectsCount] = useState([]);

    const chartSetting = {
        xAxis: [
            {
                label: 'Numero di Stanze',
            },
        ],
        width: 900,
        height: 400,
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await api.get('api/users/profile', { withCredentials: true });
                const userData = userResponse.data.user;
                setUserData(userData);

                const roomsResponse = await api.get('api/rooms');
                const roomsData = roomsResponse.data;
                setRoomsData(roomsData);

                const allSubjects = roomsData.flatMap(room => room.subject);
                const subjectsCountObj = allSubjects.reduce((acc, subject) => {
                    const existingSubject = acc.find(item => item.subject === subject);
                    if (existingSubject) {
                        existingSubject.count += 1;
                    } else {
                        acc.push({ subject, count: 1 });
                    }
                    return acc;
                }, []);
                setSubjectsCount(subjectsCountObj);
                console.log(subjectsCountObj)

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    return (
        <>
            <Navbar position="static" />
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <BarChart
                    dataset={subjectsCount}
                    yAxis={[{ scaleType: 'band', dataKey: 'subject' }]}
                    series={[{ dataKey: 'count', label: 'Numero di stanze' }]}
                    layout="horizontal"
                    width={chartSetting.width} // Passa la larghezza come numero
                    height={chartSetting.height}
                />
            </Box>
        </>
    );
};

export default HomePage;
