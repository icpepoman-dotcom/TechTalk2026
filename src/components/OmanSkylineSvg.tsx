import React from 'react';

interface OmanSkylineSvgProps {
  className?: string;
  glow?: boolean;
}

export const OmanSkylineSvg: React.FC<OmanSkylineSvgProps> = ({
  className = "w-full h-auto text-[#e5b94c]",
  glow = true
}) => {
  return (
    <div className={`relative overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 1440 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="goldSkylineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fcedbe" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#e5b94c" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#c9982a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fcedbe" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="goldFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e5b94c" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#c9982a" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#071326" stopOpacity="0" />
          </linearGradient>

          <filter id="goldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Skyline Silhouette Filled Region with delicate transparency */}
        <path
          d="
            M 0 280
            L 0 240
            L 40 240
            L 50 210
            L 70 210
            L 75 240
            L 120 240
            L 130 190
            L 145 190
            L 150 170
            L 155 190
            L 170 190
            L 180 240
            L 220 240
            L 230 150
            L 245 150
            L 250 130
            L 255 150
            L 270 150
            L 280 240
            L 320 240
            L 330 180
            L 340 180
            L 345 140
            L 350 110
            L 355 140
            L 360 180
            L 370 180
            L 380 240
            L 430 240
            L 440 200
            L 450 200
            L 455 190
            L 470 190
            L 475 200
            L 490 200
            L 500 240
            L 550 240
            L 560 130
            L 570 130
            L 580 90
            L 585 60
            L 590 90
            L 600 130
            L 610 130
            L 620 240
            L 670 240
            L 680 170
            L 720 170
            L 730 240
            L 770 240
            L 780 140
            L 800 140
            L 805 110
            L 815 110
            L 820 140
            L 840 140
            L 850 240
            L 890 240
            L 900 100
            L 915 80
            L 925 80
            L 940 100
            L 950 240
            L 1000 240
            L 1010 160
            L 1025 160
            L 1030 140
            L 1040 140
            L 1045 160
            L 1060 160
            L 1070 240
            L 1120 240
            L 1130 110
            L 1140 110
            L 1145 70
            L 1150 45
            L 1155 70
            L 1160 110
            L 1170 110
            L 1180 240
            L 1220 240
            L 1230 190
            L 1270 190
            L 1280 240
            L 1320 240
            L 1335 180
            L 1370 180
            L 1385 240
            L 1440 240
            L 1440 280
            Z
          "
          fill="url(#goldFillGrad)"
        />

        {/* Main Golden Line Outline with architectural features */}
        <g stroke="url(#goldSkylineGrad)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" filter={glow ? "url(#goldGlowFilter)" : undefined}>
          {/* Base ground & circuit line */}
          <line x1="0" y1="240" x2="1440" y2="240" strokeWidth="1.5" />

          {/* Omani Fort Watchtower Left (Muttrah Fort inspired) */}
          <path d="M 40 240 L 45 190 L 80 190 L 85 240" />
          <path d="M 40 190 L 40 180 L 48 180 L 48 190 L 58 190 L 58 180 L 66 180 L 66 190 L 76 190 L 76 180 L 85 180 L 85 190" />
          <circle cx="62" cy="208" r="4" fill="none" strokeWidth="1.2" />

          {/* Traditional Minaret (Sultan Qaboos Grand Mosque motif) */}
          <path d="M 125 240 L 132 170 L 140 170 L 142 120 L 146 80 L 148 50 L 150 80 L 154 120 L 156 170 L 164 170 L 171 240" />
          {/* Crescent finial on minaret */}
          <path d="M 148 48 Q 148 40 148 35 M 145 35 A 4 4 0 1 0 151 35 A 3 3 0 1 1 145 35" strokeWidth="1" fill="#fcedbe" />
          <rect x="138" y="145" width="18" height="12" rx="2" fill="none" />
          <line x1="147" y1="145" x2="147" y2="157" />

          {/* Traditional Omani Arched Fort Gate (Nakhal / Nizwa) */}
          <path d="M 220 240 L 225 180 L 285 180 L 290 240" />
          <path d="M 242 240 L 242 205 Q 255 190 268 205 L 268 240" />
          {/* Crenellations on fort */}
          <path d="M 220 180 L 220 172 L 230 172 L 230 180 L 240 180 L 240 172 L 250 172 L 250 180 L 260 180 L 260 172 L 270 172 L 270 180 L 280 180 L 280 172 L 290 172 L 290 180" />

          {/* Modern Muscat Financial Tower */}
          <path d="M 330 240 L 340 130 L 350 90 L 355 90 L 365 130 L 375 240" />
          <line x1="344" y1="140" x2="361" y2="140" strokeDasharray="2 3" />
          <line x1="341" y1="170" x2="364" y2="170" strokeDasharray="2 3" />
          <line x1="337" y1="200" x2="368" y2="200" strokeDasharray="2 3" />

          {/* Sultanate Incense Burner Monument (Riyam Park, Muscat) */}
          <path d="M 445 240 L 452 195 Q 460 160 470 160 Q 480 160 488 195 L 495 240" />
          <path d="M 458 160 Q 470 135 470 120 Q 470 135 482 160" />
          <circle cx="470" cy="115" r="5" fill="#fcedbe" />

          {/* Majestic Center Minaret & Dome */}
          <path d="M 565 240 L 575 140 L 585 50 L 587 30 L 589 50 L 599 140 L 609 240" />
          <circle cx="587" cy="25" r="3" fill="#fcedbe" />
          {/* Mosque Dome adjacent */}
          <path d="M 610 240 L 610 200 Q 640 160 670 200 L 670 240" />
          <path d="M 640 156 L 640 150" />
          <circle cx="640" cy="148" r="2.5" fill="#fcedbe" />

          {/* Modern Telecommunications & Tech Tower */}
          <path d="M 760 240 L 775 120 L 785 120 L 795 80 L 800 80 L 810 120 L 820 120 L 835 240" />
          <line x1="797" y1="80" x2="797" y2="40" strokeWidth="2" />
          <circle cx="797" cy="38" r="3" fill="#fcedbe" />

          {/* Al Alam Palace inspired portico columns & pediment */}
          <path d="M 885 240 L 885 170 L 965 170 L 965 240" />
          <line x1="900" y1="240" x2="900" y2="170" />
          <line x1="925" y1="240" x2="925" y2="170" />
          <line x1="950" y1="240" x2="950" y2="170" />
          {/* Palace decorative flare */}
          <path d="M 880 170 L 925 130 L 970 170 Z" />

          {/* Modern Wyndham Hotel / Muscat City Center Profile */}
          <path d="M 1010 240 L 1020 120 L 1070 120 L 1080 240" />
          <line x1="1025" y1="140" x2="1065" y2="140" strokeDasharray="3 3" />
          <line x1="1023" y1="165" x2="1067" y2="165" strokeDasharray="3 3" />
          <line x1="1020" y1="190" x2="1070" y2="190" strokeDasharray="3 3" />
          <line x1="1016" y1="215" x2="1074" y2="215" strokeDasharray="3 3" />

          {/* Eastern Fort & Minaret */}
          <path d="M 1125 240 L 1135 150 L 1145 60 L 1147 40 L 1149 60 L 1159 150 L 1169 240" />
          <circle cx="1147" cy="36" r="3" fill="#fcedbe" />
          <path d="M 1180 240 L 1190 190 L 1230 190 L 1240 240" />
          <path d="M 1180 190 L 1180 182 L 1190 182 L 1190 190 L 1200 190 L 1200 182 L 1210 182 L 1210 190 L 1220 190 L 1220 182 L 1230 182 L 1230 190 L 1240 190" />

          {/* Modern Bridge & Port Gantry Arches */}
          <path d="M 1290 240 Q 1340 170 1390 240" strokeDasharray="4 4" />
          <path d="M 1315 240 Q 1340 195 1365 240" />
        </g>

        {/* Digital Circuit Motifs & Printed Traces along the baseline */}
        <g stroke="#e5b94c" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Circuit Trace Left */}
          <path d="M 20 255 H 100 L 120 270 H 260" />
          <circle cx="20" cy="255" r="3" fill="#071326" stroke="#fcedbe" strokeWidth="1.5" />
          <circle cx="260" cy="270" r="3" fill="#fcedbe" />

          {/* Circuit Trace Center-Left */}
          <path d="M 310 265 H 390 L 410 250 H 510 L 530 268 H 630" />
          <circle cx="310" cy="265" r="3" fill="#fcedbe" />
          <circle cx="630" cy="268" r="3" fill="#071326" stroke="#fcedbe" strokeWidth="1.5" />

          {/* Circuit Trace Center */}
          <path d="M 680 252 H 760 L 780 268 H 890" />
          <circle cx="680" cy="252" r="2.5" fill="#fcedbe" />
          <circle cx="890" cy="268" r="2.5" fill="#fcedbe" />

          {/* Circuit Trace Right */}
          <path d="M 940 266 H 1030 L 1050 250 H 1170 L 1190 268 H 1420" />
          <circle cx="940" cy="266" r="3" fill="#071326" stroke="#fcedbe" strokeWidth="1.5" />
          <circle cx="1420" cy="268" r="3" fill="#fcedbe" />

          {/* Vertical Micro-Vias */}
          <line x1="180" y1="240" x2="180" y2="258" />
          <circle cx="180" cy="258" r="2" fill="#fcedbe" />

          <line x1="470" y1="240" x2="470" y2="253" />
          <circle cx="470" cy="253" r="2" fill="#fcedbe" />

          <line x1="840" y1="240" x2="840" y2="258" />
          <circle cx="840" cy="258" r="2" fill="#fcedbe" />

          <line x1="1100" y1="240" x2="1100" y2="254" />
          <circle cx="1100" cy="254" r="2" fill="#fcedbe" />
        </g>
      </svg>
    </div>
  );
};
