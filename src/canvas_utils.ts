import type { AppState } from './types';

// Hardcoded layout percentages based on standard template
const LAYOUT = {
  // Keep right 20% blank by setting w = 0.70 (x=0.08 to 0.78)
  // Give title more vertical space and move it down slightly
  title: { x: 0.08, y: 0.05, w: 0.70, h: 0.12 },
  sections: [
    { x: 0.08, y: 0.195, w: 0.84, h: 0.17 }, // Section 1 (Shifted up by 1%)
    { x: 0.08, y: 0.395, w: 0.84, h: 0.17 }, // Section 2 (Shifted up by 1%)
    { x: 0.08, y: 0.59, w: 0.84, h: 0.17 }, // Section 3
    { x: 0.08, y: 0.79, w: 0.84, h: 0.17 }, // Section 4
  ],
};

const COLORS = [
  { main: '#A75D5D', sub: '#222222' }, // Muted Red
  { main: '#5A845A', sub: '#222222' }, // Muted Green
  { main: '#4A7694', sub: '#222222' }, // Muted Blue
  { main: '#8A5A8A', sub: '#222222' }, // Muted Purple
];

const TITLE_COLOR = '#5C4033'; // Dark Brown
const HIGHLIGHT_COLOR = 'rgba(247, 210, 183, 0.8)'; // Soft orange/peach

function getFitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  baseFontSize: number,
  fontFamily: string,
  fontWeight: string
): number {
  let fontSize = baseFontSize;
  while (fontSize > 4) {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    if (metrics.width <= maxWidth && fontSize <= maxHeight) {
      break;
    }
    fontSize -= 1;
  }
  return fontSize;
}

function drawTextWithAutoFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  baseFontSize: number,
  fontFamily: string,
  color: string,
  fontWeight: string = 'normal',
  align: CanvasTextAlign = 'left'
) {
  if (!text) return;
  
  const fontSize = getFitFontSize(ctx, text, maxWidth, maxHeight, baseFontSize, fontFamily, fontWeight);
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = align;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillText(text, x, y);
}

function drawTextWithAutoSplit(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  baseFontSize: number,
  minAcceptableSize: number,
  fontFamily: string,
  color: string,
  fontWeight: string = 'normal',
  align: CanvasTextAlign = 'left',
  highlightColor: string | null = null
) {
  if (!text) return;
  const idealFontSize = getFitFontSize(ctx, text, maxWidth, maxHeight, baseFontSize, fontFamily, fontWeight);
  
  const drawLine = (lineText: string, lx: number, ly: number, lfs: number) => {
    ctx.textBaseline = 'middle';
    ctx.textAlign = align;
    ctx.font = `${fontWeight} ${lfs}px ${fontFamily}`;
    
    // Draw Highlighter Underline
    if (highlightColor) {
      const metrics = ctx.measureText(lineText);
      let rectX = lx;
      if (align === 'center') rectX = lx - metrics.width / 2;
      else if (align === 'right') rectX = lx - metrics.width;
      
      ctx.fillStyle = highlightColor;
      // Draw a thick line covering the bottom half of the text
      ctx.fillRect(rectX, ly + lfs * 0.1, metrics.width, lfs * 0.4);
    }
    
    ctx.fillStyle = color;
    ctx.fillText(lineText, lx, ly);
  };
  
  if (idealFontSize < minAcceptableSize) {
    let splitIdx = -1;
    const punctMatch = text.match(/[,.！？」】、。]/g);
    if (punctMatch && punctMatch.length > 0) {
      let bestDist = 9999;
      for (let i = 0; i < text.length; i++) {
        if (/[,\.！？」】、。]/.test(text[i]) && i < text.length - 1) {
          let dist = Math.abs(i - text.length / 2);
          if (dist < bestDist) { bestDist = dist; splitIdx = i + 1; }
        }
      }
    }
    
    if (splitIdx === -1) {
      let bestDist = 9999;
      for (let i = 0; i < text.length; i++) {
        if (/\s/.test(text[i])) {
          let dist = Math.abs(i - text.length / 2);
          if (dist < bestDist) { bestDist = dist; splitIdx = i; }
        }
      }
    }
    
    if (splitIdx !== -1) {
      const line1 = text.substring(0, splitIdx).trim();
      const line2 = text.substring(splitIdx).trim();
      const fs1 = getFitFontSize(ctx, line1, maxWidth, maxHeight / 2, baseFontSize, fontFamily, fontWeight);
      const fs2 = getFitFontSize(ctx, line2, maxWidth, maxHeight / 2, baseFontSize, fontFamily, fontWeight);
      const fs = Math.min(fs1, fs2);
      
      drawLine(line1, x, y - maxHeight * 0.22, fs);
      drawLine(line2, x, y + maxHeight * 0.22, fs);
      return;
    }
  }
  
  drawLine(text, x, y, idealFontSize);
}

export async function generateImage(state: AppState): Promise<string | null> {
  if (!state.templateUrl) return null;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Load template
  const template = await loadImage(state.templateUrl);
  canvas.width = template.width;
  canvas.height = template.height;
  
  // Draw template
  ctx.drawImage(template, 0, 0);

  const fontFam = "'M PLUS Rounded 1c', sans-serif";

  // Draw Title (Left-aligned, split if too small)
  const titleBox = LAYOUT.title;
  const tx = titleBox.x * canvas.width; 
  const ty = titleBox.y * canvas.height + (titleBox.h * canvas.height) / 2; // Center Y
  const tw = titleBox.w * canvas.width;
  const th = titleBox.h * canvas.height;
  
  const titleBaseSize = canvas.height * 0.06; 
  const minTitleSize = canvas.height * 0.04; 
  
  drawTextWithAutoSplit(ctx, state.title, tx, ty, tw, th, titleBaseSize, minTitleSize, fontFam, TITLE_COLOR, '800', 'left', HIGHLIGHT_COLOR);

  // Draw Sections
  state.sections.forEach((sec, idx) => {
    const box = LAYOUT.sections[idx];
    const bx = box.x * canvas.width + canvas.width * 0.015; 
    const by = box.y * canvas.height + canvas.height * 0.01;
    const bw = box.w * canvas.width - canvas.width * 0.03;
    
    const availableHeight = box.h * canvas.height - canvas.height * 0.02;
    const h1 = availableHeight * 0.30; 
    const h2 = availableHeight * 0.25;
    const h3 = availableHeight * 0.20;
    const h4 = availableHeight * 0.25;
    
    // Row 1 (Muted color, bold, no stroke, clean)
    drawTextWithAutoFit(ctx, sec.row1, bx, by + h1 / 2, bw, h1 * 0.95, canvas.height * 0.045, fontFam, COLORS[idx].main, '700', 'left');
    // Row 2
    drawTextWithAutoFit(ctx, sec.row2, bx, by + h1 + h2 / 2, bw, h2 * 0.9, canvas.height * 0.032, fontFam, COLORS[idx].sub, '800', 'left');
    // Row 3
    drawTextWithAutoFit(ctx, sec.row3, bx, by + h1 + h2 + h3 / 2, bw, h3 * 0.9, canvas.height * 0.025, fontFam, COLORS[idx].sub, '600', 'left');
    // Row 4
    drawTextWithAutoFit(ctx, sec.row4, bx, by + h1 + h2 + h3 + h4 / 2, bw, h4 * 0.9, canvas.height * 0.025, fontFam, COLORS[idx].sub, '600', 'left');
  });

  // Draw Character if exists
  if (state.characterUrl) {
    const charImg = await loadImage(state.characterUrl);
    // We need to map them back to the original template size.
    const cx = state.characterPos.x * canvas.width;
    const cy = state.characterPos.y * canvas.height;
    
    // Character width is given as a fraction of the canvas width
    const cw = state.characterPos.w * canvas.width;
    
    // Preserve aspect ratio
    const aspect = charImg.height / charImg.width;
    const ch = cw * aspect;
    
    ctx.drawImage(charImg, cx, cy, cw, ch);
  }

  // Draw watermark "@farron_us" at bottom right (extreme edge)
  ctx.fillStyle = 'rgba(92, 64, 51, 0.55)';
  ctx.font = `600 ${canvas.height * 0.012}px ${fontFam}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('@farron_us', canvas.width * 0.992, canvas.height * 0.995);

  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
