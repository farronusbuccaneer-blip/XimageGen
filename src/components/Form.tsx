import React from 'react';
import type { AppState } from '../types';

interface FormProps {
  state: AppState;
  onChange: (updates: Partial<AppState>) => void;
}

const Form: React.FC<FormProps> = ({ state, onChange }) => {
  const updateSection = (index: number, field: string, value: string) => {
    const newSections = [...state.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    onChange({ sections: newSections });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1">タイトル</label>
        <input
          type="text"
          className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      {state.sections.map((section, idx) => (
        <div key={idx} className="bg-white p-4 rounded shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">セクション {idx + 1}</h3>
          <div className="space-y-3">
            {(['row1', 'row2', 'row3', 'row4'] as const).map((row, rowIdx) => (
              <div key={row}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">行 {rowIdx + 1}</label>
                <input
                  type="text"
                  className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
                  value={section[row]}
                  onChange={(e) => updateSection(idx, row, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Form;
