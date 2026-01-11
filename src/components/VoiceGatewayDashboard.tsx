'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVoiceGateway, GatewayMetrics, LogEntry } from '@/hooks/useVoiceGateway';

interface VoiceGatewayDashboardProps {
    gateway: ReturnType<typeof useVoiceGateway>;
    title?: string;
}

export const VoiceGatewayDashboard = ({ gateway, title = "Voice Gateway Monitor" }: VoiceGatewayDashboardProps) => {
    const { isConnected, isSessionActive, isMicrophoneActive, metrics, logs, visualizerData } = gateway;
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {/* Status & Metrics */}
            <Card className="md:col-span-1 bg-bg1 border-border0">
                <CardHeader>
                    <CardTitle className="text-sm font-mono flex items-center justify-between">
                        {title}
                        <Badge variant={isConnected ? "success" : "destructive"}>
                            {isConnected ? "CONNECTED" : "DISCONNECTED"}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <MetricItem label="SESSION" value={isSessionActive ? "ACTIVE" : "IDLE"} color={isSessionActive ? "text-primary" : "text-fg2"} />
                        <MetricItem label="MIC" value={isMicrophoneActive ? "ON" : "OFF"} color={isMicrophoneActive ? "text-success" : "text-fg2"} />
                        <MetricItem label="LATENCY" value={`${metrics.latencyMs}ms`} />
                        <MetricItem label="PACKETS OUT" value={metrics.framesSent.toLocaleString()} />
                        <MetricItem label="DATA OUT" value={`${(metrics.bytesSent / 1024).toFixed(1)} KB`} />
                        <MetricItem label="DATA IN" value={`${(metrics.bytesReceived / 1024).toFixed(1)} KB`} />
                    </div>

                    <div className="h-16 bg-bg0 rounded flex items-center justify-center overflow-hidden">
                        <Visualizer data={visualizerData} />
                    </div>
                </CardContent>
            </Card>

            {/* Logs */}
            <Card className="md:col-span-2 bg-bg1 border-border0 flex flex-col h-[300px]">
                <CardHeader className="py-2">
                    <CardTitle className="text-xs font-mono text-fg2 uppercase tracking-widest">Real-time Events</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 bg-bg0/50 m-2 p-2 rounded">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-2">
                            <span className="text-fg3">[{log.timestamp}]</span>
                            <span className={logLevelColor(log.level)}>{log.message}</span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </CardContent>
            </Card>
        </div>
    );
};

const MetricItem = ({ label, value, color = "text-fg1" }: { label: string, value: string, color?: string }) => (
    <div className="bg-bg0 p-2 rounded border border-border0/50">
        <div className="text-[10px] text-fg2 font-bold uppercase">{label}</div>
        <div className={`text-sm font-mono font-bold ${color}`}>{value}</div>
    </div>
);

const Visualizer = ({ data }: { data: number[] }) => {
    return (
        <div className="flex items-end gap-[1px] h-full w-full px-2">
            {data.map((v, i) => (
                <div
                    key={i}
                    className="bg-primary flex-1 rounded-t-[1px] transition-all duration-75"
                    style={{ height: `${Math.min(100, v * 500)}%` }}
                />
            ))}
        </div>
    );
};

const logLevelColor = (level: LogEntry['level']) => {
    switch (level) {
        case 'error': return 'text-destructive';
        case 'warn': return 'text-warning';
        case 'debug': return 'text-fg3';
        default: return 'text-fg1';
    }
};
