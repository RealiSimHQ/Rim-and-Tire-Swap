import React, { useState, useMemo, useEffect } from 'react';
import { Car, Disc, Check, Copy, Layers, ClipboardPaste, Search, X, Image as ImageIcon, Trash2, Lock, Zap, Plus, Minus } from 'lucide-react';

// External script for JSZip
const JSZIP_URL = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

// --- PATREON OAUTH CONSTANTS ---
const PATREON_CLIENT_ID = 'vq1EOHIoQ_2p_R0SVEcW3FRYvbMkcwMX1utj5hcvipJ3_1sSPethC5KM2FoiHZgS';
const PATREON_REDIRECT = 'https://realisimhq.github.io/extended-physics-drift-edition/callback.html';
const PATREON_OAUTH_URL = 'https://www.patreon.com/oauth2/authorize';
const LOGO_ID = "1OM0G4EM2uSp7voB-CDIbB1Lj86rJD-cb";

// --- CONSTANTS ---
const INCH_TO_INTERNAL = 0.0250;
const STEP_INCHES = 0.125;
const STEP_INTERNAL = STEP_INCHES * INCH_TO_INTERNAL;
const BASE_OFFSETS = { front: 0.070, rear: -0.055 };
const MAX_FREE_GENERATIONS = 5;

// --- UI THEME COLORS ---
const COLORS = {
  cyan: { text: "text-cyan-400", textFade: "text-cyan-400/60", hoverText: "hover:text-cyan-400", hoverBorder: "hover:border-cyan-500", groupHoverBorder: "group-hover:border-cyan-500", groupHoverShadow: "group-hover:shadow-cyan-500/30", labelValue: "text-cyan-500", accent: "accent-cyan-500", bg: "bg-cyan-500", bgFade: "bg-cyan-500/10", glow: "shadow-[0_0_20px_rgba(34,211,238,0.4)]" },
  purple: { text: "text-purple-400", textFade: "text-purple-400/60", hoverText: "hover:text-purple-400", hoverBorder: "hover:border-purple-500", groupHoverBorder: "group-hover:border-purple-500", groupHoverShadow: "group-hover:shadow-purple-500/30", labelValue: "text-purple-500", accent: "accent-purple-500", bg: "bg-purple-500", bgFade: "bg-purple-500/10", glow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]" }
};

// --- DATA ---
const TYRE_STYLES = {
  Stock: { name: "Tyre Stock", front: { rim: "0.241, 0.204", tyre: "0.209, 0.205" }, rear: { rim: "0.240, 0.180", tyre: "0.209, 0.185" }, file: "Tyre_Stock.kn5", img: "id=1Ru91mDv-nQF8aFT1UHKcRlbHF78tiJh4" },
  Pro: { name: "Tyre Pro", front: { rim: "0.200, 0.195", tyre: "0.209, 0.205" }, rear: { rim: "0.200, 0.180", tyre: "0.209, 0.185" }, file: "Tyre_Pro.kn5", img: "id=1FynBqQ4jbs3KotrP7p8XBwMzLDMg7WRK" },
  Stretched: { name: "Tyre Stretched", front: { rim: "0.201, 0.204", tyre: "0.209, 0.205" }, rear: { rim: "0.200, 0.180", tyre: "0.209, 0.185" }, file: "Tyre_Stretched.kn5", img: "id=1g_RK_e-WQHHrkIwRpeBKkJUrrxA_Xtb_" },
  Thicc: { name: "Tyre Thicc", front: { rim: "0.225, 0.21", tyre: "0.209, 0.205" }, rear: { rim: "0.225, 0.195", tyre: "0.209, 0.185" }, file: "Tyre_Thicc.kn5", img: "id=1dQj2_6L1xzm3ycJW2Bt0kwq4Xsq-g-wc" }
};

const TEXTURE_DATABASE = {
  "Accelera": [{ name: "651 Sport", key: "Accelera_651", img: "id=11ma8HW9zsrIeI1dnIpQcWiQZXYeQdbgm" }],
  "ADL": [{ name: "Standard", key: "ADL", img: "id=1eClkkTgd6sjUI7232_-bgJziLsESSmi_" }],
  "Armstrong": [{ name: "BluTrac HP", key: "Armstrong_BluTracHP", img: "id=1Fh0Nxlp-eXbErOWoQk3cnFfh8Fzwm2bo" }],
  "Falken": [{ name: "Azenis", key: "Falken_Azenis", img: "id=1AZzyQU-ulDgNSqgvHAiPhW9YM457vmmi" }],
  "Federal": [
    { name: "595RS", key: "Federal_595RS", img: "id=1KosOK1qoigKHKvQ_Gw1YD8wzoeV65Nty" },
    { name: "595RS WL Tyre1", key: "Federal_595RS_white_letter_tyre1", img: "id=14bDU6RT9-Oyz7fuaNJgwWvTR8By8cqeu" },
    { name: "595RS WL Tyre2", key: "Federal_595RS_white_letter_tyre2", img: "id=14jFdEP7BgxP9mBQeJs6NhtsShDDsoq-r" }
  ],
  "Ice": [{ name: "Winter Tyre", key: "Ice_Tyre", img: "id=1TSHGYfZUEdAivrXRhTwtc8_5pIkYjtVG" }],
  "Kenda": [{ name: "KR20A", key: "KendaKR20A", img: "id=1hisLqNaVbkROmatf7wrYMJyOuUOiynqp" }],
  "Kumho": [{ name: "Standard", key: "Kumho", img: "id=192AnYt0hk2-nYhT5RDxYAffvRynSXj5q" }],
  "Nitto": [{ name: "NT05", key: "Nitto", img: "id=1bIAI_Z_XVH7u_1QNA3xtOe9gNrjqY20k" }],
  "Toyo": [
    { name: "Proxes Prox", key: "Toyo_Proxies_prox", img: "id=1wP6ys5Ip--GTUakhtpwTNmTVUCCjof2l" },
    { name: "Proxes Standard", key: "Toyo_Proxies", img: "id=1rVHk-bZj4frNyxSngyYVDOFdn72Erv4j" }
  ],
  "Valino": [{ name: "Pergea 08R", key: "Valino_Pergea", img: "id=1UFWu3Ob-_-Mc4Z1ynrOAfqDep6kctotJ" }]
};

const RIM_DATABASE = {
  "Campagnolo": [{ name: "00", img: "https://i.imgur.com/fbuG4uF.jpeg" }],
  "59North": [{ name: "d003", img: "https://i.imgur.com/MoT3l7d.jpeg" }],
  "Advan": [{ name: "A3A", img: "https://i.imgur.com/Qxb4duf.jpeg" }, { name: "TCIII", img: "https://i.imgur.com/2N80K7Z.jpeg" }],
  "BBS": [{ name: "FS", img: "https://i.imgur.com/wO3KViq.jpeg" }, { name: "RI_D", img: "https://i.imgur.com/ARlqCLR.jpeg" }],
  "CCW": [{ name: "CCW", img: "https://i.imgur.com/6ZzpFEI.jpeg" }],
  "Cosmis_Racing": [{ name: "XT-006R", img: "https://i.imgur.com/ALziMdo.jpeg" }],
  "Desmond": [{ name: "Regamaster_S", img: "https://i.imgur.com/9MfOi44.jpeg" }],
  "Enkei": [{ name: "ERPF01", img: "https://i.imgur.com/KPqHOUm.jpeg" }, { name: "GTC_02", img: "https://i.imgur.com/4udVEpC.jpeg" }, { name: "NT03_RR", img: "https://i.imgur.com/lBAIfVR.jpeg" }],
  "HGK": [{ name: "Eurofighter", img: "https://i.imgur.com/IGeCOeW.jpeg" }],
  "HRE": [{ name: "SC300", img: "https://i.imgur.com/NDPoWTt.jpeg" }, { name: "SC305", img: "https://i.imgur.com/8NSZfHO.jpeg" }],
  "Nismo": [{ name: "LM_GT", img: "https://i.imgur.com/oWyZ24O.jpeg" }, { name: "LM_GT4", img: "https://i.imgur.com/zbNbrcH.jpeg" }],
  "OEM": [{ name: "Nissan-Silva", img: "https://i.imgur.com/IWWivK7.jpeg" }],
  "OZ": [{ name: "Futura", img: "https://i.imgur.com/uHG2XVc.jpeg" }],
  "Panasports": [{ name: "G7", img: "https://i.imgur.com/kriY2Vv.jpeg" }],
  "Rotiform": [{ name: "Beadlock", img: "https://i.imgur.com/tofxD6c.jpeg" }],
  "RTR": [{ name: "Tech_7", img: "https://i.imgur.com/tfiPybY.jpeg" }],
  "RV": [{ name: "DF14", img: "https://i.imgur.com/f4Nn8EL.jpeg" }],
  "Speed_Star": [{ name: "mk3", img: "id=1Ab3V7aWusrXMfb6spDNVwV8UlphFaI-W" }],
  "SSR": [{ name: "Longchamp_XR4Z", img: "https://i.imgur.com/GlzRo7s.jpeg" }, { name: "Vienna_Courage", img: "https://i.imgur.com/6lTegPt.jpeg" }, { name: "Vienna_Kreis", img: "id=11phfjdkn7wn3Esmo2vY_PHxC9j1JsKgU" }],
  "STROM": [{ name: "DS-F45", img: "id=1frd_mbVHDEEKeZZxCmMOUjhjETyUXxd1" }],
  "TurboFan": [{ name: "TurboFan", img: "id=104HLzCN8AT3O0EuvvwhqESr9F5BNqjkh" }],
  "Volk": [
    { name: "Rays_57", img: "id=1PEGUklaR4jnPZZ9fqHUByR2hrKB__iWV" }, { name: "Rays_57DR", img: "id=1ACs03BRzL26EmZkSqTLVpcBoyC6cFEVp" },
    { name: "Rays_CE28", img: "id=1ydmAggrQL0SO9rOeu5ifCXnqaw5DVKcX" }, { name: "Rays_G025", img: "id=1xwta1dJigMJ4pUwxpu3tpJ0L6B3HX9bc" },
    { name: "Rays_GL", img: "id=1fEHPg1Hy3YRioct5PXGjdRo0nFIB_-vG" }, { name: "Rays_GTS", img: "id=16N-U6zfYTqxlmBO5yjPh-folHJPR8Nx2" },
    { name: "Rays_TE37V", img: "id=1GZL0dxGEkQOUo5zbRApBxqM0692dIFHd" }, { name: "Rays_TE37Z", img: "id=1aUR6kjHj8_FHj7kdnidelu9dDDJ9czAZ" },
    { name: "5Spoke-Deep", img: "id=1Ex2K7bFLdxLKtnR1w2cd5a8RS3Jce9sn" }
  ],
  "Vossen": [{ name: "VFS-5", img: "id=1Cz_JIcU9tQOPY778ek33q-TDvR-alTO4" }],
  "Watanabe": [{ name: "Watanabe", img: "id=1a475mPt9bRYv1QX_7NpDLVbruACu0-_x" }],
  "Weds": [{ name: "Cerberus_II", img: "id=15MmDlmlOdrJtx7iKswMZia42qJXmOU7M" }],
  "Work": [
    { name: "Emotion_KAI", img: "https://i.imgur.com/PtUjskb.jpeg" }, { name: "Equip_01", img: "id=1FPaYvTRiT9Qb7ZIiXevU3CiaWlUFiG5z" },
    { name: "Equip_03_Deep", img: "id=1bHVjPW8UPnC2fw97b8JHp73rXpLj6hTA" }, { name: "Equip_03", img: "id=1_8fNAZNca68NW9l-nW_LPWQvVyaWyTuy" },
    { name: "Equip_05_Deep", img: "id=1TZGkYRhS0Jm_e9Y3jSWEqWXR3Af2zC7s" }, { name: "Equip_05", img: "id=1cr7IABXyo6_EO8df9Q66PwzRMX6GdcTe" },
    { name: "Equip_40", img: "id=1g24sNGQSau356Ucbx30MwpjkNlQ3fTJj" }, { name: "Kiwami_CR", img: "id=195VQc3_nwDUhZqHyr2emd9m7AwzSIgQx" },
    { name: "Kiwami_Sticker", img: "id=1kh7GLHmkm_Rmv475_xJFxqiI_isjjn-s" }, { name: "Meister_L1", img: "id=1T6TeNtqGk1yqaZIx7fbuJK9snebv20Mu" },
    { name: "Meister_S1", img: "id=1ufqzpgy0kCzFbnniY_qWJi2oDTSNr_6T" }, { name: "VS_XX", img: "id=1vzsA-htawcdnfG9xve000uUTA4Al4lOW" },
    { name: "XD9", img: "id=1An7QmFb3BMV1zz5Mc3jXotNpnsANxd3D" }, { name: "Blitz", img: "id=1QwaztucADK2KywENVh_YXNv8fzYkGT-x" },
    { name: "CR2P", img: "id=1rZrRRV41FQ5d6tpQmS76atMr5bOxVr7-" }, { name: "M8R", img: "id=15isf-CBHVjm0CCYm7U9jeipl7hNPMxzn" }
  ],
  "ZP_Forged": [{ name: "Mono_3", img: "id=1S4QOUz2kcHn3zUgeLuzVys3yqVNwJcDR" }]
};

const TEXTURE_MAKES = Object.keys(TEXTURE_DATABASE).sort();
const RIM_MAKES = Object.keys(RIM_DATABASE).sort();

const TEXTURE_CONFIGS = {
  Accelera_651: { folder: "Accelera_651", diffuse: "tyre.dds", blur: "tyre_blur.dds", normal: "tyre_NM.dds", normalBlur: "tyre_blur_NM.dds" },
  ADL: { folder: "ADL", diffuse: "tyre.dds", blur: "tyre.dds", normal: "tyre_NM.dds", normalBlur: "tyre_NM.dds" },
  Armstrong_BluTracHP: { folder: "Armstrong_BluTracHP", diffuse: "tyre.dds", blur: "tyre.dds", normal: "tyre_NM.dds", normalBlur: "tyre_NM.dds", dirt: "tyre_dirt.dds" },
  Falken_Azenis: { folder: "Falken_Azenis", diffuse: "tyre.dds", blur: "tyre.dds", normal: "tyre_NM.dds", normalBlur: "tyre_NM.dds" },
  Federal_595RS: { folder: "Federal_595RS", diffuse: "tyre.dds", blur: "tyre.dds", normal: "tyre_NM.dds", normalBlur: "tyre_NM.dds" },
  Federal_595RS_white_letter_tyre1: { folder: "Federal_595RS_white_letter", diffuse: "tyre1.dds", blur: "tyre1.dds", normal: "tyre1_NM.dds", normalBlur: "tyre1_NM.dds" },
  Federal_595RS_white_letter_tyre2: { folder: "Federal_595RS_white_letter", diffuse: "tyre2.dds", blur: "tyre2.dds", normal: "tyre2_NM.dds", normalBlur: "tyre2_NM.dds" },
  Ice_Tyre: { folder: "Ice_Tyre", diffuse: "tyre.dds", blur: "tyre.dds", normal: "tyre_NM.dds", normalBlur: "tyre_NM.dds" },
  KendaKR20A: { folder: "KendaKR20A", diffuse: "tyre.dds", blur: "tyre.dds", normal: "tyre_NM.dds", normalBlur: "tyre_NM.dds" },
  Kumho: { folder: "Kumho", diffuse: "tyre.dds", blur: "tyre.dds", normal: "tyre_NM.dds", normalBlur: "tyre_NM.dds" },
  Nitto: { folder: "Nitto", diffuse: "tyre.dds", blur: "tyre.dds", normal: "tyre_NM.dds", normalBlur: "tyre_NM.dds" },
  Toyo_Proxies_prox: { folder: "Toyo_Proxies", diffuse: "Tire_Toyo_prox.dds", blur: "Tire_Toyo_prox.dds", normal: "Tire_Toyo_prox_nm.dds", normalBlur: "Tire_Toyo_prox_nm.dds" },
  Toyo_Proxies: { folder: "Toyo_Proxies", diffuse: "tyre.dds", blur: "tyre.dds", normal: "tyre_nm.dds", normalBlur: "tyre_nm.dds", dirt: "tyre_dirt.dds" },
  Valino_Pergea: { folder: "Valino_Pergea", diffuse: "tyre.dds", blur: "tyre.dds", normal: "tyre_NM.dds", normalBlur: "tyre_NM.dds" }
};

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

// --- PATREON HELPERS ---
function patreonLogin() {
  const returnUrl = encodeURIComponent(window.location.origin + window.location.pathname);
  const url = `${PATREON_OAUTH_URL}?response_type=code&client_id=${PATREON_CLIENT_ID}&redirect_uri=${encodeURIComponent(PATREON_REDIRECT)}&scope=identity%20identity%5Bemail%5D%20identity.memberships&state=${returnUrl}`;
  window.location.href = url;
}
function checkPatreonSession() {
  const auth = sessionStorage.getItem('patreon_authorized');
  const until = parseInt(sessionStorage.getItem('patreon_until') || '0');
  if (auth === 'true' && Date.now() < until) return sessionStorage.getItem('patreon_name') || 'Patron';
  return null;
}

// --- HELPERS ---
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

// --- UI COMPONENTS ---
const OffsetController = ({ label, value, base, setter, colorTheme }) => {
  const c = COLORS[colorTheme];
  const [activeAnim, setActiveAnim] = useState(null);
  const inches = (value - base) / INCH_TO_INTERNAL;
  const fractionStr = getFraction(inches);
  const triggerAnim = (type) => { setActiveAnim(type); setTimeout(() => setActiveAnim(null), 600); };
  const moveIn = () => { setter(Math.max(-0.500, value - STEP_INTERNAL)); triggerAnim('minus'); };
  const moveOut = () => { setter(Math.min(0.500, value + STEP_INTERNAL)); triggerAnim('plus'); };
  const borderClass = activeAnim === 'plus' ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : activeAnim === 'minus' ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)]' : 'border-slate-800';
  return (
    <div className="w-full bg-[#151B28] rounded-[3.5rem] border border-slate-800/80 p-8 flex flex-col items-center gap-6 shadow-2xl relative">
      <h3 className={`text-[13px] font-black uppercase tracking-[0.4em] ${c.textFade} italic mb-2 text-center`}>{label}</h3>
      <div className="flex items-center justify-between w-full gap-6">
        <button onClick={moveIn} className="w-24 h-24 bg-[#0B0F19] rounded-[2rem] border-4 border-slate-800 hover:border-yellow-500 transition-all active:scale-90 flex flex-col items-center justify-center group shadow-xl">
          <Minus size={32} className="text-slate-600 group-hover:text-yellow-500 transition-colors" />
          <span className="text-[9px] font-black uppercase text-slate-700 group-hover:text-yellow-500/50 mt-1">Move In</span>
        </button>
        <div className={`flex-1 bg-[#0B0F19] rounded-[2.5rem] border-4 ${borderClass} p-6 transition-all duration-300 flex flex-col items-center justify-center shadow-inner relative overflow-hidden h-24`}>
          <div className="flex flex-col items-center relative z-10">
            <span className={`text-[28px] font-black ${c.text} font-mono tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]`}>{fractionStr}</span>
          </div>
        </div>
        <button onClick={moveOut} className="w-24 h-24 bg-[#0B0F19] rounded-[2rem] border-4 border-slate-800 hover:border-green-500 transition-all active:scale-90 flex flex-col items-center justify-center group shadow-xl">
          <Plus size={32} className="text-slate-600 group-hover:text-green-500 transition-colors" />
          <span className="text-[9px] font-black uppercase text-slate-700 group-hover:text-green-500/50 mt-1">Move Out</span>
        </button>
      </div>
    </div>
  );
};

const SmartPasteBar = ({ label, value, setter, colorTheme }) => {
  const c = COLORS[colorTheme];
  const [error, setError] = useState('');
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { setter(value ? `${value}${text}, ` : `${text}, `); setError(''); }
    } catch { setError('SANDBOX BLOCKED. CTRL+V HERE'); }
  };
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="relative group w-full h-full">
        {error ? (
          <input autoFocus type="text" className="w-full h-full bg-red-900/10 border-2 border-red-600/50 rounded-[2rem] p-5 font-black text-[11px] tracking-widest text-center outline-none text-red-400 placeholder:text-red-500/50 shadow-inner" placeholder={error} onPaste={(e) => { e.preventDefault(); const text = e.clipboardData.getData('Text'); if (text) { setter(value ? `${value}${text}, ` : `${text}, `); setError(''); } }} onBlur={() => setError('')} />
        ) : (
          <button onClick={handlePaste} className={`w-full h-full flex items-center justify-center gap-3 bg-[#0B0F19] border-2 border-slate-800 rounded-[2rem] p-5 ${c.hoverBorder} transition-all active:scale-95 shadow-xl group`}>
            <ClipboardPaste size={20} className={`${c.text} group-hover:scale-110 transition-transform`} />
            <span className="font-black text-[13px] md:text-[14px] tracking-[0.1em] text-slate-500 group-hover:text-white uppercase leading-none">PASTE {label}</span>
          </button>
        )}
        {value && !error && <button onClick={(e) => { e.stopPropagation(); setter(''); }} className="absolute -top-3 -right-3 p-2.5 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-500 border-2 border-[#151B28] z-10"><Trash2 size={14} /></button>}
      </div>
    </div>
  );
};

const SelectionCard = ({ label, make, model, img, set, colorTheme, isTexture, isRim, isProfiling, onRemove, showRemove }) => {
  const c = COLORS[colorTheme];
  const defaultImgClass = isTexture ? "w-full h-full object-cover scale-[1.07]" : "w-full h-full object-cover scale-[1.12]";
  const imgClass = isRim ? `${defaultImgClass} -translate-x-[1.25%] -translate-y-[2.25%]` : isProfiling ? `${defaultImgClass} -translate-x-[1.25%] -translate-y-[0.75%]` : defaultImgClass;
  const renderHeader = () => {
    if (typeof label === 'object' && label !== null) {
      return (
        <div className="flex flex-col items-center justify-center w-full text-center gap-0.5 py-1 min-h-[40px]">
          <p className="text-[13px] font-black uppercase text-slate-400 tracking-wider whitespace-normal leading-tight px-4 text-center">{label.name}</p>
          <p className="text-[12px] font-black uppercase text-slate-600 tracking-wider whitespace-normal leading-tight px-4 text-center">{label.shortName}</p>
        </div>
      );
    }
    return <span className="text-[26px] font-black uppercase text-slate-500 tracking-[0.15em] shrink-0 text-center leading-none py-0.5 drop-shadow-lg">{label?.toString() || "ITEM"}</span>;
  };
  return (
    <div className={`bg-[#151B28] ${isTexture ? 'p-4' : 'p-8 pt-4 pb-6'} rounded-[3.5rem] border border-slate-800/80 flex flex-col items-center shadow-2xl space-y-4 w-full h-full transition-all relative overflow-hidden`}>
      <div className={`flex items-center justify-center w-full border-b border-slate-800/50 pb-2 px-4 gap-4`}>{renderHeader()}</div>
      {isTexture && showRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute top-4 right-4 p-3 bg-red-600/10 text-red-500 rounded-2xl border border-red-600/20 hover:bg-red-600 hover:text-white transition-all z-10"><Trash2 size={18} /></button>
      )}
      <div onClick={set} className={`group cursor-pointer w-full bg-[#0B0F19] ${isTexture ? 'p-5' : 'p-10'} rounded-[3rem] border-4 border-slate-800 ${c.hoverBorder} transition-all active:scale-95 text-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center flex-1 relative`}>
        <div className={`aspect-square w-[240px] h-[240px] bg-slate-900 rounded-full overflow-hidden ${isTexture ? 'mb-0' : 'mb-8'} border-8 border-slate-800 flex items-center justify-center relative shadow-[0_0_60px_rgba(0,0,0,0.8)] ${c.groupHoverShadow} ${c.groupHoverBorder} transition-all shrink-0`}>
          {img ? <img src={formatImageUrl(img)} className={imgClass} alt={model} /> : <ImageIcon size={72} className="text-slate-800" />}
          {isTexture && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-[#0B0F19]/85 backdrop-blur-md rounded-full border-2 border-cyan-500/50 flex flex-col items-center justify-center p-6 shadow-2xl group-hover:border-cyan-400 group-hover:scale-105 transition-all">
                <p className="text-[12px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-2 italic opacity-80">{make}</p>
                <p className="text-[18px] font-black text-white uppercase italic tracking-tighter leading-tight text-center px-2">{model}</p>
              </div>
            </div>
          )}
        </div>
        {!isTexture && (
          <>
            {make && <p className="text-[13px] font-black text-slate-700 uppercase tracking-[0.3em] mb-3 font-mono italic text-center">{make}</p>}
            <p className="text-[28px] font-black text-white uppercase italic truncate tracking-tighter leading-none w-full px-4 mb-2 text-center">{model}</p>
          </>
        )}
      </div>
    </div>
  );
};

const TireWidthController = ({ label, value, setter, colorTheme, min, max }) => {
  const c = COLORS[colorTheme];
  const [activeAnim, setActiveAnim] = useState(null);
  const triggerAnim = (type) => { setActiveAnim(type); setTimeout(() => setActiveAnim(null), 400); };
  const decrease = () => { setter(Math.max(min, value - 5)); triggerAnim('minus'); };
  const increase = () => { setter(Math.min(max, value + 5)); triggerAnim('plus'); };
  const borderClass = activeAnim === 'plus' ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : activeAnim === 'minus' ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)]' : 'border-slate-800';
  return (
    <div className="bg-[#151B28] rounded-[3.5rem] border border-slate-800/80 p-10 flex flex-col items-center shadow-2xl w-full">
      <h3 className={`text-[13px] font-black uppercase tracking-[0.4em] ${c.textFade} italic mb-8 text-center`}>{label}</h3>
      <div className="flex items-center justify-center gap-6 w-full">
        <button onClick={decrease} className="w-20 h-20 bg-[#0B0F19] rounded-[2rem] border-4 border-slate-800 hover:border-yellow-500 transition-all active:scale-90 flex flex-col items-center justify-center group shadow-xl">
          <Minus size={32} className="text-slate-600 group-hover:text-yellow-500 transition-colors" />
          <span className="text-[9px] font-black uppercase text-slate-700 group-hover:text-yellow-500/50 mt-1">NARROWER</span>
        </button>
        <div className={`flex-1 bg-[#0B0F19] rounded-[2.5rem] border-4 ${borderClass} p-8 transition-all duration-300 flex items-center justify-center shadow-inner relative overflow-hidden h-24`}>
          <span className={`text-[42px] font-black ${c.text} font-mono tracking-tighter leading-none drop-shadow-[0_0_20px_currentColor]`}>{value} mm</span>
        </div>
        <button onClick={increase} className="w-20 h-20 bg-[#0B0F19] rounded-[2rem] border-4 border-slate-800 hover:border-green-500 transition-all active:scale-90 flex flex-col items-center justify-center group shadow-xl">
          <Plus size={32} className="text-slate-600 group-hover:text-green-500 transition-colors" />
          <span className="text-[9px] font-black uppercase text-slate-700 group-hover:text-green-500/50 mt-1">WIDER</span>
        </button>
      </div>
      <p className="text-[10px] font-black text-slate-500 tracking-widest mt-6">Visual Only</p>
    </div>
  );
};// --- MAIN APP ---
export default function App() {
  const [carFile, setCarFile] = useState(() => localStorage.getItem('tp_car') || '');
  const [frontRimMesh, setFrontRimMesh] = useState(() => localStorage.getItem('tp_frm') || '');
  const [rearRimMesh, setRearRimMesh] = useState(() => localStorage.getItem('tp_rrm') || '');
  const [frontTireMesh, setFrontTireMesh] = useState(() => localStorage.getItem('tp_ftm') || '');
  const [rearTireMesh, setRearTireMesh] = useState(() => localStorage.getItem('tp_rtm') || '');
  const [texList, setTexList] = useState(() => {
    const saved = localStorage.getItem('tp_tex_list');
    return saved ? JSON.parse(saved) : [{ make: 'Valino', model: 'Pergea 08R', label: { name: 'Standard', shortName: 'ST' } }];
  });
  const [isDragging, setIsDragging] = useState(false);
  const [genStep, setGenStep] = useState('idle');
  const [copySuccess, setCopySuccess] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(null);
  const [frontMake, setFrontMake] = useState('Advan');
  const [frontModel, setFrontModel] = useState('A3A');
  const [frontTyre, setFrontTyre] = useState('Stretched');
  const [rearMake, setRearMake] = useState('Work');
  const [rearModel, setRearModel] = useState('Blitz');
  const [rearTyre, setRearTyre] = useState('Thicc');
  const [frontOffset, setFrontOffset] = useState(() => parseFloat(localStorage.getItem('tp_f_off')) || BASE_OFFSETS.front);
  const [rearOffset, setRearOffset] = useState(() => parseFloat(localStorage.getItem('tp_r_off')) || BASE_OFFSETS.rear);
  const [frontWidth, setFrontWidth] = useState(() => parseInt(localStorage.getItem('tp_f_width')) || 215);
  const [rearWidth, setRearWidth] = useState(() => parseInt(localStorage.getItem('tp_r_width')) || 215);
  const [patronName, setPatronName] = useState(null);
  const [showGate, setShowGate] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [freeGenCount, setFreeGenCount] = useState(() => parseInt(localStorage.getItem('free_gen_count') || '0'));
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayCountdown, setDelayCountdown] = useState(5);
  const [goldClicked, setGoldClicked] = useState(false);

  useEffect(() => {
    const name = checkPatreonSession();
    setPatronName(name);
    setIsCheckingAuth(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('tp_car', carFile);
    localStorage.setItem('tp_frm', frontRimMesh);
    localStorage.setItem('tp_rrm', rearRimMesh);
    localStorage.setItem('tp_ftm', frontTireMesh);
    localStorage.setItem('tp_rtm', rearTireMesh);
    localStorage.setItem('tp_tex_list', JSON.stringify(texList));
    localStorage.setItem('tp_f_off', frontOffset);
    localStorage.setItem('tp_r_off', rearOffset);
    localStorage.setItem('tp_f_width', frontWidth);
    localStorage.setItem('tp_r_width', rearWidth);
    localStorage.setItem('free_gen_count', freeGenCount);
  }, [carFile, frontRimMesh, rearRimMesh, frontTireMesh, rearTireMesh, texList, frontOffset, rearOffset, frontWidth, rearWidth, freeGenCount]);

  const currentFrontRim = useMemo(() => RIM_DATABASE[frontMake]?.find(m => m.name === frontModel) || RIM_DATABASE[frontMake]?.[0], [frontMake, frontModel]);
  const currentRearRim = useMemo(() => RIM_DATABASE[rearMake]?.find(m => m.name === rearModel) || RIM_DATABASE[rearMake]?.[0], [rearMake, rearModel]);
  const currentFrontTyre = useMemo(() => TYRE_STYLES[frontTyre], [frontTyre]);
  const currentRearTyre = useMemo(() => TYRE_STYLES[rearTyre], [rearTyre]);

  const remainingFree = MAX_FREE_GENERATIONS - freeGenCount;

  const iniContent = useMemo(() => {
    const ftData = TYRE_STYLES[frontTyre];
    const rtData = TYRE_STYLES[rearTyre];
    const clean = (str) => str.trim().replace(/,$/, '').replace(/,\s*$/, '');
    const fOffStr = `${frontOffset.toFixed(3)}, 0.0`;
    const rOffStr = `${rearOffset.toFixed(3)}, 0.0`;
    const frontTyreWidthInternal = (frontWidth / 1000).toFixed(3);
    const rearTyreWidthInternal = (rearWidth / 1000).toFixed(3);
    const textureBlocks = texList.map((tex, idx) => {
      const entryArr = TEXTURE_DATABASE[tex.make];
      const entry = entryArr?.find(m => m.name === tex.model) || entryArr?.[0] || TEXTURE_DATABASE["Valino"][0];
      const labelText = typeof tex.label === 'object' ? `${tex.label.name}-${tex.label.shortName}` : (tex.label || tex.make);
      return `;----${labelText}----;\n${getTextureINI(entry.key, idx)}`;
    }).join('\n\n');
    return `;===================================================================================================================
; Rim/Tyre Swap Generated Config
;===================================================================================================================
[INCLUDE: common/materials_interior.ini]
[INCLUDE: common/custom_rims.ini]
; --- FRONT SETUP ---
[ReplaceRims]
File = ${clean(carFile)}
OriginalRims = ${clean(frontRimMesh)}
Model = /../../parts/rims/${frontMake}/${frontModel}.kn5, ${ftData.front.rim}
Offset = ${fOffStr}
FrontOnly=1
[ReplaceRims]
File = ${clean(carFile)}
OriginalRims = ${clean(frontTireMesh)}
Model = /../../parts/tyre/${ftData.file}, ${ftData.front.tyre.split(',')[0]}, ${frontTyreWidthInternal}
Offset = ${fOffStr}
FrontOnly=1
; --- REAR SETUP ---
[ReplaceRims]
File = ${clean(carFile)}
OriginalRims = ${clean(rearRimMesh)}
Model = /../../parts/rims/${rearMake}/${rearModel}.kn5, ${rtData.rear.rim}
Offset = ${rOffStr}
RearOnly=1
[ReplaceRims]
File = ${clean(carFile)}
OriginalRims = ${clean(rearTireMesh)}
Model = /../../parts/tyre/${rtData.file}, ${rtData.rear.tyre.split(',')[0]}, ${rearTyreWidthInternal}
Offset = ${rOffStr}
RearOnly=1
;===================================================================================================================
; Tyres Lighting & Textures
;===================================================================================================================
[SHADER_REPLACEMENT_...]
MATERIALS = 21 - Default, Tyre.001, TIRE, Tyre_Stock, Tyre_Pro, Tyre_Thicc, Tyre_Stretched, Tyre, Tyres, TYRE, TIRE, TYRES
PROP_... = ksAmbient, 0.25
PROP_... = ksDiffuse, 0.12
PROP_... = ksSpecular, 0.002
PROP_... = ksSpecularEXP, 350
PROP_... = KsAlphaRef, 0
PROP_... = blurLevel, 0
PROP_... = dirtyLevel, 0.00
PROP_... = fresnelC, 0.000
PROP_... = fresnelEXP, 5
PROP_... = fresnelMaxLevel, 0.000
PROP_... = isAdditive, 0
DOUBLE_FACE_SHADOW_BIASED = 1
[SHADER_REPLACEMENT_...]
MATERIALS = Tyre_Stock, Tyre_Pro, Tyre_Thicc, Tyre_Stretched, 21 - Default, Tyre.001
SHADER = ksTyresFX
; --- TIRE TEXTURES ---
${textureBlocks}
;===================================================================================================================
`;
  }, [carFile, frontRimMesh, rearRimMesh, frontTireMesh, rearTireMesh, frontMake, frontModel, frontTyre, rearMake, rearModel, rearTyre, texList, frontOffset, rearOffset, frontWidth, rearWidth]);

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer.items;
    if (!items) return;

    const kn5List = [];
    let targetTyreIni = null;

    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (!entry) continue;
      const collectKN5s = async (ent) => {
        if (ent.isFile) {
          if (ent.name.toLowerCase().endsWith('.kn5') && ent.name.toLowerCase() !== 'collider.kn5') kn5List.push(ent.name);
        } else if (ent.isDirectory) {
          const r = ent.createReader();
          const es = await new Promise(resolve => r.readEntries(resolve));
          for (const c of es) await collectKN5s(c);
        }
      };
      await collectKN5s(entry);
      if (!targetTyreIni) targetTyreIni = await findTyreIni(entry);
    }

    if (kn5List.length > 0) setCarFile(kn5List.join(', '));

    if (targetTyreIni) {
      const file = await new Promise(resolve => targetTyreIni.file(resolve));
      const text = await file.text();
      const blocks = text.split(/\[/);

      const uniqueTextures = new Map();
      const widths = [];

      blocks.forEach(block => {
        const nameMatch = block.match(/^NAME\s*=\s*([^\r\n]+)/mi);
        const shortMatch = block.match(/^SHORT_NAME\s*=\s*([^\r\n]+)/mi);
        const widthMatch = block.match(/^WIDTH\s*=\s*([0-9.]+)/mi);

        if (widthMatch) {
          const internal = parseFloat(widthMatch[1]);
          let w = Math.round(internal * 1000 / 5) * 5;
          if (w < 185) w = 185;
          if (w > 305) w = 305;
          widths.push(w);
        }

        if (nameMatch && shortMatch) {
          const short = shortMatch[1].trim().toUpperCase();
          if (!uniqueTextures.has(short)) {
            uniqueTextures.set(short, {
              name: nameMatch[1].trim().toUpperCase(),
              shortName: short
            });
          }
        }
      });

      if (widths.length > 0) {
        setFrontWidth(widths[0]);
        setRearWidth(widths[1] !== undefined ? widths[1] : widths[0]);
      }

      if (uniqueTextures.size > 0) {
        const newTexList = Array.from(uniqueTextures.values()).map(data => ({
          make: 'Valino',
          model: 'Pergea 08R',
          label: data
        }));
        setTexList(newTexList);
      }
    }
  };

  const findTyreIni = async (entry) => {
    if (entry.isFile) {
      const name = entry.name.toLowerCase();
      if (name === 'tyres.ini' || name === 'tyre.ini') return entry;
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const entries = await new Promise(resolve => reader.readEntries(resolve));
      for (const child of entries) {
        const found = await findTyreIni(child);
        if (found) return found;
      }
    }
    return null;
  };

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = iniContent;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) { console.error('Copy failed', err); }
    document.body.removeChild(textArea);
  };

  const startFreeGenerationWithDelay = () => {
    setShowDelayModal(true);
    setDelayCountdown(5);
    const countdownInterval = setInterval(() => {
      setDelayCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowDelayModal(false);
          performGeneration();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const performGeneration = async () => {
    setGenStep('generating');
    setTimeout(async () => {
      try {
        if (!window.JSZip) {
          const script = document.createElement('script');
          script.src = JSZIP_URL;
          document.head.appendChild(script);
          await new Promise(resolve => script.onload = resolve);
        }
        const zip = new window.JSZip();
        const skinFolder = zip.folder("skins/00_RealiSim_HQ");
        skinFolder.file("ext_config.ini", iniContent);
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `skin_${frontModel}_${rearModel}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setGenStep('idle');
      } catch (e) { setGenStep('idle'); }
    }, 500);
  };

  const handleGenerate = async () => {
    const patron = checkPatreonSession();
    if (patron) {
      performGeneration();
    } else if (freeGenCount >= MAX_FREE_GENERATIONS) {
      setShowGate(true);
    } else {
      startFreeGenerationWithDelay();
      setFreeGenCount((prev) => {
        const newCount = prev + 1;
        localStorage.setItem('free_gen_count', newCount);
        return newCount;
      });
    }
  };

  const addTexture = () => {
    setTexList([...texList, { make: 'Valino', model: 'Pergea 08R', label: { name: 'Compound', shortName: 'SN' } }]);
  };

  const removeTexture = (idx) => {
    if (texList.length > 1) {
      const newList = [...texList];
      newList.splice(idx, 1);
      setTexList(newList);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0B0F19] text-white font-sans px-6 md:px-12 selection:bg-cyan-500/30 overflow-x-hidden pb-24 relative ${patronName ? 'pt-10' : ''}`}>

      {/* REALISIMHQ TOOL NAV (patrons only) */}
      {patronName && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117] border-b border-slate-800 py-2 text-center text-[13px] font-sans">
          <span className="text-slate-500 mr-3">RealiSimHQ Tools:</span>
          <a href="/" className="text-cyan-400 hover:bg-slate-800 px-3 py-1 rounded mx-1 transition-colors no-underline">Content Catalog</a>
          <a href="/ac-physics-tool/" className="text-cyan-400 hover:bg-slate-800 px-3 py-1 rounded mx-1 transition-colors no-underline">OG Physics</a>
          <a href="/extended-physics-drift-edition/" className="text-cyan-400 hover:bg-slate-800 px-3 py-1 rounded mx-1 transition-colors no-underline">Extended Physics</a>
          <a href="/Rim-and-Tire-Swap/" className="text-[#f0b429] bg-slate-800 px-3 py-1 rounded mx-1 font-bold no-underline">Rim & Tire Swap</a>
        </nav>
      )}

      {/* PATREON BAR */}
      <div className="absolute top-6 right-8 z-40">
        {isCheckingAuth ? (
          <span className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Checking Patreon...</span>
        ) : patronName ? (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 px-6 py-2.5 rounded-full shadow-xl">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-green-400 text-xs font-black uppercase tracking-widest italic">Patron: {patronName} ✓</span>
          </div>
        ) : (
          <button onClick={patreonLogin} className="flex items-center gap-3 bg-[#FF424D] hover:bg-[#E33B44] text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 border border-white/10">
            <ImageIcon size={14} className="fill-white" /> Login with Patreon
          </button>
        )}
      </div>

      {/* GENERATING MODAL */}
      {genStep === 'generating' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#151B28] border border-slate-800 rounded-[3.5rem] shadow-2xl p-14 text-center space-y-8 relative overflow-hidden">
            <div className="space-y-6 py-4 animate-in zoom-in-95 duration-300">
              <img src={formatImageUrl(`id=${LOGO_ID}`)} alt="Logo" className="h-20 mx-auto mb-4" />
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <Zap className="text-cyan-400 fill-cyan-400 animate-pulse" size={36} />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-2 uppercase italic text-center text-white">Generating pack...</h3>
              <p className="text-slate-400 text-[10px] tracking-[0.2em] uppercase font-black italic">RealiSim HQ Rim and Tyre</p>
              {checkPatreonSession() && <div className="text-green-400 text-sm font-black italic mt-4">Thank you for your support! ❤️</div>}
            </div>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          </div>
        </div>
      )}

      {/* DELAY MODAL */}
      {showDelayModal && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#151B28] border border-slate-800 rounded-[3.5rem] shadow-2xl p-14 text-center space-y-8 relative overflow-hidden">
            <img src={formatImageUrl(`id=${LOGO_ID}`)} alt="Logo" className="h-24 mx-auto mb-6 animate-[spin_3s_linear_infinite]" />
            <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white">Free Generation</h3>
            <p className="text-slate-400 text-lg font-medium">Please wait {delayCountdown} seconds...</p>
            <div className="text-xs text-slate-500 italic">Support RealiSim HQ on Patreon for unlimited generations</div>
            <button onClick={patreonLogin} className="mt-6 text-cyan-400 hover:text-white text-sm underline">Join Patreon Now</button>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          </div>
        </div>
      )}

      {/* GATE MODAL */}
      {showGate && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#151B28] border border-slate-800 rounded-[3.5rem] shadow-2xl p-12 text-center space-y-8 relative">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20"><Lock size={40} /></div>
            <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">Free Trial Used</h3>
            <div className="space-y-2">
              <p className="text-slate-400 text-sm leading-relaxed font-medium">You've used all 5 free generations.</p>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">Subscribe for unlimited access.</p>
            </div>
            <div className="pt-4 flex flex-col gap-4">
              <a href="https://www.patreon.com/membership/26118508" target="_blank" className="w-full py-6 bg-[#FF424D] hover:bg-[#E33B44] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl block text-center">Subscribe Now – $10/month</a>
              <button onClick={() => setShowGate(false)} className="text-slate-400 hover:text-white transition-colors text-sm underline font-bold">Close</button>
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40"></div>
          </div>
        </div>
      )}

      {/* PICKER MODAL */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#151B28] w-full max-w-[1450px] max-h-[85vh] rounded-[4rem] shadow-2xl overflow-hidden flex flex-col border border-slate-800">
            <header className="p-10 border-b border-slate-800 flex items-center justify-between bg-[#0F141F]">
              <h2 className="text-2xl font-black tracking-tighter italic flex items-center gap-4 uppercase">
                <Search size={28} className="text-cyan-400" /> 
                Select {pickerOpen.type === 'texture' ? 'Tire Texture' : pickerOpen.includes('tyre-profile') ? 'Tyre Profile' : 'Rim'}
              </h2>
              <button onClick={() => setPickerOpen(null)} className="p-3 hover:bg-slate-800 rounded-full transition-colors text-slate-500"><X size={32} /></button>
            </header>
            <div className="flex-1 overflow-hidden flex bg-[#0B0F19]">
              {pickerOpen.type === 'texture' ? (
                <>
                  <div className="w-72 border-r border-slate-800 overflow-y-auto bg-[#0F141F] p-6 space-y-1 custom-scrollbar">
                    {TEXTURE_MAKES.map(make => (
                      <button key={make} onClick={() => {
                        const newList = [...texList];
                        newList[pickerOpen.index].make = make;
                        setTexList(newList);
                      }} className={`w-full text-left px-8 py-5 text-[14px] font-black tracking-widest transition-all rounded-[2rem] ${texList[pickerOpen.index].make === make ? 'bg-cyan-600 text-white shadow-xl scale-105 shadow-cyan-900/40' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}>{make}</button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto p-16 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-12 custom-scrollbar">
                    {TEXTURE_DATABASE[texList[pickerOpen.index].make].map(model => (
                      <div key={model.key} onClick={() => {
                        const newList = [...texList];
                        newList[pickerOpen.index].model = model.name;
                        setTexList(newList);
                        setPickerOpen(null);
                      }} className="group cursor-pointer space-y-4 text-center">
                        <div className="aspect-square bg-slate-900 rounded-full overflow-hidden border-4 border-transparent group-hover:border-cyan-500 transition-all relative flex items-center justify-center shadow-xl">
                          <img src={formatImageUrl(model.img)} className="w-full h-full object-cover scale-[1.07]" alt={model.name} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[80%] h-[80%] bg-[#0B0F19]/85 backdrop-blur-md rounded-full border-2 border-cyan-500/50 flex flex-col items-center justify-center p-4 shadow-2xl group-hover:border-cyan-400 group-hover:scale-105 transition-all">
                              <p className="text-[8px] md:text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-1 italic opacity-80">{texList[pickerOpen.index].make}</p>
                              <p className="text-[10px] md:text-[13px] font-black text-white uppercase italic tracking-tighter leading-tight text-center px-1">{model.name}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-[12px] font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-[0.2em] px-2 truncate opacity-0 group-hover:opacity-100">{model.name}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : pickerOpen.includes('tyre-profile') ? (
                <div className="flex-1 overflow-y-auto p-16 grid grid-cols-2 md:grid-cols-4 gap-16 justify-items-center">
                  {Object.keys(TYRE_STYLES).map(styleKey => (
                    <div key={styleKey} onClick={() => { (pickerOpen.includes('front') ? setFrontTyre : setRearTyre)(styleKey); setPickerOpen(null); }} className="group cursor-pointer space-y-6 text-center">
                      <div className="w-56 h-56 bg-slate-900 rounded-full overflow-hidden border-4 border-transparent group-hover:border-cyan-500 transition-all shadow-2xl relative flex items-center justify-center">
                        {TYRE_STYLES[styleKey].img ? <img src={formatImageUrl(TYRE_STYLES[styleKey].img)} className="w-full h-full object-cover scale-110" /> : <Disc size={64} className="text-slate-800" />}
                      </div>
                      <p className="font-black text-[14px] uppercase tracking-[0.3em] text-slate-400 group-hover:text-cyan-400 transition-colors">{TYRE_STYLES[styleKey].name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="w-72 border-r border-slate-800 overflow-y-auto bg-[#0F141F] p-6 space-y-1 custom-scrollbar">
                    {RIM_MAKES.map(make => (
                      <button key={make} onClick={() => (pickerOpen.includes('front') ? setFrontMake : setRearMake)(make)} className={`w-full text-left px-8 py-5 text-[14px] font-black tracking-widest transition-all rounded-[2rem] ${(pickerOpen.includes('front') ? frontMake : rearMake) === make ? 'bg-cyan-600 text-white shadow-xl scale-105 shadow-cyan-900/40' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}>{make}</button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto p-16 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-12 custom-scrollbar">
                    {RIM_DATABASE[pickerOpen.includes('front') ? frontMake : rearMake].map(model => (
                      <div key={model.name} onClick={() => { (pickerOpen.includes('front') ? setFrontModel : setRearModel)(model.name); setPickerOpen(null); }} className="group cursor-pointer space-y-4 text-center">
                        <div className="aspect-square bg-slate-900 rounded-full overflow-hidden border-4 border-transparent group-hover:border-cyan-500 transition-all relative flex items-center justify-center shadow-xl">
                          {model.img ? <img src={formatImageUrl(model.img)} className="w-full h-full object-cover scale-[1.12] -translate-x-[1.25%] -translate-y-[2.25%]" alt={model.name} /> : <ImageIcon size={48} className="text-slate-800" />}
                        </div>
                        <p className="text-[12px] font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-[0.2em] px-2 truncate">{model.name}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1900px] mx-auto pt-10 pb-12 h-full flex flex-col">
        <header className="flex flex-col items-center justify-center space-y-3 pb-10">
          <a href="https://www.patreon.com/c/u80119694" target="_blank" className="group transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_40px_rgba(34,211,238,0.8)]">
            <img src={formatImageUrl(`id=${LOGO_ID}`)} alt="RealiSim HQ" className="h-32 md:h-40 drop-shadow-[0_0_35px_rgba(34,211,238,0.6)]" />
          </a>
          <div className="flex flex-col items-center">
            <h1 className="text-5xl md:text-[4.5rem] font-black tracking-[-0.015em] uppercase italic leading-none text-center text-white">
              RIM and TYRE
            </h1>
            <p className="text-[13px] font-black uppercase tracking-[0.25em] text-slate-500 italic mt-1">*Defaults for 0.3150 Tire RADIUS*</p>
          </div>
        </header>

        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12">
            <div className="flex flex-col gap-6">
              <SelectionCard label="Front Rim" make={frontMake} model={frontModel} img={currentFrontRim.img} set={() => setPickerOpen('front-rim')} colorTheme="cyan" isRim={true} />
              <SelectionCard label="Front Profiling" make="" model={currentFrontTyre.name} img={currentFrontTyre.img} set={() => setPickerOpen('front-tyre-profile')} colorTheme="cyan" isProfiling={true} />
            </div>
            <div className="flex flex-col gap-6">
              <SelectionCard label="Rear Rim" make={rearMake} model={rearModel} img={currentRearRim.img} set={() => setPickerOpen('rear-rim')} colorTheme="purple" isRim={true} />
              <SelectionCard label="Rear Profiling" make="" model={currentRearTyre.name} img={currentRearTyre.img} set={() => setPickerOpen('rear-tyre-profile')} colorTheme="purple" isProfiling={true} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1100px] mx-auto">
            <TireWidthController label="FRONT TIRE WIDTH (MM)" value={frontWidth} setter={setFrontWidth} colorTheme="cyan" min={185} max={265} />
            <TireWidthController label="REAR TIRE WIDTH (MM)" value={rearWidth} setter={setRearWidth} colorTheme="purple" min={185} max={305} />
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 w-full max-w-[1500px] justify-items-center">
              {texList.map((tex, idx) => (
                <div key={idx} className="w-full max-w-[620px]">
                  <SelectionCard label={tex.label} make={tex.make} model={tex.model} img={TEXTURE_DATABASE[tex.make]?.find(m => m.name === tex.model)?.img} set={() => setPickerOpen({ type: 'texture', index: idx })} colorTheme="cyan" isTexture={true} showRemove={texList.length > 1} onRemove={() => removeTexture(idx)} />
                </div>
              ))}
              <div onClick={addTexture} className="w-full max-w-[620px] bg-[#151B28]/40 border-2 border-dashed border-slate-800 rounded-[3.5rem] min-h-[400px] flex flex-col items-center justify-center group cursor-pointer hover:border-cyan-500/50 transition-all hover:bg-cyan-500/5">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 group-hover:text-cyan-400 group-hover:scale-110 transition-all border-4 border-slate-800 group-hover:border-cyan-500/50 shadow-xl mb-6">
                  <Plus size={48} />
                </div>
                <p className="font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-cyan-400 transition-colors">Add Texture Slot</p>
              </div>
            </div>
          </div>

          <div className="bg-[#151B28] rounded-[3.5rem] p-10 border border-slate-800/80 shadow-2xl flex flex-col gap-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-5">
                <Layers size={36} className="text-cyan-400" />
                <h2 className="text-3xl font-black uppercase italic tracking-widest text-white">Dashboard</h2>
              </div>
            </div>
            <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} className={`relative group transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}>
              <input type="text" placeholder="PASTE CAR FOLDER OR TYPE KN5s HERE..." className={`w-full p-8 bg-[#0B0F19] border-2 rounded-[2.5rem] outline-none font-black text-[18px] tracking-[0.3em] focus:border-cyan-500 transition-all text-white placeholder:text-slate-700 shadow-inner text-center italic ${isDragging ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800'}`} value={carFile} onChange={(e) => setCarFile(e.target.value)} />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-cyan-500"><Car size={40} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[90px]">
              <SmartPasteBar label="FRONT RIM" value={frontRimMesh} setter={setFrontRimMesh} colorTheme="cyan" />
              <SmartPasteBar label="REAR RIM" value={rearRimMesh} setter={setRearRimMesh} colorTheme="purple" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[90px]">
              <SmartPasteBar label="FRONT TYRE" value={frontTireMesh} setter={setFrontTireMesh} colorTheme="cyan" />
              <SmartPasteBar label="REAR TYRE" value={rearTireMesh} setter={setRearTireMesh} colorTheme="purple" />
            </div>

            <div className="flex justify-center mb-4">
              <a 
                href="https://drive.google.com/file/d/1qHmA_JnPEBs9f5F4ykNXUT4DOoBy2qGQ/view?usp=drive_link" 
                target="_blank"
                onClick={() => setGoldClicked(true)}
                className={`group flex items-center gap-4 px-12 py-5 rounded-3xl font-black text-[18px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 border border-amber-300/50 ring-1 ring-amber-400/30 overflow-hidden relative ${goldClicked ? 'bg-slate-700 text-slate-400 scale-95' : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-400 hover:scale-125 animate-[goldPulse_1.8s_ease-in-out_infinite]'}`}
              >
                <img src={formatImageUrl(`id=${LOGO_ID}`)} alt="RealiSim HQ" className="h-10 group-hover:scale-110 transition-transform" />
                Mandatory RealiSim HQ Rims, Tires & Parts
              </a>
            </div>

            <button onClick={handleGenerate} className="w-full flex items-center justify-center gap-6 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white py-10 rounded-[2.5rem] font-black text-3xl uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(34,211,238,0.25)] active:scale-[0.98] transition-all border-b-[8px] border-black/40 group ring-4 ring-transparent hover:ring-cyan-500/30">
              <Zap size={44} className="fill-white group-hover:scale-125 transition-transform" /> 
              {checkPatreonSession() ? "GENERATE PACKAGE" : `${remainingFree} Free Generations Remaining`}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12 px-2">
            <OffsetController label="Front Wheel Poke Fitment" value={frontOffset} base={BASE_OFFSETS.front} setter={setFrontOffset} colorTheme="cyan" />
            <OffsetController label="Rear Wheel Poke Fitment" value={rearOffset} base={BASE_OFFSETS.rear} setter={setRearOffset} colorTheme="purple" />
          </div>

          {checkPatreonSession() && (
            <div className="bg-[#151B28] rounded-[3.5rem] p-10 shadow-2xl flex flex-col border border-slate-800/80 h-[600px]">
              <div className="flex items-center justify-between mb-8 px-2 shrink-0">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 text-cyan-400">
                    <Layers size={32} />
                    <h2 className="font-black uppercase text-[20px] tracking-[0.4em] italic text-white">Live Config</h2>
                  </div>
                  <p className="text-[12px] text-slate-500 font-black tracking-widest uppercase">Real-time Stream</p>
                </div>
                <button onClick={copyToClipboard} className="px-8 py-4 bg-[#0B0F19] hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all flex items-center gap-3 text-[13px] font-black border border-slate-700 active:scale-90 uppercase tracking-widest shadow-xl">
                  {copySuccess ? <Check size={20} className="text-green-500" /> : <Copy size={20} />} {copySuccess ? 'Copied' : 'Copy All'}
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-[#0B0F19] rounded-[2.5rem] p-10 font-mono text-[13px] leading-relaxed text-slate-400 custom-scrollbar border border-slate-800 shadow-inner whitespace-pre">
                {iniContent}
              </div>
            </div>
          )}
        </div>
        <footer className="text-center py-12 text-[16px] text-slate-700 font-black uppercase tracking-[0.8em] opacity-40 italic mt-12">Master Configurator v4.8</footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; border: 4px solid #0B0F19; }
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 25px #fbbf24, 0 0 50px #a855f7; }
          50% { box-shadow: 0 0 50px #fbbf24, 0 0 80px #a855f7; }
        }
      `}} />
    </div>
  );
}
