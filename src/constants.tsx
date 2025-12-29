
import React from 'react';
import { 
  Link, 
  ArrowLeftRight, 
  IterationCcw, 
  BarChart, 
  Layers, 
  Clock, 
  Maximize, 
  Zap, 
  UserCircle,
  Shapes,
  FlaskConical
} from 'lucide-react';
import { FrameType } from './types';

export const FRAME_ICONS: Record<FrameType, React.ReactNode> = {
  [FrameType.COORDINATION]: <Link size={20} />,
  [FrameType.OPPOSITION]: <ArrowLeftRight size={20} />,
  [FrameType.DISTINCTION]: <IterationCcw size={20} />,
  [FrameType.COMPARISON]: <BarChart size={20} />,
  [FrameType.HIERARCHICAL]: <Layers size={20} />,
  [FrameType.TEMPORAL]: <Clock size={20} />,
  [FrameType.SPATIAL]: <Maximize size={20} />,
  [FrameType.CAUSAL]: <Zap size={20} />,
  [FrameType.DEICTIC]: <UserCircle size={20} />,
  [FrameType.TRANSFORMATION]: <FlaskConical size={20} />,
  [FrameType.MIXED]: <Shapes size={20} />,
};

export const SYMBOLS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
export const OBJECTS = ['Sphere', 'Cube', 'Pyramid', 'Torus', 'Prism', 'Cylinder'];
export const COLORS = ['Azure', 'Crimson', 'Emerald', 'Gold', 'Indigo', 'Violet'];
