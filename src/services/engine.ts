
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
  'Perspective': 'TEN',
  'North': 'NORT',
  'South': 'SUD',
  'East': 'EST',
  'West': 'WES',
  'Up': 'SUP',
  'Down': 'INF',
  'Left': 'SIN',
  'Right': 'DEX',
  'Front': 'ANT',
  'Back': 'POS',
  'Same Location': 'LOC'
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
    case FrameType.COORDINATION: {
      const nodeCount = Math.min(3 + Math.floor(difficulty / 20), 6);
      const activeNodes = words.slice(0, nodeCount);
      const rawPremises: string[] = [];
      
      // Generate a chain: A=B=C=D...
      for (let i = 0; i < nodeCount - 1; i++) {
        rawPremises.push(`${activeNodes[i]} ${getCue('Same As')} ${activeNodes[i+1]}`);
      }
      
      premises = finalize(injectNoise(rawPremises, words.slice(nodeCount, nodeCount + 3)));
      
      // Question: Relate first and last
      const targetA = activeNodes[0];
      const targetB = activeNodes[nodeCount - 1];
      
      question = useNaturalLanguage
        ? `IS ${targetA} THE SAME AS ${targetB}?`
        : `${targetA} ${getCue('Same As')} ${targetB}?`;
        
      correctAnswer = "Yes";
      options = ["Yes", "No", "Undetermined"];
      explanation = `Coordination: Identity relations are transitive (A=B=C implies A=C).`;
      break;
    }

    case FrameType.DISTINCTION: {
      const nodeCount = Math.min(3 + Math.floor(difficulty / 20), 5);
      const activeNodes = words.slice(0, nodeCount);
      const rawPremises: string[] = [];
      
      const split = Math.floor(nodeCount / 2);
      
      // Group 1
      for (let i = 0; i < split; i++) {
         rawPremises.push(`${activeNodes[i]} ${getCue('Same As')} ${activeNodes[i+1]}`);
      }
      // Link Group 1 to Group 2 via Difference
      rawPremises.push(`${activeNodes[split]} ${getCue('Different')} ${activeNodes[split+1]}`);
      // Group 2
      for (let i = split + 1; i < nodeCount - 1; i++) {
         rawPremises.push(`${activeNodes[i]} ${getCue('Same As')} ${activeNodes[i+1]}`);
      }

      premises = finalize(injectNoise(rawPremises, words.slice(nodeCount, nodeCount + 3)));
      
      // Pick two nodes.
      const idxA = Math.floor(Math.random() * nodeCount);
      let idxB = Math.floor(Math.random() * nodeCount);
      while (idxA === idxB) idxB = Math.floor(Math.random() * nodeCount);
      
      const nodeA = activeNodes[idxA];
      const nodeB = activeNodes[idxB];
      
      // Determine logical relation
      const groupA = idxA <= split ? 1 : 2;
      const groupB = idxB <= split ? 1 : 2;
      
      const areSame = groupA === groupB;
      
      question = useNaturalLanguage
        ? `IS ${nodeA} DIFFERENT FROM ${nodeB}?`
        : `${nodeA} ${getCue('Different')} ${nodeB}?`;
        
      correctAnswer = areSame ? "No" : "Yes";
      options = ["Yes", "No", "Undetermined"];
      explanation = `Distinction: 'Different' relations separate identity groups (Discrimination).`;
      break;
    }

    case FrameType.COMPARISON: {
      const nodeCount = Math.min(3 + Math.floor(difficulty / 20), 6);
      const activeNodes = words.slice(0, nodeCount); // Truth: [0] > [1] > [2] ...
      const wantMax = Math.random() > 0.5;
      let rawPremises: {s: string, t: string, type: 'Greater' | 'Lesser'}[] = [];
      let finalScores: Record<string, number> = {};

      let attempts = 0;
      while (attempts < 20) {
        rawPremises = [];
        const premiseCount = nodeCount; 
        for (let k = 0; k < premiseCount; k++) {
          let i = Math.floor(Math.random() * nodeCount);
          let j = Math.floor(Math.random() * nodeCount);
          while (i === j) j = Math.floor(Math.random() * nodeCount);
          if (i > j) [i, j] = [j, i]; // Ensure i < j (i is Greater)
          
          if (Math.random() > 0.5) {
            rawPremises.push({ s: activeNodes[i], t: activeNodes[j], type: 'Greater' });
          } else {
            rawPremises.push({ s: activeNodes[j], t: activeNodes[i], type: 'Lesser' });
          }
        }
        
        finalScores = solveComparison(activeNodes, rawPremises);
        const vals = Object.values(finalScores);
        const targetVal = wantMax ? Math.max(...vals) : Math.min(...vals);
        const candidates = activeNodes.filter(n => finalScores[n] === targetVal);
        
        if (candidates.length === 1) {
          correctAnswer = candidates[0];
          break;
        }
        attempts++;
      }

      const basePremises = rawPremises.map(p => `${p.s} ${getCue(p.type)} ${p.t}`);
      premises = finalize(injectNoise(basePremises, words.slice(nodeCount, nodeCount + 3)));
      
      if (useNaturalLanguage) {
        question = wantMax ? `WHICH IS THE GREATEST?` : `WHICH IS THE SMALLEST?`;
      } else {
        question = wantMax ? `TARGET: MAXIMUM NODE` : `TARGET: MINIMUM NODE`;
      }

      options = shuffle(activeNodes.slice(0, 4));
      if (!options.includes(correctAnswer)) options[Math.floor(Math.random() * options.length)] = correctAnswer;
      options = shuffle(options);
      explanation = `Relational Complexity: Scrambled branching requires you to integrate disparate links into a single hierarchy.`;
      break;
    }

    case FrameType.TEMPORAL: {
      const nodeCount = Math.min(3 + Math.floor(difficulty / 20), 6);
      const activeNodes = words.slice(0, nodeCount); // Truth: [0] precedes [1] precedes [2] ...
      const wantEarliest = Math.random() > 0.5;
      let rawPremises: {s: string, t: string, type: 'Before' | 'After'}[] = [];
      
      let attempts = 0;
      while (attempts < 20) {
        rawPremises = [];
        const premiseCount = nodeCount;
        for (let k = 0; k < premiseCount; k++) {
          let i = Math.floor(Math.random() * nodeCount);
          let j = Math.floor(Math.random() * nodeCount);
          while (i === j) j = Math.floor(Math.random() * nodeCount);
          if (i > j) [i, j] = [j, i]; // i is earlier than j
          
          if (Math.random() > 0.5) {
            rawPremises.push({ s: activeNodes[i], t: activeNodes[j], type: 'Before' });
          } else {
            rawPremises.push({ s: activeNodes[j], t: activeNodes[i], type: 'After' });
          }
        }

        // Reuse the Comparison solver by mapping Before -> Greater (internal logic)
        const mockPremises = rawPremises.map(p => ({
          s: p.type === 'Before' ? p.s : p.t,
          t: p.type === 'Before' ? p.t : p.s,
          type: 'Greater' as const
        }));
        
        const scores = solveComparison(activeNodes, mockPremises);
        const vals = Object.values(scores);
        // "Greater" here means earlier in sequence ground truth [0] > [1]
        const targetVal = wantEarliest ? Math.max(...vals) : Math.min(...vals);
        const candidates = activeNodes.filter(n => scores[n] === targetVal);

        if (candidates.length === 1) {
          correctAnswer = candidates[0];
          break;
        }
        attempts++;
      }

      const basePremises = rawPremises.map(p => `${p.s} ${getCue(p.type)} ${p.t}`);
      premises = finalize(injectNoise(basePremises, words.slice(nodeCount, nodeCount + 3)));
      
      question = useNaturalLanguage 
        ? (wantEarliest ? `WHICH HAPPENS FIRST?` : `WHICH HAPPENS LAST?`)
        : (wantEarliest ? `TARGET: TEMPORAL START` : `TARGET: TEMPORAL END`);

      options = shuffle(activeNodes.slice(0, 4));
      if (!options.includes(correctAnswer)) options[Math.floor(Math.random() * options.length)] = correctAnswer;
      options = shuffle(options);
      explanation = `Temporal Sequencing: Sequential event links require building a chronological timeline.`;
      break;
    }

    case FrameType.SPATIAL: {
      const nodeCount = Math.min(3 + Math.floor(difficulty / 20), 6);
      const activeNodes = words.slice(0, nodeCount);
      const is3D = difficulty > 60; // Enable 3D (Up/Down) at higher difficulties
      
      // 1. Generate Map (Coordinate System)
      const coords: Record<string, {x: number, y: number, z: number}> = {};
      const occupied = new Set<string>();
      
      // Place first node at origin
      coords[activeNodes[0]] = {x: 0, y: 0, z: 0};
      occupied.add("0,0,0");
      
      const directions = [
        {name: 'North', dx: 0, dy: 1, dz: 0},
        {name: 'South', dx: 0, dy: -1, dz: 0},
        {name: 'East', dx: 1, dy: 0, dz: 0},
        {name: 'West', dx: -1, dy: 0, dz: 0}
      ];
      if (is3D) {
        directions.push({name: 'Up', dx: 0, dy: 0, dz: 1});
        directions.push({name: 'Down', dx: 0, dy: 0, dz: -1});
      }

      const rawPremises: string[] = [];
      const edges: {s: string, t: string, dir: string}[] = [];

      // Grow the map
      for (let i = 1; i < nodeCount; i++) {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 50) {
           const anchorIdx = Math.floor(Math.random() * i);
           const anchorNode = activeNodes[anchorIdx];
           const anchorPos = coords[anchorNode];
           const dir = directions[Math.floor(Math.random() * directions.length)];
           
           const newX = anchorPos.x + dir.dx;
           const newY = anchorPos.y + dir.dy;
           const newZ = anchorPos.z + dir.dz;
           const key = `${newX},${newY},${newZ}`;
           
           if (!occupied.has(key)) {
             coords[activeNodes[i]] = {x: newX, y: newY, z: newZ};
             occupied.add(key);
             edges.push({s: activeNodes[i], t: anchorNode, dir: dir.name});
             placed = true;
           }
           attempts++;
        }
        
        if (!placed) {
          coords[activeNodes[i]] = {x: i * 10, y: 0, z: 0}; 
          edges.push({s: activeNodes[i], t: activeNodes[i-1], dir: 'East'});
        }
      }

      // 2. Generate Premises
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
           const p1 = coords[activeNodes[i]];
           const p2 = coords[activeNodes[j]];
           
           const dx = p1.x - p2.x;
           const dy = p1.y - p2.y;
           const dz = p1.z - p2.z;
           const dist = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
           
           if (dist === 1) {
             let dirName = "";
             if (dx === 1) dirName = 'East';
             else if (dx === -1) dirName = 'West';
             else if (dy === 1) dirName = 'North';
             else if (dy === -1) dirName = 'South';
             else if (dz === 1) dirName = 'Up';
             else if (dz === -1) dirName = 'Down';
             
             // Check if this edge is already explicitly in 'edges' to avoid duplicates?
             // Actually, duplications usually verify understanding. We can add it.
             // But we want to avoid trivial tautologies.
             // Let's rely on 'edges' for PRIMARY premises, and maybe add 1-2 derived links as random hints?
             // For now, let's just stick to the spanning tree + random extra links if adjacent.
              if (Math.random() > 0.3) { // 70% chance to reveal adjacent neighbor
                  rawPremises.push(`${activeNodes[i]} ${getCue(dirName)} ${activeNodes[j]}`);
              }
           }
        }
      }
      
      // Ensure the core spanning tree is included so it's connected
      edges.forEach(e => {
          // If not already added?
          // Simplest is to just add them all.
          rawPremises.push(`${e.s} ${getCue(e.dir)} ${e.t}`);
      });
      // Remove duplicates strings if any
      const uniquePremises = Array.from(new Set(rawPremises));
      premises = finalize(injectNoise(uniquePremises, words.slice(nodeCount, nodeCount + 3)));

      // 3. Scenario Setup (Deictic Shift)
      const playerNode = activeNodes[Math.floor(Math.random() * nodeCount)];
      const playerPos = coords[playerNode];
      const facingDir = ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)];
      
      let targetNode = playerNode;
      while (targetNode === playerNode) {
         targetNode = activeNodes[Math.floor(Math.random() * nodeCount)];
      }
      const targetPos = coords[targetNode];

      // 4. Calculate Vector
      const vecX = targetPos.x - playerPos.x;
      const vecY = targetPos.y - playerPos.y;
      const vecZ = targetPos.z - playerPos.z;

      // 5. Rotate Vector
      const fwd = directions.find(d => d.name === facingDir)!;
      let rightDx = 0, rightDy = 0;
      if (facingDir === 'North') { rightDx = 1; rightDy = 0; }
      if (facingDir === 'South') { rightDx = -1; rightDy = 0; }
      if (facingDir === 'East') { rightDx = 0; rightDy = -1; }
      if (facingDir === 'West') { rightDx = 0; rightDy = 1; }
      
      const localFwd = vecX * fwd.dx + vecY * fwd.dy;
      const localRight = vecX * rightDx + vecY * rightDy;
      const localUp = vecZ;

      // 6. Determine Answer and Query
      const distinctOptions = ['Left', 'Right', 'Front', 'Back', 'Up', 'Down', 'Same Location'].filter(o => getCue(o));
      const queryDir = distinctOptions[Math.floor(Math.random() * distinctOptions.length)];
      
      let isTrue = false;
      if (queryDir === 'Left') isTrue = localRight < 0;
      if (queryDir === 'Right') isTrue = localRight > 0;
      if (queryDir === 'Front') isTrue = localFwd > 0;
      if (queryDir === 'Back') isTrue = localFwd < 0;
      if (queryDir === 'Up') isTrue = localUp > 0;
      if (queryDir === 'Down') isTrue = localUp < 0;
      if (queryDir === 'Same Location') isTrue = (localFwd === 0 && localRight === 0 && localUp === 0);

      question = `You are at ${playerNode} facing ${getCue(facingDir)}. Is ${targetNode} to your ${getCue(queryDir)}?`;
      correctAnswer = isTrue ? "Yes" : "No";
      options = ["Yes", "No"]; // Simple Boolean validation
      explanation = `Spatial Perspective: Coordinate transformation relative to observer's orientation.`;
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
      const nodeCount = Math.min(2 + Math.floor(difficulty / 25), 5);
      const activeNodes = words.slice(0, nodeCount);
      
      const rawPremises: string[] = [];
      rawPremises.push(`${activeNodes[0]} functionalizes ${func.attr}`);
      
      // Chain of relations: A R1 B R2 C ...
      // If we use only 'Same As', property transfers.
      // If we use 'Opposite', property inverts.
      // For simplicity in adaptive logic, let's stick to Same As chains for Transfer, 
      // and maybe one Opposition step at higher levels? 
      // Let's implement pure Same As chain first for clarity, or alternating.
      // If A=B, B=C -> A=C.
      
      // Actually we just generate premises.
      // Actually we just generate premises.
      
      for (let i = 0; i < nodeCount - 1; i++) {
        // Higher difficulty could introduce Opposite?
        const useOpp = difficulty > 50 && Math.random() > 0.7;
        const rel = useOpp ? 'Opposite' : 'Same As';
        rawPremises.push(`${activeNodes[i]} ${getCue(rel)} ${activeNodes[i+1]}`);
      }

      premises = finalize(injectNoise(rawPremises, words.slice(nodeCount, nodeCount + 3)));
      
      const targetNode = activeNodes[nodeCount - 1]; // Ask about last node
      // Value calculation:
      // A (attr). A-B (Same) -> B (attr).
      // A-B (Opp) -> B (OppAttr).
      let isOpposite = false;
      for (let i = 0; i < nodeCount - 1; i++) {
         // Re-derive relation used. 
         // Since we generated linearly, we can just check what we decided.
         // But better to store it.
         // Let's trust the loop logic: 
         // We need to know the path relation product.
         // Pushing 'Opposite' flips the 'isOpposite' state.
         // We need to ensure we know exactly what we generated.
      }
      // Re-run generation cleanly:
      isOpposite = false;
      const verifiedPremises: string[] = [];
      verifiedPremises.push(`${activeNodes[0]} functionalizes ${func.attr}`);
       for (let i = 0; i < nodeCount - 1; i++) {
        const useOpp = difficulty > 50 && Math.random() > 0.3;
        const rel = useOpp ? 'Opposite' : 'Same As';
        verifiedPremises.push(`${activeNodes[i]} ${getCue(rel)} ${activeNodes[i+1]}`);
        if (useOpp) isOpposite = !isOpposite;
      }
      premises = finalize(injectNoise(verifiedPremises, words.slice(nodeCount, nodeCount + 3)));

      question = useNaturalLanguage ? `WHAT IS THE QUALITY OF ${targetNode}?` : `DERIVED VALUE of ${targetNode}?`;
      correctAnswer = isOpposite ? func.opp : func.attr;
      options = shuffle([func.attr, func.opp, 'Neutral', 'None']);
      explanation = `ToSF: Functions transform across the relational chain (Same maintains, Opposite inverts).`;
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
      const nodeCount = Math.min(3 + Math.floor(difficulty / 20), 6);
      const activeNodes = words.slice(0, nodeCount);
      const rawPremises: string[] = [];
      
      // Chain: A contains B contains C ...
      for (let i = 0; i < nodeCount - 1; i++) {
        rawPremises.push(`${activeNodes[i]} ${getCue('Contains')} ${activeNodes[i+1]}`);
      }
      
      premises = finalize(injectNoise(rawPremises, words.slice(nodeCount, nodeCount + 3)));
      
      const targetA = activeNodes[0];
      const targetB = activeNodes[nodeCount - 1];
      const checkDown = Math.random() > 0.5;
      
      // A contains ... B.
      // Question: Does A contain B? Yes.
      // Question: Is B member of A? Yes.
      
      if (checkDown) {
         question = `${targetA} ${getCue('Contains')} ${targetB}?`;
      } else {
         question = `${targetB} member of ${targetA}?`;
      }
      
      correctAnswer = "Yes";
      options = ["Yes", "No", "Undetermined"];
      explanation = `Hierarchical Transitivity: Containment is transitive downwards across ${nodeCount} levels.`;
      break;
    }

    case FrameType.MIXED: {
      const nodeCount = Math.min(3 + Math.floor(difficulty / 20), 5);
      const activeNodes = words.slice(0, nodeCount);
      const rawPremises: string[] = [];
      
      // Generate chain with random relation types
      // A R1 B R2 C ...
      // Logic tracing:
      // Logic tracing:
      // Start at 0.
      // If we ask relation between A and Z?
      // Too complex to automate general Mixed solver without graph logic.
      // Let's simplify: Use 'Same As' and 'Opposite' chains primarily, maybe one 'Greater' if solvable.
      // For reliable generation without a full theorem prover:
      // Limit to Same/Opposite chain.
      
      let isSame = true; // Track relation from start relative to current
      
      for (let i = 0; i < nodeCount - 1; i++) {
        const type = Math.random() > 0.5 ? 'Same As' : 'Opposite';
        rawPremises.push(`${activeNodes[i]} ${getCue(type)} ${activeNodes[i+1]}`);
        if (type === 'Opposite') isSame = !isSame;
      }
      
      premises = finalize(injectNoise(rawPremises, words.slice(nodeCount, nodeCount + 3)));
      
      const start = activeNodes[0];
      const end = activeNodes[nodeCount - 1];
      
      question = `${start} ? ${end}`;
      correctAnswer = isSame ? getCue('Same As') : getCue('Opposite'); // Simplified Mixed to just Same/Opposite/Diff logic for now to ensure robustness
      options = shuffle([getCue('Same As'), getCue('Opposite'), getCue('Greater'), getCue('Lesser')]);
      explanation = `Cross-Frame Synthesis: Integrating disparate relational types across ${nodeCount} nodes.`;
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
