import React, { useEffect, useState, useRef } from 'react';
import type { AppState } from '../types';
import { generateImage } from '../canvas_utils';
import { Rnd } from 'react-rnd';

interface CanvasPreviewProps {
  state: AppState;
  onCharacterMove: (pos: { x: number; y: number; w: number }) => void;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ state, onCharacterMove }) => {
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Generate the background template + text image (without character)
  useEffect(() => {
    let isMounted = true;
    const updatePreview = async () => {
      // Temporarily remove character to generate background
      const stateWithoutChar = { ...state, characterUrl: null };
      const dataUrl = await generateImage(stateWithoutChar);
      if (isMounted) {
        setPreviewDataUrl(dataUrl);
      }
    };
    updatePreview();
    return () => { isMounted = false; };
  }, [state.title, state.sections, state.templateUrl]); // Don't depend on character to avoid infinite loop of re-renders

  // Update container size for RND bounds dynamically via ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width || container.clientWidth;
        const h = entry.contentRect.height || container.clientHeight;
        setContainerSize({ w, h });
      }
    });

    resizeObserver.observe(container);

    // Initial size
    setContainerSize({
      w: container.clientWidth || container.offsetWidth,
      h: container.clientHeight || container.offsetHeight,
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [previewDataUrl]);

  const handleDownload = async () => {
    const finalDataUrl = await generateImage(state);
    if (!finalDataUrl) {
      alert("画像を生成できませんでした。テンプレートがアップロードされているか確認してください。");
      return;
    }
    const link = document.createElement('a');
    link.href = finalDataUrl;
    link.download = state.title.trim() ? `${state.title.trim()}.png` : 'tips-image.png';
    link.click();
  };

  if (!state.templateUrl) {
    return <div className="text-gray-400 text-sm">テンプレート画像をアップロードしてください</div>;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        ref={containerRef}
        className="relative w-full max-w-[400px] shadow-lg border border-gray-300 bg-white"
        style={{ aspectRatio: '3/4' }} // Assuming standard template aspect ratio
      >
        {previewDataUrl ? (
          <img src={previewDataUrl} alt="Preview" className="w-full h-full object-contain pointer-events-none" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">Loading...</span>
          </div>
        )}

        {state.characterUrl && containerSize.w > 0 && (
          <Rnd
            bounds="parent"
            size={{
              width: state.characterPos.w * containerSize.w,
              height: 'auto',
            }}
            position={{ 
              x: state.characterPos.x * containerSize.w, 
              y: state.characterPos.y * containerSize.h 
            }}
            onDragStop={(_e, d) => {
              onCharacterMove({
                ...state.characterPos,
                x: d.x / containerSize.w,
                y: d.y / containerSize.h,
              });
            }}
            onResizeStop={(_e, _direction, ref, _delta, position) => {
              const newW = parseInt(ref.style.width, 10) / containerSize.w;
              onCharacterMove({
                x: position.x / containerSize.w,
                y: position.y / containerSize.h,
                w: newW,
              });
            }}
          >
            <div className="relative w-full h-full border-2 border-dashed border-pink-500/80 rounded group">
              <img 
                src={state.characterUrl} 
                alt="Character" 
                className="w-full h-auto drop-shadow-md cursor-move"
                draggable={false}
              />
              {/* Visual Corner Resize Handles */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-pink-600 border-2 border-white rounded-full pointer-events-none shadow-md" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-pink-600 border-2 border-white rounded-full pointer-events-none shadow-md" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-pink-600 border-2 border-white rounded-full pointer-events-none shadow-md" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-pink-600 border-2 border-white rounded-full pointer-events-none shadow-md" />
            </div>
          </Rnd>
        )}
      </div>

      <button
        onClick={handleDownload}
        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
      >
        画像をダウンロード
      </button>
    </div>
  );
};

export default CanvasPreview;
