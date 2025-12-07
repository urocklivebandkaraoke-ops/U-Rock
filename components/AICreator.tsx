import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Download, Sparkles } from 'lucide-react';
import { generateAlbumArt } from '../services/geminiService';
import { ImageSize } from '../types';

export const AICreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.Size1K);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError('');
    setGeneratedImage(null);
    try {
      const base64Image = await generateAlbumArt(prompt, size);
      setGeneratedImage(base64Image);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate image. Try a different prompt.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 p-4 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 flex items-center gap-2">
          <Sparkles className="text-green-400" />
          AI Album Art
        </h2>
        <p className="text-slate-400">Design your own single cover with Gemini Nano Banana Pro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Describe your cover art
            </label>
            <textarea
              className="w-full h-32 p-4 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
              placeholder="E.g., A neon robot singing in the rain, cyberpunk style..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[ImageSize.Size1K, ImageSize.Size2K, ImageSize.Size4K].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-2 px-4 rounded-lg border transition-all ${
                    size === s
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            Generate Art
          </button>
          
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-1 flex items-center justify-center min-h-[300px] relative overflow-hidden group">
          {generatedImage ? (
            <>
              <img src={generatedImage} alt="Generated Art" className="w-full h-full object-cover rounded-xl" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <a href={generatedImage} download={`karaoke-art-${Date.now()}.png`} className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold flex items-center gap-2 hover:bg-slate-200">
                    <Download className="w-5 h-5" /> Save Image
                 </a>
              </div>
            </>
          ) : (
            <div className="text-slate-600 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>Your masterpiece will appear here</p>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};