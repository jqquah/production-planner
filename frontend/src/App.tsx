import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import { useAuth } from './context/AuthContext';



const App = () => {
    const { loadUser } = useAuth();

    useEffect(() => {
        loadUser();
        // eslint-disable-next-line
    }, []);

    return (
        <Router>
            <div className="container">
                <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/' element={<PrivateRoute />}>
                        <Route path='/' element={<Dashboard />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
};

export default App;
