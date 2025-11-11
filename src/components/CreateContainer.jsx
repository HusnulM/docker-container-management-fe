import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function CreateContainerModal({ onClose, onCreated }) {
    const token = localStorage.getItem("token");

    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [hostPort, setHostPort] = useState("");
    const [containerPort, setContainerPort] = useState("");
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/containers/run`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    image,
                    name,
                    ports: hostPort && containerPort ? {
                        [`${containerPort}/tcp`]: [{ HostPort: hostPort }],
                    } : {},
                }),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(`Container ${name || image} created! 🎉`);
                // Tutup modal dulu
                onClose?.();
                // Reload container list setelah 300ms
                setTimeout(() => {
                    onCreated?.();
                }, 300);
            } else {
                toast.error(result.message || "Failed to create container");
            }
        } catch (err) {
            toast.error("Connection failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Create New Container
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Image Name
                        </label>
                        <input
                            type="text"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="nginx:latest"
                            required
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Container Name (optional)
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="nginx-demo"
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Host Port</label>
                            <input
                                type="text"
                                value={hostPort}
                                onChange={(e) => setHostPort(e.target.value)}
                                placeholder="8080"
                                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Container Port</label>
                            <input
                                type="text"
                                value={containerPort}
                                onChange={(e) => setContainerPort(e.target.value)}
                                placeholder="80"
                                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
