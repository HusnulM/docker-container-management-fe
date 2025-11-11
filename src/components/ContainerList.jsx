import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export default function ContainerCard({ container, onAction, processingId }) {
    const shortId = container.container_id?.substring(0, 12) || "Unknown";
    const name = container.name?.replace("/", "") || "Unnamed";
    const status = container.status;
    const isRunning = status === "running";
    const isProcessing = processingId === container.container_id;

    const API_URL = import.meta.env.VITE_API_URL;

    const [stats, setStats] = useState(null);
    const [cpuHistory, setCpuHistory] = useState([]);
    const [memHistory, setMemHistory] = useState([]);
    const id = container.container_id;

    useEffect(() => {
        let interval;

        if (container.status === "running") {
            const fetchStats = () => {
                fetch(`${API_URL}/containers/stats/${id}`)
                    .then((res) => res.json())
                    .then((data) => {
                        const s = data.success ? data.stats : data;
                        if (s) {
                            setStats(s);
                            setCpuHistory((prev) => [...prev.slice(-19), s.cpuPercent]);
                            setMemHistory((prev) => [...prev.slice(-19), s.memoryPercent]);
                        }
                    })
                    .catch((err) => console.error("Failed to fetch stats", err));
            };

            fetchStats();
            interval = setInterval(fetchStats, 3000);
        }

        return () => clearInterval(interval);
    }, [container.status, id]);

    const triggerAction = (action, method, endpoint) => {
        onAction({
            id: container.container_id,
            action,
            method,
            endpoint,
        });
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { display: false },
            y: { display: false },
        },
        elements: {
            point: { radius: 0 },
            line: { borderWidth: 2, tension: 0.3 },
        },
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
    };

    const chartData = (dataArr, color) => ({
        labels: dataArr.map((_, i) => i),
        datasets: [
            {
                data: dataArr,
                borderColor: color,
                backgroundColor: "transparent",
            },
        ],
    });

    return (
        <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition border border-gray-200">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-gray-800">{name}</h2>
                <span
                    className={`px-3 py-1 text-xs rounded-full ${isRunning ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                >
                    {status?.toUpperCase() || "UNKNOWN"}
                </span>
            </div>

            <p className="text-sm text-gray-500 mb-2">ID: {shortId}</p>

            {stats && (
                <div className="text-sm text-gray-600 mb-3 space-y-1">
                    <p>💻 CPU: <b>{stats.cpuPercent}%</b></p>
                    <div className="h-12">
                        <Line data={chartData(cpuHistory, "#3b82f6")} options={chartOptions} />
                    </div>
                    <p>🧠 RAM: <b>{stats.memoryPercent}%</b></p>
                    <div className="h-12">
                        <Line data={chartData(memHistory, "#10b981")} options={chartOptions} />
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
                {isRunning ? (
                    <>

                        <ActionButton
                            label="Stop"
                            color="yellow"
                            onClick={() =>
                                triggerAction("stop", "POST", `/containers/stop/${container.container_id}`)
                            }
                            disabled={isProcessing}
                            loading={isProcessing}
                        />
                        <ActionButton
                            label="Restart"
                            color="blue"
                            onClick={() =>
                                triggerAction("restart", "POST", `/containers/restart/${container.container_id}`)
                            }
                            disabled={isProcessing}
                            loading={isProcessing}
                        />
                    </>
                ) : (
                    <ActionButton
                        label="Start"
                        color="green"
                        onClick={() =>
                            triggerAction("start", "POST", `/containers/start/${container.container_id}`)
                        }
                        disabled={isProcessing}
                        loading={isProcessing}
                    />
                )}
                <ActionButton
                    label="Remove"
                    color="red"
                    onClick={() =>
                        confirm(`Remove container ${name}?`) &&
                        triggerAction("remove", "DELETE", `/containers/remove/${container.container_id}`)
                    }
                    disabled={isProcessing}
                    loading={isProcessing}
                />

                <ActionButton
                    label="Logs"
                    color="green"
                    onClick={() => triggerAction("logs", "GET", `/containers/${container.container_id}/logs`)}
                    disabled={isProcessing}
                    loading={isProcessing}
                />

                <ActionButton
                    label="Inspect"
                    color="purple"
                    onClick={() => triggerAction("inspect", "GET", `/containers/inspect/${container.container_id}`)}
                    disabled={isProcessing}
                    loading={isProcessing}
                />
            </div>
        </div>
    );
}

function ActionButton({ label, color, onClick, disabled, loading }) {
    const base =
        "px-3 py-1 text-xs text-white rounded transition flex items-center justify-center gap-1";
    const colors = {
        yellow: "bg-yellow-500 hover:bg-yellow-600",
        blue: "bg-blue-500 hover:bg-blue-600",
        green: "bg-green-500 hover:bg-green-600",
        red: "bg-red-500 hover:bg-red-600",
        purple: "bg-purple-500 hover:bg-purple-600",

    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${colors[color]} ${disabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
        >
            {loading ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
                label
            )}
        </button>
    );
}
