import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to appropriate auth page based on required role
        let authPath = "/auth";
        if (requiredRole === "admin") authPath = "/auth/admin";
        if (requiredRole === "vendor") authPath = "/auth/vendor";

        // Redirect to auth page but save the attempted location
        return <Navigate to={authPath} state={{ from: location }} replace />;
    }

    if (requiredRole && user.user_type !== requiredRole) {
        // Redirect to appropriate dashboard based on user type
        const redirectPath = user.user_type === "admin"
            ? "/admin"
            : (user.user_type === "vendor" ? "/vendor" : "/profile");

        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
