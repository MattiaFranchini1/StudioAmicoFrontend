import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import LoginForm from './components/GoogleLogin.jsx';
import About from './components/About.jsx';
import Users from './components/Users.jsx';

// ... (importa le librerie necessarie)

const PrivateRoute = ({ element, ...props }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/users/profile', { withCredentials: true });
        setIsAuth(Object.keys(response.data).length !== 0);
      } catch (error) {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    // Sta verificando l'autenticazione, potresti mostrare uno spinner o altro
    return null;
  }
  return isAuth ? element : <Navigate to="/login" />;
};


const LoginPage = ({ element, ...props }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/users/profile', { withCredentials: true });
        setIsAuth(Object.keys(response.data).length !== 0);
      } catch (error) {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    // Sta verificando l'autenticazione, potresti mostrare uno spinner o altro
    return null;
  }
  return isAuth ? <Navigate to="/" /> : element;
};


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route 
        path="/login" 
        element={<LoginPage element={<LoginForm />} />}
        />
        <Route
          path="/about"
          element={<PrivateRoute element={<About />} />}
        />
        <Route
          path="/users"
          element={<PrivateRoute element={<Users />} />}
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
;
