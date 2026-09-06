export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  heuristic?: number; // Estimated heuristic cost to target if predefined
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number; // e.g. Distance in km
  travelTime?: number; // e.g. Travel time in mins
  customWeight?: number; // e.g. Cost or Toll fee
  directed?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
}

export type WeightType = 'distance' | 'travelTime' | 'customWeight';
export type AlgorithmType = 'dijkstra' | 'astar';
export type VehicleMode = 'bike' | 'car';

export interface VehicleProfile {
  type: VehicleMode;
  name: string;
  icon: string;
  avgSpeedKmH: number;
  tollExempt: boolean;
  costPerKm: number;
  carbonPerKmGrams: number;
  congestionResistance: number; // percentage of congestion delay reduced (0 to 1)
}

export interface AlgorithmStep {
  stepNumber: number;
  currentNode: string;
  currentNodeLabel: string;
  description: string;
  distances: Record<string, number>;
  visited: string[];
  frontier: string[];
  heuristics?: Record<string, number>;
  fScores?: Record<string, number>;
  previous: Record<string, string | null>;
}

export interface AlgorithmResult {
  algorithm: AlgorithmType;
  source: string;
  destination: string;
  path: string[];
  distance: number;
  nodesVisited: string[];
  totalVisitedCount: number;
  executionTimeMs: number;
  steps: AlgorithmStep[];
  allDistances: Record<string, number>;
  weightType: WeightType;
  success: boolean;
  errorMessage?: string;
  vehicleMode?: VehicleMode;
  estimatedTravelTimeMinutes?: number;
  estimatedCostINR?: number;
  tollCostINR?: number;
}

export interface RouteHistoryItem {
  id: string;
  date: string;
  timestamp: number;
  source: string;
  sourceLabel: string;
  destination: string;
  destinationLabel: string;
  algorithm: AlgorithmType;
  weightType: WeightType;
  path: string[];
  pathLabels: string[];
  distance: number;
  nodesVisited: number;
  executionTimeMs: number;
}

export interface BooleanAnalysisResult {
  expression: string;
  normalizedExpression: string;
  variables: string[];
  operatorsCount: {
    AND: number;
    OR: number;
    NOT: number;
    XOR: number;
    IMPLIES?: number;
    IFF?: number;
  };
  totalOperators: number;
  expressionType: 'Tautology (Always True)' | 'Contradiction (Always False)' | 'Contingent (Satisfiable)';
  simplifiedExpression: string;
  lawsApplied: string[];
  dnf: string;
  cnf: string;
  dualExpression: string;
  truthTableSummary: {
    totalCombinations: number;
    trueCount: number;
    falseCount: number;
  };
}

export interface TruthTableRow {
  id: number;
  assignments: Record<string, boolean>;
  subEvaluations: Record<string, boolean>;
  result: boolean;
}

export interface TruthTableData {
  variables: string[];
  subExpressions: string[];
  rows: TruthTableRow[];
  expression: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  defaultAlgorithm: AlgorithmType;
  defaultWeightType: WeightType;
  animationSpeed: number; // 1 to 5
  showCoordinates: boolean;
  snapToGrid: boolean;
  autoPlayRouteAnimation: boolean;
  liveTrafficEnabled: boolean;
  liveTrafficIntervalSeconds: number;
  autoRerouteOnIncident: boolean;
  soundEnabled?: boolean;
  voiceAnnouncementsEnabled?: boolean;
}

export type CongestionLevel = 'low' | 'moderate' | 'heavy' | 'severe';

export interface LiveTrafficEdgeState {
  edgeId: string;
  congestion: CongestionLevel;
  speedMultiplier: number; // 0.3 to 1.3
  delayMinutes: number; // Additional live delay
  currentSpeedKmH: number;
  incidentTitle?: string;
  isIncident: boolean;
  incidentSeverity?: 'warning' | 'critical' | 'info';
  lastUpdated: number;
}

export interface LiveTrafficIncident {
  id: string;
  edgeId: string;
  title: string;
  severity: 'warning' | 'critical' | 'info';
  description: string;
  timestamp: number;
  resolved: boolean;
  delayImpactMinutes: number;
  locationLabel: string;
}

export interface VehicleDriveState {
  isActive: boolean;
  isPaused: boolean;
  progress: number; // 0 to 1
  currentEdgeIndex: number;
  currentX: number;
  currentY: number;
  headingAngle: number;
  speedKmH: number;
  distanceRemainingKm: number;
  timeRemainingSeconds: number;
  currentStepInstruction: string;
  nextStepInstruction?: string;
  speedMultiplier: number; // 1x, 2x, 4x, 8x
  vehicleMode?: VehicleMode;
}

export interface TurnGuidanceStep {
  stepIndex: number;
  fromNodeId: string;
  toNodeId: string;
  fromName: string;
  toName: string;
  maneuver: 'depart' | 'straight' | 'turn-left' | 'turn-right' | 'toll' | 'arrive';
  distanceKm: number;
  instruction: string;
  voiceText: string;
  educationalTip?: string;
  landmarkDetails?: string;
}

export interface CampusLandmarkInfo {
  id: string;
  name: string;
  subtitle?: string;
  category: 'Healthcare' | 'Academic' | 'Administration' | 'Highway Transit' | 'Natural Landmark' | 'Student Amenities';
  emoji: string;
  badgeColor: string;
  description: string;
  educationalHighlights: string[];
  graphProperties: {
    degree: number;
    nodeType: 'Origin Terminal' | 'Highway Corridor' | 'Junction & Interchange' | 'Toll Barrier' | 'Campus Gateway' | 'Destination Quad' | 'Academic Quad';
    significance: string;
  };
  facilities?: string[];
  speechNarration: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'route-planner'
  | 'live-traffic'
  | 'graph-builder'
  | 'matrix-relations'
  | 'algorithms'
  | 'boolean-algebra'
  | 'truth-table'
  | 'academic-report'
  | 'route-history'
  | 'analytics'
  | 'contact'
  | 'settings';
