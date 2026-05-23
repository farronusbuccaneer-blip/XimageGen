import React, { useEffect, useState } from 'react';
import { 
  saveTemplate, 
  getTemplates, 
  deleteTemplate, 
  saveCharacter, 
  getCharacters, 
  deleteCharacter, 
} from '../db';
import type { SavedImage } from '../db';

interface UploaderProps {
  templateUrl: string | null;
  characterUrl: string | null;
  characterPos: { x: number; y: number; w: number };
  onTemplateUpload: (url: string | null) => void;
  onCharacterUpload: (url: string | null) => void;
  onCharacterMove: (pos: { x: number; y: number; w: number }) => void;
}

const Uploader: React.FC<UploaderProps> = ({ 
  templateUrl, 
  characterUrl, 
  characterPos,
  onTemplateUpload, 
  onCharacterUpload,
  onCharacterMove
}) => {
  const [templates, setTemplates] = useState<SavedImage[]>([]);
  const [characters, setCharacters] = useState<SavedImage[]>([]);

  const loadSavedImages = async () => {
    try {
      const temps = await getTemplates();
      const chars = await getCharacters();
      setTemplates(temps);
      setCharacters(chars);
    } catch (e) {
      console.error('Failed to load saved images from IndexedDB', e);
    }
  };

  useEffect(() => {
    loadSavedImages();
  }, []);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    saveFn: (name: string, dataUrl: string) => Promise<SavedImage>,
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          try {
            await saveFn(file.name, dataUrl);
            callback(dataUrl);
            await loadSavedImages();
          } catch (err) {
            console.error('Failed to save image to IndexedDB', err);
            callback(dataUrl);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string, dataUrl: string) => {
    e.stopPropagation();
    if (window.confirm('このテンプレート画像を削除しますか？')) {
      try {
        await deleteTemplate(id);
        if (templateUrl === dataUrl) {
          onTemplateUpload(null);
        }
        await loadSavedImages();
      } catch (err) {
        console.error('Failed to delete template', err);
      }
    }
  };

  const handleDeleteCharacter = async (e: React.MouseEvent, id: string, dataUrl: string) => {
    e.stopPropagation();
    if (window.confirm('このキャラクター画像を削除しますか？')) {
      try {
        await deleteCharacter(id);
        if (characterUrl === dataUrl) {
          onCharacterUpload(null);
        }
        await loadSavedImages();
      } catch (err) {
        console.error('Failed to delete character', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Template Upload Section (Direct Layout) */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm text-center">
        <h3 className="text-blue-700 font-bold mb-3 text-sm sm:text-base text-left flex items-center gap-2">
          <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
          テンプレート画像の選択
        </h3>

        {/* Upload Button Area */}
        <label className="cursor-pointer block py-4 px-2 hover:bg-blue-100/50 rounded-lg border border-dashed border-blue-300 transition-colors bg-white/50 mb-4">
          <span className="text-blue-600 font-bold text-xs sm:text-sm block mb-1">新規画像ファイルをアップロード</span>
          <span className="text-[10px] sm:text-xs text-blue-400 block mb-3">JPEG/PNG形式 (必須)</span>
          <input 
            type="file" 
            accept="image/png, image/jpeg" 
            className="hidden" 
            onChange={(e) => handleFile(e, saveTemplate, onTemplateUpload)} 
          />
          <div className="bg-white text-blue-600 px-4 py-1.5 rounded shadow-sm inline-block text-xs font-semibold hover:shadow transition-shadow border border-blue-100">
            ファイルを選択
          </div>
        </label>

        {/* Direct Saved Grid (Always visible below if images exist) */}
        {templates.length > 0 && (
          <div className="text-left border-t border-blue-200/60 pt-3">
            <span className="text-xs font-bold text-blue-800 block mb-2">保存済みのテンプレートから選択:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {templates.map((item) => {
                const isSelected = templateUrl === item.dataUrl;
                return (
                  <div 
                    key={item.id}
                    onClick={() => onTemplateUpload(item.dataUrl)}
                    className={`relative group flex-shrink-0 cursor-pointer rounded-md overflow-hidden border transition-all ${
                      isSelected 
                        ? 'border-blue-600 ring-2 ring-blue-100 scale-95 shadow-sm' 
                        : 'border-gray-200 hover:border-blue-400 hover:scale-105'
                    }`}
                    style={{ width: '48px', height: '64px' }}
                    title={item.name}
                  >
                    <img 
                      src={item.dataUrl} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center pointer-events-none">
                        <div className="bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteTemplate(e, item.id, item.dataUrl)}
                      className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      aria-label="Delete"
                    >
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Character Upload Section (Direct Layout) */}
      <div className="bg-pink-50 border border-pink-200 rounded-xl p-5 shadow-sm text-center">
        <h3 className="text-pink-700 font-bold mb-3 text-sm sm:text-base text-left flex items-center gap-2">
          <span className="bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
          キャラクター画像の選択
        </h3>

        {/* Upload Button Area */}
        <label className="cursor-pointer block py-4 px-2 hover:bg-pink-100/50 rounded-lg border border-dashed border-pink-300 transition-colors bg-white/50 mb-4">
          <span className="text-pink-600 font-bold text-xs sm:text-sm block mb-1">新規画像ファイルをアップロード</span>
          <span className="text-[10px] sm:text-xs text-pink-400 block mb-3">背景透過PNG形式 (任意)</span>
          <input 
            type="file" 
            accept="image/png" 
            className="hidden" 
            onChange={(e) => handleFile(e, saveCharacter, onCharacterUpload)} 
          />
          <div className="bg-white text-pink-600 px-4 py-1.5 rounded shadow-sm inline-block text-xs font-semibold hover:shadow transition-shadow border border-pink-100">
            ファイルを選択
          </div>
        </label>

        {/* Direct Saved Grid (Always visible below if images exist) */}
        {characters.length > 0 && (
          <div className="text-left border-t border-pink-200/60 pt-3">
            <span className="text-xs font-bold text-pink-800 block mb-2">保存済みのキャラクターから選択:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {characters.map((item) => {
                const isSelected = characterUrl === item.dataUrl;
                return (
                    <div 
                      key={item.id}
                      onClick={() => onCharacterUpload(item.dataUrl)}
                      className={`relative group flex-shrink-0 cursor-pointer rounded-md overflow-hidden border transition-all ${
                        isSelected 
                          ? 'border-pink-600 ring-2 ring-pink-100 scale-95 shadow-sm' 
                          : 'border-gray-200 hover:border-pink-400 hover:scale-105'
                      }`}
                      style={{ width: '48px', height: '64px' }}
                      title={item.name}
                    >
                      <img 
                        src={item.dataUrl} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    {isSelected && (
                      <div className="absolute inset-0 bg-pink-600/10 flex items-center justify-center pointer-events-none">
                        <div className="bg-pink-600 text-white rounded-full p-0.5 shadow-sm">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteCharacter(e, item.id, item.dataUrl)}
                      className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      aria-label="Delete"
                    >
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Character Size Range Slider Panel */}
        {characterUrl && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-pink-100 text-left shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs sm:text-sm font-bold text-pink-700">キャラクターの大きさ調整</label>
              <span className="text-xs font-semibold bg-pink-100 text-pink-700 py-0.5 px-2 rounded-full">
                {Math.round(characterPos.w * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="5" 
                max="80" 
                value={Math.round(characterPos.w * 100)} 
                onChange={(e) => onCharacterMove({ ...characterPos, w: parseInt(e.target.value, 10) / 100 })}
                className="flex-grow h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-600 focus:outline-none"
              />
              <button 
                type="button" 
                onClick={() => onCharacterMove({ ...characterPos, w: 0.2 })}
                className="text-xs text-pink-600 bg-white border border-pink-200 hover:bg-pink-50 py-1 px-2.5 rounded shadow-sm transition-colors cursor-pointer font-medium"
              >
                リセット
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Uploader;
