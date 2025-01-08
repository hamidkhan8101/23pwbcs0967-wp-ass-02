import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from './Home'; // Import your Home component
import Login from './Login';
import Register from './Register';

function App() {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        console.log("Token in isAuthenticated:", token);
        return !!token;
    };

    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated()) {
            console.log("Not authenticated, redirecting to /login");
            return <Navigate to="/login" />;
        }
        console.log("Authenticated, rendering protected route");
        return children;
    };

    return (
        <div style={{ marginTop: '-3.5rem' }}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Register />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;