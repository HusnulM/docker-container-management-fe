import React from "react";
import { X } from "lucide-react";

export default function InspectModal({ containerName, inspectData, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-3/4 max-h-[80vh] rounded-xl shadow-lg overflow-hidden">
                <div className="flex justify-between items-center px-5 py-3 border-b">
                    <h2 className="font-semibold text-lg text-gray-800">
                        Inspect: {containerName}
                    </h2>
                    <button onClick={onClose}>
                        <X className="text-gray-600 hover:text-red-500" />
                    </button>
                </div>
                <div className="overflow-auto p-4 bg-gray-900 text-gray-100 text-sm font-mono">
                    <pre>{JSON.stringify(inspectData, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}
