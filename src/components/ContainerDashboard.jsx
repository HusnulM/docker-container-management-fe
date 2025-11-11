// src/components/ContainerDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import ContainerCard from "./ContainerCard";
import CreateContainerModal from "./CreateContainerModal";
import LogsModal from "./LogsModal";
import InspectModal from "./InspectModal";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

export default function ContainerDashboard() {
    const { token } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL;

    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const [showCreate, setShowCreate] = useState(false);

    const [showLogs, setShowLogs] = useState(false);
    const [logs, setLogs] = useState("");
    const [logsTitle, setLogsTitle] = useState("");

    const [showInspectModal, setShowInspectModal] = useState(false);
    const [selectedInspect, setSelectedInspect] = useState(null);
    const [selectedContainerName, setSelectedContainerName] = useState("");

    // Fetch containers milik user
    const fetchContainers = async () => {
        try {
            const res = await fetch(`${API_URL}/containers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setContainers(data);
        } catch (err) {
            toast.error("Failed to fetch containers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContainers();
        const interval = setInterval(fetchContainers, 5000);
        return () => clearInterval(interval);
    }, []);

    // Action handler untuk semua tombol
    const handleAction = async ({ action, id, method, endpoint }) => {
        setProcessingId(id);
        toast.loading(`${action.toUpperCase()} in progress...`, { id });

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(`${action.toUpperCase()} success!`, { id });

                if (action === "logs" && data.success) {
                    const containerData = containers.find((c) => c.container_id === id);
                    const containerName = containerData?.name || id.substring(0, 12);
                    setLogs(data.logs);
                    setLogsTitle(`Logs for ${containerName}`);
                    setShowLogs(true);
                } else if (action === "inspect" && data.success) {
                    const containerData = containers.find((c) => c.container_id === id);
                    setSelectedContainerName(containerData?.name || id.substring(0, 12));
                    setSelectedInspect(data.inspect);
                    setShowInspectModal(true);
                } else {
                    try {
                        const res = await fetch(`${API_URL}${endpoint}`, { method });
                        const result = await res.json();

                        if (res.ok) {
                            toast.success(`${action.toUpperCase()} success!`, { id });
                            fetchContainers();
                        } else {
                            toast.error(result.message || `Failed to ${action}`, { id });
                        }
                    } catch (err) {
                        toast.error(`Error while ${action}: ${err.message}`, { id });
                    } finally {
                        setProcessingId(null);
                    }
                }

                fetchContainers();
            } else {
                toast.error(data.message || `Failed to ${action}`, { id });
            }
        } catch (err) {
            toast.error(`Error while ${action}: ${err.message}`, { id });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Containers</h2>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    + New Container
                </button>
            </div>

            {showCreate && (
                <CreateContainerModal
                    onClose={() => setShowCreate(false)}
                    onCreated={fetchContainers}
                />
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {containers.length > 0 ? (
                        containers.map((container) => (
                            <ContainerCard
                                key={container.container_id}
                                container={container}
                                onAction={handleAction}
                                processingId={processingId}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center w-full">
                            No containers found.
                        </p>
                    )}
                </div>
            )}

            <LogsModal
                show={showLogs}
                onClose={() => setShowLogs(false)}
                logs={logs}
                title={logsTitle}
            />

            {showInspectModal && (
                <InspectModal
                    containerName={selectedContainerName}
                    inspectData={selectedInspect}
                    onClose={() => setShowInspectModal(false)}
                />
            )}
        </div>
    );
}
