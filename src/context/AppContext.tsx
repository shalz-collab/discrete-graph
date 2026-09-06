import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  GraphData,
  GraphNode,
  GraphEdge,
  AlgorithmResult,
  AlgorithmType,
  WeightType,
  RouteHistoryItem,
  AppSettings,
  ActiveTab,
  LiveTrafficEdgeState,
  LiveTrafficIncident,
  VehicleDriveState,
  CongestionLevel,
  VehicleMode
} from '../types';
import { INITIAL_GRAPH, INITIAL_HISTORY, DEFAULT_SETTINGS } from '../data/initialData';
import { runDijkstra, runAStar } from '../utils/graphAlgorithms';
import { transitSound } from '../utils/soundEffects';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface RerouteSuggestion {
  newResult: AlgorithmResult;
  timeSavedMinutes: number;
  reason: string;
}

interface AppContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Graph State
  graph: GraphData;
  setGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  addNode: (node: Omit<GraphNode, 'id'> & { id?: string }) => string;
  updateNode: (id: string, updates: Partial<GraphNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Omit<GraphEdge, 'id'> & { id?: string }) => string;
  updateEdge: (id: string, updates: Partial<GraphEdge>) => void;
  deleteEdge: (id: string) => void;
  toggleGraphDirected: () => void;
  resetDemoGraph: () => void;
  clearGraph: () => void;

  // Route Planning State
  selectedSource: string;
  setSelectedSource: (id: string) => void;
  selectedDestination: string;
  setSelectedDestination: (id: string) => void;
  selectedVehicle: VehicleMode;
  setSelectedVehicle: (mode: VehicleMode) => void;
  selectedAlgorithm: AlgorithmType;
  setSelectedAlgorithm: (algo: AlgorithmType) => void;
  selectedWeightType: WeightType;
  setSelectedWeightType: (wt: WeightType) => void;
  activeResult: AlgorithmResult | null;
  setActiveResult: (res: AlgorithmResult | null) => void;
  isCalculating: boolean;
  calculateRoute: (
    sourceId?: string,
    destId?: string,
    algorithm?: AlgorithmType,
    weightType?: WeightType
  ) => AlgorithmResult;
  clearActiveRoute: () => void;

  // Real-Time Live Traffic & Incidents
  liveTraffic: Record<string, LiveTrafficEdgeState>;
  liveIncidents: LiveTrafficIncident[];
  isLiveTrafficActive: boolean;
  setIsLiveTrafficActive: (active: boolean) => void;
  triggerRandomIncident: (customTitle?: string, customSeverity?: 'warning' | 'critical' | 'info') => void;
  resolveIncident: (incidentId: string) => void;
  clearAllIncidents: () => void;
  updateEdgeTraffic: (edgeId: string, updates: Partial<LiveTrafficEdgeState>) => void;
  telemetryTicks: number;

  // Real-Time GPS / Driving Simulation
  vehicleDriveState: VehicleDriveState;
  startDrivingSimulation: (customResult?: AlgorithmResult) => void;
  pauseDrivingSimulation: () => void;
  resumeDrivingSimulation: () => void;
  stopDrivingSimulation: () => void;
  setDriveSpeedMultiplier: (mult: number) => void;

  // Real-Time Dynamic Rerouting
  rerouteSuggestion: RerouteSuggestion | null;
  applyRerouteSuggestion: () => void;
  dismissRerouteSuggestion: () => void;

  // Live Traffic Drawer
  isLiveTrafficDrawerOpen: boolean;
  setIsLiveTrafficDrawerOpen: (open: boolean) => void;

  // Route History
  history: RouteHistoryItem[];
  addHistoryItem: (item: RouteHistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;

  // Discrete Math Stats
  booleanEvaluationsCount: number;
  incrementBooleanCount: () => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetApplicationData: () => void;

  // Notifications
  toasts: ToastNotification[];
  notifications: ToastNotification[];
  notify: (type: ToastNotification['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;
  dismissNotification: (id: string) => void;

  // Modal helper
  isAboutModalOpen: boolean;
  setIsAboutModalOpen: (open: boolean) => void;

  // Transit & Stop Sounds
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  playStopSound: (stopIdOrName: string, isDest?: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const GRAPH_STORAGE_KEY = 'simats_saveetha_thandalam_corridor_v6';
const HISTORY_STORAGE_KEY = 'simats_saveetha_thandalam_history_v6';
const SETTINGS_STORAGE_KEY = 'simats_saveetha_thandalam_settings_v6';
const BOOL_COUNT_KEY = 'simats_saveetha_thandalam_bool_count_v6';

// Seed initial traffic states for edges
const buildInitialTraffic = (edges: GraphEdge[]): Record<string, LiveTrafficEdgeState> => {
  const result: Record<string, LiveTrafficEdgeState> = {};
  edges.forEach((edge) => {
    let congestion: CongestionLevel = 'low';
    let speedMult = 1.0;
    let delayMins = 0;
    let currentSpeed = 55; // Highway speed limit km/h

    if (edge.id === 'e_cbk_toll') {
      congestion = 'heavy';
      speedMult = 0.55;
      delayMins = 3.5;
      currentSpeed = 22; // Toll queue
    } else if (edge.id === 'e_pm_bp') {
      congestion = 'moderate';
      speedMult = 0.75;
      delayMins = 2.0;
      currentSpeed = 35; // Poonamallee city junction
    } else if (edge.id === 'e_than_gate') {
      congestion = 'low';
      speedMult = 0.9;
      delayMins = 0.5;
      currentSpeed = 25; // Gate turning
    }

    result[edge.id] = {
      edgeId: edge.id,
      congestion,
      speedMultiplier: speedMult,
      delayMinutes: delayMins,
      currentSpeedKmH: currentSpeed,
      isIncident: false,
      lastUpdated: Date.now()
    };
  });
  return result;
};

const INITIAL_INCIDENTS: LiveTrafficIncident[] = [
  {
    id: 'inc-1',
    edgeId: 'e_cbk_toll',
    title: 'Irungattukottai Toll Plaza FASTag Queue',
    locationLabel: 'Chembarambakkam Lake ➔ Irungattukottai Toll (NH-48)',
    severity: 'warning',
    description: 'Heavy truck and interstate passenger vehicle queuing at NH-48 toll plaza. Bikes bypass without delay.',
    timestamp: Date.now() - 60000 * 12,
    resolved: false,
    delayImpactMinutes: 3.5
  }
];

const INITIAL_DRIVE_STATE: VehicleDriveState = {
  isActive: false,
  isPaused: false,
  progress: 0,
  currentEdgeIndex: 0,
  currentX: 0,
  currentY: 0,
  headingAngle: 0,
  speedKmH: 0,
  distanceRemainingKm: 0,
  timeRemainingSeconds: 0,
  currentStepInstruction: 'Ready to drive',
  speedMultiplier: 2
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Load persistent state with safe fallbacks
  const [graph, setGraph] = useState<GraphData>(() => {
    try {
      const saved = localStorage.getItem(GRAPH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.nodes &&
          parsed.edges &&
          parsed.nodes.some((n: any) => n.id === 'poonamallee') &&
          parsed.nodes.some((n: any) => n.id === 'medical_hospital')
        ) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_GRAPH;
  });

  const [history, setHistory] = useState<RouteHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_HISTORY;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [booleanEvaluationsCount, setBooleanEvaluationsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(BOOL_COUNT_KEY);
      if (saved) return parseInt(saved, 10) || 12;
    } catch {
      // fallback
    }
    return 12;
  });

  // Routing form state
  const [selectedSource, setSelectedSource] = useState<string>('poonamallee');
  const [selectedDestination, setSelectedDestination] = useState<string>('medical_hospital');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleMode>('car');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>(settings.defaultAlgorithm || 'dijkstra');
  const [selectedWeightType, setSelectedWeightType] = useState<WeightType>(settings.defaultWeightType || 'distance');
  const [activeResult, setActiveResult] = useState<AlgorithmResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Real-Time Traffic & Incidents State
  const [liveTraffic, setLiveTraffic] = useState<Record<string, LiveTrafficEdgeState>>(() =>
    buildInitialTraffic(graph.edges)
  );
  const [liveIncidents, setLiveIncidents] = useState<LiveTrafficIncident[]>(INITIAL_INCIDENTS);
  const [isLiveTrafficActive, setIsLiveTrafficActive] = useState<boolean>(true);
  const [telemetryTicks, setTelemetryTicks] = useState<number>(0);
  const [isLiveTrafficDrawerOpen, setIsLiveTrafficDrawerOpen] = useState<boolean>(false);
  const [rerouteSuggestion, setRerouteSuggestion] = useState<RerouteSuggestion | null>(null);

  // Real-Time GPS Vehicle Drive Simulation
  const [vehicleDriveState, setVehicleDriveState] = useState<VehicleDriveState>(INITIAL_DRIVE_STATE);
  const driveAnimFrameRef = useRef<number | null>(null);
  const lastAnnouncedStopRef = useRef<number>(-1);

  // Transit Audio Sound Effects and Voice Announcements
  const [isSoundEnabled, setIsSoundEnabledState] = useState<boolean>(() => transitSound.getSoundEnabled());
  const [isVoiceEnabled, setIsVoiceEnabledState] = useState<boolean>(() => transitSound.getVoiceEnabled());

  const setIsSoundEnabled = useCallback((enabled: boolean) => {
    transitSound.setSoundEnabled(enabled);
    setIsSoundEnabledState(enabled);
  }, []);

  const setIsVoiceEnabled = useCallback((enabled: boolean) => {
    transitSound.setVoiceEnabled(enabled);
    setIsVoiceEnabledState(enabled);
  }, []);

  // About modal
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const notify = useCallback((type: ToastNotification['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Update liveTraffic whenever graph edges change
  useEffect(() => {
    setLiveTraffic(prev => {
      const next = { ...prev };
      graph.edges.forEach(e => {
        if (!next[e.id]) {
          next[e.id] = {
            edgeId: e.id,
            congestion: 'low',
            speedMultiplier: 1.0,
            delayMinutes: 0,
            currentSpeedKmH: 50,
            isIncident: false,
            lastUpdated: Date.now()
          };
        }
      });
      return next;
    });
  }, [graph.edges]);

  // Real-Time Traffic Telemetry Streaming Effect
  useEffect(() => {
    if (!isLiveTrafficActive || !settings.liveTrafficEnabled) return;

    const intervalMs = Math.max(2000, (settings.liveTrafficIntervalSeconds || 4) * 1000);
    const timer = setInterval(() => {
      setTelemetryTicks(t => t + 1);

      setLiveTraffic(prev => {
        const next = { ...prev };
        const edgeIds = Object.keys(next);
        if (edgeIds.length === 0) return prev;

        // Pick 1-2 random edges to fluctuate traffic slightly
        const countToUpdate = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < countToUpdate; i++) {
          const randomEdgeId = edgeIds[Math.floor(Math.random() * edgeIds.length)];
          const current = next[randomEdgeId];
          if (!current || current.isIncident) continue;

          const speedVariance = (Math.random() * 0.2 - 0.1);
          let newMultiplier = Math.min(1.25, Math.max(0.4, (current.speedMultiplier || 1.0) + speedVariance));
          newMultiplier = Math.round(newMultiplier * 100) / 100;

          let newCongestion: CongestionLevel = 'low';
          let delayMins = 0;
          const speedKmH = Math.round(55 * newMultiplier);

          if (newMultiplier <= 0.55) {
            newCongestion = 'severe';
            delayMins = Math.floor(Math.random() * 8) + 8;
          } else if (newMultiplier <= 0.75) {
            newCongestion = 'heavy';
            delayMins = Math.floor(Math.random() * 5) + 3;
          } else if (newMultiplier <= 0.9) {
            newCongestion = 'moderate';
            delayMins = Math.floor(Math.random() * 3) + 1;
          }

          next[randomEdgeId] = {
            ...current,
            congestion: newCongestion,
            speedMultiplier: newMultiplier,
            delayMinutes: delayMins,
            currentSpeedKmH: speedKmH,
            lastUpdated: Date.now()
          };
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isLiveTrafficActive, settings.liveTrafficEnabled, settings.liveTrafficIntervalSeconds]);

  // Real-Time Incident Generator
  const triggerRandomIncident = useCallback((
    customTitle?: string,
    customSeverity?: 'warning' | 'critical' | 'info'
  ) => {
    if (graph.edges.length === 0) return;

    const CAMPUS_INCIDENTS = [
      {
        title: 'Cafeteria Lunch Rush',
        desc: 'Dense student pedestrian crossing between lecture halls and food court.',
        delay: 3,
        severity: 'warning' as const,
        multiplier: 0.65,
        congestion: 'heavy' as const
      },
      {
        title: 'Gate 1 Highway Entry Queue',
        desc: 'Vehicular check and security verification at NH48 Main Arch entrance.',
        delay: 4,
        severity: 'warning' as const,
        multiplier: 0.55,
        congestion: 'heavy' as const
      },
      {
        title: 'Convocation & Auditorium Event',
        desc: 'Special shuttle movement and pathway diversion near Central Library.',
        delay: 5,
        severity: 'critical' as const,
        multiplier: 0.4,
        congestion: 'severe' as const
      },
      {
        title: 'Campus Shuttle Bay Boarding',
        desc: 'Peak-hour evening bus departures near University Transport Bay.',
        delay: 3,
        severity: 'warning' as const,
        multiplier: 0.7,
        congestion: 'moderate' as const
      }
    ];

    const incidentPreset = CAMPUS_INCIDENTS[Math.floor(Math.random() * CAMPUS_INCIDENTS.length)];
    const randomEdge = graph.edges[Math.floor(Math.random() * graph.edges.length)];
    const nodeMap = new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n]));
    const srcLabel = nodeMap.get(randomEdge.source)?.label || randomEdge.source;
    const tgtLabel = nodeMap.get(randomEdge.target)?.label || randomEdge.target;
    const locationLabel = `${srcLabel} ➔ ${tgtLabel}`;

    const title = customTitle || incidentPreset.title;
    const severity = customSeverity || incidentPreset.severity;
    const incId = `inc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

    const newIncident: LiveTrafficIncident = {
      id: incId,
      edgeId: randomEdge.id,
      title,
      severity,
      description: `${incidentPreset.desc} (at ${locationLabel})`,
      timestamp: Date.now(),
      resolved: false,
      delayImpactMinutes: incidentPreset.delay,
      locationLabel
    };

    setLiveIncidents(prev => [newIncident, ...prev.slice(0, 9)]);

    setLiveTraffic(prev => ({
      ...prev,
      [randomEdge.id]: {
        edgeId: randomEdge.id,
        congestion: incidentPreset.congestion,
        speedMultiplier: incidentPreset.multiplier,
        delayMinutes: incidentPreset.delay,
        currentSpeedKmH: Math.round(50 * incidentPreset.multiplier),
        isIncident: true,
        incidentTitle: title,
        incidentSeverity: severity,
        lastUpdated: Date.now()
      }
    }));

    notify(
      severity === 'critical' ? 'error' : 'warning',
      `Live Alert: ${title}`,
      `Impact at ${locationLabel} (+${incidentPreset.delay} mins delay).`
    );

    // Check if active route traverses this edge and auto-suggest reroute
    if (activeResult && activeResult.success && activeResult.path.length >= 2) {
      const activeEdges = new Set<string>();
      for (let i = 0; i < activeResult.path.length - 1; i++) {
        activeEdges.add(`${activeResult.path[i]}->${activeResult.path[i + 1]}`);
        if (!graph.directed) {
          activeEdges.add(`${activeResult.path[i + 1]}->${activeResult.path[i]}`);
        }
      }

      if (activeEdges.has(`${randomEdge.source}->${randomEdge.target}`) || activeEdges.has(`${randomEdge.target}->${randomEdge.source}`)) {
        const altResult = selectedAlgorithm === 'astar'
          ? runAStar(graph, activeResult.source, activeResult.destination, selectedWeightType, {
              ...liveTraffic,
              [randomEdge.id]: {
                edgeId: randomEdge.id,
                congestion: incidentPreset.congestion,
                speedMultiplier: incidentPreset.multiplier,
                delayMinutes: incidentPreset.delay,
                currentSpeedKmH: 20,
                isIncident: true,
                lastUpdated: Date.now()
              }
            })
          : runDijkstra(graph, activeResult.source, activeResult.destination, selectedWeightType, {
              ...liveTraffic,
              [randomEdge.id]: {
                edgeId: randomEdge.id,
                congestion: incidentPreset.congestion,
                speedMultiplier: incidentPreset.multiplier,
                delayMinutes: incidentPreset.delay,
                currentSpeedKmH: 20,
                isIncident: true,
                lastUpdated: Date.now()
              }
            });

        if (altResult.success) {
          setRerouteSuggestion({
            newResult: altResult,
            timeSavedMinutes: Math.max(2, incidentPreset.delay - 2),
            reason: `Incident at ${locationLabel} adds +${incidentPreset.delay}m delay.`
          });
        }
      }
    }
  }, [graph, activeResult, selectedAlgorithm, selectedWeightType, liveTraffic, notify]);

  const resolveIncident = useCallback((incidentId: string) => {
    setLiveIncidents(prev => {
      const target = prev.find(i => i.id === incidentId);
      if (!target) return prev;

      setLiveTraffic(current => {
        const edge = current[target.edgeId];
        if (!edge) return current;
        return {
          ...current,
          [target.edgeId]: {
            ...edge,
            congestion: 'low',
            speedMultiplier: 1.0,
            delayMinutes: 0,
            currentSpeedKmH: 52,
            isIncident: false,
            incidentTitle: undefined,
            lastUpdated: Date.now()
          }
        };
      });

      return prev.filter(i => i.id !== incidentId);
    });

    notify('success', 'Traffic Incident Cleared', 'Roadway returned to normal operating speeds.');
    setRerouteSuggestion(null);
  }, [notify]);

  const clearAllIncidents = useCallback(() => {
    setLiveIncidents([]);
    setLiveTraffic(prev => {
      const next: Record<string, LiveTrafficEdgeState> = {};
      Object.keys(prev).forEach(key => {
        next[key] = {
          edgeId: key,
          congestion: 'low',
          speedMultiplier: 1.0,
          delayMinutes: 0,
          currentSpeedKmH: 50,
          isIncident: false,
          lastUpdated: Date.now()
        };
      });
      return next;
    });
    setRerouteSuggestion(null);
    notify('info', 'All Incidents Cleared', 'City road network reset to smooth flow.');
  }, [notify]);

  const updateEdgeTraffic = useCallback((edgeId: string, updates: Partial<LiveTrafficEdgeState>) => {
    setLiveTraffic(prev => {
      const current = prev[edgeId] || {
        edgeId,
        congestion: 'low',
        speedMultiplier: 1.0,
        delayMinutes: 0,
        currentSpeedKmH: 50,
        isIncident: false,
        lastUpdated: Date.now()
      };
      return {
        ...prev,
        [edgeId]: {
          ...current,
          ...updates,
          lastUpdated: Date.now()
        }
      };
    });
  }, []);

  const applyRerouteSuggestion = useCallback(() => {
    if (!rerouteSuggestion) return;
    setActiveResult(rerouteSuggestion.newResult);
    setRerouteSuggestion(null);
    notify('success', 'Alternate Route Applied', 'Switched navigation to optimal congestion-avoiding path.');
  }, [rerouteSuggestion, notify]);

  const dismissRerouteSuggestion = useCallback(() => {
    setRerouteSuggestion(null);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(graph));
    } catch {
      // Ignore
    }
  }, [graph]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOL_COUNT_KEY, booleanEvaluationsCount.toString());
    } catch {
      // Ignore
    }
  }, [booleanEvaluationsCount]);

  // Graph Manipulations
  const addNode = useCallback((nodeData: Omit<GraphNode, 'id'> & { id?: string }): string => {
    const id = nodeData.id && nodeData.id.trim() !== ''
      ? nodeData.id.toLowerCase().replace(/[^a-z0-9_]/g, '')
      : `node_${Date.now()}`;

    if (graph.nodes.some(n => n.id === id)) {
      notify('error', 'Duplicate Node ID', `A location with ID "${id}" already exists.`);
      return '';
    }

    const newNode: GraphNode = {
      id,
      label: nodeData.label || id,
      x: nodeData.x ?? Math.floor(Math.random() * 400 + 100),
      y: nodeData.y ?? Math.floor(Math.random() * 400 + 100),
      heuristic: nodeData.heuristic ?? 0
    };

    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));

    notify('success', 'Location Added', `Added "${newNode.label}" to the graph.`);
    return id;
  }, [graph.nodes, notify]);

  const updateNode = useCallback((id: string, updates: Partial<GraphNode>) => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === id ? { ...n, ...updates } : n))
    }));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
      edges: prev.edges.filter(e => e.source !== id && e.target !== id)
    }));

    if (selectedSource === id) setSelectedSource('');
    if (selectedDestination === id) setSelectedDestination('');
    if (activeResult && (activeResult.source === id || activeResult.destination === id)) {
      setActiveResult(null);
    }

    notify('info', 'Location Deleted', `Removed node and all connected edges.`);
  }, [selectedSource, selectedDestination, activeResult, notify]);

  const addEdge = useCallback((edgeData: Omit<GraphEdge, 'id'> & { id?: string }): string => {
    if (edgeData.source === edgeData.target) {
      notify('error', 'Invalid Connection', 'Cannot create self-loop edge on the same location.');
      return '';
    }

    const exists = graph.edges.some(
      e =>
        (e.source === edgeData.source && e.target === edgeData.target) ||
        (!graph.directed && e.source === edgeData.target && e.target === edgeData.source)
    );

    if (exists) {
      notify('error', 'Edge Exists', 'A connection between these two locations already exists.');
      return '';
    }

    const id = edgeData.id && edgeData.id.trim() !== '' ? edgeData.id : `e_${Date.now()}`;
    const newEdge: GraphEdge = {
      id,
      source: edgeData.source,
      target: edgeData.target,
      weight: Math.max(1, edgeData.weight || 1),
      travelTime: edgeData.travelTime,
      customWeight: edgeData.customWeight,
      directed: edgeData.directed
    };

    setGraph(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge]
    }));

    setLiveTraffic(prev => ({
      ...prev,
      [id]: {
        edgeId: id,
        congestion: 'low',
        speedMultiplier: 1.0,
        delayMinutes: 0,
        currentSpeedKmH: 50,
        isIncident: false,
        lastUpdated: Date.now()
      }
    }));

    notify('success', 'Route Connected', `Roadway created with weight ${newEdge.weight}.`);
    return id;
  }, [graph.edges, graph.directed, notify]);

  const updateEdge = useCallback((id: string, updates: Partial<GraphEdge>) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.map(e => (e.id === id ? { ...e, ...updates } : e))
    }));
  }, []);

  const deleteEdge = useCallback((id: string) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== id)
    }));
    notify('info', 'Roadway Removed', 'Edge connection deleted from graph.');
  }, [notify]);

  const toggleGraphDirected = useCallback(() => {
    setGraph(prev => ({
      ...prev,
      directed: !prev.directed
    }));
    notify('info', 'Network Topology Changed', `Graph is now ${!graph.directed ? 'Directed' : 'Undirected'}.`);
  }, [graph.directed, notify]);

  const resetDemoGraph = useCallback(() => {
    setGraph(INITIAL_GRAPH);
    setLiveTraffic(buildInitialTraffic(INITIAL_GRAPH.edges));
    setLiveIncidents(INITIAL_INCIDENTS);
    setActiveResult(null);
    setVehicleDriveState(INITIAL_DRIVE_STATE);
    notify('success', 'Demo Graph Restored', 'Chennai Smart City baseline graph reset.');
  }, [notify]);

  const clearGraph = useCallback(() => {
    setGraph({ nodes: [], edges: [], directed: false });
    setLiveTraffic({});
    setLiveIncidents([]);
    setActiveResult(null);
    setVehicleDriveState(INITIAL_DRIVE_STATE);
    notify('warning', 'Graph Cleared', 'All locations and roadways have been removed.');
  }, [notify]);

  // Route Calculation with Live Traffic Integration
  const calculateRoute = useCallback((
    srcId?: string,
    dstId?: string,
    algo?: AlgorithmType,
    weightType?: WeightType
  ): AlgorithmResult => {
    const sId = srcId || selectedSource;
    const dId = dstId || selectedDestination;
    const algorithm = algo || selectedAlgorithm;
    const wType = weightType || selectedWeightType;

    const nodeMap = new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n]));
    const sNode = nodeMap.get(sId);
    const dNode = nodeMap.get(dId);

    if (!sId || !dId || !sNode || !dNode) {
      notify('error', 'Invalid Selection', 'Please select both a valid source and destination.');
      const errRes: AlgorithmResult = {
        algorithm,
        source: sId,
        destination: dId,
        path: [],
        distance: Infinity,
        nodesVisited: [],
        totalVisitedCount: 0,
        executionTimeMs: 0,
        steps: [],
        allDistances: {},
        weightType: wType,
        success: false,
        errorMessage: 'Invalid source or destination selected.'
      };
      setActiveResult(errRes);
      return errRes;
    }

    if (sId === dId) {
      notify('warning', 'Same Location', 'If source and destination are the same, please select different locations.');
    }

    setIsCalculating(true);
    let result: AlgorithmResult;

    if (algorithm === 'astar') {
      result = runAStar(graph, sId, dId, wType, liveTraffic);
    } else {
      result = runDijkstra(graph, sId, dId, wType, liveTraffic);
    }

    setIsCalculating(false);

    if (result.success) {
      // Calculate vehicle specific travel time, fuel/electric cost and toll charges
      const isBike = selectedVehicle === 'bike';
      let totalDelayMins = 0;
      let tollTotal = 0;

      for (let i = 0; i < result.path.length - 1; i++) {
        const u = result.path[i];
        const v = result.path[i + 1];
        const edge = graph.edges.find(
          e => (e.source === u && e.target === v) || (!graph.directed && e.source === v && e.target === u)
        );
        if (edge) {
          const traffic = liveTraffic[edge.id];
          if (traffic && traffic.delayMinutes) {
            totalDelayMins += traffic.delayMinutes;
          }
          if (edge.customWeight && edge.customWeight > 0) {
            tollTotal += edge.customWeight;
          }
        }
      }

      // Bikes bypass 65% of traffic congestion; cars face full delay
      const effectiveDelay = isBike ? totalDelayMins * 0.35 : totalDelayMins;
      const baseSpeedKmH = isBike ? 42 : 36;
      const baseTravelTimeMins = (result.distance / baseSpeedKmH) * 60;
      const estimatedTravelTimeMinutes = Math.max(1, Math.round((baseTravelTimeMins + effectiveDelay) * 10) / 10);
      const tollCostINR = isBike ? 0 : tollTotal;
      // Fuel/transit cost: Bike ₹2.2/km, Car ₹7.8/km + tolls
      const estimatedCostINR = Math.round((result.distance * (isBike ? 2.2 : 7.8) + tollCostINR) * 10) / 10;

      result.vehicleMode = selectedVehicle;
      result.estimatedTravelTimeMinutes = estimatedTravelTimeMinutes;
      result.tollCostINR = tollCostINR;
      result.estimatedCostINR = estimatedCostINR;

      notify(
        'success',
        `${algorithm === 'astar' ? 'A*' : 'Dijkstra'} Completed (${isBike ? 'Bike 🏍️' : 'Car 🚗'})`,
        `Optimal route found: ${result.distance} km • ~${estimatedTravelTimeMinutes} mins • ₹${estimatedCostINR}.`
      );

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = `Today, ${timeStr}`;

      const historyItem: RouteHistoryItem = {
        id: `hist_${Date.now()}`,
        date: dateStr,
        timestamp: Date.now(),
        source: sId,
        sourceLabel: sNode.label,
        destination: dId,
        destinationLabel: dNode.label,
        algorithm,
        weightType: wType,
        path: result.path,
        pathLabels: result.path.map(id => nodeMap.get(id)?.label || id),
        distance: result.distance,
        nodesVisited: result.totalVisitedCount,
        executionTimeMs: result.executionTimeMs
      };

      setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
    } else {
      notify('error', 'No Path Found', result.errorMessage || 'No route exists between the selected locations.');
    }

    setActiveResult(result);
    return result;
  }, [selectedSource, selectedDestination, selectedAlgorithm, selectedWeightType, selectedVehicle, graph, liveTraffic, notify]);

  // Automatically pre-calculate default Poonamallee to Saveetha Medical College route on initial launch
  useEffect(() => {
    if (!activeResult && graph.nodes.some(n => n.id === 'poonamallee') && graph.nodes.some(n => n.id === 'medical_hospital')) {
      calculateRoute('poonamallee', 'medical_hospital', 'astar', 'distance');
    }
  }, []); // run once on mount

  const clearActiveRoute = useCallback(() => {
    setActiveResult(null);
    setVehicleDriveState(INITIAL_DRIVE_STATE);
  }, []);

  // REAL-TIME GPS VEHICLE SIMULATION ENGINE
  const startDrivingSimulation = useCallback((customResult?: AlgorithmResult) => {
    const route = customResult || activeResult;
    if (!route || !route.success || route.path.length < 2) {
      notify('warning', 'No Route to Drive', 'Please compute an active route before starting the real-time simulation.');
      return;
    }

    const nodeMap = new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n]));
    const firstNode = nodeMap.get(route.path[0]);
    const secondNode = nodeMap.get(route.path[1]);

    if (!firstNode || !secondNode) return;

    const angle = Math.atan2(secondNode.y - firstNode.y, secondNode.x - firstNode.x) * (180 / Math.PI);
    const isBike = selectedVehicle === 'bike';
    const driveSpeed = isBike ? 48 : 38;

    // Reset sound stop tracker and play departure stop chime
    lastAnnouncedStopRef.current = 0;
    if (firstNode.id === 'irungattukottai') {
      transitSound.playTollPlazaBeep();
    } else {
      transitSound.playStopArrival(firstNode.label, selectedVehicle, false);
    }

    setVehicleDriveState({
      isActive: true,
      isPaused: false,
      progress: 0,
      currentEdgeIndex: 0,
      currentX: firstNode.x,
      currentY: firstNode.y,
      headingAngle: angle,
      speedKmH: driveSpeed,
      distanceRemainingKm: route.distance,
      timeRemainingSeconds: Math.round((route.distance * 60) / driveSpeed),
      currentStepInstruction: `Departing from ${firstNode.label} via ${isBike ? 'Bike' : 'Car'}`,
      nextStepInstruction: `Proceed toward ${secondNode.label}`,
      speedMultiplier: 2,
      vehicleMode: selectedVehicle
    });

    notify(
      'info',
      `${isBike ? 'Bike 🏍️' : 'Car 🚗'} Simulation Started`,
      `Driving from ${firstNode.label} to ${nodeMap.get(route.path[route.path.length - 1])?.label || 'Goal'}.`
    );
  }, [activeResult, graph.nodes, selectedVehicle, notify]);

  const pauseDrivingSimulation = useCallback(() => {
    setVehicleDriveState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeDrivingSimulation = useCallback(() => {
    setVehicleDriveState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const stopDrivingSimulation = useCallback(() => {
    lastAnnouncedStopRef.current = -1;
    setVehicleDriveState(INITIAL_DRIVE_STATE);
    if (driveAnimFrameRef.current) {
      cancelAnimationFrame(driveAnimFrameRef.current);
    }
  }, []);

  const setDriveSpeedMultiplier = useCallback((mult: number) => {
    setVehicleDriveState(prev => ({ ...prev, speedMultiplier: mult }));
  }, []);

  // Manual trigger to play stop sounds on demand
  const playStopSound = useCallback((stopIdOrName: string, isDest: boolean = false) => {
    const node = graph.nodes.find(n => n.id === stopIdOrName || n.label === stopIdOrName);
    const label = node ? node.label : stopIdOrName;
    const isToll = stopIdOrName === 'irungattukottai' || (node && node.id === 'irungattukottai');
    if (isToll) {
      transitSound.playTollPlazaBeep();
    } else if (isDest) {
      transitSound.playDestinationArrival(label);
    } else {
      transitSound.playStopArrival(label, selectedVehicle, false);
    }
  }, [graph.nodes, selectedVehicle]);

  // Animation frame loop for driving simulation
  useEffect(() => {
    if (!vehicleDriveState.isActive || vehicleDriveState.isPaused || !activeResult || activeResult.path.length < 2) {
      return;
    }

    const nodeMap = new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n]));
    const pathNodes = activeResult.path.map(id => nodeMap.get(id)).filter(Boolean) as GraphNode[];

    if (pathNodes.length < 2) return;

    const segmentLengths: number[] = [];
    let totalPathLength = 0;
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const dx = pathNodes[i + 1].x - pathNodes[i].x;
      const dy = pathNodes[i + 1].y - pathNodes[i].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      segmentLengths.push(len);
      totalPathLength += len;
    }

    let lastTime = performance.now();

    const animateDrive = (now: number) => {
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      setVehicleDriveState(prev => {
        if (!prev.isActive || prev.isPaused) return prev;

        const baseDuration = Math.max(12, totalPathLength / 35);
        const progressIncrement = (deltaSeconds / baseDuration) * prev.speedMultiplier;
        const newProgress = Math.min(1.0, prev.progress + progressIncrement);

        if (newProgress >= 1.0) {
          transitSound.playDestinationArrival(pathNodes[pathNodes.length - 1].label);
          notify('success', 'Destination Reached', `Completed transit to ${pathNodes[pathNodes.length - 1].label}.`);
          return {
            ...prev,
            progress: 1.0,
            isActive: false,
            speedKmH: 0,
            distanceRemainingKm: 0,
            timeRemainingSeconds: 0,
            currentStepInstruction: `Arrived at destination: ${pathNodes[pathNodes.length - 1].label}`
          };
        }

        const currentDist = newProgress * totalPathLength;
        let accumulated = 0;
        let segIdx = 0;
        let segProgress = 0;

        for (let i = 0; i < segmentLengths.length; i++) {
          if (accumulated + segmentLengths[i] >= currentDist) {
            segIdx = i;
            segProgress = (currentDist - accumulated) / segmentLengths[i];
            break;
          }
          accumulated += segmentLengths[i];
        }

        // Trigger sound effects for every stop passed along the corridor
        if (segIdx !== lastAnnouncedStopRef.current && segIdx < pathNodes.length) {
          lastAnnouncedStopRef.current = segIdx;
          const stopNode = pathNodes[segIdx];
          if (stopNode) {
            if (stopNode.id === 'irungattukottai') {
              transitSound.playTollPlazaBeep();
            } else {
              transitSound.playStopArrival(stopNode.label, selectedVehicle, false);
            }
          }
        }

        const pA = pathNodes[segIdx];
        const pB = pathNodes[segIdx + 1];

        const curX = pA.x + segProgress * (pB.x - pA.x);
        const curY = pA.y + segProgress * (pB.y - pA.y);
        const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x) * (180 / Math.PI);

        const edgeInGraph = graph.edges.find(
          e => (e.source === pA.id && e.target === pB.id) || (!graph.directed && e.source === pB.id && e.target === pA.id)
        );
        const liveEdge = edgeInGraph ? liveTraffic[edgeInGraph.id] : null;
        const liveSpeed = liveEdge ? liveEdge.currentSpeedKmH : 48;

        const remainingKm = Math.max(0, Math.round((1 - newProgress) * activeResult.distance * 10) / 10);
        const remainingSec = Math.round((remainingKm / (liveSpeed || 40)) * 3600);

        const instruction = `Driving on ${pA.label} ➔ ${pB.label}`;
        const nextInstruction = segIdx + 2 < pathNodes.length ? `Next turn: ${pathNodes[segIdx + 2].label}` : 'Arriving at destination';

        return {
          ...prev,
          progress: newProgress,
          currentEdgeIndex: segIdx,
          currentX: curX,
          currentY: curY,
          headingAngle: angle,
          speedKmH: Math.round(liveSpeed * (prev.speedMultiplier > 2 ? 1.4 : 1)),
          distanceRemainingKm: remainingKm,
          timeRemainingSeconds: remainingSec,
          currentStepInstruction: instruction,
          nextStepInstruction: nextInstruction
        };
      });

      driveAnimFrameRef.current = requestAnimationFrame(animateDrive);
    };

    driveAnimFrameRef.current = requestAnimationFrame(animateDrive);

    return () => {
      if (driveAnimFrameRef.current) {
        cancelAnimationFrame(driveAnimFrameRef.current);
      }
    };
  }, [vehicleDriveState.isActive, vehicleDriveState.isPaused, vehicleDriveState.speedMultiplier, activeResult, graph, liveTraffic, selectedVehicle, notify]);

  const addHistoryItem = useCallback((item: RouteHistoryItem) => {
    setHistory(prev => [item, ...prev]);
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    notify('info', 'History Item Removed', 'Record removed from route history.');
  }, [notify]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    notify('warning', 'History Cleared', 'All saved route calculation history was cleared.');
  }, [notify]);

  const incrementBooleanCount = useCallback(() => {
    setBooleanEvaluationsCount(prev => prev + 1);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    notify('success', 'Settings Updated', 'Preferences have been saved.');
  }, [notify]);

  const resetApplicationData = useCallback(() => {
    localStorage.removeItem(GRAPH_STORAGE_KEY);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(BOOL_COUNT_KEY);

    setGraph(INITIAL_GRAPH);
    setLiveTraffic(buildInitialTraffic(INITIAL_GRAPH.edges));
    setLiveIncidents(INITIAL_INCIDENTS);
    setHistory(INITIAL_HISTORY);
    setSettings(DEFAULT_SETTINGS);
    setBooleanEvaluationsCount(12);
    setActiveResult(null);
    setSelectedSource('poonamallee');
    setSelectedDestination('medical_hospital');
    setSelectedVehicle('car');
    setVehicleDriveState(INITIAL_DRIVE_STATE);

    notify('success', 'Application Reset', 'All application data has been restored to factory demo state.');
  }, [notify]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        graph,
        setGraph,
        addNode,
        updateNode,
        deleteNode,
        addEdge,
        updateEdge,
        deleteEdge,
        toggleGraphDirected,
        resetDemoGraph,
        clearGraph,
        selectedSource,
        setSelectedSource,
        selectedDestination,
        setSelectedDestination,
        selectedVehicle,
        setSelectedVehicle,
        selectedAlgorithm,
        setSelectedAlgorithm,
        selectedWeightType,
        setSelectedWeightType,
        activeResult,
        setActiveResult,
        isCalculating,
        calculateRoute,
        clearActiveRoute,
        liveTraffic,
        liveIncidents,
        isLiveTrafficActive,
        setIsLiveTrafficActive,
        triggerRandomIncident,
        resolveIncident,
        clearAllIncidents,
        updateEdgeTraffic,
        telemetryTicks,
        vehicleDriveState,
        startDrivingSimulation,
        pauseDrivingSimulation,
        resumeDrivingSimulation,
        stopDrivingSimulation,
        setDriveSpeedMultiplier,
        rerouteSuggestion,
        applyRerouteSuggestion,
        dismissRerouteSuggestion,
        isLiveTrafficDrawerOpen,
        setIsLiveTrafficDrawerOpen,
        history,
        addHistoryItem,
        deleteHistoryItem,
        clearHistory,
        booleanEvaluationsCount,
        incrementBooleanCount,
        settings,
        updateSettings,
        resetApplicationData,
        toasts,
        notifications: toasts,
        notify,
        dismissToast,
        dismissNotification: dismissToast,
        isAboutModalOpen,
        setIsAboutModalOpen,
        isSoundEnabled,
        setIsSoundEnabled,
        isVoiceEnabled,
        setIsVoiceEnabled,
        playStopSound
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
