import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, error, clearErrors } = useAuth();

    const [user, setUser] = useState({
        email: '',
        password: '',
    });

    const { email, password } = user;

    useEffect(() => {
        if (error) {
            alert(error); // Replace with a proper notification component later
            clearErrors();
        }
    }, [error, clearErrors]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setUser({ ...user, [e.target.name]: e.target.value });

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (email === '' || password === '') {
            alert('Please fill in all fields'); // Replace with a proper notification
        } else {
            const success = await login({ email, password });
            if (success) {
                navigate('/');
            }
        }
    };

    return (
        <div className="form-container">
            <h1>Account Login</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input id="email" type="email" name="email" value={email} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" name="password" value={password} onChange={onChange} required />
                </div>
                <input type="submit" value="Login" className="btn btn-primary btn-block" />
            </form>
        </div>
    );
};

export default Login;
