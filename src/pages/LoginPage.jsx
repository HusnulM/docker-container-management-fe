import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function LoginPage() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
            login(res.data.user, res.data.token, res.data.email);
            toast.success("Login sukses!");

            localStorage.setItem("token", res.token);
            localStorage.setItem("email", email);

            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login gagal");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Login
                </button>
                <p className="mt-3 text-sm text-gray-500">
                    Belum punya akun? <a href="/register" className="text-blue-600">Register</a>
                </p>
            </form>
        </div>
    );
}
