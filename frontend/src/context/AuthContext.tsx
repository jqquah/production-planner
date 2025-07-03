import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define types
interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'production_manager';
}

interface AuthState {
    token: string | null;
    isAuthenticated: boolean | null;
    loading: boolean;
    user: User | null;
    error: string | null;
}

interface AuthContextType extends AuthState {
    register: (formData: any) => Promise<void>;
    loadUser: () => Promise<void>;
    login: (formData: any) => Promise<boolean>;
    logout: () => void;
    clearErrors: () => void;
}

type AuthAction =
    | { type: 'USER_LOADED'; payload: User }
    | { type: 'REGISTER_SUCCESS'; payload: { token: string } }
    | { type: 'LOGIN_SUCCESS'; payload: { token: string } }
    | { type: 'REGISTER_FAIL'; payload: string }
    | { type: 'AUTH_ERROR'; payload?: string }
    | { type: 'LOGIN_FAIL'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERRORS' }
    | { type: 'AUTH_CLEARED' };


// Helper to set auth token in axios headers
const setAuthToken = (token: string | null) => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload,
            };
        case 'REGISTER_SUCCESS':
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            setAuthToken(action.payload.token);
            return {
                ...state,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
            };
        case 'REGISTER_FAIL':
        case 'LOGIN_FAIL':
        case 'AUTH_ERROR':
            localStorage.removeItem('token');
            setAuthToken(null);
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                error: action.payload || 'An error occurred',
            };
        case 'LOGOUT':
        case 'AUTH_CLEARED':
            localStorage.removeItem('token');
            setAuthToken(null);
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                error: null,
            };
        case 'CLEAR_ERRORS':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const initialState: AuthState = {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null,
        error: null,
    };

    const [state, dispatch] = useReducer(authReducer, initialState);

    // Set token on initial load and load user
    useEffect(() => {
        loadUser();
        // eslint-disable-next-line
    }, []);

    // Load User
    const loadUser = async (token: string | null = null) => {
        const tokenToUse = token || localStorage.token;
        if (!tokenToUse) {
            dispatch({ type: 'AUTH_CLEARED' });
            return;
        }
        setAuthToken(tokenToUse);

        try {
            const res = await axios.get<User>('/api/auth');
            dispatch({ type: 'USER_LOADED', payload: res.data });
        } catch (err) {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    // Register User
    const register = async (formData: any) => {
        try {
            const res = await axios.post<{ token: string }>('/api/auth/register', formData);
            dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
            await loadUser(res.data.token);
        } catch (err: any) {
            dispatch({
                type: 'REGISTER_FAIL',
                payload: err.response?.data?.msg || 'Registration failed',
            });
        }
    };

    // Login User
    const login = async (formData: any): Promise<boolean> => {
        try {
            const res = await axios.post<{ token: string }>('/api/auth/login', formData);
            dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
            await loadUser(res.data.token);
            return true;
        } catch (err: any) {
            dispatch({
                type: 'LOGIN_FAIL',
                payload: err.response?.data?.msg || 'Login failed',
            });
            return false;
        }
    };

    // Logout
    const logout = () => dispatch({ type: 'LOGOUT' });

    // Clear Errors
    const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

    return (
        <AuthContext.Provider
            value={{
                ...state,
                register,
                loadUser,
                login,
                logout,
                clearErrors,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
