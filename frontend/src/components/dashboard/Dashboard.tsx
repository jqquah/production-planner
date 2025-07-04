import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Tab, Tabs } from 'react-bootstrap';
import Materials from './Materials';
import Recipes from './Recipes';
import InventoryAlerts from './InventoryAlerts';
import InventoryHistory from './InventoryHistory';
import Production from './Production';
import CurrentStockReport from './CurrentStockReport';
import ExpiringReport from './ExpiringReport';
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
                <InventoryAlerts />
                <Tabs defaultActiveKey="materials" id="dashboard-tabs" className="mb-3 mt-5">
                    <Tab eventKey="materials" title="Materials">
                        <Materials />
                    </Tab>
                    <Tab eventKey="recipes" title="Recipes">
                        <Recipes />
                    </Tab>
                    <Tab eventKey="production" title="Production">
                        <Production />
                    </Tab>
                    <Tab eventKey="stock-report" title="Current Stock">
                        <CurrentStockReport />
                    </Tab>
                    <Tab eventKey="expiring-report" title="Expiring Soon">
                        <ExpiringReport />
                    </Tab>
                    <Tab eventKey="history" title="Inventory History">
                        <InventoryHistory />
                    </Tab>
                </Tabs>
            </main>
        </div>
    );
};

export default Dashboard;
