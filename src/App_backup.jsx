import React, { useEffect, useState } from "react";
import ContainerCard from "./components/ContainerList";
import CreateContainerModal from "./components/CreateContainerModal";
import LogsModal from "./components/LogsModal";
import InspectModal from "./components/InspectModal";
import { Toaster, toast } from "react-hot-toast";

export default function App() {
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // const API_URL = "http://localhost:3000/api";
    const API_URL = import.meta.env.VITE_API_URL;


    const [showLogs, setShowLogs] = useState(false);
    const [logs, setLogs] = useState("");
    const [logsTitle, setLogsTitle] = useState("");

    const [showInspectModal, setShowInspectModal] = useState(false);
    const [selectedInspect, setSelectedInspect] = useState(null);
    const [selectedContainerName, setSelectedContainerName] = useState("");

    // 🔁 Fetch data containers
    const fetchContainers = async () => {
        try {
            const res = await fetch(`${API_URL}/containers`);
            const data = await res.json();
            setContainers(data);
        } catch (err) {
            toast.error("Failed to fetch containers");
        } finally {
            setLoading(false);
        }
    };

    // ⏱ Auto Refresh setiap 5 detik
    useEffect(() => {
        fetchContainers();
        const interval = setInterval(fetchContainers, 5000);
        return () => clearInterval(interval);
    }, []);

    // ⚡ Action Handler
    const handleAction = async (actionObj) => {

        const action = actionObj.action;
        const id = actionObj.id;
        const method = actionObj.method;
        const endpoint = actionObj.endpoint;
        setProcessingId(id);

        // console.log(endpoint);

        toast.loading(`${action.toUpperCase()} in progress...`, { id });

        if (action === "logs") {
            try {
                const res = await fetch(`${API_URL}${endpoint}`);
                const data = await res.json();
                if (data.success) {
                    const containerData = containers.find((c) => c.container_id === id);
                    const containerName = containerData?.name || id.substring(0, 12);


                    setLogs(data.logs);
                    setLogsTitle(`Logs for ${containerName}`);
                    setShowLogs(true);

                    toast.success("Logs fetched successfully", { id });
                } else throw new Error(data.message);
            } catch (err) {
                toast.error(`Failed to fetch logs: ${err.message}`);
            } finally {
                setProcessingId(null);
            }
            return;
        } else if (action === "inspect") {
            console.log("Inspect action triggered");
            try {
                const res = await fetch(`${API_URL}${endpoint}`);
                const data = await res.json();

                console.log(data);

                if (data.success) {
                    const containerData = containers.find((c) => c.container_id === id);
                    setSelectedContainerName(containerData?.name || id.substring(0, 12));
                    setSelectedInspect(data.inspect);
                    setShowInspectModal(true);
                } else {
                    toast.error(`Inspect error: ${data.message}`);
                    throw new Error(data.message || "Failed to fetch inspect data");

                }

                toast.success("Inspect data loaded", { id });
            } catch (err) {
                toast.error(`Inspect error: ${err.message}`);
            } finally {
                setProcessingId(null);
            }
            return;
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

    };

    // 🔍 Filter & Search Logic
    const filteredContainers = containers.filter((container) => {
        const nameMatch = container.name?.[0]?.toLowerCase().includes(search.toLowerCase());
        const statusMatch =
            filterStatus === "all" ||
            container.status?.toLowerCase() === filterStatus.toLowerCase();
        return nameMatch && statusMatch;
    });

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
                <h1 className="text-3xl font-bold text-gray-800">🐳 Docker Container Dashboard</h1>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    + New Container
                </button>
            </div>

            {/* 🔍 Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Search container..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full sm:w-1/3 focus:ring-2 focus:ring-blue-400"
                />

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                >
                    <option value="all">All Status</option>
                    <option value="running">Running</option>
                    <option value="exited">Exited</option>
                    <option value="paused">Paused</option>
                </select>
            </div>

            {/* 🧱 Modal Create Container */}
            {showCreate && (
                <CreateContainerModal
                    onClose={() => setShowCreate(false)}
                    onCreated={fetchContainers}
                />
            )}

            {/* 🌀 Spinner & Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContainers.length > 0 ? (
                        filteredContainers.map((container) => (
                            <ContainerCard
                                key={container.Id || container.container_id}
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

            {/* 🪵 Modal Logs */}
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
