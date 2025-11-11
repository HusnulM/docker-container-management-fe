// src/pages/Dashboard.jsx
import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import ContainerDashboard from "../components/DashboardContainer";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h1 className="font-bold text-lg">Docker Manager</h1>
                <div className="flex items-center gap-4">
                    <span>{user?.name}</span>
                    <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
                        Logout
                    </button>
                </div>
            </nav>

            {/* Container Dashboard */}
            <ContainerDashboard />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: { fontSize: "14px" },
                    success: { iconTheme: { primary: "#4ade80", secondary: "#fff" } },
                }}
            />
        </div>
    );
}
