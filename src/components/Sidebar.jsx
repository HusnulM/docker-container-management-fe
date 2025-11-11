import React from "react";
import { Cpu, Database, Settings, HelpCircle, Server } from "lucide-react";

export default function Sidebar({ onNavigate }) {
    const menus = [
        { title: "Containers", icon: <Cpu size={18} />, path: "containers" },
        { title: "Database", icon: <Database size={18} />, path: "database" },
        { title: "Settings", icon: <Settings size={18} />, path: "settings" },
        { title: "Support", icon: <HelpCircle size={18} />, path: "support" },
    ];

    return (
        <aside className="w-60 bg-gray-50 h-screen border-r border-gray-200 flex flex-col">
            <div className="p-4 text-xl font-semibold text-blue-600 flex items-center gap-2">
                <Server size={22} /> ToekangKetik
            </div>
            <nav className="flex-1 p-2 space-y-1">
                {menus.map((m) => (
                    <button
                        key={m.title}
                        onClick={() => onNavigate(m.path)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50"
                    >
                        {m.icon} {m.title}
                    </button>
                ))}
            </nav>
        </aside>
    );
}
