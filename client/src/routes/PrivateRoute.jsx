import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '../app/apiSlice';
import Loader from '../components/ui/Loader';

const PrivateRoute = () => {
    const token = localStorage.getItem('token');
    const location = useLocation();
    const { data: user, isLoading, isError } = useGetMeQuery(undefined, {
        skip: !token, // Don't fetch if no token
    });

    if (!token) {
        // Not logged in, redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg">
                <Loader size="lg" />
            </div>
        );
    }

    if (isError || !user) {
        // Token might be invalid or expired
        localStorage.removeItem('token');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authorized user so return child components
    return <Outlet />;
};

export default PrivateRoute;
