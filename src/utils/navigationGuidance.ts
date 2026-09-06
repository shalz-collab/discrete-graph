import { GraphData, GraphNode, TurnGuidanceStep } from '../types';
import { getLandmarkInfo } from '../data/landmarksData';

/**
 * Generates rich, educational, voice-ready turn-by-turn navigation instructions
 * for any calculated path in the Chennai-Thandalam transit network.
 */
export function generateTurnByTurnGuidance(
  path: string[],
  graph: GraphData,
  nodeMap: Map<string, GraphNode>
): TurnGuidanceStep[] {
  if (!path || path.length < 2) return [];

  const steps: TurnGuidanceStep[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];
    const fromNode = nodeMap.get(fromId);
    const toNode = nodeMap.get(toId);

    const fromLabel = fromNode ? fromNode.label : fromId;
    const toLabel = toNode ? toNode.label : toId;

    // Find edge connecting the two nodes
    const edge = graph.edges.find(
      e => (e.source === fromId && e.target === toId) || (!graph.directed && e.source === toId && e.target === fromId)
    );
    const dist = edge ? edge.weight : 1.0;

    const fromLandmark = getLandmarkInfo(fromId);
    const toLandmark = getLandmarkInfo(toId);

    let maneuver: TurnGuidanceStep['maneuver'] = 'straight';
    let instruction = '';
    let voiceText = '';
    let educationalTip = '';

    // Specialized instructions tailored for key Chennai - Poonamallee - Saveetha corridor
    if (i === 0) {
      maneuver = 'depart';
      instruction = `Depart from ${fromLabel}. Proceed west onto NH-48 Bengaluru Highway toward ${toLabel}.`;
      voiceText = `Departing from ${fromLabel.replace(/\(.*?\)/g, '')}. Proceed west on National Highway 48 toward ${toLabel.replace(/\(.*?\)/g, '')} for ${dist} kilometers.`;
      educationalTip = `Origin Departure: Graph root vertex with degree ${fromLandmark?.graphProperties.degree || 1}.`;
    } else if (i === path.length - 2) {
      maneuver = 'arrive';
      instruction = `Make the final turn at ${fromLabel} into ${toLabel}. You have reached your destination.`;
      voiceText = `In ${dist} kilometers, arrive at your final destination, ${toLabel.replace(/\(.*?\)/g, '')}. The hospital emergency entrance is on your right.`;
      educationalTip = `Destination Sink Node: 1,500-bed hospital clinical quadrangle reached with optimal $g(v)$ cost.`;
    } else if (toId === 'irungattukottai') {
      maneuver = 'toll';
      instruction = `Continue on NH-48 toward Irungattukottai FASTag Toll Plaza. Keep right for electronic toll lanes.`;
      voiceText = `Approaching Irungattukottai Toll Plaza in ${dist} kilometers. Keep right for active FASTag toll collection lanes.`;
      educationalTip = `Queueing Modeling: Toll barrier introduces ₹45 cost parameter and dynamic peak-hour queue delay.`;
    } else if (toId === 'thandalam_junction') {
      maneuver = 'turn-left';
      instruction = `Approach Thandalam Junction on NH-48. Prepare to take the left exit slip road toward Saveetha University.`;
      voiceText = `In ${dist} kilometers, take the left exit slip road at Thandalam Junction toward Saveetha University and Medical College.`;
      educationalTip = `Articulation Gateway: Threshold node transitioning highway vehicular flow into campus internal topology.`;
    } else if (toId === 'saveetha_gate1') {
      maneuver = 'turn-left';
      instruction = `Turn into Saveetha University Entrance Gate 1 Archway. Proceed through security checkpoint.`;
      voiceText = `Turn left into Saveetha University Gate 1 entrance archway. Proceed past the security checkpoint along the campus avenue.`;
      educationalTip = `Campus Gateway: Spanning tree root distributing traffic to Engineering, Medical, and Dental quads.`;
    } else if (toId === 'chembarambakkam') {
      maneuver = 'straight';
      instruction = `Drive along the Chembarambakkam Lake Highway embankment corridor. Maintain steady cruising speed.`;
      voiceText = `Continue straight for ${dist} kilometers along the Chembarambakkam Lake reservoir highway. Scenic waterbody view on your left.`;
      educationalTip = `High-Speed Edge: Longest continuous arc in the corridor graph (${dist} km) supporting maximum vehicular throughput.`;
    } else if (toId === 'chembarambakkam_service') {
      maneuver = 'turn-right';
      instruction = `Diverge onto Chembarambakkam Service Road. Dedicated two-wheeler / cycle bypass.`;
      voiceText = `Take the service road diversion on your right. This two-wheeler corridor bypasses express traffic and toll charges.`;
      educationalTip = `Multi-Modal Optimization: Bypasses highway toll barrier with lower friction for lightweight vehicles.`;
    } else if (toId === 'kuthambakkam') {
      maneuver = 'turn-left';
      instruction = `Head southwest toward Kuthambakkam Greenfield Bus Terminal interchange.`;
      voiceText = `Head toward Kuthambakkam Greenfield Bus Terminal interchange for ${dist} kilometers.`;
      educationalTip = `Multimodal Satellite: 25-acre modern terminal designed to handle western Tamil Nadu intercity buses.`;
    } else if (toId === 'dental_college') {
      maneuver = 'turn-right';
      instruction = `Pass along Saveetha Dental College & Hospital research complex.`;
      voiceText = `Proceed past Saveetha Dental College and Hospital on your right for ${dist} kilometers.`;
      educationalTip = `NIRF #1 Ranked Dental Institute in India with over 600 clinical operatories.`;
    } else if (toId === 'sse_engineering') {
      maneuver = 'straight';
      instruction = `Proceed along the academic boulevard past Saveetha School of Engineering (SSE).`;
      voiceText = `Continue straight past Saveetha School of Engineering computing and robotics campus for ${dist} kilometers.`;
      educationalTip = `ABET Accredited Computing Hub: Lab where this Discrete Mathematics transit algorithms capstone was developed.`;
    } else {
      maneuver = 'straight';
      instruction = `Continue straight on the route from ${fromLabel} toward ${toLabel} (${dist} km).`;
      voiceText = `Continue straight toward ${toLabel.replace(/\(.*?\)/g, '')} for ${dist} kilometers.`;
      educationalTip = `Graph edge traversed: Relaxation check verified $d(v) \\le d(u) + w(u,v)$.`;
    }

    steps.push({
      stepIndex: i + 1,
      fromNodeId: fromId,
      toNodeId: toId,
      fromName: fromLabel,
      toName: toLabel,
      maneuver,
      distanceKm: dist,
      instruction,
      voiceText,
      educationalTip,
      landmarkDetails: toLandmark?.description
    });
  }

  return steps;
}
