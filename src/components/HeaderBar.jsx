import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function HeaderBar({ onRefresh, onAdd }) {
    const { user } = useContext(AuthContext);

    return (
        <header className="flex items-center justify-between border-b border-gray-200 p-4 bg-white">
            <h1 className="text-lg font-semibold text-gray-800">Containers</h1>
            <div className="flex items-center gap-3">
                <button
                    onClick={onRefresh}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                    Refresh
                </button>
                <button
                    onClick={onAdd}
                    className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-blue-700"
                >
                    + Add Container
                </button>
                <div className="text-sm text-gray-600 border-l pl-3">
                    {user?.email || localStorage.getItem("email")}
                </div>
            </div>
        </header>
    );
}
