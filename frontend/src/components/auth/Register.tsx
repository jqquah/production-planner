import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, error, clearErrors } = useAuth();

    const [user, setUser] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
    });

    const { username, email, password, password2 } = user;

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
        if (error) {
            alert(error); // Replace with a proper notification component later
            clearErrors();
        }
    }, [isAuthenticated, error, navigate, clearErrors]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setUser({ ...user, [e.target.name]: e.target.value });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (username === '' || email === '' || password === '') {
            alert('Please enter all fields');
        } else if (password !== password2) {
            alert('Passwords do not match');
        } else {
            register({ username, email, password });
        }
    };

    return (
        <div className="form-container">
            <h1>Account Register</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" name="username" value={username} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input id="email" type="email" name="email" value={email} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" name="password" value={password} onChange={onChange} required minLength={6} />
                </div>
                <div className="form-group">
                    <label htmlFor="password2">Confirm Password</label>
                    <input id="password2" type="password" name="password2" value={password2} onChange={onChange} required minLength={6} />
                </div>
                <input type="submit" value="Register" className="btn btn-primary btn-block" />
            </form>
        </div>
    );
};

export default Register;
