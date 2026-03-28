// client/src/components/AdminProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const AdminProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = () => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Check if user is logged in and has admin role
        if (token && user && user.role === 'admin') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
        setLoading(false);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminProtectedRoute;