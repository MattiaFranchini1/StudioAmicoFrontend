import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MailIcon from '@mui/icons-material/Mail';
import Container from '@mui/material/Container';


const TeamPage = () => {
    const teamMembers = [
        {
            id: 1,
            name: 'Mattia',
            surname: 'Franchini',
            class: '5IC',
            roles: ['Sviluppatore', 'Designer', 'Progettista', 'CEO'],
            imageUrl: 'https://lh3.googleusercontent.com/a/ACg8ocKW7j1uNUqVBELEYc40-ptBeRYg45UYbNzF8Z-3NGjmng=s96-c',
            email: 'franchini.mattia.studente@itispaleocapa.it',
        },
        {
            id: 2,
            name: 'Marco',
            surname: 'Borelli',
            class: '5IF',
            roles: ['Sviluppatore', 'Tester', 'SMM', 'Analista'],
            imageUrl: 'https://lh3.googleusercontent.com/a/ACg8ocJ_61OHKpMYO5oZmbguxyCIhEXUESFkbtD1IXFbeuoe5hE=s96-c',
            email: 'borelli.marco.studente@itispaleocapa.it',
        },
    ];

    return (
        <Container style={{ marginBottom: '120px' }}>
            <Typography variant="h2" gutterBottom style={{ color: '#1976d2', textAlign: 'center', paddingTop: '40px' }}>
                IL TEAM
            </Typography>

            <Grid container spacing={3} justifyContent="center">
                {teamMembers.map((member) => (
                    <Grid item key={member.id} xs={12} sm={6} md={4}>
                        <Card style={{ backgroundColor: '#212121', color: '#ffffff' }}>
                            <Avatar
                                alt={`${member.name} ${member.surname}`}
                                src={member.imageUrl}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    margin: 'auto',
                                    marginTop: 2,
                                    border: '2px solid #64b5f6',
                                }}
                            />
                            <CardContent>
                                <Typography variant="h5" component="div" align="center">
                                    {`${member.name} ${member.surname}`}
                                </Typography>
                                <Typography variant="h7" component="div" align="center" style={{ margin: '8px 0' }}>
                                    {`${member.class}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    {member.roles.map((role, index) => (
                                        <Chip
                                            key={index}
                                            label={role}
                                            color="primary"
                                            variant="outlined"
                                            style={{ margin: '2px', borderColor: '#64b5f6', color: '#64b5f6' }}
                                        />
                                    ))}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h2" gutterBottom style={{ color: '#1976d2', marginTop: '40px', textAlign: 'center' }}>
                IL PROGETTO
            </Typography>
            <Typography paragraph style={{ marginBottom: '20px' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla gravida nunc nec massa
                tristique, sit amet efficitur purus pharetra. Proin vel accumsan odio. Vestibulum
                ullamcorper, turpis vel mattis aliquam, elit metus iaculis lectus, non hendrerit
                turpis mi ac lorem.
            </Typography>
            <Typography paragraph>
                Vestibulum efficitur libero non sem facilisis, vel scelerisque sapien aliquam. Fusce
                tincidunt orci nec lectus blandit, in commodo dui dictum. Integer dapibus tempus nulla
                vel fermentum.
            </Typography>
            <Typography paragraph>
                Nullam euismod felis ut sem interdum, vel varius est luctus. Donec sagittis est at elit
                facilisis, id fermentum tortor aliquet. Integer nec urna sit amet nunc tincidunt
                fringilla non et lacus.
            </Typography>

            <Typography variant="h3" gutterBottom style={{ color: '#1976d2', marginTop: '40px', textAlign: 'center' }}>
                CONTATTACI
            </Typography>

            <Card style={{ backgroundColor: '#212121', color: '#ffffff', textAlign: 'center', padding: '20px', marginTop: '20px' }}>
                <Typography variant="h5" gutterBottom style={{ color: '#1976d2' }}>
                    Hai domande o suggerimenti? Contattaci!
                </Typography>
                {teamMembers.map((member) => (
                    <Typography key={member.id} paragraph>
                        {`${member.name} ${member.surname}: `}
                        <Link href={`mailto:${member.email}`} style={{ color: '#1976d2', fontSize: '15px' }}>
                            {member.email}
                        </Link>
                        <IconButton href={`mailto:${member.email}`} style={{ color: '#1976d2', marginLeft: '5px' }}>
                            <MailIcon />
                        </IconButton>
                    </Typography>
                ))}
            </Card>
        </Container>
    );
};

export default TeamPage;
