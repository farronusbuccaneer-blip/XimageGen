import React, { useState } from 'react';
import type { AppState } from '../types';
import { defaultState } from '../types';

interface XMLParserProps {
  onParsed: (parsed: Partial<AppState>) => void;
}

const XMLParser: React.FC<XMLParserProps> = ({ onParsed }) => {
  const [input, setInput] = useState('');

  const handleParse = () => {
    try {
      // Very basic XML-like string parsing using DOMParser
      const parser = new DOMParser();
      // Wrap input in a root element to ensure valid XML for the parser
      const xmlDoc = parser.parseFromString(`<root>${input}</root>`, "text/xml");

      const parsedState: Partial<AppState> = {
        title: xmlDoc.querySelector('title')?.textContent || '',
        sections: [...defaultState.sections]
      };

      for (let i = 1; i <= 4; i++) {
        const sectionNode = xmlDoc.querySelector(`section${i}`);
        if (sectionNode) {
          parsedState.sections![i - 1] = {
            row1: sectionNode.querySelector('row1')?.textContent || '',
            row2: sectionNode.querySelector('row2')?.textContent || '',
            row3: sectionNode.querySelector('row3')?.textContent || '',
            row4: sectionNode.querySelector('row4')?.textContent || '',
          };
        }
      }

      onParsed(parsedState);
      setInput(''); // Clear after successful parse
    } catch (e) {
      alert("XMLのパースに失敗しました。正しい形式で入力してください。");
    }
  };

  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">一括入力 (XML形式)</label>
      <textarea
        className="w-full h-32 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
        placeholder={`<title>タイトル</title>\n<section1>\n  <row1>テキスト1</row1>\n  ...\n</section1>`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="mt-3 flex gap-3">
        <button
          onClick={handleParse}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow transition-colors font-medium text-sm cursor-pointer"
        >
          テキストを反映する
        </button>
        <button
          onClick={() => setInput('')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm cursor-pointer"
        >
          クリア
        </button>
      </div>
    </div>
  );
};

export default XMLParser;
