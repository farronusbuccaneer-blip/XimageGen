export type SectionData = {
  row1: string;
  row2: string;
  row3: string;
  row4: string;
};

export type AppState = {
  title: string;
  sections: SectionData[]; // Length 4
  templateUrl: string | null;
  characterUrl: string | null;
  characterPos: { x: number; y: number; w: number };
};

export const defaultState: AppState = {
  title: '',
  sections: Array.from({ length: 4 }, () => ({ row1: '', row2: '', row3: '', row4: '' })),
  templateUrl: null,
  characterUrl: null,
  characterPos: { x: 0.5, y: 0.5, w: 0.2 },
};
