import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw, Play, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraViewProps {
  onCapture: (base64: string) => Promise<void>;
  isAnalyzing: boolean;
  interval: number;
  facingMode: 'user' | 'environment';
}

export default function CameraView({ onCapture, isAnalyzing, interval, facingMode }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoCapture, setAutoCapture] = useState(false);
  const [countdown, setCountdown] = useState(interval);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Unable to access camera with specified mode. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setAutoCapture(false);
  };

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      await onCapture(base64);
    }
  }, [onCapture]);

  // Handle countdown interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoCapture && !isAnalyzing) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(interval);
    }
    return () => clearInterval(timer);
  }, [autoCapture, isAnalyzing, interval]);

  // Trigger capture at 0
  useEffect(() => {
    if (autoCapture && countdown === 0 && !isAnalyzing) {
      captureFrame();
      setCountdown(interval);
    }
  }, [countdown, autoCapture, isAnalyzing, captureFrame, interval]);

  // Restart camera when facingMode changes
  useEffect(() => {
    stopCamera();
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-brand-line shadow-2xl">
      {error ? (
        <div className="flex flex-col items-center justify-center h-full text-white p-4 text-center">
          <p className="mb-4 opacity-70">{error}</p>
          <button 
            onClick={startCamera}
            className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-opacity-80 transition-all"
          >
            Retry Camera
          </button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setAutoCapture(!autoCapture)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                    autoCapture ? 'bg-red-500 text-white' : 'bg-brand-accent text-white'
                  }`}
                >
                  {autoCapture ? <Square size={18} /> : <Play size={18} />}
                  {autoCapture ? `Monitoring (${countdown}s)` : 'Start Monitor'}
                </button>
                
                <button
                  onClick={captureFrame}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-md font-medium backdrop-blur-md border border-white/20 hover:bg-white/20 disabled:opacity-50 transition-all"
                >
                  {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                  Capture
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stream ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                <span className="text-white text-xs font-mono font-medium uppercase tracking-widest opacity-80">
                  {stream ? 'Live Feed' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
      
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="relative">
              <Loader2 size={48} className="text-white animate-spin" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-white/20 blur-2xl rounded-full" 
              />
            </div>
            <p className="mt-4 text-white font-mono text-sm tracking-widest uppercase">Analyzing Crowd...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
