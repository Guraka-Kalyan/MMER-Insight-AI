import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Type, 
  Mic, 
  ImageIcon, 
  Video, 
  Eye, 
  ChevronLeft, 
  Clock, 
  Upload, 
  Camera, 
  Activity,
  Zap,
  Cpu
} from 'lucide-react';
import { 
  predictText, 
  predictAudio, 
  predictImage, 
  type EmotionKey, 
  type EmotionResult,
  EMOTION_COLORS,
  EMOTION_LABELS,
  EMOTION_ICONS
} from '@/lib/emotions';

// --- Types ---
type Modality = 'text' | 'audio' | 'image' | 'video';

const EMOTIONS_LIST: EmotionKey[] = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const headerVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { ease: [0.25, 0.1, 0.25, 1] as any, duration: 0.8 } }
};

const sidebarVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { ease: [0.25, 0.1, 0.25, 1] as any, duration: 0.8 } }
};

const panelVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { ease: [0.25, 0.1, 0.25, 1] as any, duration: 0.8 } }
};

const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Modality;
  const [activeModality, setActiveModality] = useState<Modality>(
    ['text', 'audio', 'image', 'video'].includes(tabParam) ? tabParam : 'text'
  );

  useEffect(() => {
    if (tabParam && ['text', 'audio', 'image', 'video'].includes(tabParam)) {
      setActiveModality(tabParam);
    }
  }, [tabParam]);

  const handleModalityChange = (mode: Modality) => {
    setActiveModality(mode);
    setSearchParams({ tab: mode });
  };
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Handle window resize for mobile blocker
  const [isLowRes, setIsLowRes] = useState(false);

  // Text state
  const [textInput, setTextInput] = useState('');

  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Video state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturingVideo, setIsCapturingVideo] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  // Mouse move effect for custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsLowRes(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  // Auto-terminate camera and audio on modality switch
  useEffect(() => {
    if (activeModality !== 'video' && isCameraActive) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
      setIsScanning(false);
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    if (activeModality !== 'audio' && isRecording) {
      mediaRecorderRef.current?.stop();
    }
  }, [activeModality, isCameraActive, isRecording]);

  // Real-time video scanning interval
  useEffect(() => {
    let interval: any;
    if (activeModality === 'video' && isCameraActive && isScanning) {
      interval = setInterval(async () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const res = await predictImage(blob);
              setResult(res);
            }
          }, 'image/jpeg', 0.8);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [activeModality, isCameraActive, isScanning]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setAudioTimer(prev => prev + 1), 1000);
    } else {
      setAudioTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Audio Recording Logic ---
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false); // Fix state update
        };

        mediaRecorder.start();
        setIsRecording(true);
        setAudioBlob(null);
      } catch (err) {
        setError('Failed to access microphone');
      }
    }
  };

  // --- Video Camera Handling ---
  const toggleCamera = async () => {
    if (isCameraActive) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        setIsCameraActive(true);
      } catch (err) {
        setError('Failed to access camera');
      }
    }
  };

  const handleCaptureVideo = async () => {
    if (isCapturingVideo) {
      videoRecorderRef.current?.stop();
      setIsCapturingVideo(false);
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (!stream) return;

      const mediaRecorder = new MediaRecorder(stream);
      videoRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/mp4' });
        setLoading(true);
        try {
          const form = new FormData();
          form.append('video', blob, 'video.mp4');
          const res = await fetch(`${import.meta.env.VITE_API_URL}/predict_video`, {
            method: 'POST',
            body: form
          });
          const data = await res.json();
          setResult(data);
        } catch (err: any) {
          setError(err.message || 'Video analysis failed');
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setIsCapturingVideo(true);
    }
  };

  // --- Handlers ---
  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let res: EmotionResult;
      if (activeModality === 'text') {
        if (!textInput.trim()) throw new Error('Input text signal required');
        res = await predictText(textInput);
      } else if (activeModality === 'audio') {
        if (!audioBlob) throw new Error('Audio signal required. Please record first.');
        res = await predictAudio(audioBlob);
      } else if (activeModality === 'image') {
        if (!imageFile) throw new Error('Image source required');
        res = await predictImage(imageFile);
      } else if (activeModality === 'video') {
        if (!isCameraActive) throw new Error('Camera feed inactive');
        setIsScanning(!isScanning);
        setLoading(false);
        return;
      }
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'System error detected');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // API Status check
  const [apiStatus, setApiStatus] = useState<'pending' | 'connected' | 'disconnected'>('pending');
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then((res) => {
        if (res.ok) setApiStatus('connected');
        else setApiStatus('disconnected');
      })
      .catch(() => setApiStatus('disconnected'));
  }, []);
  // Reset results when switching modalities
  useEffect(() => {
    setResult(null);
    setError('');
  }, [activeModality]);

  if (isLowRes) {
    return (
      <div className="fixed inset-0 bg-[#010106] z-[9999] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
        <div className="flex items-center gap-3 mb-10 translate-y-[-20px]">
          <Eye className="w-6 h-6 text-[#00E5FF] glow-cyan" />
          <span className="font-mono text-[#00E5FF] tracking-[0.4em] text-[11px] font-bold">INSIGHT AI</span>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-7xl font-display text-white mb-6 tracking-tight leading-none"
        >
          DESKTOP ONLY
        </motion.h1>
        
        <p className="font-mono text-[10px] text-[#3A5A5F] max-w-[320px] leading-relaxed uppercase tracking-[0.2em]">
          This neural interface is optimized for desktop screens. Please open on a laptop or monitor.
        </p>
        
        <div className="w-56 h-[1px] bg-[#00E5FF]/10 mt-16 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full w-24 bg-[#00E5FF] shadow-[0_0_20px_#00E5FF] opacity-60"
            animate={{ left: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          />
        </div>

        {/* Subtle background noise */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#00E5FF_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed inset-0 bg-[#010106] flex flex-col font-body text-[#E0F7FA] overflow-hidden cursor-none selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]"
    >
      
      {/* Custom Cursor Field */}
      <div className="pointer-events-none fixed inset-0 z-[100]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(0,229,255,0.05)_0%,transparent_50%)]" />
        <div 
          className="fixed w-4 h-4 text-[#00E5FF] pointer-events-none z-[101] flex items-center justify-center font-mono text-xl"
          style={{ 
            left: 'var(--mouse-x, -20px)', 
            top: 'var(--mouse-y, -20px)',
            transform: 'translate(-50%, -50%)',
            textShadow: '0 0 8px #00E5FF'
          }}
        >
          +
        </div>
      </div>

      {/* --- Top Header Bar --- */}
      <motion.header 
        variants={headerVariants}
        className="h-12 shrink-0 border-b border-[#00E5FF]/10 bg-[#010106]/95 backdrop-blur-xl flex items-center justify-between px-6 z-50 shadow-[0_1px_0_rgba(0,229,255,0.1)]"
      >
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-[#00E5FF] glow-cyan" strokeWidth={2.5} />
          <span className="font-mono font-bold text-sm tracking-tighter text-[#00E5FF]">INSIGHT AI</span>
        </div>
        
        <div className="font-mono text-[10px] tracking-[0.4em] text-[#00E5FF]/30 font-bold">
          NEURAL COMMAND CENTER
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-mono text-[#3A5A5F] hover:text-[#00E5FF] transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
            BACK TO HOME
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs text-[#00E5FF]">
            <Clock className="w-3.5 h-3.5" />
            {time}
          </div>
        </div>
      </motion.header>

      {/* --- Main Contents --- */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* --- Left Sidebar --- */}
        <motion.aside 
          variants={sidebarVariants}
          className="w-[220px] shrink-0 border-r border-[#00E5FF]/10 bg-[#02020A] flex flex-col p-4 relative"
        >
          {/* Circuit pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48 0l3 3-3 3-3-3 3-3zm-36 0l3 3-3 3-3-3 3-3zM30 0L27 3l3 3 3-3-3-3zM0 54.627l.828.83 1.415-1.415L0 51.8v2.827zM0 5.373l.828-.83L2.243 5.96 0 8.2V5.374zM0 48l3 3-3 3-3-3 3-3zm0-36l3 3-3 3-3-3 3-3zm0 18l3 3-3 3-3-3 3-3zM54.627 60l.83-.828-1.415-1.415L51.8 60h2.827zM5.373 60l-.83-.828L5.96 57.757 8.2 60H5.374zM48 60l3-3-3-3-3 3 3 3zm-36 0l3-3-3-3-3 3 3 3zM30 60l3-3-3-3-3 3 3 3zM60 54.627l-.828.83-1.415-1.415L60 51.8v2.827zM60 5.373l-.828-.83L57.757 5.96 60 8.2V5.374zM60 48l-3 3 3 3 3-3-3-3zm0-36l-3 3 3 3 3-3-3-3zm0 18l-3 3 3 3 3-3-3-3z\' fill=\'%2300E5FF\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />
          
          <div className="mb-2 mt-2 font-mono text-[9px] tracking-[0.15em] text-[#3A5A5F] font-bold">ANALYSIS MODE</div>
          
          <nav className="flex flex-col gap-1">
            {[
              { id: 'text', icon: Type, label: 'TEXT_SIGNAL' },
              { id: 'audio', icon: Mic, label: 'VOICE_PROSODY' },
              { id: 'image', icon: ImageIcon, label: 'FACIAL_MAPPING' },
              { id: 'video', icon: Video, label: 'REALTIME_FEED' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModalityChange(mode.id as Modality)}
                className={`flex items-center gap-3 p-3 rounded-sm transition-all duration-300 group relative ${
                  activeModality === mode.id ? 'text-[#00E5FF]' : 'text-[#2A4A4F] hover:text-[#00E5FF]'
                }`}
              >
                {activeModality === mode.id && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[60%] bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                <mode.icon className={`w-4 h-4 ${activeModality === mode.id ? 'glow-cyan' : ''}`} strokeWidth={activeModality === mode.id ? 2.5 : 2} />
                <span className="font-mono text-[11px] font-bold tracking-tight">{mode.label}</span>
              </button>
            ))}
          </nav>

        </motion.aside>

        {/* --- Center Input Panel --- */}
        <motion.section 
          variants={panelVariants}
          className="flex-1 bg-[#03030D] flex flex-col relative overflow-hidden min-h-0"
        >
          {/* Main content area - overflow-hidden forced */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="relative z-10 w-full flex-1 flex flex-col min-h-0 p-6 pb-2">
            <div className="max-w-4xl mx-auto w-full shrink-0 mb-3">
              <h2 className="text-5xl font-display text-[#E0F7FA] tracking-wider uppercase leading-tight mt-2 mb-1">
                {activeModality} ANALYSIS
              </h2>
              <p className="font-mono text-xs text-[#3A5A5F] tracking-widest uppercase">
                NEURAL ENGINE {activeModality.toUpperCase()}_LAYER 00{activeModality === 'text' ? '1' : activeModality === 'audio' ? '2' : activeModality === 'image' ? '3' : '4'}
              </p>
            </div>

            <div className="flex-1 flex flex-col min-h-0 mb-2">
              <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0">
              <AnimatePresence mode="wait">
                {activeModality === 'text' && (
                  <motion.div 
                    key="text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col gap-4 min-h-0"
                  >
                    <div className="flex-1 relative group shrink-0 min-h-0">
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="INPUT TEXT SIGNAL..."
                        className="w-full h-full bg-[#020210] border border-[#00E5FF]/20 rounded-lg p-6 font-body text-lg focus:outline-none focus:border-[#00E5FF]/50 transition-colors resize-none relative z-10"
                      />
                      {/* Scanline pattern */}
                      <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.02] bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px]" />
                      <div className="absolute bottom-4 right-6 z-30 font-mono text-[10px] text-[#3A5A5F]">
                        {textInput.length} CHARS_LOADED
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeModality === 'audio' && (
                  <motion.div 
                    key="audio"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col items-center justify-center gap-6 py-2 min-h-0 overflow-hidden"
                  >
                    <div className="relative shrink-0">
                      <motion.button
                        onClick={toggleRecording}
                        className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all duration-500 relative z-10 ${
                          isRecording ? 'bg-red-500/10 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.2)]' : 'bg-[#00E5FF]/5 border-[#00E5FF]/30'
                        }`}
                        animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Mic className={`w-8 h-8 ${isRecording ? 'text-white' : 'text-[#00E5FF]'}`} />
                      </motion.button>
                      
                      {isRecording && (
                        <motion.div 
                          className="absolute inset-[-10px] rounded-full border border-[#00E5FF]/20"
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.4, opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-[60px] shrink-0">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-[#00E5FF]/60 rounded-full"
                          animate={isRecording ? { height: [6, Math.random() * 30 + 6, 6] } : { height: 4 }}
                          transition={isRecording ? { repeat: Infinity, duration: 0.4 + Math.random() * 0.4, delay: i * 0.02 } : {}}
                        />
                      ))}
                    </div>

                    <div className="text-center mt-2 shrink-0">
                      <div className="font-mono text-xl text-[#00E5FF] mb-0.5">{formatTime(audioTimer)}</div>
                      <div className="font-mono text-[10px] text-[#5A848A] uppercase tracking-[0.2em] font-bold">
                        {isRecording ? 'CAPTURING_SIGNAL...' : 'AWAITING_INPUT'}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeModality === 'image' && (
                  <motion.div 
                    key="image"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col gap-2 min-h-0"
                  >
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 h-full shrink min-h-0 max-h-[240px] border-2 border-dashed border-[#00E5FF]/20 rounded-xl bg-[#020210] flex flex-col items-center justify-center cursor-pointer hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/[0.02] transition-all relative overflow-hidden group"
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} className="max-h-full max-w-full object-contain" alt="Preview" />
                          <motion.div 
                            className="absolute top-0 left-0 right-0 h-0.5 bg-[#00E5FF] shadow-[0_0_15px_#00E5FF] z-30"
                            initial={{ top: '0%' }}
                            animate={{ top: '100%' }}
                            transition={{ duration: 2, ease: "linear" }}
                          />
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-[#3A5A5F] mb-4 group-hover:text-[#00E5FF] transition-colors" />
                          <div className="font-mono text-xs text-[#E0F7FA] font-bold mb-1">DROP_FACE_IMAGE</div>
                          <div className="font-mono text-[10px] text-[#3A5A5F] uppercase">OR_CLICK_TO_UPLOAD</div>
                        </>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button className="flex-1 h-[36px] border border-[#00E5FF]/20 rounded font-mono text-[10px] text-[#00E5FF]/60 hover:text-[#00E5FF] hover:bg-[#00E5FF]/5 transition-all uppercase">SAMPLE_HAPPY.DAT</button>
                      <button className="flex-1 h-[36px] border border-[#00E5FF]/20 rounded font-mono text-[10px] text-[#00E5FF]/60 hover:text-[#00E5FF] hover:bg-[#00E5FF]/5 transition-all uppercase">SAMPLE_SAD.DAT</button>
                    </div>
                  </motion.div>
                )}

                {activeModality === 'video' && (
                  <motion.div 
                    key="video"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col gap-2 min-h-0"
                  >
                    <div className="flex-1 h-full shrink min-h-0 max-h-[340px] bg-[#020210] border border-[#00E5FF]/30 rounded-xl relative overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.05)]">
                      {isCameraActive ? (
                        <>
                          <div className="absolute inset-0 bg-blue-500/10 z-10 pointer-events-none" />
                          <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                        </>
                      ) : (
                        <>
                          <Camera className="w-16 h-16 text-[#3A5A5F] mb-4" />
                          <div className="font-mono text-xs text-[#3A5A5F] font-bold uppercase tracking-widest">CAMERA_OFFLINE</div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={toggleCamera}
                        className="w-full h-[44px] bg-transparent border border-[#00E5FF]/30 text-[#00E5FF] font-mono font-bold text-[11px] uppercase rounded hover:bg-[#00E5FF]/10 transition-all"
                      >
                        {isCameraActive ? 'TERMINATE_FEED' : 'INITIALIZE_CAMERA'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          </div>
          </div>

          {/* Bottom bar */}
          <div className="shrink-0 border-t border-[#00E5FF]/10 px-4 py-3 z-30">
            <div className="max-w-4xl mx-auto w-full">
              <button 
                onClick={handleAnalyze}
                disabled={loading || (activeModality === 'text' && !textInput.trim()) || (activeModality === 'image' && !imageFile) || (activeModality === 'audio' && !audioBlob && !isRecording)}
                className="w-full custom-dashboard-btn"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span className="tracking-[0.2em] text-[11px]">ANALYZING...</span>
                  </>
                ) : (
                  <>
                    <Zap className={`w-4 h-4 fill-current ${isScanning ? 'animate-pulse text-[#00E5FF]' : ''}`} />
                    <span className="tracking-[0.1em]">
                      {activeModality === 'video' ? (isScanning ? 'TERMINATE_LIVE_SCAN' : 'INITIATE_LIVE_SCAN') : 'INITIATE ANALYSIS'}
                    </span>
                  </>
                )}
              </button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded font-mono text-[10px] text-red-500 text-center uppercase tracking-widest"
                >
                  ERROR_SIGNAL: {error}
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* --- Right Results Panel --- */}
        <motion.aside 
          variants={panelVariants}
          className="w-[380px] shrink-0 bg-[#02020C] border-l border-[#00E5FF]/10 flex flex-col p-6 overflow-y-auto relative"
        >
          
          <div className="flex items-center justify-between mb-8">
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#3A5A5F] font-bold uppercase">SIGNAL OUTPUT</div>
            <Cpu className="w-3.5 h-3.5 text-[#3A5A5F]" />
          </div>

          {!result && !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-[180px] h-[180px] mb-8">
                {/* Dash Radar Circle */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00E5FF]/30 bg-[#00E5FF]/[0.03]" />
                
                {/* Rotating Arc */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00E5FF]/60"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                />

                {/* Pulse Center Dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"
                    animate={{ scale: [1, 1.8, 1], opacity: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </div>

              <div className="font-mono text-[10px] text-[#3A5A5F] uppercase tracking-[0.3em] flex items-center">
                AWAITING INPUT SIGNAL
                <motion.span 
                  animate={{ opacity: [1, 0, 1] }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="ml-1 w-1 h-3 bg-[#00E5FF]/40"
                >
                  |
                </motion.span>
              </div>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <motion.div 
                className="w-24 h-24 border-2 border-t-[#00E5FF] border-r-transparent border-b-[#00E5FF]/20 border-l-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <div className="font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.2em] animate-pulse">
                DECODING_NEURAL_LAYERS...
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-full"
            >
              {/* Emotion Orb */}
              <div className="flex flex-col items-center mb-12">
                <motion.div 
                  className="w-40 h-40 rounded-full flex flex-col items-center justify-center relative mb-6"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                  transition={{ 
                    scale: { repeat: Infinity, duration: 2 },
                    opacity: { duration: 0.5 }
                  }}
                  style={{ 
                    background: `radial-gradient(circle, ${EMOTION_COLORS[result!.label]}66 0%, transparent 70%)`,
                    boxShadow: `0 0 60px ${EMOTION_COLORS[result!.label]}33`
                  }}
                >
                  <div className="text-5xl mb-2">{EMOTION_ICONS[result!.label]}</div>
                  <div className="font-mono text-sm font-bold text-white uppercase tracking-widest">{EMOTION_LABELS[result!.label]}</div>
                </motion.div>
                
                <div className="text-center">
                  <div className="font-mono text-5xl font-bold text-[#00E5FF] mb-1">
                    {(result!.probabilities[result!.label] * 100).toFixed(1)}%
                  </div>
                  <div className="font-mono text-[9px] text-[#3A5A5F] tracking-[0.2em] uppercase font-bold">
                    DOMINANT SIGNAL DETECTED
                  </div>
                </div>
              </div>

              {/* Signal Distribution */}
              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-[#3A5A5F] font-bold uppercase mb-6">SIGNAL DISTRIBUTION</div>
                <div className="space-y-4">
                  {EMOTIONS_LIST.map((emotion, i) => (
                    <div key={emotion}>
                      <div className="flex justify-between font-mono text-[10px] mb-1.5 px-0.5">
                        <span className="text-[#E0F7FA]/70 uppercase">{emotion}</span>
                        <span className="text-[#E0F7FA]">
                          {((result?.probabilities?.[emotion] || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(result?.probabilities?.[emotion] || 0) * 100}%` }}
                          transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: EMOTION_COLORS[emotion] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-8 flex items-center justify-between border-t border-[#00E5FF]/5">
                <div className="font-mono text-[9px] text-[#3A5A5F]">FACES_DETECTED: 01</div>
                <Activity className="w-3.5 h-3.5 text-[#00E5FF]/40" />
              </div>
            </motion.div>
          )}

          {/* Background Reactant Tint */}
          <motion.div 
            className="absolute inset-0 z-[-1] pointer-events-none transition-colors duration-1000"
            style={{ 
              backgroundColor: result ? `${EMOTION_COLORS[result.label]}08` : 'transparent'
            }}
          />
        </motion.aside>

      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rot-arc {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .glow-cyan {
          filter: drop-shadow(0 0 4px rgba(0, 229, 255, 0.6));
        }
      `}} />
    </motion.div>
  );
};

export default DashboardPage;
