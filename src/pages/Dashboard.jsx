import { useEffect, useState } from "react";
import { dockerApi } from "../api/dockerApi";

export default function Dashboard() {
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadContainers = async () => {
        setLoading(true);
        try {
            const data = await dockerApi.list();
            console.log("Fetched containers:", data);
            setContainers(data);
        } catch (err) {
            console.error(err);
            setError("Gagal mengambil data container.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, id) => {
        try {
            await dockerApi[action](id);
            loadContainers();
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    };

    useEffect(() => {
        loadContainers();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading containers...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">🧩 Docker Containers Dashboard</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {containers.map((c) => (
                    <div key={c.Id} className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
                        <h2 className="text-lg font-semibold">{c.name[0].replace("/", "")}</h2>
                        <p className="text-sm text-gray-600">Image: {c.Image}</p>
                        <p
                            className={`text-sm font-bold ${c.status === "running" ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {c.status.toUpperCase()}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {c.status === "running" ? (
                                <button
                                    onClick={() => handleAction("stop", c.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Stop
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleAction("start", c.Id)}
                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                >
                                    Start
                                </button>
                            )}
                            <button
                                onClick={() => handleAction("restart", c.Id)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                            >
                                Restart
                            </button>
                            <button
                                onClick={() => handleAction("remove", c.Id)}
                                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {containers.length === 0 && (
                <div className="text-gray-500 mt-8 text-center">Tidak ada container ditemukan.</div>
            )}
        </div>
    );
}
