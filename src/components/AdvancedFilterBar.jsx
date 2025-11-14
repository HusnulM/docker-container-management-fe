import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon, RotateCcw } from "lucide-react";

export default function AdvancedFilterBar({ onFilterChange }) {
    const [filters, setFilters] = useState({
        searchText: "",
        status: "",
        port: "",
        dateFrom: "",
        dateTo: "",
    });

    // Debounce searchText
    useEffect(() => {
        const timeout = setTimeout(() => {
            onFilterChange(filters);
        }, 300);
        return () => clearTimeout(timeout);
    }, [filters]);

    const handleChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        const resetFilters = {
            searchText: "",
            status: "",
            port: "",
            dateFrom: "",
            dateTo: "",
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <Input
                placeholder="🔍 Search by name..."
                value={filters.searchText}
                onChange={(e) => handleChange("searchText", e.target.value)}
                className="w-60"
            />

            {/* Status */}
            <Select value={filters.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="exited">Exited</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
            </Select>

            {/* Port */}
            <Input
                placeholder="Port"
                value={filters.port}
                onChange={(e) => handleChange("port", e.target.value)}
                className="w-28"
            />

            {/* Date Range */}
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-36 justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateFrom || "From date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Calendar
                            mode="single"
                            selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                            onSelect={(date) => handleChange("dateFrom", date?.toISOString().split("T")[0] || "")}
                        />
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-36 justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateTo || "To date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Calendar
                            mode="single"
                            selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                            onSelect={(date) => handleChange("dateTo", date?.toISOString().split("T")[0] || "")}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Reset */}
            <Button onClick={handleReset} variant="secondary" className="flex items-center gap-1">
                <RotateCcw className="h-4 w-4" />
                Reset
            </Button>
        </div>
    );
}
