import { CampusLandmarkInfo } from '../types';

export const CAMPUS_LANDMARKS: Record<string, CampusLandmarkInfo> = {
  poonamallee: {
    id: 'poonamallee',
    name: 'Poonamallee Bus Stand & Trunk Road',
    subtitle: 'Western Chennai Transit Gateway • Historic Origin Town',
    category: 'Highway Transit',
    emoji: '🛣️',
    badgeColor: 'emerald',
    description:
      'Poonamallee is a historic town and the primary gateway connecting Chennai metropolitan limits to the western industrial and university corridor along the NH-48 Bengaluru Highway. It serves as the multimodal origin point for students and commuters.',
    educationalHighlights: [
      'Origin vertex (Source s) in the Chennai-Thandalam graph topology.',
      'Connects Mount-Poonamallee Road, Avadi High Road, and NH-48 arterial highways.',
      'Serves over 45,000 daily commuters across MTC, SETC, and college transit fleets.'
    ],
    graphProperties: {
      degree: 1,
      nodeType: 'Origin Terminal',
      significance: 'Primary departure terminus (indegree = 0 for directed flows, degree = 1 in highway trunk tree).'
    },
    facilities: ['MTC Regional Depot', 'Auto & Taxi Stand', 'Commercial Quadrangle', 'Emergency Fuel Outlets'],
    speechNarration:
      'Poonamallee Bus Stand is the historic origin terminus connecting Chennai city to the western educational corridor on the Bengaluru Highway.'
  },

  poonamallee_bypass: {
    id: 'poonamallee_bypass',
    name: 'Poonamallee Bypass (Chennai Outer Ring Road)',
    subtitle: 'Grade-Separated Flyover Interchange • High-Speed Artery',
    category: 'Highway Transit',
    emoji: '🌉',
    badgeColor: 'cyan',
    description:
      'A major elevated intersection where the Chennai Outer Ring Road (CORR) intersects the NH-48 Bengaluru Highway. This bypass prevents bottleneck congestion within Poonamallee town center.',
    educationalHighlights: [
      'Acts as a transit bridge between intra-city urban flow and high-speed intercity movement.',
      'Graph Theory: Key intermediate bridge vertex with high betweenness centrality.',
      'Equipped with electronic variable message signs and automated vehicle counters.'
    ],
    graphProperties: {
      degree: 2,
      nodeType: 'Highway Corridor',
      significance: 'Critical intermediate edge router facilitating uninterrupted 80 km/h cruising speeds.'
    },
    facilities: ['ORR Cloverleaf Ramps', 'Highway Patrol Post', 'Variable Message Signs', 'LED High-Mast Lighting'],
    speechNarration:
      'Poonamallee Bypass intersects the Chennai Outer Ring Road, routing intercity traffic onto the NH-48 corridor without town-center congestion.'
  },

  nazarathpet: {
    id: 'nazarathpet',
    name: 'Nazarathpet Bangalore Highway Junction',
    subtitle: 'Strategic Highway Fork • Signalized Multi-Way Nexus',
    category: 'Highway Transit',
    emoji: '🚦',
    badgeColor: 'blue',
    description:
      'Nazarathpet Junction marks the primary diversion point where traffic splits between the high-speed NH-48 express lanes, Kuthambakkam terminus, and the Chembarambakkam two-wheeler service road.',
    educationalHighlights: [
      'Crucial branching vertex with high degree (degree = 4) in the regional road network.',
      'In Dijkstra and A* analysis, this junction serves as the primary decision node for bike vs car route diversion.',
      'Site of intelligent traffic signal automation and real-time CCTV speed enforcement.'
    ],
    graphProperties: {
      degree: 4,
      nodeType: 'Junction & Interchange',
      significance: 'Multi-edge hub offering parallel paths (expressway vs service road bypass).'
    },
    facilities: ['Traffic Control Booth', 'Emergency Vehicle Bay', 'Fuel & EV Fast Charging', 'Pedestrian Foot-Over-Bridge'],
    speechNarration:
      'Nazarathpet Junction is the primary highway junction where vehicles choose between the express expressway or the service road bypass.'
  },

  kuthambakkam: {
    id: 'kuthambakkam',
    name: 'Kuthambakkam Greenfield Bus Terminal',
    subtitle: '25-Acre Satellite Multimodal Hub • Decongesting CMBT',
    category: 'Highway Transit',
    emoji: '🚌',
    badgeColor: 'indigo',
    description:
      'A state-of-the-art greenfield transit hub constructed over 25 acres to handle western intercity buses heading toward Vellore, Bengaluru, and Hosur, relieving inner Chennai congestion.',
    educationalHighlights: [
      'Designed for sustainable mass transit with solar canopy roofing and rainwater percolation ponds.',
      'Graph Theory: Sub-hub creating alternative feeder paths to Saveetha University.',
      'Integrated with upcoming Chennai Metro Rail Phase 2 extension plans.'
    ],
    graphProperties: {
      degree: 2,
      nodeType: 'Transit Interchange',
      significance: 'High-capacity feeder vertex linking suburban commuters to institutional transit shuttles.'
    },
    facilities: ['285 Bus Bays', 'Multi-Level Car Parking', 'Solar Roof Array', 'Passenger Lounges & Cafeterias'],
    speechNarration:
      'Kuthambakkam Greenfield Bus Terminal is a 25-acre modern multimodal transit station serving western Tamil Nadu intercity routes.'
  },

  chembarambakkam: {
    id: 'chembarambakkam',
    name: 'Chembarambakkam Lake Highway Corridor (NH-48)',
    subtitle: 'Scenic Waterbody Vista • Chennai Drinking Water Reservoir',
    category: 'Natural Landmark',
    emoji: '🌊',
    badgeColor: 'sky',
    description:
      'A prominent scenic stretch of NH-48 running along the embankments of the Chembarambakkam Reservoir—one of the four primary rain-fed water reservoirs supplying drinking water to Chennai city.',
    educationalHighlights: [
      'Historic 16th-century reservoir with an expansive water catchment basin and overflow floodgates to Adyar River.',
      'Graph Theory: Longest continuous high-speed edge in the Chennai-Thandalam graph (3.8 to 4.2 km).',
      'Subject to crosswind and moisture considerations in intelligent transport simulation models.'
    ],
    graphProperties: {
      degree: 3,
      nodeType: 'Highway Corridor',
      significance: 'High-speed express artery with scenic lake embankment views and high traffic capacity.'
    },
    facilities: ['PWD Water Gate Observation', 'Highway Scenic Viewpoint', 'Avenue Tree Plantations', 'Automated Weather Sensor'],
    speechNarration:
      'Chembarambakkam Lake highway corridor borders Chennai’s primary freshwater reservoir, offering wide scenic lanes along the NH-48.'
  },

  chembarambakkam_service: {
    id: 'chembarambakkam_service',
    name: 'Chembarambakkam Service Road (Bike Arterial)',
    subtitle: 'Dedicated Two-Wheeler Track • Zero-Toll Bypass Lane',
    category: 'Highway Transit',
    emoji: '🚲',
    badgeColor: 'amber',
    description:
      'A parallel 2-lane service roadway designed for two-wheelers, local farm vehicles, and institutional cyclists seeking to bypass the fast expressway traffic and avoid FASTag toll gate delays.',
    educationalHighlights: [
      'Employed in our Multi-Modal routing algorithm to model bike fuel efficiency and zero-toll transit.',
      'Demonstrates discrete edge-weight trade-offs: longer distance but lower congestion delay for small vehicles.',
      'Connects suburban hamlets to educational institutions along the highway periphery.'
    ],
    graphProperties: {
      degree: 4,
      nodeType: 'Highway Corridor',
      significance: 'Parallel non-tolled alternative path ensuring multi-modal reachability.'
    },
    facilities: ['Bicycle Corridors', 'Local Village Access Paths', 'Streetlamp Infrastructure', 'Service Garages'],
    speechNarration:
      'Chembarambakkam Service Road offers two-wheelers a relaxed, zero-toll route parallel to the main NH-48 expressway.'
  },

  irungattukottai: {
    id: 'irungattukottai',
    name: 'Irungattukottai Toll Plaza & SIPCOT Industrial Hub',
    subtitle: 'FASTag Electronic Toll Collection • Automotive Manufacturing Center',
    category: 'Highway Transit',
    emoji: '🛑',
    badgeColor: 'rose',
    description:
      'A pivotal highway waypoint housing the National Highways Authority of India (NHAI) FASTag Toll Plaza and the entry to the Irungattukottai SIPCOT industrial park, home to major automotive manufacturing plants.',
    educationalHighlights: [
      'Toll plaza represents a dynamic queueing bottleneck ($M/M/c$ queue) in transit modeling.',
      'Simulates FASTag RFID transaction delays (custom weight = ₹45 for four-wheelers, ₹0 for two-wheelers).',
      'Industrial ecosystem home to Hyundai Motor India, Saint-Gobain, and global auto-ancillaries.'
    ],
    graphProperties: {
      degree: 3,
      nodeType: 'Toll Barrier',
      significance: 'Choke-point node introducing monetary toll cost and potential peak-hour queue delay.'
    },
    facilities: ['16-Lane FASTag Toll Gates', 'SIPCOT Industrial Gate', 'Emergency Medical Outpost', 'Weigh-in-Motion Sensor'],
    speechNarration:
      'Irungattukottai Toll Plaza is the primary NH-48 electronic toll checkpoint and gateway to Chennai’s automotive manufacturing corridor.'
  },

  mevalurkuppam: {
    id: 'mevalurkuppam',
    name: 'Mevalurkuppam Industrial Link Road',
    subtitle: 'Warehousing & Logistics Belt • Thandalam Bypass Connection',
    category: 'Highway Transit',
    emoji: '🏭',
    badgeColor: 'slate',
    description:
      'An industrial connector linking heavy logistics parks and technology warehouses directly to the western boundary of Saveetha University, allowing service traffic to bypass the main highway toll.',
    educationalHighlights: [
      'Serves as an essential alternate rerouting arc when incidents occur on the main NH-48 express artery.',
      'Graph Theory: Crucial component of planar bipartite flow modeling in suburban road networks.',
      'Links global logistics centers with institutional campuses.'
    ],
    graphProperties: {
      degree: 4,
      nodeType: 'Junction & Interchange',
      significance: 'Bypass hub connecting industrial link roads directly to Saveetha University western gates.'
    },
    facilities: ['Logistics Terminals', 'Heavy Vehicle Lay-Bays', 'Commercial Services', 'Industrial Fire Sub-Station'],
    speechNarration:
      'Mevalurkuppam Industrial Link connects regional warehousing centers and offers a direct link into Saveetha University grounds.'
  },

  thandalam_junction: {
    id: 'thandalam_junction',
    name: 'Thandalam Junction (Saveetha Nagar NH-48)',
    subtitle: 'Primary Institutional Roundabout • Highway Exit to SIMATS',
    category: 'Highway Transit',
    emoji: '📍',
    badgeColor: 'violet',
    description:
      'The designated highway junction where commuters traveling along the NH-48 exit the national expressway and enter Saveetha Nagar to access Saveetha University, Saveetha Medical College, and associated hospitals.',
    educationalHighlights: [
      'High-traffic convergence zone connecting intercity vehicular streams to institutional internal roads.',
      'Features prominent directional signage, pedestrian underpass, and institutional shuttle staging areas.',
      'Graph Theory: Articulation gateway linking the intercity highway subgraph to the campus subgraph.'
    ],
    graphProperties: {
      degree: 2,
      nodeType: 'Junction & Interchange',
      significance: 'Threshold junction connecting external national highway network to Saveetha University territory.'
    },
    facilities: ['University Welcome Signboard', 'Pedestrian Underpass', 'Police Outpost', 'Bus Transit Shelter'],
    speechNarration:
      'Thandalam Junction is the main highway exit off the NH-48 where university visitors turn into the Saveetha University campus corridor.'
  },

  saveetha_gate1: {
    id: 'saveetha_gate1',
    name: 'Saveetha University Entrance Gate 1 (Thandalam)',
    subtitle: 'Iconic Grand Entrance Arch • Security & Campus Transit Gateway',
    category: 'Campus Gateway',
    emoji: '⛩️',
    badgeColor: 'emerald',
    description:
      'The iconic grand entrance archway of Saveetha Institute of Medical and Technical Sciences (SIMATS) at Thandalam. Gate 1 controls campus vehicular access, electronic visitor badge verification, and internal shuttle departures.',
    educationalHighlights: [
      'Marks the formal boundary of the 180+ acre SIMATS university campus.',
      'Graph Theory: Gateway vertex forming the root of the campus internal spanning tree.',
      'Equipped with ANPR automated number-plate recognition cameras and security bollards.'
    ],
    graphProperties: {
      degree: 4,
      nodeType: 'Campus Gateway',
      significance: 'Campus master root node connecting to Engineering, Medical, Dental, and Senate quads.'
    },
    facilities: ['Security Verification Booth', 'Shuttle Boarding Station', 'Campus Map Directory', 'Visitor Reception Desk'],
    speechNarration:
      'Saveetha University Gate 1 is the grand architectural entrance leading into the 180-acre Thandalam campus and Medical College.'
  },

  medical_hospital: {
    id: 'medical_hospital',
    name: 'Saveetha Medical College & Multi-Speciality Hospital',
    subtitle: '1,500-Bed Tertiary Teaching Hospital • NABH & NABL Accredited',
    category: 'Healthcare',
    emoji: '🏥',
    badgeColor: 'rose',
    description:
      'A premier 1,500-bed super-speciality teaching hospital and research institution affiliated with SIMATS. Features 24x7 Level-1 trauma emergency services, robotic surgery units, comprehensive cardiology, oncology, and tertiary medical research.',
    educationalHighlights: [
      'Target sink node (Goal t) in our primary Poonamallee-to-Saveetha Medical College navigation path.',
      'Ranked among top medical universities in India with NIRF recognition and global medical accreditations.',
      'Conducts thousands of patient consultations and emergency responses daily across 30+ medical departments.'
    ],
    graphProperties: {
      degree: 4,
      nodeType: 'Destination Quad',
      significance: 'Primary clinical goal vertex with high betweenness centrality within the campus health district.'
    },
    facilities: [
      '1,500+ Inpatient Beds',
      '24/7 Level-1 Emergency Trauma Center',
      'Robotic Surgical Suites',
      'Helipad Facility',
      'ICU & Cardiac Care Units',
      'Diagnostic Imaging (3T MRI & 128-Slice CT)'
    ],
    speechNarration:
      'Saveetha Medical College and Multi-Speciality Hospital is a 1,500-bed tertiary care teaching hospital with 24-hour emergency trauma services.'
  },

  dental_college: {
    id: 'dental_college',
    name: 'Saveetha Dental College & Hospital (SDC)',
    subtitle: 'Ranked #1 Dental College in India (NIRF) • Global Center of Excellence',
    category: 'Academic',
    emoji: '🦷',
    badgeColor: 'teal',
    description:
      'Globally renowned dental institution ranked #1 in India by the Ministry of Education (NIRF) and in the world top 15 by QS World University Rankings. Known for dental implants, regenerative therapies, and high research publication output.',
    educationalHighlights: [
      'Over 600 dental dental chairs and high-precision CAD/CAM dental manufacturing laboratories.',
      'Recognized with thousands of high-impact Scopus indexed scientific publications.',
      'Graph Theory: Adjacent to Gate 1 and Medical Hospital, forming an integrated clinical healthcare cluster.'
    ],
    graphProperties: {
      degree: 2,
      nodeType: 'Academic Quad',
      significance: 'Specialized healthcare research node with high pedestrian and outpatient traffic.'
    },
    facilities: ['600+ Dental Operatories', 'Cone Beam CT Lab', 'CAD/CAM Prosthetics Center', 'International Patient Wing'],
    speechNarration:
      'Saveetha Dental College is ranked Number 1 in India by NIRF and is internationally celebrated for advanced dental research and patient care.'
  },

  sse_engineering: {
    id: 'sse_engineering',
    name: 'Saveetha School of Engineering (SSE)',
    subtitle: 'ABET & AICTE Accredited • High-Tech Computing & Robotics Complex',
    category: 'Academic',
    emoji: '⚙️',
    badgeColor: 'purple',
    description:
      'A leading engineering institution under SIMATS, featuring cutting-edge departments in Computer Science & Engineering, Artificial Intelligence & Machine Learning, Robotics, and Biomedical Engineering.',
    educationalHighlights: [
      'Accredited by ABET (USA) and certified by AICTE with Grade ‘A++’ NAAC rating.',
      'Home to advanced AI computing clusters, IoT prototyping laboratories, and drone testing zones.',
      'Origin lab of this Discrete Mathematics and Intelligent Shortest-Path Graph Transit Capstone project.'
    ],
    graphProperties: {
      degree: 4,
      nodeType: 'Academic Quad',
      significance: 'High-density student academic quadrangle with direct connections to hostels and library.'
    },
    facilities: ['NVIDIA AI High-Performance Cluster', 'Robotics & Automation Labs', 'Makerspace 3D Printing Lab', 'Smart Lecture Theaters'],
    speechNarration:
      'Saveetha School of Engineering is an ABET-accredited engineering college home to cutting-edge Computer Science, Artificial Intelligence, and Robotics labs.'
  },

  admin_senate: {
    id: 'admin_senate',
    name: 'SIMATS Senate & Central Digital Library',
    subtitle: 'Institutional Headquarters • 5-Story Digitized Research Archive',
    category: 'Administration',
    emoji: '🏛️',
    badgeColor: 'amber',
    description:
      'The administrative epicenter of Saveetha Institute of Medical and Technical Sciences, housing the Chancellor’s Senate, University Registry, and a massive 5-story central library with access to millions of digital journal articles.',
    educationalHighlights: [
      'Architectural focal point of the university campus featuring classical colonnaded facade.',
      'Graph Theory: Central star vertex connecting academic, administrative, and recreational quads.',
      'Equipped with RFID automated book checkout, doctoral research lounges, and e-learning pods.'
    ],
    graphProperties: {
      degree: 3,
      nodeType: 'Academic Quad',
      significance: 'Administrative centroid with high accessibility from both medical and engineering zones.'
    },
    facilities: ['Chancellor & Vice-Chancellor Senate', '5-Story Central Library', 'Doctoral Research Cubicles', 'Convention Auditorium'],
    speechNarration:
      'SIMATS Senate and Central Library is the administrative headquarters and high-tech research library of Saveetha University.'
  },

  hostels_residence: {
    id: 'hostels_residence',
    name: 'Student Hostels & Residential Quarters',
    subtitle: 'Campus Residences for 8,000+ Scholars • Green Living Quad',
    category: 'Student Amenities',
    emoji: '🏢',
    badgeColor: 'indigo',
    description:
      'Sprawling residential quads accommodating undergraduate, postgraduate, and international students along with faculty quarters, dining halls, study kiosks, and 24/7 solar hot water and fiber internet.',
    educationalHighlights: [
      'Houses over 8,000 resident students from across India and international regions.',
      'Graph Theory: Major source/sink during morning class start times and evening returns.',
      'Designed with pedestrianized green pathways minimizing vehicular noise inside living quarters.'
    ],
    graphProperties: {
      degree: 3,
      nodeType: 'Academic Quad',
      significance: 'Residential node generating significant morning departure and evening return flow.'
    },
    facilities: ['Modern Dining Halls', 'Indoor Badminton Courts', 'Study Lounges with High-Speed Wi-Fi', 'Health Clinic & Pharmacy'],
    speechNarration:
      'Student Hostels provide modern residential accommodations, dining halls, and study lounges for over eight thousand university scholars.'
  },

  sports_complex: {
    id: 'sports_complex',
    name: 'Sports Arena & University Transport Bay',
    subtitle: 'Olympic-Standard Track • Staging Terminal for 120+ Campus Buses',
    category: 'Student Amenities',
    emoji: '⚽',
    badgeColor: 'green',
    description:
      'A multi-facility sports complex including an Olympic-standard athletic track, cricket pavilion, tennis courts, and the adjacent central fleet depot for more than 120 institutional buses servicing Chennai and Tiruvallur.',
    educationalHighlights: [
      'Staging terminus for SIMATS bus logistics running over 80 designated routes across Chennai city.',
      'Hosts national inter-university sporting meets and annual athletics tournaments.',
      'Graph Theory: Southern boundary terminal node in the Saveetha Thandalam topological graph.'
    ],
    graphProperties: {
      degree: 2,
      nodeType: 'Transit Interchange',
      significance: 'Southern logistics anchor connecting student athletics and daily intercity transit fleet.'
    },
    facilities: ['Olympic 400m Synthetic Track', 'Cricket & Football Grounds', '120-Bus Fleet Staging Bay', 'Gymnasium & Fitness Center'],
    speechNarration:
      'The Sports Arena and Transport Bay features athletic stadiums and houses the university fleet of over 120 transit buses.'
  }
};

export const getLandmarkInfo = (nodeId: string): CampusLandmarkInfo | undefined => {
  return CAMPUS_LANDMARKS[nodeId];
};
