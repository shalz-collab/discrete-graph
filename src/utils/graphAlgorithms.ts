import {
  GraphData,
  GraphNode,
  GraphEdge,
  AlgorithmResult,
  AlgorithmStep,
  WeightType,
  LiveTrafficEdgeState
} from '../types';

export function getEdgeWeight(
  edge: GraphEdge,
  weightType: WeightType,
  liveTrafficMap?: Record<string, LiveTrafficEdgeState>
): number {
  const traffic = liveTrafficMap?.[edge.id];
  let baseVal = edge.weight;

  if (weightType === 'travelTime') {
    baseVal = edge.travelTime ?? edge.weight * 1.5; // fallback
    if (traffic) {
      const mult = Math.max(0.2, traffic.speedMultiplier || 1.0);
      const computed = (baseVal / mult) + (traffic.delayMinutes || 0);
      return Math.round(computed * 10) / 10;
    }
    return baseVal;
  }

  if (weightType === 'customWeight') {
    baseVal = edge.customWeight ?? edge.weight * 2;
    if (traffic && traffic.congestion !== 'low') {
      const congestionToll = traffic.congestion === 'severe' ? 12 : traffic.congestion === 'heavy' ? 7 : 3;
      return baseVal + congestionToll;
    }
    return baseVal;
  }

  // Distance mode: if severe blockage / incident, factor in dynamic route impedance
  if (traffic && (traffic.congestion === 'severe' || traffic.isIncident)) {
    return Math.round((baseVal + (traffic.delayMinutes > 0 ? traffic.delayMinutes * 0.4 : 3)) * 10) / 10;
  }

  return baseVal;
}

// Build adjacency map for fast neighbor lookups
export function buildAdjacencyMap(
  graph: GraphData,
  weightType: WeightType = 'distance',
  liveTrafficMap?: Record<string, LiveTrafficEdgeState>
) {
  const adj = new Map<string, { target: string; weight: number; edgeId: string }[]>();
  
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of graph.edges) {
    const w = Math.max(0.1, getEdgeWeight(edge, weightType, liveTrafficMap));
    
    // Add forward connection
    if (adj.has(edge.source)) {
      adj.get(edge.source)!.push({ target: edge.target, weight: w, edgeId: edge.id });
    }
    
    // If undirected or edge explicitly not directed
    const isDirected = edge.directed !== undefined ? edge.directed : graph.directed;
    if (!isDirected) {
      if (adj.has(edge.target)) {
        adj.get(edge.target)!.push({ target: edge.source, weight: w, edgeId: edge.id });
      }
    }
  }

  return adj;
}

// Euclidean heuristic function for A*
export function calculateHeuristic(nodeA: GraphNode, nodeB: GraphNode, scaleFactor: number = 0.05): number {
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;
  const euclidean = Math.sqrt(dx * dx + dy * dy);
  return Math.round(euclidean * scaleFactor * 10) / 10;
}

/**
 * Dijkstra's Algorithm Implementation
 */
export function runDijkstra(
  graph: GraphData,
  sourceId: string,
  destId: string,
  weightType: WeightType = 'distance',
  liveTrafficMap?: Record<string, LiveTrafficEdgeState>
): AlgorithmResult {
  const startTime = performance.now();
  const nodeMap = new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n]));

  if (!nodeMap.has(sourceId) || !nodeMap.has(destId)) {
    return {
      algorithm: 'dijkstra',
      source: sourceId,
      destination: destId,
      path: [],
      distance: Infinity,
      nodesVisited: [],
      totalVisitedCount: 0,
      executionTimeMs: 0,
      steps: [],
      allDistances: {},
      weightType,
      success: false,
      errorMessage: 'Source or destination node not found in graph.'
    };
  }

  if (sourceId === destId) {
    return {
      algorithm: 'dijkstra',
      source: sourceId,
      destination: destId,
      path: [sourceId],
      distance: 0,
      nodesVisited: [sourceId],
      totalVisitedCount: 1,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      steps: [{
        stepNumber: 1,
        currentNode: sourceId,
        currentNodeLabel: nodeMap.get(sourceId)?.label || sourceId,
        description: `Source and destination are identical (${nodeMap.get(sourceId)?.label}). Distance is 0.`,
        distances: { [sourceId]: 0 },
        visited: [sourceId],
        frontier: [],
        previous: { [sourceId]: null }
      }],
      allDistances: { [sourceId]: 0 },
      weightType,
      success: true
    };
  }

  const adj = buildAdjacencyMap(graph, weightType, liveTrafficMap);
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const visitedOrder: string[] = [];
  const steps: AlgorithmStep[] = [];

  // Initialize distances
  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  }
  distances[sourceId] = 0;

  // Priority Queue representation: array of [nodeId, distance]
  const pq: [string, number][] = [[sourceId, 0]];
  let stepCount = 0;

  steps.push({
    stepNumber: ++stepCount,
    currentNode: sourceId,
    currentNodeLabel: nodeMap.get(sourceId)?.label || sourceId,
    description: `Initialize Dijkstra: Start at ${nodeMap.get(sourceId)?.label} with dist=0, all other nodes dist=∞.`,
    distances: { ...distances },
    visited: [],
    frontier: [sourceId],
    previous: { ...previous }
  });

  while (pq.length > 0) {
    // Extract minimum distance node
    pq.sort((a, b) => a[1] - b[1]);
    const [currentId, currentDist] = pq.shift()!;

    if (visited.has(currentId)) continue;
    visited.add(currentId);
    visitedOrder.push(currentId);

    const currentLabel = nodeMap.get(currentId)?.label || currentId;

    steps.push({
      stepNumber: ++stepCount,
      currentNode: currentId,
      currentNodeLabel: currentLabel,
      description: `Visit node "${currentLabel}" with minimum tentative distance ${currentDist === Infinity ? '∞' : currentDist}.`,
      distances: { ...distances },
      visited: [...visitedOrder],
      frontier: pq.map(p => p[0]),
      previous: { ...previous }
    });

    if (currentId === destId) {
      break; // Reached destination
    }

    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      const neighborId = neighbor.target;
      if (visited.has(neighborId)) continue;

      const alt = currentDist + neighbor.weight;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = currentId;
        pq.push([neighborId, alt]);

        const neighborLabel = nodeMap.get(neighborId)?.label || neighborId;
        steps.push({
          stepNumber: ++stepCount,
          currentNode: currentId,
          currentNodeLabel: currentLabel,
          description: `Relax edge (${currentLabel} → ${neighborLabel}): Updated tentative distance of ${neighborLabel} to ${alt} via ${currentLabel}.`,
          distances: { ...distances },
          visited: [...visitedOrder],
          frontier: pq.map(p => p[0]),
          previous: { ...previous }
        });
      }
    }
  }

  const endTime = performance.now();
  const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = destId;

  if (distances[destId] !== Infinity) {
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }

  const success = path.length > 0 && path[0] === sourceId;

  return {
    algorithm: 'dijkstra',
    source: sourceId,
    destination: destId,
    path: success ? path : [],
    distance: success ? distances[destId] : Infinity,
    nodesVisited: visitedOrder,
    totalVisitedCount: visitedOrder.length,
    executionTimeMs,
    steps,
    allDistances: distances,
    weightType,
    success,
    errorMessage: success ? undefined : 'No route exists between the selected locations.'
  };
}

/**
 * A* Search Algorithm Implementation
 * f(n) = g(n) + h(n)
 */
export function runAStar(
  graph: GraphData,
  sourceId: string,
  destId: string,
  weightType: WeightType = 'distance',
  liveTrafficMap?: Record<string, LiveTrafficEdgeState>
): AlgorithmResult {
  const startTime = performance.now();
  const nodeMap = new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n]));

  if (!nodeMap.has(sourceId) || !nodeMap.has(destId)) {
    return {
      algorithm: 'astar',
      source: sourceId,
      destination: destId,
      path: [],
      distance: Infinity,
      nodesVisited: [],
      totalVisitedCount: 0,
      executionTimeMs: 0,
      steps: [],
      allDistances: {},
      weightType,
      success: false,
      errorMessage: 'Source or destination node not found in graph.'
    };
  }

  if (sourceId === destId) {
    return {
      algorithm: 'astar',
      source: sourceId,
      destination: destId,
      path: [sourceId],
      distance: 0,
      nodesVisited: [sourceId],
      totalVisitedCount: 1,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      steps: [{
        stepNumber: 1,
        currentNode: sourceId,
        currentNodeLabel: nodeMap.get(sourceId)?.label || sourceId,
        description: `Source and destination are identical (${nodeMap.get(sourceId)?.label}). Distance is 0.`,
        distances: { [sourceId]: 0 },
        visited: [sourceId],
        frontier: [],
        previous: { [sourceId]: null }
      }],
      allDistances: { [sourceId]: 0 },
      weightType,
      success: true
    };
  }

  const destNode = nodeMap.get(destId)!;
  const adj = buildAdjacencyMap(graph, weightType, liveTrafficMap);

  // Compute heuristics for all nodes relative to destination
  const heuristics: Record<string, number> = {};
  for (const node of graph.nodes) {
    heuristics[node.id] = calculateHeuristic(node, destNode);
  }

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const openSet = new Set<string>([sourceId]);
  const closedSet = new Set<string>();
  const visitedOrder: string[] = [];
  const steps: AlgorithmStep[] = [];

  for (const node of graph.nodes) {
    gScore[node.id] = Infinity;
    fScore[node.id] = Infinity;
    previous[node.id] = null;
  }

  gScore[sourceId] = 0;
  fScore[sourceId] = heuristics[sourceId];

  let stepCount = 0;
  steps.push({
    stepNumber: ++stepCount,
    currentNode: sourceId,
    currentNodeLabel: nodeMap.get(sourceId)?.label || sourceId,
    description: `Initialize A*: Start at ${nodeMap.get(sourceId)?.label} with g=0, h=${heuristics[sourceId]}, f=${fScore[sourceId]}.`,
    distances: { ...gScore },
    visited: [],
    frontier: [sourceId],
    heuristics: { ...heuristics },
    fScores: { ...fScore },
    previous: { ...previous }
  });

  while (openSet.size > 0) {
    // Find node in openSet with lowest fScore
    let currentId: string | null = null;
    let lowestF = Infinity;

    for (const nodeId of openSet) {
      if (fScore[nodeId] < lowestF) {
        lowestF = fScore[nodeId];
        currentId = nodeId;
      }
    }

    if (!currentId) break;

    const currentLabel = nodeMap.get(currentId)?.label || currentId;

    if (currentId === destId) {
      visitedOrder.push(currentId);
      steps.push({
        stepNumber: ++stepCount,
        currentNode: currentId,
        currentNodeLabel: currentLabel,
        description: `Goal reached! Target "${currentLabel}" selected from open set with optimal cost g=${gScore[currentId]}.`,
        distances: { ...gScore },
        visited: [...visitedOrder],
        frontier: Array.from(openSet),
        heuristics: { ...heuristics },
        fScores: { ...fScore },
        previous: { ...previous }
      });
      break;
    }

    openSet.delete(currentId);
    closedSet.add(currentId);
    visitedOrder.push(currentId);

    steps.push({
      stepNumber: ++stepCount,
      currentNode: currentId,
      currentNodeLabel: currentLabel,
      description: `Expand "${currentLabel}": f=${fScore[currentId]} (g=${gScore[currentId]} + h=${heuristics[currentId]}).`,
      distances: { ...gScore },
      visited: [...visitedOrder],
      frontier: Array.from(openSet),
      heuristics: { ...heuristics },
      fScores: { ...fScore },
      previous: { ...previous }
    });

    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      const neighborId = neighbor.target;
      if (closedSet.has(neighborId)) continue;

      const tentativeG = gScore[currentId] + neighbor.weight;
      const neighborLabel = nodeMap.get(neighborId)?.label || neighborId;

      if (!openSet.has(neighborId)) {
        openSet.add(neighborId);
      } else if (tentativeG >= gScore[neighborId]) {
        continue; // Not a better path
      }

      previous[neighborId] = currentId;
      gScore[neighborId] = tentativeG;
      fScore[neighborId] = gScore[neighborId] + heuristics[neighborId];

      steps.push({
        stepNumber: ++stepCount,
        currentNode: currentId,
        currentNodeLabel: currentLabel,
        description: `Discovered/Updated ${neighborLabel}: g=${tentativeG}, h=${heuristics[neighborId]} → f=${fScore[neighborId]}.`,
        distances: { ...gScore },
        visited: [...visitedOrder],
        frontier: Array.from(openSet),
        heuristics: { ...heuristics },
        fScores: { ...fScore },
        previous: { ...previous }
      });
    }
  }

  const endTime = performance.now();
  const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = destId;

  if (gScore[destId] !== Infinity) {
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }

  const success = path.length > 0 && path[0] === sourceId;

  return {
    algorithm: 'astar',
    source: sourceId,
    destination: destId,
    path: success ? path : [],
    distance: success ? gScore[destId] : Infinity,
    nodesVisited: visitedOrder,
    totalVisitedCount: visitedOrder.length,
    executionTimeMs,
    steps,
    allDistances: gScore,
    weightType,
    success,
    errorMessage: success ? undefined : 'No route exists between the selected locations.'
  };
}

/**
 * Generate Adjacency List
 */
export function generateAdjacencyList(graph: GraphData, weightType: WeightType = 'distance') {
  const adj = buildAdjacencyMap(graph, weightType);
  const nodeMap = new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n]));
  
  const result: { nodeId: string; nodeLabel: string; neighbors: { targetId: string; targetLabel: string; weight: number }[] }[] = [];

  for (const node of graph.nodes) {
    const list = adj.get(node.id) || [];
    result.push({
      nodeId: node.id,
      nodeLabel: node.label,
      neighbors: list.map(item => ({
        targetId: item.target,
        targetLabel: nodeMap.get(item.target)?.label || item.target,
        weight: item.weight
      }))
    });
  }

  return result;
}

/**
 * Generate Adjacency Matrix
 */
export function generateAdjacencyMatrix(graph: GraphData, weightType: WeightType = 'distance') {
  const nodes = graph.nodes;
  const n = nodes.length;
  const matrix: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
  const nodeIndexMap = new Map<string, number>(nodes.map((node, idx) => [node.id, idx]));

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 0; // Distance to self is 0
  }

  for (const edge of graph.edges) {
    const u = nodeIndexMap.get(edge.source);
    const v = nodeIndexMap.get(edge.target);
    const w = getEdgeWeight(edge, weightType);

    if (u !== undefined && v !== undefined) {
      matrix[u][v] = w;
      const isDirected = edge.directed !== undefined ? edge.directed : graph.directed;
      if (!isDirected) {
        matrix[v][u] = w;
      }
    }
  }

  return {
    headers: nodes.map(n => n.label),
    nodeIds: nodes.map(n => n.id),
    matrix
  };
}

/**
 * Graph Analytical Properties for Discrete Mathematics
 */
export function getGraphProperties(graph: GraphData) {
  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;
  const isDirected = graph.directed;

  // Max edges possible
  const maxEdges = isDirected ? nodeCount * (nodeCount - 1) : (nodeCount * (nodeCount - 1)) / 2;
  const density = maxEdges > 0 ? Math.round((edgeCount / maxEdges) * 1000) / 1000 : 0;

  // Degrees
  const inDegree: Record<string, number> = {};
  const outDegree: Record<string, number> = {};
  for (const node of graph.nodes) {
    inDegree[node.id] = 0;
    outDegree[node.id] = 0;
  }

  for (const edge of graph.edges) {
    if (outDegree[edge.source] !== undefined) outDegree[edge.source]++;
    if (inDegree[edge.target] !== undefined) inDegree[edge.target]++;
    
    if (!graph.directed && !edge.directed) {
      if (outDegree[edge.target] !== undefined) outDegree[edge.target]++;
      if (inDegree[edge.source] !== undefined) inDegree[edge.source]++;
    }
  }

  const degrees = graph.nodes.map(n => ({
    id: n.id,
    label: n.label,
    inDegree: inDegree[n.id] || 0,
    outDegree: outDegree[n.id] || 0,
    totalDegree: (outDegree[n.id] || 0) + (graph.directed ? (inDegree[n.id] || 0) : 0)
  }));

  const avgDegree = nodeCount > 0 
    ? Math.round((degrees.reduce((acc, d) => acc + d.totalDegree, 0) / nodeCount) * 10) / 10 
    : 0;

  return {
    nodeCount,
    edgeCount,
    isDirected,
    density,
    avgDegree,
    degrees,
    isPlanarEstimated: edgeCount <= (3 * nodeCount - 6) || nodeCount < 3
  };
}
