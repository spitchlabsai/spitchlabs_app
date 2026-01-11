import { useState, useCallback, useRef, useEffect } from 'react';

export interface GatewayMetrics {
    framesSent: number;
    bytesSent: number;
    framesReceived: number;
    bytesReceived: number;
    latencyMs: number;
}

export interface LogEntry {
    timestamp: string;
    message: string;
    level: 'info' | 'warn' | 'error' | 'debug';
}

export const useVoiceGateway = (serverUrl: string) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
    const [metrics, setMetrics] = useState<GatewayMetrics>({
        framesSent: 0,
        bytesSent: 0,
        framesReceived: 0,
        bytesReceived: 0,
        latencyMs: 0,
    });
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [visualizerData, setVisualizerData] = useState<number[]>(new Array(128).fill(0));

    const wsRef = useRef<WebSocket | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const micCtxRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const workletNodeRef = useRef<ScriptProcessorNode | null>(null);
    const nextPlayTimeRef = useRef<number>(0);
    const sequenceRef = useRef<number>(0);
    const pingIntervalRef = useRef<any>(null);

    const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
        setLogs((prev) => [
            ...prev.slice(-99),
            { timestamp: new Date().toLocaleTimeString(), message, level },
        ]);
    }, []);

    const updateMetrics = useCallback((update: Partial<GatewayMetrics>) => {
        setMetrics((prev) => ({ ...prev, ...update }));
    }, []);

    // Connection Management
    const connect = useCallback(() => {
        try {
            addLog(`Connecting to ${serverUrl}...`);
            const ws = new WebSocket(serverUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                addLog('WebSocket connected');

                // Start latency monitor
                pingIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
                    }
                }, 2000);
            };

            ws.onmessage = async (event) => {
                if (typeof event.data === 'string') {
                    const message = JSON.parse(event.data);
                    if (message.type === 'pong') {
                        const latency = Date.now() - message.timestamp;
                        updateMetrics({ latencyMs: latency });
                    } else if (message.type === 'session.started') {
                        setIsSessionActive(true);
                        addLog(`Session started: ${message.session_id}`);
                    } else if (message.type === 'session.ended') {
                        setIsSessionActive(false);
                        addLog('Session ended');
                    } else {
                        addLog(`← ${message.type}`, 'debug');
                    }
                } else {
                    // Binary audio frame
                    handleAudioFrame(event.data);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                setIsSessionActive(false);
                addLog('WebSocket disconnected', 'warn');
                if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            };

            ws.onerror = (err) => {
                addLog('WebSocket error', 'error');
                console.error(err);
            };
        } catch (err) {
            addLog(`Connection failed: ${err}`, 'error');
        }
    }, [serverUrl, addLog, updateMetrics]);

    const disconnect = useCallback(() => {
        wsRef.current?.close();
        stopMicrophone();
    }, []);

    // Session Management
    const initAudioPlayback = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextPlayTimeRef.current = audioCtxRef.current.currentTime;
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        addLog('Audio playback initialized (24kHz)');
    }, [addLog]);

    const startSession = useCallback((config: any) => {
        initAudioPlayback();
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'session.start',
                config: {
                    ...config,
                    audio: {
                        sample_rate: 16000,
                        channels: 1,
                        bit_depth: 16,
                        encoding: 'pcm'
                    }
                }
            }));
            addLog('Session start requested');
        }
    }, [addLog]);

    const endSession = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'session.end' }));
            addLog('Session end requested');
        }
        stopMicrophone();
    }, [addLog]);

    // Audio Playback
    const handleAudioFrame = async (data: Blob) => {
        try {
            const buffer = await data.arrayBuffer();
            const view = new DataView(buffer);
            const frameType = view.getUint8(0);

            if (frameType === 0x02) { // Output
                const pcmData = new Int16Array(buffer, 6);
                playAudio(pcmData);
                updateMetrics({
                    framesReceived: metrics.framesReceived + 1,
                    bytesReceived: metrics.bytesReceived + buffer.byteLength
                });
            }
        } catch (err) {
            console.error('Error parsing audio frame', err);
        }
    };

    const playAudio = (pcmData: Int16Array) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextPlayTimeRef.current = audioCtxRef.current.currentTime;
        }

        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const float32Data = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
            float32Data[i] = pcmData[i] / (pcmData[i] < 0 ? 0x8000 : 0x7FFF);
        }

        const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
        audioBuffer.getChannelData(0).set(float32Data);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        const playTime = Math.max(nextPlayTimeRef.current, ctx.currentTime);
        source.start(playTime);
        nextPlayTimeRef.current = playTime + audioBuffer.duration;
    };

    // Microphone
    const startMicrophone = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });
            streamRef.current = stream;

            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            micCtxRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            workletNodeRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);

                // Visualizer
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                const rms = Math.sqrt(sum / inputData.length);
                setVisualizerData(prev => [...prev.slice(1), rms]);

                // Convert to Int16
                const int16Data = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Send in 20ms chunks (320 samples @ 16kHz)
                const chunkSize = 320;
                for (let i = 0; i < int16Data.length; i += chunkSize) {
                    const chunk = int16Data.slice(i, i + chunkSize);
                    if (chunk.length === chunkSize && wsRef.current?.readyState === WebSocket.OPEN) {
                        const header = new ArrayBuffer(6);
                        const view = new DataView(header);
                        view.setUint8(0, 0x01); // Input
                        view.setUint8(1, 0x00);
                        view.setUint32(2, sequenceRef.current++, false);

                        wsRef.current.send(new Blob([header, chunk]));
                        updateMetrics({
                            framesSent: metrics.framesSent + 1,
                            bytesSent: metrics.bytesSent + chunk.byteLength + 6
                        });
                    }
                }
            };

            source.connect(processor);
            processor.connect(ctx.destination);
            setIsMicrophoneActive(true);
            addLog('Microphone started');
        } catch (err) {
            addLog(`Mic error: ${err}`, 'error');
        }
    }, [addLog, updateMetrics]);

    const stopMicrophone = useCallback(() => {
        workletNodeRef.current?.disconnect();
        streamRef.current?.getTracks().forEach(t => t.stop());
        setIsMicrophoneActive(false);
        addLog('Microphone stopped');
    }, [addLog]);

    return {
        isConnected,
        isSessionActive,
        isMicrophoneActive,
        metrics,
        logs,
        visualizerData,
        connect,
        disconnect,
        initAudioPlayback,
        startSession,
        endSession,
        startMicrophone,
        stopMicrophone,
    };
};
