import React, { useEffect, useState, useContext, useRef } from "react";
import Sidebar from "../components/Sidebar";
import HeaderBar from "../components/HeaderBar";
import ContainerCard from "../components/ContainerCard";
import CreateContainerModal from "../components/CreateContainer";
import LogsModal from "./LogsModal";
import InspectModal from "./InspectModal";
// import { CreateContainerModal } from "../components/CreateContainerModal";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function DashboardContainer() {
    const { token, user } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL;

    const [openModal, setOpenModal] = useState(false);
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

    // 🧠 State untuk menyimpan chart history agar tidak hilang setiap refresh
    const statsRef = useRef({}); // { container_id: { cpu: [], mem: [] } }

    // ✅ Fetch list container
    const fetchContainers = async () => {
        try {
            const res = await fetch(`${API_URL}/containers`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            const list = Array.isArray(data)
                ? data
                : data.containers || data.data || [];

            // Sync old stats agar chart history tetap ada
            list.forEach((c) => {
                if (!statsRef.current[c.container_id]) {
                    statsRef.current[c.container_id] = { cpu: [], mem: [] };
                }
            });

            setContainers(list);
        } catch (err) {
            toast.error("Failed to load containers");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch stats tiap 3 detik
    const fetchStats = async () => {
        for (const container of containers) {
            if (container.status === "running") {
                try {
                    const res = await fetch(
                        `${API_URL}/containers/stats/${container.container_id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const data = await res.json();
                    const s = data.success ? data.stats : data;

                    if (s) {
                        const ref = statsRef.current[container.container_id];
                        if (ref) {
                            ref.cpu = [...ref.cpu.slice(-19), s.cpuPercent];
                            ref.mem = [...ref.mem.slice(-19), s.memoryPercent];
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch stats", err);
                }
            }
        }
    };

    const handleCreateContainer = async (formData) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_URL}/containers/create`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowCreate(false);
            fetchContainers();
        } catch (err) {
            console.error("Error creating container:", err);
            alert("Failed to create container.");
        }
    };

    useEffect(() => {
        // const savedEmail = localStorage.getItem("email");
        // if (savedEmail) setUser({ email: savedEmail });

        console.log(token);

        fetchContainers();
        const containerInterval = setInterval(fetchContainers, 8000);
        const statsInterval = setInterval(fetchStats, 3000);

        return () => {
            clearInterval(containerInterval);
            clearInterval(statsInterval);
        };
    }, [token]);

    // ✅ Handler tombol aksi (start, stop, restart)
    const handleAction = async ({ id, action, method, endpoint }) => {
        setProcessingId(id);
        toast.loading(`${action} in progress...`, { id: `act-${id}` });


        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
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
            }

            if (res.ok) {
                toast.success(`${action} success!`, { id: `act-${id}` });
                fetchContainers();
            } else {
                toast.error(data.message || "Action failed", { id: `act-${id}` });
            }
        } catch (err) {
            toast.error(err.message, { id: `act-${id}` });
        } finally {
            setProcessingId(null);
        }

    };

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-gray-50">
                <HeaderBar
                    user={user}
                    onRefresh={fetchContainers}
                    onAdd={() => setShowCreate(true)}
                />

                {/* CREATE CONTAINER MODAL */}
                {showCreate && (
                    <CreateContainerModal
                        open={openModal}
                        onClose={() => setShowCreate(false)}
                        onCreate={handleCreateContainer}
                    />
                )}

                <main className="flex-1 p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : containers.length === 0 ? (
                        <div className="text-center text-gray-500 border border-gray-200 bg-white rounded-lg py-12">
                            No containers found.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {containers.map((container) => (
                                <ContainerCard
                                    key={container.container_id}
                                    container={container}
                                    onAction={handleAction}
                                    processingId={processingId}
                                    stats={statsRef.current[container.container_id] || { cpu: [], mem: [] }}
                                />
                            ))}
                        </div>
                    )}
                </main>

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
        </div>
    );
}
