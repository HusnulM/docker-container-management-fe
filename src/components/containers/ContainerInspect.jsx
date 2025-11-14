import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactJson from "react-json-view";
import { inspectContainer } from "@/services/dockerApi";
import { Loader2, RefreshCcw } from "lucide-react";

export default function ContainerInspect({ containerId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadInspect = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await inspectContainer(containerId);
            setData(res);
        } catch (err) {
            console.error("Failed to fetch container inspect:", err);
            setError("Failed to fetch container details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (containerId) loadInspect();
    }, [containerId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                <span className="ml-2 text-gray-500">Loading container details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-4 text-center">
                <p className="text-red-500">{error}</p>
                <Button onClick={loadInspect} className="mt-3">
                    <RefreshCcw className="h-4 w-4 mr-1" /> Retry
                </Button>
            </Card>
        );
    }

    return (
        <Card className="shadow-md border">
            <CardHeader className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                    Container Inspect: <span className="text-blue-600">{containerId}</span>
                </h2>
                <Button variant="outline" size="sm" onClick={loadInspect}>
                    <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
                </Button>
            </CardHeader>
            <CardContent>
                {data ? (
                    <ReactJson
                        src={data}
                        name={false}
                        collapsed={2}
                        displayDataTypes={false}
                        enableClipboard={true}
                        theme="rjv-default"
                        style={{ backgroundColor: "transparent" }}
                    />
                ) : (
                    <p className="text-gray-500">No data available</p>
                )}
            </CardContent>
        </Card>
    );
}
