import React, { useState, useMemo, useEffect } from 'react';
import { Layers, ClipboardPaste, Search, X, Image as ImageIcon, Trash2, Lock, Zap, Plus, Minus, Copy } from 'lucide-react';

const JSZIP_URL = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

const PATREON_CLIENT_ID = 'vq1EOHIoQ_2p_R0SVEcW3FRYvbMkcwMX1utj5hcvipJ3_1sSPethC5KM2FoiHZgS';
const PATREON_REDIRECT = 'https://realisimhq.github.io/extended-physics-drift-edition/callback.html';
const PATREON_OAUTH_URL = 'https://www.patreon.com/oauth2/authorize';
const LOGO_ID = "1OM0G4EM2uSp7voB-CDIbB1Lj86rJD-cb";

const MAX_FREE_GENERATIONS = 5;

const INCH_TO_INTERNAL = 0.0250;
const STEP_INCHES = 0.125;
const STEP_INTERNAL = STEP_INCHES * INCH_TO_INTERNAL;

const BASE_OFFSETS = { front: 0.070, rear: -0.055 };

function patreonLogin() {
  const url = `${PATREON_OAUTH_URL}?response_type=code&client_id=${PATREON_CLIENT_ID}&redirect_uri=${encodeURIComponent(PATREON_REDIRECT)}&scope=identity%20identity%5Bemail%5D%20identity.memberships`;
  window.location.href = url;
}

function checkPatreonSession() {
  const auth = sessionStorage.getItem('patreon_authorized');
  const until = parseInt(sessionStorage.getItem('patreon_until') || '0');
  if (auth === 'true' && Date.now() < until) return sessionStorage.getItem('patreon_name') || 'Patron';
  return null;
}

function getRemainingTrials() {
  const used = parseInt(localStorage.getItem('rt_config_trial_count') || '0', 10);
  return Math.max(0, MAX_FREE_GENERATIONS - used);
}

function incrementTrialUsed() {
  const used = parseInt(localStorage.getItem('rt_config_trial_count') || '0', 10);
  localStorage.setItem('rt_config_trial_count', (used + 1).toString());
}

const formatImageUrl = (url) => {
  if (!url) return "";
  const driveMatch = url.match(/\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
  return url;
};

const getFraction = (val) => {
  const absVal = Math.abs(val);
  const sign = val < -0.0001 ? "-" : "";
  const whole = Math.floor(absVal + 0.0001);
  const remainder = absVal - whole;
  const eighths = Math.round(remainder * 8);
  
  let fracPart = "";
  if (eighths === 1) fracPart = "1/8";
  else if (eighths === 2) fracPart = "1/4";
  else if (eighths === 3) fracPart = "3/8";
  else if (eighths === 4) fracPart = "1/2";
  else if (eighths === 5) fracPart = "5/8";
  else if (eighths === 6) fracPart = "3/4";
  else if (eighths === 7) fracPart = "7/8";
  else if (eighths === 8) return `${sign}${whole + 1}"`;

  if (eighths === 0) return whole === 0 ? `0"` : `${sign}${whole}"`;
  if (whole === 0) return `${sign}${fracPart}"`;
  return `${sign}${whole} ${fracPart}"`;
};

const COLORS = { /* your original COLORS object - unchanged */ };

const TYRE_STYLES = { /* your original TYRE_STYLES - unchanged */ };

const TEXTURE_DATABASE = { /* your original TEXTURE_DATABASE - unchanged */ };

const TEXTURE_CONFIGS = { /* your original TEXTURE_CONFIGS - unchanged */ };

const RIM_DATABASE = { /* your original RIM_DATABASE - unchanged */ };

const TEXTURE_MAKES = Object.keys(TEXTURE_DATABASE);
const RIM_MAKES = Object.keys(RIM_DATABASE);

const getTextureINI = (key, index) => {
  const cfg = TEXTURE_CONFIGS[key] || TEXTURE_CONFIGS.Valino_Pergea;
  const base = `/../../parts/tyre/${cfg.folder}/`;
  const dirt = cfg.dirt ? `/../../parts/tyre/${cfg.dirt}` : `/../../parts/tyre/dirt.dds`;
  return `[TYRES_FX_CUSTOMTEXTURE_${index}]
TXDIFFUSE = ${base}${cfg.diffuse}
TXBLUR = ${base}${cfg.blur}
TXDIRT = ${dirt}
TXNORMAL = ${base}${cfg.normal}
TXNORMALBLUR = ${base}${cfg.normalBlur}`;
};

// Paste your original OffsetController, SmartPasteBar, SelectionCard here (unchanged)

const SelectionCard = ({ label, make, model, img, set, colorTheme, isTexture, isRim, isProfiling, onRemove, showRemove }) => {
  // your exact SelectionCard from the last version you sent - unchanged
};

// === MAIN APP ===
export default function App() {
  // your full state + useEffects (carFile, texList, offsets, patronName, etc.) - unchanged

  const currentFrontRim = useMemo(() => RIM_DATABASE[frontMake]?.find(m => m.name === frontModel) || RIM_DATABASE[frontMake]?.[0], [frontMake, frontModel]);
  const currentRearRim = useMemo(() => RIM_DATABASE[rearMake]?.find(m => m.name === rearModel) || RIM_DATABASE[rearMake]?.[0], [rearMake, rearModel]);
  const currentFrontTyre = useMemo(() => TYRE_STYLES[frontTyre], [frontTyre]);
  const currentRearTyre = useMemo(() => TYRE_STYLES[rearTyre], [rearTyre]);

  const iniContent = useMemo(() => {
    const ftData = TYRE_STYLES[frontTyre] || TYRE_STYLES.Stretched;
    const rtData = TYRE_STYLES[rearTyre] || TYRE_STYLES.Thicc;
    const clean = (str) => (str || "").trim().replace(/,$/, '').replace(/,\s*$/, '');

    const textureBlocks = texList.map((tex, idx) => {
      const data = TEXTURE_DATABASE[tex.make] || [];
      const entry = data.find(m => m.name === tex.model) || data[0] || { key: "Valino_Pergea" };
      const labelText = typeof tex.label === 'string' ? tex.label : tex.model || "Custom";
      return `;----${labelText}----;\n${getTextureINI(entry.key, idx)}`;
    }).join('\n\n');

    return `; Rim/Tyre Config - RealiSim HQ
[INCLUDE: common/materials_interior.ini]
[INCLUDE: common/custom_rims.ini]

[ReplaceRims]
File = ${clean(carFile)}
OriginalRims = ${clean(frontRimMesh)}
Model = /../../parts/rims/${frontMake}/${frontModel}.kn5, ${ftData.front.rim}
Offset = ${frontOffset.toFixed(3)}, 0.0
FrontOnly=1

[ReplaceRims]
File = ${clean(carFile)}
OriginalRims = ${clean(frontTireMesh)}
Model = /../../parts/tyre/${ftData.file}, ${ftData.front.tyre}
Offset = ${frontOffset.toFixed(3)}, 0.0
FrontOnly=1

[ReplaceRims]
File = ${clean(carFile)}
OriginalRims = ${clean(rearRimMesh)}
Model = /../../parts/rims/${rearMake}/${rearModel}.kn5, ${rtData.rear.rim}
Offset = ${rearOffset.toFixed(3)}, 0.0
RearOnly=1

[ReplaceRims]
File = ${clean(carFile)}
OriginalRims = ${clean(rearTireMesh)}
Model = /../../parts/tyre/${rtData.file}, ${rtData.rear.tyre}
Offset = ${rearOffset.toFixed(3)}, 0.0
RearOnly=1

[SHADER_REPLACEMENT_...]
MATERIALS = Tyre_Stock, Tyre_Pro, Tyre_Thicc, Tyre_Stretched, Tyre, Tyres, TIRE, TYRE
SHADER = ksTyresFX

${textureBlocks}`;
  }, [carFile, frontRimMesh, rearRimMesh, frontTireMesh, rearTireMesh, frontMake, frontModel, rearMake, rearModel, frontTyre, rearTyre, texList, frontOffset, rearOffset]);

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items) return;

    const kn5List = [];
    let tyresIniFile = null;

    const traverseEntry = async (entry, path = "") => {
      if (entry.isFile) {
        const name = entry.name.toLowerCase();
        if (name.endsWith('.kn5') && name !== 'collider.kn5') kn5List.push(entry.name);
        if (name === 'tyres.ini' && path.toLowerCase().includes('data')) tyresIniFile = entry;
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await new Promise(resolve => reader.readEntries(resolve));
        for (const child of entries) await traverseEntry(child, path + "/" + entry.name);
      }
    };

    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) await traverseEntry(entry);
    }

    if (kn5List.length > 0) setCarFile(kn5List.join(', '));

    if (tyresIniFile) {
      const file = await new Promise(resolve => tyresIniFile.file(resolve));
      const text = await file.text();

      const compounds = [];
      const blocks = text.split(/\[COMPOUND_/i);

      blocks.forEach(block => {
        const nameMatch = block.match(/NAME\s*=\s*([^\r\n]+)/i);
        const shortMatch = block.match(/SHORT_NAME\s*=\s*([^\r\n]+)/i);
        if (nameMatch && shortMatch) {
          const name = nameMatch[1].trim();
          const short = shortMatch[1].trim();
          compounds.push(`${name} (${short})`);
        }
      });

      const uniqueCompounds = [...new Set(compounds)];
      if (uniqueCompounds.length > 0) {
        const newTexList = uniqueCompounds.map(label => ({
          make: 'Valino',
          model: 'Pergea 08R',
          label: label
        }));
        setTexList(newTexList);
      }
    }
  };

  // your handleGenerate, addTexture, removeTexture, copyToClipboard, return JSX (everything else unchanged)
  // just make sure the button text uses getRemainingTrials() and the live config is behind {patronName && (...) }
}
