import React from 'react';

interface SaveethaCampusMapOverlayProps {
  isDarkMode?: boolean;
}

export const SaveethaCampusMapOverlay: React.FC<SaveethaCampusMapOverlayProps> = ({ isDarkMode = true }) => {
  return (
    <g id="saveetha-thandalam-corridor-overlay" pointerEvents="none">
      <defs>
        {/* Lawn Texture Pattern */}
        <pattern id="campus-lawn-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill={isDarkMode ? '#051b14' : '#ecfdf5'} />
          <circle cx="8" cy="8" r="1.5" fill={isDarkMode ? '#064e3b' : '#a7f3d0'} opacity="0.45" />
          <circle cx="24" cy="24" r="1.5" fill={isDarkMode ? '#064e3b' : '#a7f3d0'} opacity="0.45" />
        </pattern>

        {/* Paved Plaza Pattern */}
        <pattern id="campus-plaza-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill={isDarkMode ? '#090d16' : '#f8fafc'} />
          <path d="M 16 0 L 0 16 M 0 0 L 16 16" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="0.8" opacity="0.6" />
        </pattern>

        {/* Water / Lake Wave Pattern for Chembarambakkam Lake */}
        <pattern id="lake-water-pattern" width="24" height="14" patternUnits="userSpaceOnUse">
          <rect width="24" height="14" fill={isDarkMode ? '#032030' : '#e0f2fe'} />
          <path d="M 0 7 Q 6 3, 12 7 T 24 7" fill="none" stroke={isDarkMode ? '#0284c7' : '#38bdf8'} strokeWidth="0.9" opacity="0.5" />
        </pattern>
      </defs>

      {/* ========================================================================= */}
      {/* 1. REGIONAL GEOGRAPHIC ZONES (Poonamallee -> Chembarambakkam -> Thandalam) */}
      {/* ========================================================================= */}

      {/* Zone A: Poonamallee Urban Hub Perimeter */}
      <rect
        x="20"
        y="50"
        width="310"
        height="220"
        rx="16"
        fill={isDarkMode ? '#0f172a' : '#f1f5f9'}
        stroke={isDarkMode ? '#334155' : '#cbd5e1'}
        strokeWidth="1.2"
        opacity="0.6"
      />
      <text x="35" y="70" fill={isDarkMode ? '#94a3b8' : '#64748b'} fontSize="10" fontWeight="800" letterSpacing="1">
        POONAMALLEE URBAN TRANSIT HUB
      </text>

      {/* Zone B: Chembarambakkam Lake Basin (Major Regional Waterbody) */}
      <g id="chembarambakkam-lake-basin">
        <path
          d="M 430 190 C 470 180, 580 180, 680 200 C 700 240, 690 320, 650 350 C 580 380, 480 370, 430 330 C 410 280, 410 220, 430 190 Z"
          fill="url(#lake-water-pattern)"
          stroke={isDarkMode ? '#0284c7' : '#0284c7'}
          strokeWidth="2"
          opacity="0.85"
        />
        <text x="540" y="270" textAnchor="middle" fill={isDarkMode ? '#38bdf8' : '#0369a1'} fontSize="11" fontWeight="800" letterSpacing="1">
          CHEMBARAMBAKKAM LAKE RESERVOIR
        </text>
        <text x="540" y="285" textAnchor="middle" fill={isDarkMode ? '#7dd3fc' : '#0284c7'} fontSize="8" fontWeight="600">
          Chennai Water Source & Scenic Highway Viewpoint
        </text>
      </g>

      {/* Zone C: Saveetha University (SIMATS) Thandalam Campus Grounds (180+ Acres) */}
      <g id="saveetha-thandalam-campus-grounds">
        <rect
          x="830"
          y="200"
          width="320"
          height="520"
          rx="18"
          fill="url(#campus-lawn-pattern)"
          stroke={isDarkMode ? '#064e3b' : '#10b981'}
          strokeWidth="1.8"
          strokeDasharray="6 4"
          opacity="0.9"
        />
        <rect x="845" y="210" width="290" height="22" rx="4" fill={isDarkMode ? '#064e3b' : '#dcfce7'} stroke={isDarkMode ? '#059669' : '#10b981'} strokeWidth="1" />
        <text x="990" y="224" textAnchor="middle" fill={isDarkMode ? '#34d399' : '#047857'} fontSize="10" fontWeight="800" letterSpacing="0.8">
          SAVEETHA UNIVERSITY • THANDALAM CAMPUS (180+ ACRES)
        </text>
      </g>

      {/* ========================================================================= */}
      {/* 2. NH-48 BANGALORE EXPRESS HIGHWAY (CHENNAI - POONAMALLEE - THANDALAM)     */}
      {/* ========================================================================= */}
      <g id="nh48-highway-artery">
        {/* Outer Embankment */}
        <rect x="20" y="125" width="1120" height="50" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.8" />
        {/* Asphalt Driving Surface */}
        <rect x="20" y="128" width="1120" height="44" fill="#1e293b" />
        {/* Center Double Median Line */}
        <line x1="20" y1="149" x2="1140" y2="149" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="14 8" opacity="0.9" />
        <line x1="20" y1="152" x2="1140" y2="152" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="14 8" opacity="0.9" />
        {/* Highway Shoulder Guide Lines */}
        <line x1="20" y1="133" x2="1140" y2="133" stroke="#f8fafc" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="167" x2="1140" y2="167" stroke="#f8fafc" strokeWidth="1" opacity="0.5" />

        {/* Chembarambakkam Causeway Bridge Railings over Lake */}
        <g id="highway-lake-bridge">
          <rect x="440" y="122" width="230" height="56" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="555" y="118" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700">
            🌉 CHEMBARAMBAKKAM LAKE CAUSEWAY BRIDGE (NH-48)
          </text>
        </g>

        {/* Overhead Highway Directional Gantries */}
        <g id="gantry-poonamallee" transform="translate(100, 110)">
          <rect x="-65" y="-12" width="130" height="15" rx="3" fill="#047857" stroke="#10b981" strokeWidth="0.8" />
          <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="800" letterSpacing="0.4">
            POONAMALLEE (KM 0.0)
          </text>
        </g>

        <g id="gantry-bypass" transform="translate(240, 110)">
          <rect x="-65" y="-12" width="130" height="15" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
          <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="800" letterSpacing="0.4">
            CHENNAI ORR BYPASS
          </text>
        </g>

        <g id="gantry-thandalam" transform="translate(910, 110)">
          <rect x="-95" y="-12" width="190" height="15" rx="3" fill="#b45309" stroke="#f59e0b" strokeWidth="0.8" />
          <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="800" letterSpacing="0.4">
            THANDALAM • SAVEETHA NAGAR (KM 16.7)
          </text>
        </g>

        <g id="gantry-bangalore-end" transform="translate(1080, 110)">
          <rect x="-55" y="-12" width="110" height="15" rx="3" fill="#065f46" stroke="#34d399" strokeWidth="0.8" />
          <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="800" letterSpacing="0.4">
            NH-48 ➔ BENGALURU
          </text>
        </g>
      </g>

      {/* ========================================================================= */}
      {/* 3. IRUNGATTUKOTTAI NHAI HIGHWAY TOLL PLAZA                                */}
      {/* ========================================================================= */}
      <g id="irungattukottai-toll-plaza" transform="translate(740, 150)">
        <rect x="-50" y="-30" width="100" height="60" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1.8" />
        {/* FASTag Roof Canopy */}
        <rect x="-54" y="-33" width="108" height="12" rx="3" fill="#dc2626" />
        <text y="-24" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800" letterSpacing="0.5">
          IRUNGATTUKOTTAI TOLL • FASTag
        </text>
        {/* 4 Toll Lanes */}
        {[-32, -11, 11, 32].map((tx, idx) => (
          <g key={idx} transform={`translate(${tx}, 0)`}>
            <rect x="-6" y="-14" width="12" height="28" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            <circle cx="0" cy="-6" r="2.5" fill="#22c55e" />
            <line x1="-5" y1="4" x2="5" y2="4" stroke="#ef4444" strokeWidth="1.2" />
          </g>
        ))}
        <text y="24" textAnchor="middle" fill="#fca5a5" fontSize="6.5" fontWeight="700">
          Cars: ₹45 • Bikes: Free Exempt
        </text>
      </g>

      {/* ========================================================================= */}
      {/* 4. UNDERLAY ROADS BEHIND GRAPH EDGES (HIGHWAY, SERVICE ROAD, CAMPUS ROADS) */}
      {/* ========================================================================= */}
      <g id="paved-road-underlays" opacity="0.6">
        {/* Service Road & Bike Bypass (Nazarathpet -> Chembarambakkam Svc -> Mevalurkuppam -> Saveetha Gate 1) */}
        <path
          d="M 390 150 L 570 280 L 740 280 L 910 280"
          fill="none"
          stroke={isDarkMode ? '#334155' : '#94a3b8'}
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 390 150 L 570 280 L 740 280 L 910 280"
          fill="none"
          stroke={isDarkMode ? '#1e293b' : '#e2e8f0'}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Direct Link to Saveetha Medical College via South Approach */}
        <path
          d="M 740 280 L 910 440"
          fill="none"
          stroke={isDarkMode ? '#334155' : '#94a3b8'}
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Kuthambakkam Bus Terminal Links */}
        <path
          d="M 390 150 L 480 390 L 570 280"
          fill="none"
          stroke={isDarkMode ? '#334155' : '#94a3b8'}
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Saveetha Campus Internal Boulevards */}
        {/* Gate 1 -> Medical College Hospital -> Admin Senate -> Sports Complex */}
        <path
          d="M 910 150 L 910 280 L 910 440 L 910 580 L 990 680"
          fill="none"
          stroke={isDarkMode ? '#334155' : '#94a3b8'}
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 910 150 L 910 280 L 910 440 L 910 580 L 990 680"
          fill="none"
          stroke={isDarkMode ? '#0f172a' : '#f8fafc'}
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* East Campus Avenue (Dental -> Engineering -> Hostels -> Sports) */}
        <path
          d="M 910 280 L 1080 280 L 1080 440 L 1080 580 L 990 680"
          fill="none"
          stroke={isDarkMode ? '#334155' : '#94a3b8'}
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 910 280 L 1080 280 L 1080 440 L 1080 580 L 990 680"
          fill="none"
          stroke={isDarkMode ? '#0f172a' : '#f8fafc'}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hospital to SSE Engineering Crosslink */}
        <line x1="910" y1="440" x2="1080" y2="440" stroke={isDarkMode ? '#334155' : '#94a3b8'} strokeWidth="16" strokeLinecap="round" />
        <line x1="910" y1="580" x2="1080" y2="580" stroke={isDarkMode ? '#334155' : '#94a3b8'} strokeWidth="16" strokeLinecap="round" />
      </g>

      {/* ========================================================================= */}
      {/* 5. ARCHITECTURAL BUILDING & LANDMARK FOOTPRINTS                           */}
      {/* ========================================================================= */}

      {/* POONAMALLEE TOWN & BUS STAND TERMINUS */}
      <g id="bldg-poonamallee-hub" transform="translate(90, 150)">
        <rect x="-48" y="-30" width="96" height="60" rx="8" fill="url(#campus-plaza-pattern)" stroke={isDarkMode ? '#d97706' : '#f59e0b'} strokeWidth="1.8" />
        {/* Bus Bays */}
        {[-28, -6, 16].map((bx, i) => (
          <rect key={i} x={bx} y="-18" width="16" height="8" rx="2" fill="#f59e0b" />
        ))}
        <text y="22" textAnchor="middle" fill={isDarkMode ? '#fbbf24' : '#d97706'} fontSize="8" fontWeight="800">
          Poonamallee Bus Stand
        </text>
      </g>

      {/* POONAMALLEE BYPASS & CHENNAI ORR FLYOVER */}
      <g id="bldg-pm-bypass" transform="translate(240, 150)">
        <rect x="-42" y="-22" width="84" height="44" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1.8" />
        <path d="M -30 -16 L 30 16 M -30 16 L 30 -16" stroke="#38bdf8" strokeWidth="2" />
        <text y="28" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="700">
          ORR Bypass Flyover
        </text>
      </g>

      {/* NAZARATHPET JUNCTION GATEWAY */}
      <g id="bldg-nazarathpet" transform="translate(390, 150)">
        <circle r="18" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
        <circle cx="-6" cy="-4" r="2.5" fill="#ef4444" />
        <circle cx="0" cy="-4" r="2.5" fill="#eab308" />
        <circle cx="6" cy="-4" r="2.5" fill="#22c55e" />
        <text y="26" textAnchor="middle" fill={isDarkMode ? '#86efac' : '#16a34a'} fontSize="7.5" fontWeight="700">
          Nazarathpet Signal
        </text>
      </g>

      {/* KUTHAMBAKKAM GREENFIELD BUS TERMINAL */}
      <g id="bldg-kuthambakkam" transform="translate(480, 390)">
        <rect x="-50" y="-26" width="100" height="52" rx="8" fill="url(#campus-plaza-pattern)" stroke="#8b5cf6" strokeWidth="1.5" />
        <text y="-6" textAnchor="middle" fill="#c084fc" fontSize="8" fontWeight="800">
          Kuthambakkam Terminal
        </text>
        <text y="8" textAnchor="middle" fill="#94a3b8" fontSize="6.5">
          New Chennai Mofussil Hub
        </text>
      </g>

      {/* MEVALURKUPPAM INDUSTRIAL LINK */}
      <g id="bldg-mevalurkuppam" transform="translate(740, 280)">
        <rect x="-42" y="-20" width="84" height="40" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
        <text y="4" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontWeight="700">
          Mevalurkuppam
        </text>
      </g>

      {/* SAVEETHA UNIVERSITY GATE 1 GRAND ARCH (THANDALAM) */}
      <g id="bldg-saveetha-gate1" transform="translate(910, 280)">
        <rect x="-65" y="-18" width="130" height="36" rx="6" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
        <circle cx="-50" cy="0" r="6" fill="#f59e0b" />
        <circle cx="50" cy="0" r="6" fill="#f59e0b" />
        <text y="4" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="900" letterSpacing="0.8">
          SAVEETHA GATE 1 ARCH
        </text>
      </g>

      {/* SAVEETHA MEDICAL COLLEGE & SUPER SPECIALTY HOSPITAL (THANDALAM) */}
      {/* HIGHLIGHTED AS PRIMARY DESTINATION */}
      <g id="bldg-saveetha-medical-hospital" transform="translate(910, 440)">
        <rect x="-80" y="-55" width="160" height="110" rx="14" fill="url(#campus-plaza-pattern)" stroke="#e11d48" strokeWidth="2.5" />
        {/* Emergency & Trauma Header */}
        <rect x="-70" y="-48" width="140" height="16" rx="3" fill="#881337" />
        <text y="-37" textAnchor="middle" fill="#ffe4e6" fontSize="8" fontWeight="900" letterSpacing="0.5">
          EMERGENCY & SUPER SPECIALTY CARE
        </text>

        {/* Large Red Cross Landmark */}
        <g transform="translate(0, -3)">
          <circle r="18" fill="#ffe4e6" />
          <rect x="-13" y="-4" width="26" height="8" fill="#e11d48" rx="1.5" />
          <rect x="-4" y="-13" width="8" height="26" fill="#e11d48" rx="1.5" />
        </g>

        {/* Hospital Details */}
        <text y="28" textAnchor="middle" fill={isDarkMode ? '#fda4af' : '#e11d48'} fontSize="10" fontWeight="900">
          Saveetha Medical College Hospital
        </text>
        <text y="42" textAnchor="middle" fill={isDarkMode ? '#94a3b8' : '#64748b'} fontSize="7.5" fontWeight="600">
          Thandalam • 24x7 Ambulance & ICU
        </text>
      </g>

      {/* SAVEETHA DENTAL COLLEGE & HOSPITAL (THANDALAM) */}
      <g id="bldg-dental-college" transform="translate(1080, 280)">
        <rect x="-48" y="-28" width="96" height="56" rx="8" fill="url(#campus-plaza-pattern)" stroke="#059669" strokeWidth="1.5" />
        <text y="-2" textAnchor="middle" fill={isDarkMode ? '#34d399' : '#059669'} fontSize="8" fontWeight="800">
          Saveetha Dental Hospital
        </text>
        <text y="14" textAnchor="middle" fill="#94a3b8" fontSize="7">
          Clinical Dental Sciences
        </text>
      </g>

      {/* SAVEETHA SCHOOL OF ENGINEERING (SSE THANDALAM) */}
      <g id="bldg-sse-engineering" transform="translate(1080, 440)">
        <rect x="-50" y="-30" width="100" height="60" rx="8" fill="url(#campus-plaza-pattern)" stroke="#f59e0b" strokeWidth="1.5" />
        <text y="-4" textAnchor="middle" fill={isDarkMode ? '#fbbf24' : '#d97706'} fontSize="8" fontWeight="800">
          Saveetha School of Eng (SSE)
        </text>
        <text y="12" textAnchor="middle" fill="#94a3b8" fontSize="7">
          AI & Tech Blocks
        </text>
      </g>

      {/* SIMATS SENATE & CENTRAL TECH LIBRARY */}
      <g id="bldg-admin-senate" transform="translate(910, 580)">
        <rect x="-56" y="-28" width="112" height="56" rx="8" fill="url(#campus-plaza-pattern)" stroke="#0284c7" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="14" fill={isDarkMode ? '#0c4a6e' : '#e0f2fe'} stroke="#0284c7" strokeWidth="1" />
        <text y="-6" textAnchor="middle" fill={isDarkMode ? '#38bdf8' : '#0284c7'} fontSize="8" fontWeight="800">
          SIMATS Admin Senate
        </text>
        <text y="10" textAnchor="middle" fill="#94a3b8" fontSize="7">
          Central Tech Library
        </text>
      </g>

      {/* STUDENT HOSTELS & RESIDENTIAL QUARTERS */}
      <g id="bldg-hostels-residence" transform="translate(1080, 580)">
        <rect x="-46" y="-28" width="92" height="56" rx="8" fill="url(#campus-plaza-pattern)" stroke="#64748b" strokeWidth="1.5" />
        <text y="-4" textAnchor="middle" fill={isDarkMode ? '#cbd5e1' : '#475569'} fontSize="8" fontWeight="700">
          Student Hostels
        </text>
        <text y="10" textAnchor="middle" fill="#94a3b8" fontSize="7">
          Rose & Jasmine Blocks
        </text>
      </g>

      {/* SAVEETHA SPORTS ARENA & TRANSPORT BAY */}
      <g id="bldg-sports-complex" transform="translate(990, 680)">
        <rect x="-65" y="-20" width="130" height="40" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        <text y="-2" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="800">
          Sports Arena & Transport Bay
        </text>
        <text y="12" textAnchor="middle" fill="#94a3b8" fontSize="7">
          University Stadium & Bus Depot
        </text>
      </g>
    </g>
  );
};
