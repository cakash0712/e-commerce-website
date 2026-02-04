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
        if (requiredRole === "vendor") authPath = "/auth"; // Force user to choose or go back to generic
        if (requiredRole === "food_vendor" || requiredRole === "restaurant") authPath = "/food/vendor/login";

        // Redirect to auth page but save the attempted location
        return <Navigate to={authPath} state={{ from: location }} replace />;
    }

    const isAuthorized = !requiredRole ||
        user.user_type === requiredRole ||
        (requiredRole === "vendor" && user.user_type?.startsWith("vendor") && user.user_type !== "food_vendor" && user.user_type !== "restaurant") ||
        ((requiredRole === "food_vendor" || requiredRole === "restaurant") && (user.user_type === "food_vendor" || user.user_type === "restaurant"));

    if (!isAuthorized) {
        // Redirect to appropriate dashboard based on user type
        let redirectPath = "/profile";
        if (user.user_type === "admin") redirectPath = "/admin";
        else if (user.user_type === "food_vendor" || user.user_type === "restaurant") redirectPath = "/food/vendor/dashboard";
        else if (user.user_type?.startsWith("vendor")) redirectPath = "/vendor";

        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
