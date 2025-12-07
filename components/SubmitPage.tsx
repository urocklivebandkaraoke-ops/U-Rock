import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../types';
import { Music, ArrowLeft, CheckCircle, Camera, RefreshCcw, X, MessageSquare } from 'lucide-react';

interface SubmitPageProps {
  song: Song | null;
  onBack: () => void;
  onSubmit: (singerName: string, photo?: string, comments?: string) => void;
}

interface SingerProfile {
  firstName: string;
  lastName: string;
  photo?: string;
}

export const SubmitPage: React.FC<SubmitPageProps> = ({ song, onBack, onSubmit }) => {
  // Initialize state from localStorage (Last used name)
  const [firstName, setFirstName] = useState(() => localStorage.getItem('uRockFirstName') || '');
  const [lastName, setLastName] = useState(() => localStorage.getItem('uRockLastName') || '');
  const [comments, setComments] = useState('');
  
  // History state for paired autocomplete
  const [singerHistory, setSingerHistory] = useState<SingerProfile[]>([]);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load history on mount
  useEffect(() => {
    try {
      const savedProfiles = localStorage.getItem('uRockSingerProfiles');
      if (savedProfiles) {
        setSingerHistory(JSON.parse(savedProfiles));
      } else {
        setSingerHistory([]);
      }
    } catch (e) {
      setSingerHistory([]);
    }
  }, []);

  if (!song) return null;

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Dimensions for the thumbnail
        const size = 300;
        canvas.width = size;
        canvas.height = size;

        // Calculate center crop
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - minDim) / 2;
        const startY = (video.videoHeight - minDim) / 2;

        // Draw cropped image to canvas
        context.drawImage(
          video, 
          startX, startY, minDim, minDim, // Source crop
          0, 0, size, size // Destination resize
        );

        // Convert to low quality JPEG base64 string
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    startCamera();
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFirstName(val);

    // Smart Auto-fill: Check if this first name exists in history
    // We find the first match (which corresponds to the most recently used due to sorting)
    const match = singerHistory.find(profile => 
      profile.firstName.toLowerCase() === val.trim().toLowerCase()
    );

    if (match) {
      setLastName(match.lastName);
      if (match.photo) {
        setPhoto(match.photo);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (cleanFirst && cleanLast) {
      // Update the "Last Used" single values for next session init
      localStorage.setItem('uRockFirstName', cleanFirst);
      localStorage.setItem('uRockLastName', cleanLast);

      // Update History: Add new profile to top, remove duplicates
      const newProfile: SingerProfile = { 
        firstName: cleanFirst, 
        lastName: cleanLast,
        photo: photo || undefined
      };
      
      const updatedHistory = [
        newProfile,
        ...singerHistory.filter(p => 
          !(p.firstName.toLowerCase() === cleanFirst.toLowerCase() && 
            p.lastName.toLowerCase() === cleanLast.toLowerCase())
        )
      ].slice(0, 50); // Keep last 50 entries

      setSingerHistory(updatedHistory);
      localStorage.setItem('uRockSingerProfiles', JSON.stringify(updatedHistory));

      const fullName = `${cleanFirst} ${cleanLast}`;
      onSubmit(fullName, photo || undefined, comments || undefined);
    }
  };

  // Derive unique lists for datalists
  const uniqueFirstNames = Array.from(new Set(singerHistory.map(p => p.firstName)));
  const uniqueLastNames = Array.from(new Set(singerHistory.map(p => p.lastName)));

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 max-w-md mx-auto w-full">
      <button 
        onClick={() => {
          stopCamera();
          onBack();
        }}
        className="self-start mb-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to List
      </button>

      <div className="w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-brand-500"></div>
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-700 rounded-full">
            <Music className="w-12 h-12 text-accent-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-2">{song.title}</h2>
        <p className="text-center text-accent-400 font-medium mb-8">{song.artist}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-400">
              Who is singing?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  autoFocus={!isCameraOpen}
                  required
                  placeholder="First Name"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  list="firstNameHistory"
                  className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                />
                <datalist id="firstNameHistory">
                  {uniqueFirstNames.map((name, i) => (
                    <option key={i} value={name} />
                  ))}
                </datalist>
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  list="lastNameHistory"
                  className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                />
                <datalist id="lastNameHistory">
                  {uniqueLastNames.map((name, i) => (
                    <option key={i} value={name} />
                  ))}
                </datalist>
              </div>
            </div>
            <p className="text-xs text-slate-500 px-1">Start typing to see previous names.</p>
          </div>

          {/* Camera Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">
              Add a Selfie (Optional)
            </label>
            
            {isCameraOpen ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-3 bg-red-500/80 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="p-3 bg-white text-slate-900 rounded-full hover:bg-slate-200 border-4 border-slate-300"
                  >
                    <Camera className="w-8 h-8" />
                  </button>
                </div>
              </div>
            ) : photo ? (
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-square border border-slate-700 group">
                <img src={photo} alt="Selfie" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-4 py-2 bg-white text-slate-900 rounded-full font-bold flex items-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" /> Retake
                  </button>
                </div>
                <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-8 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-accent-400 hover:border-accent-500/50 hover:bg-slate-800/50 transition-all flex flex-col items-center gap-2"
              >
                <Camera className="w-8 h-8" />
                <span>Take a Photo</span>
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Notes for the Band (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="E.g. I want the A team to sing with me..."
              className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all placeholder-slate-600 h-24 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!firstName.trim() || !lastName.trim() || isCameraOpen}
            className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Add to Queue
          </button>
        </form>
      </div>
    </div>
  );
};