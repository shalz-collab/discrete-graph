import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Compass,
  ArrowRight,
  Radio,
  AlertTriangle,
  Play,
  Pause,
  Square,
  FastForward,
  Navigation,
  CheckCircle2,
  Flame,
  Shuffle,
  Layers,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GraphNode } from '../types';
import { getEdgeWeight } from '../utils/graphAlgorithms';
import { SaveethaCampusMapOverlay } from './SaveethaCampusMapOverlay';

// Landmark emoji mapping for Saveetha University campus and urban nodes
const getNodeIcon = (id: string) => {
  switch (id) {
    case 'poonamallee':
      return '🛣️';
    case 'poonamallee_bypass':
      return '🌉';
    case 'nazarathpet':
      return '🚦';
    case 'chembarambakkam':
      return '🌊';
    case 'chembarambakkam_service':
      return '🚲';
    case 'kuthambakkam':
      return '🚌';
    case 'irungattukottai':
      return '🛑';
    case 'mevalurkuppam':
      return '🏭';
    case 'thandalam_junction':
      return '📍';
    case 'saveetha_gate1':
    case 'nh48_gate1':
      return '⛩️';
    case 'medical_hospital':
      return '🏥';
    case 'dental_college':
      return '🦷';
    case 'cse_tech_park':
      return '💻';
    case 'sse_engineering':
      return '⚙️';
    case 'central_library':
      return '📚';
    case 'food_court':
      return '🍔';
    case 'admin_senate':
      return '🏛️';
    case 'sports_stadium':
    case 'sports_complex':
      return '⚽';
    case 'hostels':
    case 'hostels_residence':
      return '🏢';
    case 'transport_bay':
      return '🚌';
    case 'research_park':
      return '🔬';
    default:
      return '📍';
  }
};

interface GraphCanvasProps {
  height?: string | number;
  highlightPath?: string[];
  visitedNodes?: string[];
  sourceId?: string;
  destinationId?: string;
  interactive?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  showDetailsOverlay?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  height = 500,
  highlightPath = [],
  visitedNodes = [],
  sourceId,
  destinationId,
  interactive = true,
  onNodeClick,
  showDetailsOverlay = true
}) => {
  const {
    graph,
    updateNode,
    selectedSource,
    selectedDestination,
    setSelectedSource,
    setSelectedDestination,
    selectedWeightType,
    settings,
    liveTraffic,
    liveIncidents,
    isLiveTrafficActive,
    setIsLiveTrafficActive,
    triggerRandomIncident,
    vehicleDriveState,
    startDrivingSimulation,
    pauseDrivingSimulation,
    resumeDrivingSimulation,
    stopDrivingSimulation,
    setDriveSpeedMultiplier,
    rerouteSuggestion,
    applyRerouteSuggestion,
    dismissRerouteSuggestion,
    activeResult,
    telemetryTicks
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Transform state for pan and zoom
  const [transform, setTransform] = useState<{ x: number; y: number; scale: number }>({
    x: 0,
    y: 0,
    scale: 1
  });

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan canvas state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hovered node/edge
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Campus Architectural Map vs Topological Graph mode
  const [canvasMode, setCanvasMode] = useState<'campus' | 'graph'>('campus');

  // Effective source & destination
  const effectiveSource = sourceId !== undefined ? sourceId : selectedSource;
  const effectiveDestination = destinationId !== undefined ? destinationId : selectedDestination;

  // Path edges set for fast lookup
  const pathEdgeSet = useMemo(() => {
    const set = new Set<string>();
    if (!highlightPath || highlightPath.length < 2) return set;

    for (let i = 0; i < highlightPath.length - 1; i++) {
      const u = highlightPath[i];
      const v = highlightPath[i + 1];
      set.add(`${u}->${v}`);
      if (!graph.directed) {
        set.add(`${v}->${u}`);
      }
    }
    return set;
  }, [highlightPath, graph.directed]);

  // Fit graph to view
  const fitGraph = useCallback(() => {
    if (!containerRef.current || graph.nodes.length === 0) return;
    const { clientWidth, clientHeight } = containerRef.current;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const node of graph.nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }

    const padding = 80;
    const graphWidth = Math.max(100, maxX - minX + padding * 2);
    const graphHeight = Math.max(100, maxY - minY + padding * 2);

    const scaleX = clientWidth / graphWidth;
    const scaleY = clientHeight / graphHeight;
    const scale = Math.min(1.4, Math.max(0.4, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setTransform({
      x: clientWidth / 2 - centerX * scale,
      y: clientHeight / 2 - centerY * scale,
      scale
    });
  }, [graph.nodes]);

  // Auto-fit on initial render or graph change or height change
  useEffect(() => {
    const timer = setTimeout(() => {
      fitGraph();
    }, 60);
    return () => clearTimeout(timer);
  }, [graph.nodes.length, height, fitGraph]);

  // Responsive container observer for Big Page modal and layout resize
  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return;
    let timeoutId: NodeJS.Timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fitGraph();
      }, 80);
    });
    observer.observe(containerRef.current);
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [fitGraph]);

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setTransform(prev => {
      const newScale = Math.min(2.5, Math.max(0.3, prev.scale + delta));
      return { ...prev, scale: newScale };
    });
  };

  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
    fitGraph();
  };

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }));
      return;
    }

    if (draggingNodeId && interactive) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const rawX = (e.clientX - svgRect.left - transform.x) / transform.scale;
      const rawY = (e.clientY - svgRect.top - transform.y) / transform.scale;

      let newX = rawX - dragOffset.x;
      let newY = rawY - dragOffset.y;

      if (settings.snapToGrid) {
        const grid = settings.gridSize || 20;
        newX = Math.round(newX / grid) * grid;
        newY = Math.round(newY / grid) * grid;
      }

      updateNode(draggingNodeId, {
        x: Math.round(newX),
        y: Math.round(newY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node Drag start
  const handleNodeMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    if (!interactive) return;
    e.stopPropagation();

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const rawX = (e.clientX - svgRect.left - transform.x) / transform.scale;
    const rawY = (e.clientY - svgRect.top - transform.y) / transform.scale;

    setDragOffset({
      x: rawX - node.x,
      y: rawY - node.y
    });
    setDraggingNodeId(node.id);
  };

  // Node click internal handler
  const handleNodeClickInternal = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    if (onNodeClick) {
      onNodeClick(node);
      return;
    }

    if (!selectedSource || (selectedSource && selectedDestination)) {
      setSelectedSource(node.id);
      setSelectedDestination('');
    } else if (selectedSource && !selectedDestination) {
      if (selectedSource === node.id) {
        setSelectedSource('');
      } else {
        setSelectedDestination(node.id);
      }
    }
  };

  const nodeMap = useMemo(() => {
    return new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n]));
  }, [graph.nodes]);

  const weightUnit = selectedWeightType === 'travelTime' ? 'm' : selectedWeightType === 'customWeight' ? 'u' : 'km';

  return (
    <div
      ref={containerRef}
      id="graph-canvas-container"
      className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 select-none shadow-inner"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <svg
        ref={svgRef}
        id="graph-canvas-svg"
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Subtle Canvas Grid Background */}
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.75" strokeOpacity="0.4" />
          </pattern>
          <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#475569" fillOpacity="0.4" />
          </pattern>

          {/* Arrow markers for directed edges */}
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX="24"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
          </marker>
          <marker
            id="arrow-highlight"
            viewBox="0 0 10 10"
            refX="24"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#0284c7" />
          </marker>
        </defs>

        <rect id="canvas-bg" width="100%" height="100%" fill="url(#grid-pattern)" />
        <rect width="100%" height="100%" fill="url(#grid-dots)" pointerEvents="none" />

        {/* World Transform Group */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* SAVEETHA UNIVERSITY CAMPUS ARCHITECTURAL MAP OVERLAY */}
          {canvasMode === 'campus' && <SaveethaCampusMapOverlay isDarkMode={settings.theme !== 'light'} />}

          {/* EDGES LAYER */}
          <g id="edges-layer">
            {graph.edges.map(edge => {
              const u = nodeMap.get(edge.source);
              const v = nodeMap.get(edge.target);
              if (!u || !v) return null;

              const isPath = pathEdgeSet.has(`${edge.source}->${edge.target}`) ||
                pathEdgeSet.has(`${edge.target}->${edge.source}`);
              
              const isDirected = edge.directed !== undefined ? edge.directed : graph.directed;
              const weightVal = getEdgeWeight(edge, selectedWeightType, liveTraffic);
              const trafficState = liveTraffic[edge.id];
              const isHovered = hoveredEdgeId === edge.id;

              // Traffic Congestion Color Logic
              let trafficStroke = '#475569';
              let trafficGlow = 'none';

              if (trafficState) {
                if (trafficState.congestion === 'severe' || trafficState.isIncident) {
                  trafficStroke = '#ef4444'; // Red alert
                  trafficGlow = '#ef4444';
                } else if (trafficState.congestion === 'heavy') {
                  trafficStroke = '#f97316'; // Orange
                } else if (trafficState.congestion === 'moderate') {
                  trafficStroke = '#eab308'; // Yellow
                } else if (trafficState.congestion === 'low') {
                  trafficStroke = isPath ? '#22d3ee' : '#334155';
                }
              }

              if (isPath) {
                trafficStroke = trafficState?.congestion === 'severe' ? '#f43f5e' : '#22d3ee';
              }

              // Calculate midpoint for weight badge
              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              // Perpendicular offset for badge readability
              const dx = v.x - u.x;
              const dy = v.y - u.y;
              const angle = Math.atan2(dy, dx);
              const badgeOffsetX = -Math.sin(angle) * 15;
              const badgeOffsetY = Math.cos(angle) * 15;

              return (
                <g
                  key={edge.id}
                  id={`edge-group-${edge.id}`}
                  onMouseEnter={() => setHoveredEdgeId(edge.id)}
                  onMouseLeave={() => setHoveredEdgeId(null)}
                >
                  {/* Outer Glow for Path */}
                  {isPath && (
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke={trafficState?.congestion === 'severe' ? '#ef4444' : '#06b6d4'}
                      strokeWidth="9"
                      strokeOpacity="0.45"
                      filter="url(#path-glow)"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Traffic Congestion Highlight Underlay */}
                  {trafficState && trafficState.congestion !== 'low' && !isPath && (
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke={trafficStroke}
                      strokeWidth="5"
                      strokeOpacity="0.35"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Main Line */}
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={trafficStroke}
                    strokeWidth={isPath ? 3.5 : (isHovered ? 3 : 2)}
                    strokeDasharray={trafficState?.congestion === 'severe' ? '6 3' : 'none'}
                    markerEnd={isDirected ? (isPath ? 'url(#arrow-highlight)' : 'url(#arrow-default)') : undefined}
                    className="transition-colors duration-200"
                  />

                  {/* Real-time incident hazard marker */}
                  {trafficState?.isIncident && (
                    <g transform={`translate(${midX}, ${midY})`} className="cursor-pointer">
                      <circle r="12" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" className="animate-ping opacity-75" />
                      <circle r="10" fill="#991b1b" stroke="#f87171" strokeWidth="1" />
                      <text textAnchor="middle" dy="3.5" fill="#fef08a" fontSize="10" fontWeight="bold">!</text>
                    </g>
                  )}

                  {/* Weight & Live Telemetry Label Pill */}
                  <g
                    transform={`translate(${midX + badgeOffsetX}, ${midY + badgeOffsetY})`}
                    className="cursor-pointer"
                  >
                    <rect
                      x={trafficState && trafficState.delayMinutes > 0 ? "-28" : "-20"}
                      y="-11"
                      width={trafficState && trafficState.delayMinutes > 0 ? "56" : "40"}
                      height="22"
                      rx="6"
                      fill={isPath ? '#083344' : (trafficState?.congestion === 'severe' ? '#450a0a' : '#0f172a')}
                      stroke={isPath ? '#06b6d4' : (trafficState?.congestion === 'severe' ? '#ef4444' : '#334155')}
                      strokeWidth={isPath ? 1.5 : 1}
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill={
                        isPath
                          ? '#38bdf8'
                          : trafficState?.congestion === 'severe'
                          ? '#fca5a5'
                          : trafficState?.congestion === 'heavy'
                          ? '#fdba74'
                          : '#94a3b8'
                      }
                      fontSize="10.5"
                      fontFamily="Fira Code, monospace"
                      fontWeight="600"
                    >
                      {weightVal}{weightUnit}
                      {trafficState && trafficState.delayMinutes > 0 ? ` +${trafficState.delayMinutes}m` : ''}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* NODES LAYER */}
          <g id="nodes-layer">
            {graph.nodes.map(node => {
              const isSource = effectiveSource === node.id;
              const isDestination = effectiveDestination === node.id;
              const isPath = highlightPath.includes(node.id);
              const isVisited = visitedNodes.includes(node.id);
              const isHovered = hoveredNodeId === node.id;

              let circleColor = '#1e293b'; // slate-800
              let strokeColor = '#475569'; // slate-600
              const textColor = '#f8fafc';
              let badgeText = '';
              let badgeBg = '';

              if (isSource) {
                circleColor = '#065f46'; // emerald-800
                strokeColor = '#10b981'; // emerald-500
                badgeText = 'START';
                badgeBg = '#059669';
              } else if (isDestination) {
                circleColor = '#881337'; // rose-900
                strokeColor = '#f43f5e'; // rose-500
                badgeText = 'GOAL';
                badgeBg = '#e11d48';
              } else if (isPath) {
                circleColor = '#0c4a6e'; // sky-900
                strokeColor = '#38bdf8'; // sky-400
              } else if (isVisited) {
                circleColor = '#713f12'; // amber-900
                strokeColor = '#f59e0b'; // amber-500
              }

              return (
                <g
                  key={node.id}
                  id={`node-group-${node.id}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onMouseDown={e => handleNodeMouseDown(e, node)}
                  onClick={e => handleNodeClickInternal(e, node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Highlight Ring - Pulsing active indicator */}
                  {(isSource || isDestination || isPath || isHovered) && (
                    <circle
                      r={isSource || isDestination ? 34 : 29}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSource || isDestination ? 3 : 2}
                      strokeDasharray={isSource || isDestination ? '5 3' : 'none'}
                      opacity={0.95}
                      className={isSource || isDestination ? 'animate-pulse' : ''}
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={isSource || isDestination ? 28 : 24}
                    fill={circleColor}
                    stroke={strokeColor}
                    strokeWidth={isPath || isSource || isDestination ? 3 : 2}
                    className="transition-all duration-150 drop-shadow-md"
                  />

                  {/* Landmark Emoji Icon */}
                  <text
                    textAnchor="middle"
                    dy="7"
                    fontSize={isSource || isDestination ? '16' : '14'}
                    pointerEvents="none"
                  >
                    {getNodeIcon(node.id)}
                  </text>

                  {/* High Contrast Label Box Below Node */}
                  <g transform="translate(0, 36)" pointerEvents="none">
                    <rect
                      x={-(node.label.length * 4.3 + 12)}
                      y="-12"
                      width={node.label.length * 8.6 + 24}
                      height="22"
                      rx="6"
                      fill="#020617"
                      stroke={isSource ? '#10b981' : isDestination ? '#f43f5e' : isPath ? '#38bdf8' : '#334155'}
                      strokeWidth={isSource || isDestination || isPath ? 1.5 : 1}
                      fillOpacity="0.95"
                      filter="drop-shadow(0 2px 5px rgba(0,0,0,0.6))"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fill={isSource ? '#a7f3d0' : isDestination ? '#fecdd3' : isPath ? '#bae6fd' : '#f8fafc'}
                      fontSize="11.5"
                      fontWeight="700"
                    >
                      {node.label}
                    </text>
                  </g>

                  {/* Role Badge (START / GOAL) */}
                  {badgeText && (
                    <g transform="translate(0, -32)" pointerEvents="none">
                      <rect
                        x="-30"
                        y="-9"
                        width="60"
                        height="18"
                        rx="5"
                        fill={badgeBg}
                        stroke="#ffffff"
                        strokeWidth="1"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
                      />
                      <text
                        textAnchor="middle"
                        dy="4.5"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="800"
                        letterSpacing="0.6"
                      >
                        {badgeText}
                      </text>
                    </g>
                  )}

                  {/* Coordinates Overlay if enabled */}
                  {settings.showCoordinates && (
                    <text
                      textAnchor="middle"
                      dy="56"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="Fira Code, monospace"
                      pointerEvents="none"
                    >
                      ({node.x}, {node.y})
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* REAL-TIME VEHICLE GPS SIMULATION MARKER (BIKE / CAR) */}
          {vehicleDriveState.isActive && (
            <g
              id="vehicle-gps-marker"
              transform={`translate(${vehicleDriveState.currentX}, ${vehicleDriveState.currentY})`}
              pointerEvents="none"
            >
              {/* Outer Accuracy Ring */}
              <circle
                r="24"
                fill={vehicleDriveState.vehicleMode === 'bike' ? '#10b981' : '#0284c7'}
                fillOpacity="0.22"
                stroke={vehicleDriveState.vehicleMode === 'bike' ? '#34d399' : '#38bdf8'}
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Directional Heading Cone Pointer */}
              <g transform={`rotate(${vehicleDriveState.headingAngle})`}>
                <polygon
                  points="18,-7 34,0 18,7"
                  fill={vehicleDriveState.vehicleMode === 'bike' ? '#059669' : '#0284c7'}
                  stroke={vehicleDriveState.vehicleMode === 'bike' ? '#6ee7b7' : '#38bdf8'}
                  strokeWidth="1"
                />
              </g>

              {/* Vehicle Body with Heading Rotation */}
              <g transform={`rotate(${vehicleDriveState.headingAngle})`}>
                {vehicleDriveState.vehicleMode === 'bike' ? (
                  /* MOTORBIKE CHASSIS & RIDER */
                  <g id="bike-simulation-model">
                    {/* Headlight beam */}
                    <polygon points="12,-4 38,-14 38,14 12,4" fill="#fef08a" fillOpacity="0.35" />
                    {/* Rear and Front Tyres */}
                    <rect x="-14" y="-3" width="7" height="6" rx="2" fill="#020617" stroke="#94a3b8" strokeWidth="1" />
                    <rect x="9" y="-3" width="7" height="6" rx="2" fill="#020617" stroke="#94a3b8" strokeWidth="1" />
                    {/* Bike Body frame */}
                    <path d="M -11 0 L 11 0" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="4.5" fill="#047857" stroke="#34d399" strokeWidth="1" />
                    {/* Handlebars */}
                    <line x1="8" y1="-8" x2="8" y2="8" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Rider with Helmet */}
                    <circle cx="-3" cy="0" r="4" fill="#10b981" stroke="#f8fafc" strokeWidth="1.2" />
                    <circle cx="12" cy="0" r="2" fill="#fef08a" />
                  </g>
                ) : (
                  /* CAR CHASSIS */
                  <g id="car-simulation-model">
                    {/* Dual Headlight Beams */}
                    <polygon points="16,-7 44,-16 44,0 16,-4" fill="#fef08a" fillOpacity="0.25" />
                    <polygon points="16,7 44,16 44,0 16,4" fill="#fef08a" fillOpacity="0.25" />
                    {/* Car Body */}
                    <rect
                      x="-16"
                      y="-11"
                      width="32"
                      height="22"
                      rx="5"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                    {/* Roof & Windshields */}
                    <rect x="-11" y="-8" width="5" height="16" rx="1" fill="#38bdf8" opacity="0.8" />
                    <rect x="-4" y="-8" width="10" height="16" rx="1" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.8" />
                    <rect x="7" y="-8" width="5" height="16" rx="1" fill="#38bdf8" opacity="0.9" />
                    {/* Side Mirrors */}
                    <rect x="4" y="-14" width="3" height="3" rx="1" fill="#38bdf8" />
                    <rect x="4" y="11" width="3" height="3" rx="1" fill="#38bdf8" />
                    {/* Headlights */}
                    <circle cx="16" cy="-6" r="2" fill="#fef08a" />
                    <circle cx="16" cy="6" r="2" fill="#fef08a" />
                  </g>
                )}
              </g>

              {/* Live Speed / Status Badge above vehicle */}
              <g transform="translate(0, -28)">
                <rect
                  x="-55"
                  y="-11"
                  width="110"
                  height="22"
                  rx="5"
                  fill="#020617"
                  stroke={vehicleDriveState.vehicleMode === 'bike' ? '#10b981' : '#0284c7'}
                  strokeWidth="1.5"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill={vehicleDriveState.vehicleMode === 'bike' ? '#6ee7b7' : '#38bdf8'}
                  fontSize="9.5"
                  fontFamily="Fira Code, monospace"
                  fontWeight="700"
                >
                  {vehicleDriveState.vehicleMode === 'bike' ? '🏍️ BIKE' : '🚗 CAR'} • {vehicleDriveState.speedKmH} km/h
                </text>
              </g>
            </g>
          )}
        </g>
      </svg>

      {/* TOP LEFT STATUS BADGES */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10">
        {/* Graph metric badge */}
        <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-cyan-400 shadow-md">
          <Compass className="w-3.5 h-3.5" />
          <span>|V|={graph.nodes.length}</span>
          <span className="text-slate-600">•</span>
          <span>|E|={graph.edges.length}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">{graph.directed ? 'Directed' : 'Undirected'}</span>
        </div>

        {/* Real-time streaming status pill */}
        <button
          id="btn-toggle-live-traffic-stream"
          onClick={() => setIsLiveTrafficActive(!isLiveTrafficActive)}
          title={isLiveTrafficActive ? 'Real-Time Streaming Active (Click to Pause)' : 'Telemetry Paused (Click to Resume)'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium backdrop-blur-md transition-all shadow-md ${
            isLiveTrafficActive
              ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
              : 'bg-slate-900/80 border-slate-700 text-slate-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLiveTrafficActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <Radio className="w-3 h-3" />
          <span>{isLiveTrafficActive ? 'Live Telemetry' : 'Telemetry Paused'}</span>
        </button>

        {/* Active Incidents Counter Badge */}
        {liveIncidents.length > 0 && (
          <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-700/60 text-rose-300 px-2.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md shadow-md animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{liveIncidents.length} Incident{liveIncidents.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* TOP RIGHT TOOLBAR & CONTROLS */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
        <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-lg">
          {/* Map Layer Mode Toggle */}
          <button
            id="btn-toggle-canvas-mode"
            onClick={() => setCanvasMode(canvasMode === 'campus' ? 'graph' : 'campus')}
            title="Toggle between Saveetha University Campus Map and Graph Topological View"
            className="p-1.5 px-2 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">{canvasMode === 'campus' ? 'Campus Map' : 'Graph View'}</span>
          </button>

          {/* Quick incident injector */}
          <button
            id="btn-canvas-simulate-incident"
            onClick={() => triggerRandomIncident()}
            title="Simulate Random Real-Time Incident"
            className="p-1.5 px-2 rounded-md bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 text-amber-300 hover:text-amber-200 text-xs flex items-center gap-1 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Add Incident</span>
          </button>

          {/* Start Driving Simulation Button */}
          {activeResult && activeResult.success && (
            <button
              id="btn-canvas-start-drive"
              onClick={() => {
                if (vehicleDriveState.isActive) {
                  stopDrivingSimulation();
                } else {
                  startDrivingSimulation();
                }
              }}
              title={vehicleDriveState.isActive ? 'Stop GPS Simulation' : 'Start Real-Time GPS Simulation Along Active Route'}
              className={`p-1.5 px-2 rounded-md border text-xs flex items-center gap-1 transition-colors ${
                vehicleDriveState.isActive
                  ? 'bg-rose-950/50 border-rose-700 text-rose-300 hover:bg-rose-900/60'
                  : 'bg-cyan-950/50 border-cyan-700 text-cyan-300 hover:bg-cyan-900/60'
              }`}
            >
              {vehicleDriveState.isActive ? (
                <>
                  <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span className="hidden sm:inline">Stop Drive</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span className="hidden sm:inline">Simulate GPS Drive</span>
                </>
              )}
            </button>
          )}

          <div className="w-px h-5 bg-slate-800 mx-0.5" />

          {/* Zoom & Fit buttons */}
          <button
            id="btn-canvas-zoom-in"
            onClick={() => handleZoom(0.15)}
            title="Zoom In"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-canvas-zoom-out"
            onClick={() => handleZoom(-0.15)}
            title="Zoom Out"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="btn-canvas-fit"
            onClick={fitGraph}
            title="Fit Graph to View"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            id="btn-canvas-reset"
            onClick={handleResetView}
            title="Reset Zoom/Pan"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DYNAMIC REROUTING NOTIFICATION BANNER */}
      {rerouteSuggestion && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 max-w-lg w-[92%] z-20 bg-slate-900/95 border border-amber-500/80 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-bounce-short">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Faster Dynamic Route Available
                </h4>
                <p className="text-xs text-slate-200 mt-0.5">
                  {rerouteSuggestion.reason} Avoid traffic and save ~{rerouteSuggestion.timeSavedMinutes} minutes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="btn-apply-reroute"
                onClick={applyRerouteSuggestion}
                className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md text-xs font-semibold shadow transition-all flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Reroute
              </button>
              <button
                id="btn-dismiss-reroute"
                onClick={dismissRerouteSuggestion}
                className="p-1 text-slate-400 hover:text-slate-200 rounded text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME DRIVING HUD OVERLAY (When Vehicle Simulation is Active) */}
      {vehicleDriveState.isActive && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-xl w-[94%] bg-slate-950/90 border border-cyan-500/50 rounded-xl p-3.5 shadow-2xl backdrop-blur-md z-20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Turn-by-Turn Instruction</div>
                <div className="text-sm font-semibold text-cyan-300 line-clamp-1">
                  {vehicleDriveState.currentStepInstruction}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {vehicleDriveState.nextStepInstruction}
                </div>
              </div>
            </div>

            {/* Metrics & Control Buttons */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">Remaining</div>
                <div className="text-sm font-mono font-bold text-white">
                  {vehicleDriveState.distanceRemainingKm} km • {Math.ceil(vehicleDriveState.timeRemainingSeconds / 60)}m
                </div>
              </div>

              {/* Simulation Play/Pause/Speed buttons */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {vehicleDriveState.isPaused ? (
                  <button
                    onClick={resumeDrivingSimulation}
                    title="Resume Drive"
                    className="p-1.5 rounded hover:bg-slate-800 text-emerald-400"
                  >
                    <Play className="w-4 h-4 fill-emerald-400" />
                  </button>
                ) : (
                  <button
                    onClick={pauseDrivingSimulation}
                    title="Pause Drive"
                    className="p-1.5 rounded hover:bg-slate-800 text-amber-400"
                  >
                    <Pause className="w-4 h-4 fill-amber-400" />
                  </button>
                )}

                <button
                  onClick={stopDrivingSimulation}
                  title="Stop Drive"
                  className="p-1.5 rounded hover:bg-slate-800 text-rose-400"
                >
                  <Square className="w-4 h-4 fill-rose-400" />
                </button>

                {/* Speed Multiplier toggle */}
                <button
                  onClick={() => {
                    const nextMult = vehicleDriveState.speedMultiplier === 1 ? 2 : vehicleDriveState.speedMultiplier === 2 ? 4 : 1;
                    setDriveSpeedMultiplier(nextMult);
                  }}
                  title="Cycle Simulation Speed Multiplier"
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 font-bold flex items-center gap-0.5"
                >
                  <FastForward className="w-3 h-3" />
                  <span>{vehicleDriveState.speedMultiplier}x</span>
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-150"
              style={{ width: `${Math.round(vehicleDriveState.progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* QUICK INSTRUCTION / STATUS OVERLAY (When vehicle is not driving) */}
      {showDetailsOverlay && !vehicleDriveState.isActive && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 shadow-md">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            {effectiveSource ? (nodeMap.get(effectiveSource)?.label || 'Source Set') : 'Click node for Source'}
          </span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="flex items-center gap-1 text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            {effectiveDestination ? (nodeMap.get(effectiveDestination)?.label || 'Dest Set') : 'Click node for Goal'}
          </span>
          <span className="hidden sm:inline-block text-slate-600">|</span>
          <span className="hidden sm:inline-block text-slate-400">Drag nodes to rearrange</span>
        </div>
      )}
    </div>
  );
};
