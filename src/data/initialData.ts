import { GraphData, RouteHistoryItem, AppSettings } from '../types';

export const INITIAL_GRAPH: GraphData = {
  directed: false,
  nodes: [
    // POONAMALLEE REGION (ORIGIN TOWN)
    { id: 'poonamallee', label: 'Poonamallee Bus Stand & Trunk Rd', x: 90, y: 150, heuristic: 16.7 },
    { id: 'poonamallee_bypass', label: 'Poonamallee Bypass (Chennai ORR)', x: 240, y: 150, heuristic: 14.6 },
    { id: 'nazarathpet', label: 'Nazarathpet Bangalore Hwy Junction', x: 390, y: 150, heuristic: 12.3 },

    // NH-48 EXPRESS HIGHWAY & TRANSIT CORRIDOR
    { id: 'kuthambakkam', label: 'Kuthambakkam Greenfield Bus Terminal', x: 480, y: 390, heuristic: 11.5 },
    { id: 'chembarambakkam', label: 'Chembarambakkam Lake Highway (NH-48)', x: 570, y: 150, heuristic: 8.5 },
    { id: 'chembarambakkam_service', label: 'Chembarambakkam Service Rd (Bike)', x: 570, y: 280, heuristic: 8.2 },
    { id: 'irungattukottai', label: 'Irungattukottai Toll Plaza & SIPCOT', x: 740, y: 150, heuristic: 4.3 },
    { id: 'mevalurkuppam', label: 'Mevalurkuppam Industrial Link', x: 740, y: 280, heuristic: 4.0 },

    // THANDALAM JUNCTION & SAVEETHA UNIVERSITY CAMPUS
    { id: 'thandalam_junction', label: 'Thandalam Junction (Saveetha Nagar NH-48)', x: 910, y: 150, heuristic: 1.2 },
    { id: 'saveetha_gate1', label: 'Saveetha University Gate 1 (Thandalam)', x: 910, y: 280, heuristic: 0.7 },
    { id: 'dental_college', label: 'Saveetha Dental College & Hospital', x: 1080, y: 280, heuristic: 0.6 },
    { id: 'medical_hospital', label: 'Saveetha Medical College & Hospital (Thandalam)', x: 910, y: 440, heuristic: 0.0 },
    { id: 'sse_engineering', label: 'Saveetha School of Engineering (SSE)', x: 1080, y: 440, heuristic: 0.7 },
    { id: 'admin_senate', label: 'SIMATS Senate & Central Library', x: 910, y: 580, heuristic: 0.5 },
    { id: 'hostels_residence', label: 'Student Hostels & Quarters', x: 1080, y: 580, heuristic: 1.0 },
    { id: 'sports_complex', label: 'Sports Arena & Transport Bay', x: 990, y: 680, heuristic: 0.9 }
  ],
  edges: [
    // NH-48 HIGHWAY EXPRESS ARTERY (Poonamallee -> Thandalam)
    { id: 'e_pm_bp', source: 'poonamallee', target: 'poonamallee_bypass', weight: 2.1, travelTime: 4, customWeight: 0 },
    { id: 'e_bp_naz', source: 'poonamallee_bypass', target: 'nazarathpet', weight: 2.3, travelTime: 4, customWeight: 0 },
    { id: 'e_naz_cbk', source: 'nazarathpet', target: 'chembarambakkam', weight: 3.8, travelTime: 5, customWeight: 0 },
    { id: 'e_cbk_toll', source: 'chembarambakkam', target: 'irungattukottai', weight: 4.2, travelTime: 5, customWeight: 45 },
    { id: 'e_toll_than', source: 'irungattukottai', target: 'thandalam_junction', weight: 3.1, travelTime: 4, customWeight: 0 },
    { id: 'e_than_gate', source: 'thandalam_junction', target: 'saveetha_gate1', weight: 0.5, travelTime: 1, customWeight: 0 },
    { id: 'e_gate_med', source: 'saveetha_gate1', target: 'medical_hospital', weight: 0.7, travelTime: 2, customWeight: 0 },

    // SERVICE ROAD & BIKE BYPASS CORRIDOR (No Tolls, Lower Congestion)
    { id: 'e_naz_svc', source: 'nazarathpet', target: 'chembarambakkam_service', weight: 4.0, travelTime: 6, customWeight: 0 },
    { id: 'e_svc_mev', source: 'chembarambakkam_service', target: 'mevalurkuppam', weight: 3.9, travelTime: 5, customWeight: 0 },
    { id: 'e_mev_gate', source: 'mevalurkuppam', target: 'saveetha_gate1', weight: 3.3, travelTime: 5, customWeight: 0 },
    { id: 'e_mev_med', source: 'mevalurkuppam', target: 'medical_hospital', weight: 3.1, travelTime: 4, customWeight: 0 },
    { id: 'e_cbk_svc', source: 'chembarambakkam', target: 'chembarambakkam_service', weight: 0.4, travelTime: 1, customWeight: 0 },
    { id: 'e_irung_mev', source: 'irungattukottai', target: 'mevalurkuppam', weight: 0.5, travelTime: 1, customWeight: 0 },

    // KUTHAMBAKKAM GREENFIELD HUB
    { id: 'e_naz_kuth', source: 'nazarathpet', target: 'kuthambakkam', weight: 3.2, travelTime: 5, customWeight: 0 },
    { id: 'e_kuth_svc', source: 'kuthambakkam', target: 'chembarambakkam_service', weight: 2.2, travelTime: 4, customWeight: 0 },

    // SAVEETHA THANDALAM UNIVERSITY CAMPUS INTERNAL CORRIDOR
    { id: 'e_gate_dental', source: 'saveetha_gate1', target: 'dental_college', weight: 0.8, travelTime: 2, customWeight: 0 },
    { id: 'e_dental_med', source: 'dental_college', target: 'medical_hospital', weight: 0.6, travelTime: 1.5, customWeight: 0 },
    { id: 'e_gate_sse', source: 'saveetha_gate1', target: 'sse_engineering', weight: 0.9, travelTime: 2.5, customWeight: 0 },
    { id: 'e_med_sse', source: 'medical_hospital', target: 'sse_engineering', weight: 0.7, travelTime: 2, customWeight: 0 },
    { id: 'e_med_admin', source: 'medical_hospital', target: 'admin_senate', weight: 0.5, travelTime: 1.5, customWeight: 0 },
    { id: 'e_sse_hostels', source: 'sse_engineering', target: 'hostels_residence', weight: 0.6, travelTime: 2, customWeight: 0 },
    { id: 'e_admin_hostels', source: 'admin_senate', target: 'hostels_residence', weight: 0.8, travelTime: 2.5, customWeight: 0 },
    { id: 'e_admin_sports', source: 'admin_senate', target: 'sports_complex', weight: 0.4, travelTime: 1, customWeight: 0 },
    { id: 'e_hostels_sports', source: 'hostels_residence', target: 'sports_complex', weight: 0.5, travelTime: 1.5, customWeight: 0 }
  ]
};

export const INITIAL_HISTORY: RouteHistoryItem[] = [
  {
    id: 'hist-1',
    date: 'Today, 08:30 AM',
    timestamp: Date.now() - 3600000 * 2,
    source: 'poonamallee',
    sourceLabel: 'Poonamallee Bus Stand & Trunk Rd',
    destination: 'medical_hospital',
    destinationLabel: 'Saveetha Medical College & Hospital (Thandalam)',
    algorithm: 'astar',
    weightType: 'distance',
    path: ['poonamallee', 'poonamallee_bypass', 'nazarathpet', 'chembarambakkam', 'irungattukottai', 'thandalam_junction', 'saveetha_gate1', 'medical_hospital'],
    pathLabels: [
      'Poonamallee Bus Stand',
      'Poonamallee Bypass (ORR)',
      'Nazarathpet Junction',
      'Chembarambakkam Lake Highway',
      'Irungattukottai Toll Plaza',
      'Thandalam Junction',
      'Saveetha Gate 1',
      'Saveetha Medical College Hospital'
    ],
    distance: 16.7,
    nodesVisited: 8,
    executionTimeMs: 0.85
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  defaultAlgorithm: 'dijkstra',
  defaultWeightType: 'distance',
  animationSpeed: 3,
  showCoordinates: true,
  snapToGrid: false,
  autoPlayRouteAnimation: true,
  liveTrafficEnabled: true,
  liveTrafficIntervalSeconds: 4,
  autoRerouteOnIncident: true,
  soundEnabled: true,
  voiceAnnouncementsEnabled: true
};

export const PRESET_BOOLEAN_EXPRESSIONS = [
  { label: 'Basic Conjunction/Disjunction', expr: '(A AND B) OR (NOT C)' },
  { label: 'De Morgan Example', expr: 'NOT (A AND B)' },
  { label: 'Exclusive OR (XOR) Logic', expr: 'A XOR B' },
  { label: 'Distributive Law Test', expr: 'A AND (B OR C)' },
  { label: 'Tautology Law Test', expr: 'A OR (NOT A)' },
  { label: 'Contradiction Law Test', expr: 'A AND (NOT A)' },
  { label: 'Absorption Form', expr: 'A OR (A AND B)' },
  { label: 'Conditional Implication', expr: 'P IMPLIES Q' },
  { label: 'Biconditional Equivalence', expr: 'P IFF Q' },
  { label: 'Complex 3-Variable Route Filter', expr: '(Traffic AND Rain) OR (Roadwork XOR Highway)' }
];
