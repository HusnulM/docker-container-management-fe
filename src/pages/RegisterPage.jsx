// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Password dan Confirm Password tidak sama");
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
                name,
                email,
                password,
            });

            toast.success("Register sukses! Silakan login");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Register gagal");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleRegister} className="bg-white p-6 rounded-xl shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Register</h1>

                <input
                    type="text"
                    placeholder="Nama"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />

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

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Register
                </button>

                <p className="mt-3 text-sm text-gray-500">
                    Sudah punya akun? <a href="/login" className="text-blue-600">Login</a>
                </p>
            </form>
        </div>
    );
}
