import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Materials from './Materials';
import Recipes from './Recipes';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-container">
                        <header className="dashboard-header">
                <h1>Welcome, {user?.username}</h1>
                <button onClick={logout} className="btn btn-danger">
                    Logout
                </button>
            </header>
            <main>
                <p>This is your dashboard. More features will be added soon.</p>
                <hr />
                <Materials />
        <hr className="my-5" />
        <Recipes />
            </main>
        </div>
    );
};

export default Dashboard;
