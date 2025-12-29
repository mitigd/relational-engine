
import { FrameType, type Challenge } from '../types';

const NONSENSE_WORDS = [
  'Greeble', 'Zorp', 'Kree', 'Plon', 'Vesh', 'Trum', 'Yox', 'Skrit', 'Wox', 'Jiv', 
  'Blorp', 'Dax', 'Flim', 'Glarb', 'Hox', 'Ibt', 'Krel', 'Lom', 'Mub', 'Nif',
  'Quark', 'Vem', 'Jex', 'Trog', 'Splet', 'Fyke', 'Grom', 'Haze', 'Kip', 'Lurk'
];

const FUNCTIONS = [
  { attr: 'Luminous', opp: 'Shadowy' },
  { attr: 'Painful', opp: 'Pleasant' },
  { attr: 'Heavy', opp: 'Weightless' },
  { attr: 'Quicker', opp: 'Slower' },
  { attr: 'Freezing', opp: 'Scorching' }
];

export const ARBITRARY_CUES: Record<string, string> = {
  'Same As': 'RFGP',
  'Opposite': 'ZIB',
  'Greater': 'QUX',
  'Lesser': 'PLIM',
  'Contains': 'WUG',
  'Before': 'SKRIT',
  'After': 'VOK',
  'Perspective': 'TEN' 
};

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const solveComparison = (nodes: string[], premises: {s: string, t: string, type: 'Greater'|'Lesser'}[]) => {
  const score: Record<string, number> = {};
  nodes.forEach(n => score[n] = 0);
  for (let i = 0; i < nodes.length * 2; i++) {
    premises.forEach(p => {
      if (p.type === 'Greater') {
        if (score[p.s] <= score[p.t]) score[p.s] = score[p.t] + 1;
      } else {
        if (score[p.t] <= score[p.s]) score[p.t] = score[p.s] + 1;
      }
    });
  }
  return score;
};

export const generateChallenge = (frame: FrameType, difficulty: number, useNaturalLanguage: boolean = false): Challenge => {
  const id = Math.random().toString(36).substr(2, 9);
  const words = shuffle(NONSENSE_WORDS);
  const getCue = (name: string) => useNaturalLanguage ? name.toUpperCase() : ARBITRARY_CUES[name];

  let premises: string[] = [];
  let question = "";
  let options: string[] = [];
  let correctAnswer = "";
  let explanation = "";

  const injectNoise = (base: string[], pool: string[]) => {
    if (difficulty < 60) return base;
    const noiseNodes = shuffle(pool).slice(0, 2);
    const noisePremise = `${noiseNodes[0]} ${getCue('Same As')} ${noiseNodes[1]}`;
    return [...base, noisePremise];
  };

  const finalize = (raw: string[]) => shuffle(raw);

  switch (frame) {
    case FrameType.COMPARISON: {
      const nodeCount = Math.min(3 + Math.floor(difficulty / 20), 6);
      const activeNodes = words.slice(0, nodeCount);
      const rawPremises: {s: string, t: string, type: 'Greater' | 'Lesser'}[] = [];
      const indices = Array.from({length: nodeCount - 1}, (_, i) => i);
      const shuffledIndices = shuffle(indices);
      
      shuffledIndices.forEach(i => {
        const type = Math.random() > 0.5 ? 'Greater' : 'Lesser';
        rawPremises.push({ s: activeNodes[i], t: activeNodes[i+1], type });
      });

      const basePremises = rawPremises.map(p => `${p.s} ${getCue(p.type)} ${p.t}`);
      premises = finalize(injectNoise(basePremises, words.slice(nodeCount, nodeCount + 5)));
      
      const scores = solveComparison(activeNodes, rawPremises);
      const wantMax = Math.random() > 0.5;
      let sorted = [...activeNodes].sort((a, b) => scores[b] - scores[a]);
      correctAnswer = wantMax ? sorted[0] : sorted[sorted.length - 1];
      
      if (useNaturalLanguage) {
        question = wantMax ? `WHICH IS THE GREATEST?` : `WHICH IS THE SMALLEST?`;
      } else {
        question = wantMax ? `TARGET: MAXIMUM NODE` : `TARGET: MINIMUM NODE`;
      }

      options = shuffle(activeNodes.slice(0, 4));
      if (!options.includes(correctAnswer)) options[0] = correctAnswer;
      options = shuffle(options);
      explanation = `Relational Complexity: Fragmented comparison links require you to build a mental hierarchy.`;
      break;
    }

    case FrameType.TEMPORAL: {
      const nodeCount = Math.min(3 + Math.floor(difficulty / 20), 6);
      const activeNodes = words.slice(0, nodeCount);
      const rawPremises: {s: string, t: string, type: 'Before' | 'After'}[] = [];
      
      for (let i = 0; i < nodeCount - 1; i++) {
        const type = Math.random() > 0.5 ? 'Before' : 'After';
        rawPremises.push({ s: activeNodes[i], t: activeNodes[i+1], type });
      }

      const basePremises = rawPremises.map(p => `${p.s} ${getCue(p.type)} ${p.t}`);
      premises = finalize(injectNoise(basePremises, words.slice(nodeCount, nodeCount + 3)));
      
      const wantEarliest = Math.random() > 0.5;
      correctAnswer = wantEarliest ? activeNodes[0] : activeNodes[nodeCount - 1];
      question = useNaturalLanguage 
        ? (wantEarliest ? `WHICH HAPPENS FIRST?` : `WHICH HAPPENS LAST?`)
        : (wantEarliest ? `TARGET: TEMPORAL START` : `TARGET: TEMPORAL END`);

      options = shuffle(activeNodes.slice(0, 4));
      if (!options.includes(correctAnswer)) options[0] = correctAnswer;
      options = shuffle(options);
      explanation = `Temporal Sequencing: Sequential event links require building a chronological timeline.`;
      break;
    }

    case FrameType.SPATIAL: {
      const nodeCount = Math.min(3 + Math.floor(difficulty / 25), 5);
      const activeNodes = words.slice(0, nodeCount);
      const rawPremises: {s: string, t: string, type: 'Greater' | 'Lesser'}[] = []; // Reusing Greater/Lesser logic for Above/Below
      
      for (let i = 0; i < nodeCount - 1; i++) {
        rawPremises.push({ s: activeNodes[i], t: activeNodes[i+1], type: 'Greater' });
      }

      premises = finalize(rawPremises.map(p => `${p.s} ${getCue('Greater')} ${p.t}`));
      
      const targetIdx = Math.floor(Math.random() * nodeCount);
      correctAnswer = activeNodes[targetIdx];
      
      const queryIdx = (targetIdx + (Math.random() > 0.5 ? 1 : -1) + nodeCount) % nodeCount;
      const rel = targetIdx < queryIdx ? 'Greater' : 'Lesser';
      
      question = `${activeNodes[targetIdx]} ${getCue(rel)} ${activeNodes[queryIdx]}?`;
      correctAnswer = "Yes";
      options = ["Yes", "No", "Undetermined"];
      explanation = `Spatial Orientation: Positional relations define a coordinate-based network.`;
      break;
    }

    case FrameType.DEICTIC: {
      const locs = shuffle(["Ziggurat", "Nexus", "Void", "Chamber", "Aegis", "Spire"]);
      const useDoubleShift = difficulty > 45;
      
      if (useDoubleShift) {
        premises = finalize(injectNoise([
          `I at ${locs[0]} (NOW)`,
          `You at ${locs[1]} (NOW)`,
          `I at ${locs[2]} (THEN)`,
          `You at ${locs[3]} (THEN)`,
          `CONTEXT ${getCue('Perspective')} You`,
          `TEMPORAL ${getCue('Perspective')} THEN`
        ], words.slice(10, 15)));
        correctAnswer = locs[3];
        question = useNaturalLanguage ? `WHERE IS I NOW?` : `DERIVED LOCUS of I?`;
        explanation = `Double Deictic Shift: Simultaneous rotation of personal and temporal coordinates.`;
      } else {
        premises = finalize([
          `I at ${locs[0]}`,
          `You at ${locs[1]}`,
          `CONTEXT ${getCue('Perspective')} You`
        ]);
        correctAnswer = locs[1];
        question = useNaturalLanguage ? `WHERE IS I?` : `DERIVED LOCUS of I?`;
        explanation = `Core Perspective Take: Respond from the relational orientation defined by the PERSPECTIVE cue.`;
      }
      options = shuffle(locs.slice(0, 4));
      if (!options.includes(correctAnswer)) options[0] = correctAnswer;
      options = shuffle(options);
      break;
    }

    case FrameType.OPPOSITION: {
      const nodeCount = Math.min(3 + Math.floor(difficulty / 25), 5);
      const activeNodes = words.slice(0, nodeCount);
      const p: string[] = [];
      for (let i = 0; i < activeNodes.length - 1; i++) {
        p.push(`${activeNodes[i]} ${getCue('Opposite')} ${activeNodes[i+1]}`);
      }
      premises = finalize(injectNoise(p, words.slice(nodeCount, nodeCount + 3)));
      const isEvenSteps = (activeNodes.length - 1) % 2 === 0;
      question = `${activeNodes[0]} ? ${activeNodes[activeNodes.length - 1]}`;
      correctAnswer = isEvenSteps ? getCue('Same As') : getCue('Opposite');
      options = [getCue('Same As'), getCue('Opposite'), getCue('Greater'), getCue('Lesser')];
      explanation = `Reciprocal Opposition: Multi-stage inversion across the chain.`;
      break;
    }

    case FrameType.TRANSFORMATION: {
      const func = FUNCTIONS[Math.floor(Math.random() * FUNCTIONS.length)];
      const nodeA = words[0];
      const nodeB = words[1];
      const relType = Math.random() > 0.5 ? 'Same As' : 'Opposite';
      
      premises = finalize([
        `${nodeA} functionalizes ${func.attr}`,
        `${nodeA} ${getCue(relType)} ${nodeB}`
      ]);
      question = useNaturalLanguage ? `WHAT IS THE QUALITY OF ${nodeB}?` : `DERIVED VALUE of ${nodeB}?`;
      correctAnswer = relType === 'Same As' ? func.attr : func.opp;
      options = shuffle([func.attr, func.opp, 'Neutral', 'None']);
      explanation = `ToSF: Psychological functions are transformed through established relational networks.`;
      break;
    }

    case FrameType.CAUSAL: {
      const nodeA = words[0];
      const nodeB = words[1];
      const nodeC = words[2];
      const isDirect = difficulty < 40;
      
      if (isDirect) {
        premises = finalize([`If ${nodeA}, then ${nodeB}`]);
        question = `State of ${nodeB} given ${nodeA}?`;
        correctAnswer = "Present";
        options = ["Present", "Absent", "Undetermined"];
      } else {
        premises = finalize([
          `If ${nodeA}, then ${nodeB}`,
          `If ${nodeB}, then ${nodeC}`
        ]);
        question = `Given ${nodeA}, is ${nodeC} derived?`;
        correctAnswer = "Yes";
        options = ["Yes", "No", "Undetermined"];
      }
      explanation = `Causal Contingency: Conditional 'if-then' relations create predictive behavioral networks.`;
      break;
    }

    case FrameType.HIERARCHICAL: {
      const nodeA = words[0];
      const nodeB = words[1];
      const nodeC = words[2];
      premises = finalize(injectNoise([
        `${nodeA} ${getCue('Contains')} ${nodeB}`,
        `${nodeB} ${getCue('Contains')} ${nodeC}`
      ], words.slice(3, 6)));
      const checkDown = Math.random() > 0.5;
      question = checkDown ? `${nodeA} ${getCue('Contains')} ${nodeC}?` : `${nodeC} member of ${nodeA}?`;
      correctAnswer = "Yes";
      options = ["Yes", "No", "Undetermined"];
      explanation = `Hierarchical Transitivity: Containment is transitive downwards.`;
      break;
    }

    case FrameType.MIXED: {
      const n = words.slice(0, 4);
      premises = finalize([
        `${n[0]} ${getCue('Same As')} ${n[1]}`,
        `${n[1]} ${getCue('Opposite')} ${n[2]}`,
        `${n[2]} ${getCue('Greater')} ${n[3]}`
      ]);
      question = `${n[0]} ? ${n[2]}`;
      correctAnswer = getCue('Opposite');
      options = shuffle([getCue('Same As'), getCue('Opposite'), getCue('Greater'), getCue('Lesser')]);
      explanation = `Cross-Frame Synthesis: Integrating disparate relational types.`;
      break;
    }

    default: {
      premises = [`${words[0]} ${getCue('Same As')} ${words[1]}`];
      question = `${words[0]} ? ${words[1]}`;
      correctAnswer = getCue('Same As');
      options = [getCue('Same As'), getCue('Opposite')];
      explanation = "Baseline Coordination.";
    }
  }

  return { id, frame, premises, question, options, correctAnswer, difficulty, explanation };
};
