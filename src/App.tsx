import { useState, useEffect } from 'react';
import type { AppState } from './types';
import { defaultState } from './types';
import XMLParser from './components/XMLParser';
import Form from './components/Form';
import CanvasPreview from './components/CanvasPreview';
import Uploader from './components/Uploader';
import { getTemplates, getCharacters } from './db';

function App() {
  const [state, setState] = useState<AppState>(defaultState);

  // Auto-load last used images on startup
  useEffect(() => {
    const restoreSavedImages = async () => {
      try {
        const savedTemps = await getTemplates();
        const savedChars = await getCharacters();
        const updates: Partial<AppState> = {};

        if (savedTemps.length > 0) {
          updates.templateUrl = savedTemps[0].dataUrl;
        }
        if (savedChars.length > 0) {
          updates.characterUrl = savedChars[0].dataUrl;
        }

        if (Object.keys(updates).length > 0) {
          setState((prev) => ({ ...prev, ...updates }));
        }
      } catch (err) {
        console.error('Failed to restore saved images on startup', err);
      }
    };
    restoreSavedImages();
  }, []);

  const handleUpdate = (updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <header className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 sm:p-6 text-white text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">TipsImageMaker</h1>
          <p className="text-purple-100 mt-1 sm:mt-2 text-xs sm:text-sm font-medium">Auto-Layout Image Generator for Tips</p>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left Column: Inputs */}
          <div className="space-y-6 sm:space-y-8">
            <Uploader 
              templateUrl={state.templateUrl}
              characterUrl={state.characterUrl}
              characterPos={state.characterPos}
              onTemplateUpload={(url) => handleUpdate({ templateUrl: url })} 
              onCharacterUpload={(url) => handleUpdate({ characterUrl: url })} 
              onCharacterMove={(pos) => handleUpdate({ characterPos: pos })}
            />
            <div className="border-t border-gray-200 pt-6 sm:pt-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">テキスト入力</h2>
              <XMLParser onParsed={(parsed) => handleUpdate(parsed)} />
              <Form state={state} onChange={handleUpdate} />
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 flex flex-col">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">プレビュー & ダウンロード</h2>
            <div className="flex-grow flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden relative shadow-inner p-4 min-h-[350px] sm:min-h-[450px]">
              <CanvasPreview state={state} onCharacterMove={(pos) => handleUpdate({ characterPos: pos })} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
