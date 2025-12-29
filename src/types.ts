
export enum FrameType {
  COORDINATION = 'Coordination', // Same as
  OPPOSITION = 'Opposition', // Opposite of
  DISTINCTION = 'Distinction', // Different from
  COMPARISON = 'Comparison', // More/Less than
  HIERARCHICAL = 'Hierarchical', // Type of / Contains
  TEMPORAL = 'Temporal', // Before / After
  SPATIAL = 'Spatial', // Above / Below / Inside
  CAUSAL = 'Causal', // If A then B
  DEICTIC = 'Deictic', // I-You / Here-There / Now-Then
  TRANSFORMATION = 'Transformation', // ToSF - Applying functions across networks
  MIXED = 'Mixed' // Multi-frame integration
}

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
