
export const FrameType = {
  COORDINATION: 'Coordination',
  OPPOSITION: 'Opposition',
  DISTINCTION: 'Distinction',
  COMPARISON: 'Comparison',
  HIERARCHICAL: 'Hierarchical',
  TEMPORAL: 'Temporal',
  SPATIAL: 'Spatial',
  CAUSAL: 'Causal',
  DEICTIC: 'Deictic',
  TRANSFORMATION: 'Transformation',
  MIXED: 'Mixed'
} as const;

export type FrameType = (typeof FrameType)[keyof typeof FrameType];

export interface Node {
  id: string;
  label: string;
  type: 'abstract' | 'spatial' | 'person' | 'time' | 'value';
}

export interface Relation {
  sourceId: string;
  targetId: string;
  type: string;
  frame: FrameType;
}

export interface Challenge {
  id: string;
  frame: FrameType;
  premises: string[];
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
  explanation: string;
}

export interface UserStats {
  scores: Record<FrameType, number>;
  history: {
    frame: FrameType;
    success: boolean;
    timestamp: number;
    isPractice?: boolean;
  }[];
  settings: {
    timerEnabled: boolean;
    timerDuration: number;
    practiceMode: boolean;
    useNaturalLanguage: boolean;
  };
}
