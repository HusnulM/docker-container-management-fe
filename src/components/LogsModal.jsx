import React from "react";

export default function LogsModal({ show, onClose, logs, title }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-5 relative">
                <h2 className="text-xl font-bold mb-3">{title}</h2>
                <pre className="bg-gray-900 text-green-300 p-3 rounded-lg overflow-y-auto h-96 text-sm">
                    {logs || "No logs available..."}
                </pre>

                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
