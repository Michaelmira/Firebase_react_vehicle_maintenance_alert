import { Navigate } from "react-router-dom";
import { auth } from "../config/firebase";
import {useAuthState } from "react-firebase-hooks/auth"

export const ProtectedRoute = ({children}) => {
    const [user, loading] = useAuthState(auth);

    if (loading) return <p>Loading...</p>;

    return user ? children: <Navigate to="/" />
}