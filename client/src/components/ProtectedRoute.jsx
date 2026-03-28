// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user || user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute;