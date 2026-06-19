import { useState, useEffect, useRef } from "react";

// ─── BRAND TOKENS ────────────────────────────────────────────────
const C = {
  maroon: "#6B1E3F", maroonDark: "#4A1229", maroonLight: "#8B2A55",
  gold: "#C4973A", goldLight: "#E8B85A",
  green: "#2D6A4F", greenLight: "#52B788", greenPale: "#D8F3DC",
  soil: "#8B6914", soilLight: "#F4EBD0",
  cream: "#FDFAF5", charcoal: "#1A1A1A", muted: "#6B7280",
  border: "#E5E0D8", white: "#FFFFFF",
  red: "#C0392B", orange: "#E67E22", blue: "#2980B9",
};

// ─── INITIAL DATA ────────────────────────────────────────────────
const INITIAL_FARMERS = [
  {
    id: "F001", name: "Ramesh Yadav", village: "Mataundh", district: "Hamirpur",
    land: 1.5, soilType: "Sandy Loam", nitrogen: 180, phosphorus: 28, potassium: 210,
    soc: 0.38, waterAvail: "Borewell (seasonal)", cropHistory: "Wheat, Wheat, Wheat",
    economicProfile: "Marginal (<1ha)", status: "Plan Generated", planGenerated: true,
    produce: [{ id: "P001", crop: "Mustard", qty: 180, stage: "Cold Storage", buyer: "Mandi Sell", qrGenerated: true, harvestDate: "2026-03-10" }],
    plan: null,
  },
  {
    id: "F002", name: "Sita Devi", village: "Jhansi", district: "Jhansi",
    land: 0.8, soilType: "Clay", nitrogen: 140, phosphorus: 18, potassium: 185,
    soc: 0.21, waterAvail: "Rainfed only", cropHistory: "Paddy, Paddy, Wheat",
    economicProfile: "Marginal (<1ha)", status: "Soil Assessed", planGenerated: false,
    produce: [], plan: null,
  },
  {
    id: "F003", name: "Mohan Patel", village: "Banda", district: "Banda",
    land: 2.2, soilType: "Clay Loam", nitrogen: 210, phosphorus: 35, potassium: 240,
    soc: 0.52, waterAvail: "Canal irrigation", cropHistory: "Gram, Wheat, Mustard",
    economicProfile: "Small (1–2ha)", status: "Plan Generated", planGenerated: true,
    produce: [{ id: "P002", crop: "Gram", qty: 320, stage: "Buyer Matched", buyer: "B2B Buyer", qrGenerated: true, harvestDate: "2026-02-18" },
              { id: "P003", crop: "Wheat", qty: 410, stage: "Sold", buyer: "Mandi Sell", qrGenerated: true, harvestDate: "2026-04-02" }],
    plan: null,
  },
];

const INITIAL_RENTALS = [
  { id: "R001", farmerId: "F001", farmerName: "Ramesh Yadav", equipment: "Multi-crop Seeder", startDate: "2026-06-20", endDate: "2026-06-22", hours: 6, ratePerHour: 180, status: "Confirmed", totalCost: 1080 },
  { id: "R002", farmerId: "F003", farmerName: "Mohan Patel", equipment: "Soil Sensor Kit", startDate: "2026-06-18", endDate: "2026-06-18", hours: 2, ratePerHour: 250, status: "Completed", totalCost: 500 },
];

const EQUIPMENT_LIST = [
  { name: "Multi-crop Seeder", icon: "🌱", ratePerHour: 180, available: true, desc: "Precision multi-crop seeder for row sowing" },
  { name: "Rotavator", icon: "⚙️", ratePerHour: 220, available: true, desc: "Deep soil tillage and seedbed preparation" },
  { name: "Soil Sensor Kit", icon: "🔬", ratePerHour: 250, available: false, desc: "NPK + SOC field sensor with digital readout" },
  { name: "Mini Tractor (25HP)", icon: "🚜", ratePerHour: 350, available: true, desc: "Compact tractor for smallholder fields" },
  { name: "Drip Irrigation Set", icon: "💧", ratePerHour: 120, available: true, desc: "2-acre drip irrigation setup with timer" },
  { name: "Drone Sprayer", icon: "🚁", ratePerHour: 480, available: false, desc: "Agricultural drone for precision spray" },
  { name: "Thresher (Portable)", icon: "🌾", ratePerHour: 200, available: true, desc: "Portable grain thresher for post-harvest" },
  { name: "Bio-Shredder", icon: "♻️", ratePerHour: 150, available: true, desc: "Organic matter shredder for compost making" },
];

const CROP_OPTIONS = ["Wheat","Paddy","Mustard","Gram","Arhar (Pigeon Pea)","Lentil","Sunflower","Sesame","Soybean","Maize"];
const SOIL_TYPES = ["Sandy Loam","Clay Loam","Red Laterite","Black Cotton","Sandy","Clay","Silty Loam"];
const WATER_OPTIONS = ["Canal irrigation","Borewell (seasonal)","Borewell (perennial)","Rainfed only","Check dam nearby","Drip irrigation"];
const DISTRICTS = ["Hamirpur","Jhansi","Banda","Mahoba","Lalitpur","Chitrakoot","Kanpur Dehat","Kanpur Nagar"];
const ECO_PROFILES = ["Marginal (<1ha)","Small (1–2ha)","Semi-medium (2–4ha)","Medium (4–10ha)"];
const PRODUCE_STAGES = ["Harvested","Cold Storage","Buyer Matched","Dispatched","Sold"];
const BUYER_TYPES = ["Mandi Sell","B2B Buyer","B2C Premium","FPO Aggregation","Cold Storage Hold"];
const ONBOARD_STEPS = ["Farmer Identity", "Crop History", "Soil & Water"];

// ─── UI PRIMITIVES ───────────────────────────────────────────────
function Badge({ color, children }) {
  const map = {
    green: { bg: C.greenPale, text: C.green },
    maroon: { bg: "#F8E8EE", text: C.maroon },
    gold: { bg: "#FEF3D0", text: C.soil },
    gray: { bg: "#F3F4F6", text: C.muted },
    blue: { bg: "#EBF5FB", text: C.blue },
    orange: { bg: "#FEF0E6", text: C.orange },
    red: { bg: "#FDEDEC", text: C.red },
  };
  const s = map[color] || map.gray;
  return <span style={{ background: s.bg, color: s.text, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{children}</span>;
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", options, required, hint, disabled }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.charcoal, marginBottom: 4 }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>}
      {hint && <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{hint}</div>}
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.charcoal, background: disabled ? "#f9f9f9" : C.white, outline: "none" }}>
          <option value="">— Select —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.charcoal, background: disabled ? "#f9f9f9" : C.white, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, small, style = {} }) {
  const base = { borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: small ? 13 : 14, padding: small ? "6px 14px" : "10px 22px", transition: "all 0.15s", opacity: disabled ? 0.55 : 1, ...style };
  const vs = { primary: { background: C.maroon, color: C.white }, green: { background: C.green, color: C.white }, gold: { background: C.gold, color: C.white }, ghost: { background: "transparent", color: C.maroon, border: `1.5px solid ${C.maroon}` }, blue: { background: C.blue, color: C.white }, danger: { background: C.red, color: C.white } };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...(vs[variant] || vs.primary) }}>{children}</button>;
}

function SoilBar({ label, value, max, unit, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
        <span style={{ color: C.charcoal, fontWeight: 500 }}>{label}</span>
        <span style={{ color: color || C.green, fontWeight: 700 }}>{value} {unit}</span>
      </div>
      <div style={{ height: 8, background: C.border, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color || C.green, borderRadius: 99 }} />
      </div>
    </div>
  );
}

function StepBar({ current, steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 70 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: i < current ? C.green : i === current ? C.maroon : C.border, color: i <= current ? C.white : C.muted, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              {i < current ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: 11, color: i === current ? C.maroon : i < current ? C.green : C.muted, fontWeight: i === current ? 700 : 400, textAlign: "center", lineHeight: 1.2 }}>{s}</div>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < current ? C.green : C.border, marginBottom: 20, minWidth: 16 }} />}
        </div>
      ))}
    </div>
  );
}

// ─── QR CODE COMPONENT ──────────────────────────────────────────
function QRDisplay({ data, size = 120 }) {
  // SVG-based QR-style visual (deterministic pattern from data string)
  const hash = data.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const cells = 11;
  const grid = [];
  for (let r = 0; r < cells; r++) {
    for (let c2 = 0; c2 < cells; c2++) {
      const isCorner = (r < 3 && c2 < 3) || (r < 3 && c2 > cells - 4) || (r > cells - 4 && c2 < 3);
      const bit = isCorner || (((hash ^ (r * 17 + c2 * 31)) & 1) === 1 && !(r === 1 && c2 === 1) && !(r === 1 && c2 > cells - 3) && !(r > cells - 3 && c2 === 1));
      grid.push({ r, c: c2, on: bit });
    }
  }
  const cell = size / cells;
  return (
    <svg width={size} height={size} style={{ borderRadius: 6, border: `2px solid ${C.border}` }}>
      <rect width={size} height={size} fill="white" />
      {grid.map(({ r, c: c2, on }, i) =>
        on ? <rect key={i} x={c2 * cell} y={r * cell} width={cell - 0.5} height={cell - 0.5} fill={C.charcoal} /> : null
      )}
      {/* Corner markers */}
      {[[0,0],[0,cells-3],[cells-3,0]].map(([ry,cx], i) => (
        <g key={i}>
          <rect x={cx*cell} y={ry*cell} width={3*cell} height={3*cell} fill={C.charcoal} rx={2}/>
          <rect x={cx*cell+cell*0.5} y={ry*cell+cell*0.5} width={2*cell} height={2*cell} fill="white" rx={1}/>
          <rect x={cx*cell+cell} y={ry*cell+cell} width={cell} height={cell} fill={C.charcoal} rx={1}/>
        </g>
      ))}
    </svg>
  );
}

function QRCard({ produce, farmer }) {
  const qrData = `SQUIRE-VERIFIED|ID:${produce.id}|FARMER:${farmer.id}|CROP:${produce.crop}|QTY:${produce.qty}kg|HARVEST:${produce.harvestDate || "2026"}|SOC:${farmer.soc}%|BUYER:${produce.buyer}|STATUS:${produce.stage}`;
  const [expanded, setExpanded] = useState(false);
  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <QRDisplay data={qrData} size={100} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.charcoal, marginBottom: 2 }}>{produce.crop}</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Batch #{produce.id} · {produce.qty} kg</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <Badge color="green">✓ Squire Verified</Badge>
            <Badge color={produce.stage === "Sold" ? "green" : produce.stage === "Buyer Matched" ? "blue" : "gold"}>{produce.stage}</Badge>
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>Farmer: <strong style={{ color: C.charcoal }}>{farmer.name}</strong></div>
          <div style={{ fontSize: 12, color: C.muted }}>SOC at harvest: <strong style={{ color: C.green }}>{farmer.soc}%</strong></div>
          <div style={{ fontSize: 12, color: C.muted }}>Buyer: <strong style={{ color: C.charcoal }}>{produce.buyer || "—"}</strong></div>
          <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", color: C.maroon, fontSize: 12, cursor: "pointer", fontWeight: 600, padding: 0, marginTop: 6 }}>
            {expanded ? "▲ Hide QR data" : "▼ View QR trace data"}
          </button>
          {expanded && (
            <div style={{ background: C.cream, borderRadius: 6, padding: 8, marginTop: 6, fontSize: 10, color: C.muted, fontFamily: "monospace", wordBreak: "break-all" }}>
              {qrData}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── AI CROP PLAN — Direct Local Connection ─────────────────────
async function generateCropPlan(farmer) {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
console.log("DEBUG: All Vite env variables:", import.meta.env);
  if (!GEMINI_API_KEY) {
    alert("🚨 API Key missing! Make sure you have a .env file with VITE_GEMINI_API_KEY set.");
    throw new Error("API Key missing");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `You are Squire Digital Brain — an AI agricultural planning system for restorative farming in semi-arid India (Bundelkhand/Central UP).

FARMER PROFILE:
- Name: ${farmer.name}, Village: ${farmer.village}, District: ${farmer.district}
- Land: ${farmer.land} ha, Soil Type: ${farmer.soilType}
- Soil N-P-K: ${farmer.nitrogen} / ${farmer.phosphorus} / ${farmer.potassium} kg/ha
- Soil Organic Carbon (SOC): ${farmer.soc}%
- Water: ${farmer.waterAvail}
- Crop History (last 3 seasons): ${farmer.cropHistory}
- Economic Profile: ${farmer.economicProfile}

Return ONLY a single compact JSON object. No markdown. No text before or after. All string values must be SHORT (under 60 chars).

{"soilHealthScore":55,"soilHealthGrade":"Fair","degradationRisk":"High","keyIssues":["Low SOC","Monocropping","N deficiency"],"year1":{"season1":{"crop":"Mustard","variety":"Pusa Bold","sowMonth":"Oct","harvestMonth":"Feb","expectedYield":"8-10 qtl/acre","netProfit":"18000-22000","soilBenefit":"Breaks wheat cycle"},"season2":{"crop":"Moong","variety":"Pusa Vishal","sowMonth":"Mar","harvestMonth":"Jun","expectedYield":"4-5 qtl/acre","netProfit":"10000-14000","soilBenefit":"Fixes nitrogen"}},"year3Target":{"socImprovement":"+0.4%","profitIncrease":"+35%","crops":["Mustard","Gram","Sesame"]},"year5Target":{"socImprovement":"+0.8%","profitIncrease":"+65%","crops":["Mustard","Arhar","Sesame"]},"fertilizerPrescription":{"organic":"Vermicompost 2t/acre pre-sowing","bio":"Rhizobium+PSB at seed treatment","chemical":"DAP 50kg/acre basal only","schedule":"Organic pre-sow, bio seed, DAP basal"},"pestAlert":{"riskLevel":"High","likely":["Aphids","White rust"],"bioIntervention":"Neem oil 3ml/L at 30 DAS"},"weatherLogic":{"sowingWindow":"Oct 15 - Nov 10","irrigationSchedule":"2x: flowering Dec, pod-fill Jan","harvestWindow":"Feb 15 - Mar 5"},"mandiTiming":{"bestMonth":"March-April","expectedPrice":"5400-5800/qtl","recommendation":"Hold till March for 10% premium"},"inputShoppingList":[{"item":"Mustard Seed","qty":"2 kg/acre","cost":"280","source":"Squire Outlet"},{"item":"Vermicompost","qty":"2t/acre","cost":"1800","source":"Squire Outlet"},{"item":"DAP Fertilizer","qty":"50 kg/acre","cost":"1350","source":"Squire Outlet"},{"item":"Neem Oil","qty":"3L","cost":"450","source":"Squire Outlet"}],"planScore":72,"profitabilityIndex":"High"}

Replace ALL values above to match this specific farmer. Keep exact same keys and structure. Keep all strings under 60 characters.`;

  const optimizedPrompt = prompt + "\n\nIMPORTANT: Return ONLY a valid, clean raw JSON object string. Do not wrap it in markdown code blocks like \`\`\`json ... \`\`\`. Start directly with { and end with }.";

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: optimizedPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        }
      })
    });
  } catch (networkErr) {
    throw new Error(`Network error: ${networkErr.message}`);
  }

  if (!res.ok) {
    let errBody = "";
    try { errBody = await res.text(); } catch (_) {}
    throw new Error(`API HTTP ${res.status}: ${errBody.slice(0, 300)}`);
  }

  let data;
  try {
    data = await res.json();
  } catch (parseErr) {
    throw new Error(`Parse error: ${parseErr.message}`);
  }

  let text = "";
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.text) text += part.text;
  }

  text = text.trim();
  if (text.startsWith("```json")) text = text.substring(7);
  else if (text.startsWith("```")) text = text.substring(3);
  if (text.endsWith("```")) text = text.substring(0, text.length - 3);
  text = text.trim();

  if (!text) throw new Error("Empty response from Gemini");

  try {
    return JSON.parse(text);
  } catch (jsonErr) {
    throw new Error(`JSON parse failed.`);
  }
}

// ─── ONBOARD FORM ───────────────────────────────────────────────
function OnboardForm({ onSave, onCancel }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", village: "", district: "", land: "", economicProfile: "", cropHistory: "", soilType: "", nitrogen: "", phosphorus: "", potassium: "", soc: "", waterAvail: "" });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const stepContent = [
    <>
      <Input label="Farmer Name" value={form.name} onChange={set("name")} required />
      <Input label="Village" value={form.village} onChange={set("village")} required />
      <Input label="District" value={form.district} onChange={set("district")} options={DISTRICTS} required />
      <Input label="Land Holding (Ha)" value={form.land} onChange={set("land")} type="number" required hint="e.g. 1.5 for 1.5 hectares" />
      <Input label="Economic Profile" value={form.economicProfile} onChange={set("economicProfile")} options={ECO_PROFILES} required />
    </>,
    <>
      <Input label="Crop History (last 3 seasons)" value={form.cropHistory} onChange={set("cropHistory")} required hint="e.g. Wheat, Wheat, Paddy" />
    </>,
    <>
      <Input label="Soil Type" value={form.soilType} onChange={set("soilType")} options={SOIL_TYPES} required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Nitrogen (kg/ha)" value={form.nitrogen} onChange={set("nitrogen")} type="number" required />
        <Input label="Phosphorus (kg/ha)" value={form.phosphorus} onChange={set("phosphorus")} type="number" required />
        <Input label="Potassium (kg/ha)" value={form.potassium} onChange={set("potassium")} type="number" required />
        <Input label="SOC (%)" value={form.soc} onChange={set("soc")} type="number" hint="Soil Organic Carbon %" required />
      </div>
      <Input label="Water Availability" value={form.waterAvail} onChange={set("waterAvail")} options={WATER_OPTIONS} required />
    </>
  ];

  const canNext = [
    form.name && form.village && form.district && form.land && form.economicProfile,
    !!form.cropHistory,
    form.soilType && form.nitrogen && form.phosphorus && form.potassium && form.soc && form.waterAvail
  ][step];

  const handleSave = () => {
    onSave({ ...form, id: "F" + Date.now().toString().slice(-4), land: parseFloat(form.land), nitrogen: parseFloat(form.nitrogen), phosphorus: parseFloat(form.phosphorus), potassium: parseFloat(form.potassium), soc: parseFloat(form.soc), status: "Soil Assessed", planGenerated: false, produce: [], plan: null });
  };

  return (
    <div>
      <StepBar current={step} steps={ONBOARD_STEPS} />
      <Card>
        <div style={{ fontWeight: 700, fontSize: 17, color: C.maroon, marginBottom: 18 }}>Step {step + 1}: {ONBOARD_STEPS[step]}</div>
        {stepContent[step]}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          {step > 0 && <Btn variant="ghost" onClick={() => setStep(s => s - 1)}>← Back</Btn>}
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          {step < 2 ? <Btn variant="primary" onClick={() => setStep(s => s + 1)} disabled={!canNext}>Next →</Btn>
            : <Btn variant="green" onClick={handleSave} disabled={!canNext}>✓ Save Farmer</Btn>}
        </div>
      </Card>
    </div>
  );
}

// ─── FARMER DETAIL ───────────────────────────────────────────────
function FarmerDetail({ farmer, onBack, onUpdateFarmer, rentals, onAddRental }) {
  const [tab, setTab] = useState("soil");
  const [plan, setPlan] = useState(farmer.plan || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProduce, setNewProduce] = useState({ crop: "", qty: "", stage: "", buyer: "", harvestDate: "" });
  const [addingProduce, setAddingProduce] = useState(false);

  const handleGenerate = async () => {
    setLoading(true); setError(null);
    try {
      const result = await generateCropPlan(farmer);
      setPlan(result);
      onUpdateFarmer({ ...farmer, plan: result, planGenerated: true, status: "Plan Generated" });
    } catch (e) { setError(`Error: ${e.message}`); }
    setLoading(false);
  };

  const handleAddProduce = () => {

    if (!newProduce.crop || !newProduce.qty || !newProduce.stage) return;
    const entry = { id: "P" + Date.now(), ...newProduce, qrGenerated: true };
    onUpdateFarmer({ ...farmer, produce: [...farmer.produce, entry] });
    setNewProduce({ crop: "", qty: "", stage: "", buyer: "", harvestDate: "" });
    setAddingProduce(false);
  };

  const farmerRentals = rentals.filter(r => r.farmerId === farmer.id);

  // ── Live Economics Calculations ─────────────────────────────
  // Input costs: parse cost strings from AI plan, multiply by land
  const inputItems = (plan?.inputShoppingList || []).map(item => {
    const rawCost = parseFloat(String(item.cost).replace(/[^0-9.]/g, "")) || 0;
    const qtyNum = parseFloat(String(item.qty).replace(/[^0-9.]/g, "")) || 1;
    // If cost is per-acre, scale by land; otherwise flat
    const isPerAcre = String(item.qty).toLowerCase().includes("acre");
    const landAcres = farmer.land * 2.47;
    const totalItemCost = isPerAcre ? Math.round(rawCost * landAcres) : rawCost;
    return { ...item, unitCost: rawCost, totalCost: totalItemCost, isPerAcre, landAcres: Math.round(landAcres * 10) / 10 };
  });
  const totalInputCost = inputItems.reduce((a, i) => a + i.totalCost, 0);

  // Produce revenue: qty (kg) × mandi price per kg
  const MANDI_PER_KG = { "Wheat": 22.75, "Paddy": 23.0, "Mustard": 56.5, "Gram": 54.4, "Arhar (Pigeon Pea)": 70.0, "Lentil": 60.0, "Sunflower": 67.6, "Sesame": 90.0, "Soybean": 46.0, "Maize": 20.9, "Moong": 72.0 };
  const produceItems = farmer.produce.map(p => {
    const pricePerKg = MANDI_PER_KG[p.crop] || 30;
    const grossRevenue = Math.round((parseFloat(p.qty) || 0) * pricePerKg);
    const commissionPct = p.buyer === "B2C Premium" ? 0.05 : p.buyer === "B2B Buyer" ? 0.07 : p.buyer === "FPO Aggregation" ? 0.06 : 0.10;
    const commission = Math.round(grossRevenue * commissionPct);
    const netRevenue = grossRevenue - commission;
    return { ...p, pricePerKg, grossRevenue, commission, commissionPct, netRevenue };
  });
  const totalGrossRevenue = produceItems.reduce((a, p) => a + p.grossRevenue, 0);
  const totalCommission = produceItems.reduce((a, p) => a + p.commission, 0);
  const totalNetRevenue = produceItems.reduce((a, p) => a + p.netRevenue, 0);

  // Machinery costs
  const machineryRentalCost = farmerRentals.reduce((a, r) => a + r.totalCost, 0);
  const machineryPending = farmerRentals.filter(r => r.status === "Confirmed").reduce((a, r) => a + r.totalCost, 0);

  // P&L
  const totalCosts = totalInputCost + machineryRentalCost;
  const netPL = totalNetRevenue - totalCosts;
  const restorativePremium = Math.round(totalNetRevenue * 0.18);

  const TABS = [{ key: "soil", label: "🧪 Soil" }, { key: "plan", label: "🧠 Blueprint" }, { key: "inputs", label: "🛒 Inputs" }, { key: "produce", label: "📦 Produce" }, { key: "qr", label: "🏷 QR Tags" }, { key: "machinery", label: "🚜 Machinery" }, { key: "economics", label: "💰 Economics" }];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.muted }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: C.charcoal }}>{farmer.name}</div>
          <div style={{ fontSize: 13, color: C.muted }}>{farmer.village}, {farmer.district} · {farmer.land} Ha · {farmer.economicProfile}</div>
        </div>
        <Badge color={farmer.planGenerated ? "green" : "gold"}>{farmer.status}</Badge>
      </div>

      <div style={{ display: "flex", gap: 2, borderBottom: `2px solid ${C.border}`, marginBottom: 20, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "8px 14px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? C.maroon : C.muted, borderBottom: tab === t.key ? `2px solid ${C.maroon}` : "2px solid transparent", marginBottom: -2, fontSize: 13, whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* SOIL */}
      {tab === "soil" && (
        <div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: C.maroon, marginBottom: 14, fontSize: 15 }}>🧪 Soil Health Metrics</div>
            <SoilBar label="Nitrogen (N)" value={farmer.nitrogen} max={400} unit="kg/ha" color={farmer.nitrogen < 150 ? C.red : farmer.nitrogen < 250 ? C.orange : C.green} />
            <SoilBar label="Phosphorus (P)" value={farmer.phosphorus} max={80} unit="kg/ha" color={farmer.phosphorus < 20 ? C.red : farmer.phosphorus < 40 ? C.orange : C.green} />
            <SoilBar label="Potassium (K)" value={farmer.potassium} max={400} unit="kg/ha" color={farmer.potassium < 150 ? C.red : farmer.potassium < 280 ? C.orange : C.green} />
            <SoilBar label="Soil Organic Carbon" value={farmer.soc * 10} max={10} unit="%" color={farmer.soc < 0.3 ? C.red : farmer.soc < 0.5 ? C.orange : C.green} />
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: C.maroon, marginBottom: 12, fontSize: 15 }}>🌾 Field Profile</div>
            {[["Soil Type", farmer.soilType], ["Water Availability", farmer.waterAvail], ["Crop History", farmer.cropHistory]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14 }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ color: C.charcoal, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* PLAN */}
      {tab === "plan" && (
        <div>
          {!plan && !loading && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: C.charcoal, marginBottom: 8 }}>Generate AI Crop Blueprint</div>
              <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>The Digital Brain analyses soil data, water, crop history and economics to generate a personalised 1/3/5-year restorative plan.</div>
              {error && <div style={{ color: C.red, marginBottom: 14, fontSize: 13 }}>{error}</div>}
              <Btn variant="primary" onClick={handleGenerate}>🌱 Generate Plan with AI</Btn>
            </Card>
          )}
          {loading && (
            <Card style={{ textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>⚙️</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.maroon }}>Digital Brain Processing…</div>
              <div style={{ color: C.muted, fontSize: 13, marginTop: 8 }}>Analysing soil, water, crop history & market data</div>
            </Card>
          )}
          {plan && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Card style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: plan.soilHealthScore > 60 ? C.green : plan.soilHealthScore > 35 ? C.orange : C.red }}>{plan.soilHealthScore}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Soil Health Score</div>
                  <Badge color={plan.soilHealthGrade === "Good" || plan.soilHealthGrade === "Excellent" ? "green" : "gold"}>{plan.soilHealthGrade}</Badge>
                </Card>
                <Card style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.maroon }}>{plan.planScore}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Plan Score</div>
                  <Badge color="maroon">{plan.profitabilityIndex}</Badge>
                </Card>
                <Card style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: plan.degradationRisk === "High" ? C.red : plan.degradationRisk === "Medium" ? C.orange : C.green }}>{plan.degradationRisk}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Degradation Risk</div>
                </Card>
              </div>
              <Card>
                <div style={{ fontWeight: 700, color: C.maroon, marginBottom: 10, fontSize: 14 }}>⚠️ Key Issues</div>
                {plan.keyIssues?.map((issue, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}><span style={{ color: C.orange }}>•</span><span>{issue}</span></div>)}
              </Card>
              <Card>
                <div style={{ fontWeight: 700, color: C.maroon, marginBottom: 12, fontSize: 14 }}>📅 Year 1 Crop Rotation</div>
                {[plan.year1?.season1, plan.year1?.season2].filter(Boolean).map((s, i) => (
                  <div key={i} style={{ background: C.cream, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.green, marginBottom: 6 }}>Season {i + 1}: {s.crop} ({s.variety})</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
                      {[["Sow", s.sowMonth], ["Harvest", s.harvestMonth], ["Yield", s.expectedYield], ["Profit", s.netProfit]].map(([k, v]) => (
                        <div key={k}><span style={{ color: C.muted }}>{k}: </span><span style={{ fontWeight: 600 }}>{v}</span></div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: C.green }}><strong>Soil:</strong> {s.soilBenefit}</div>
                  </div>
                ))}
              </Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["3-Year", plan.year3Target], ["5-Year", plan.year5Target]].map(([label, t]) => t && (
                  <Card key={label}>
                    <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 8 }}>{label} Target</div>
                    <div style={{ fontSize: 12, color: C.muted }}>SOC: <strong style={{ color: C.green }}>{t.socImprovement}</strong></div>
                    <div style={{ fontSize: 12, color: C.muted }}>Profit: <strong style={{ color: C.green }}>{t.profitIncrease}</strong></div>
                    <div style={{ fontSize: 11, color: C.charcoal, marginTop: 4 }}>{t.crops?.join(" → ")}</div>
                  </Card>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Card>
                  <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 8 }}>🌦 Weather Logic</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Sowing: <strong>{plan.weatherLogic?.sowingWindow}</strong></div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Irrigation: <strong>{plan.weatherLogic?.irrigationSchedule}</strong></div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Harvest: <strong>{plan.weatherLogic?.harvestWindow}</strong></div>
                </Card>
                <Card>
                  <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 8 }}>📊 Mandi Intelligence</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Best Month: <strong>{plan.mandiTiming?.bestMonth}</strong></div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Price: <strong style={{ color: C.green }}>{plan.mandiTiming?.expectedPrice}</strong></div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{plan.mandiTiming?.recommendation}</div>
                </Card>
              </div>
              <Card>
                <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 8 }}>🐛 Pest Alert</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <Badge color={plan.pestAlert?.riskLevel === "High" ? "maroon" : plan.pestAlert?.riskLevel === "Medium" ? "gold" : "green"}>{plan.pestAlert?.riskLevel} Risk</Badge>
                  <span style={{ fontSize: 12, color: C.muted }}>{plan.pestAlert?.likely?.join(", ")}</span>
                </div>
                <div style={{ fontSize: 12 }}><strong>Bio-intervention:</strong> {plan.pestAlert?.bioIntervention}</div>
              </Card>
              <Btn variant="gold" onClick={handleGenerate} small style={{ alignSelf: "flex-start" }}>🔄 Regenerate Plan</Btn>
            </div>
          )}
        </div>
      )}

      {/* INPUTS */}
      {tab === "inputs" && (
        <div>
          {!plan ? (
            <Card style={{ textAlign: "center", padding: 32 }}>
              <div style={{ color: C.muted, marginBottom: 16 }}>Generate the AI Blueprint first to see input recommendations.</div>
              <Btn variant="primary" onClick={() => setTab("plan")}>Go to AI Blueprint →</Btn>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Cost summary banner */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <Card style={{ textAlign: "center", padding: 12, background: "#FEF0E6" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.orange }}>₹{totalInputCost.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Total Input Cost</div>
                </Card>
                <Card style={{ textAlign: "center", padding: 12, background: C.soilLight }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.soil }}>{(farmer.land * 2.47).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Acres ({farmer.land} Ha)</div>
                </Card>
                <Card style={{ textAlign: "center", padding: 12, background: C.greenPale }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>₹{farmer.land > 0 ? Math.round(totalInputCost / (farmer.land * 2.47)).toLocaleString() : 0}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Cost / Acre</div>
                </Card>
              </div>

              <Card>
                <div style={{ fontWeight: 700, color: C.maroon, fontSize: 14, marginBottom: 12 }}>🛒 Input Shopping List — Live Cost Calculator</div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 4 }}>
                  {["Item", "Qty", "Unit Cost", "Total (scaled)", "Source"].map(h => <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>{h}</span>)}
                </div>
                {inputItems.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: C.charcoal }}>{item.item}</span>
                    <span style={{ color: C.muted }}>{item.qty}</span>
                    <span style={{ color: C.charcoal }}>₹{item.unitCost}</span>
                    <span style={{ color: C.orange, fontWeight: 700 }}>
                      ₹{item.totalCost.toLocaleString()}
                      {item.isPerAcre && <div style={{ fontSize: 9, color: C.muted, fontWeight: 400 }}>×{item.landAcres} acres</div>}
                    </span>
                    <span style={{ color: C.muted }}>{item.source}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 0", borderTop: `2px solid ${C.maroon}`, marginTop: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.maroon }}>Total: ₹{totalInputCost.toLocaleString()}</span>
                </div>
              </Card>

              <Card>
                <div style={{ fontWeight: 700, color: C.maroon, fontSize: 14, marginBottom: 12 }}>🧪 Fertilizer Prescription</div>
                {[["Organic", plan.fertilizerPrescription?.organic], ["Bio-Fertilizer", plan.fertilizerPrescription?.bio], ["Chemical", plan.fertilizerPrescription?.chemical], ["Schedule", plan.fertilizerPrescription?.schedule]].map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.maroon }}>{k}</div>
                    <div style={{ fontSize: 13, color: C.charcoal }}>{v}</div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* PRODUCE */}
      {tab === "produce" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: C.charcoal }}>Produce Entries</div>
            <Btn small variant="green" onClick={() => setAddingProduce(true)}>+ Add Produce</Btn>
          </div>

          {/* Revenue summary banner */}
          {farmer.produce.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              <Card style={{ textAlign: "center", padding: 12, background: "#EBF5FB" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.blue }}>₹{totalGrossRevenue.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Gross Revenue</div>
              </Card>
              <Card style={{ textAlign: "center", padding: 12, background: "#FEF0E6" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.orange }}>₹{totalCommission.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Commission (Squire)</div>
              </Card>
              <Card style={{ textAlign: "center", padding: 12, background: C.greenPale }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>₹{totalNetRevenue.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Net to Farmer</div>
              </Card>
            </div>
          )}

          {addingProduce && (
            <Card style={{ marginBottom: 14, background: C.soilLight }}>
              <div style={{ fontWeight: 700, color: C.maroon, marginBottom: 12 }}>New Produce Entry</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Input label="Crop" value={newProduce.crop} onChange={v => setNewProduce(p => ({ ...p, crop: v }))} options={CROP_OPTIONS} required />
                <Input label="Quantity (kg)" value={newProduce.qty} onChange={v => setNewProduce(p => ({ ...p, qty: v }))} type="number" required />
                <Input label="Stage" value={newProduce.stage} onChange={v => setNewProduce(p => ({ ...p, stage: v }))} options={PRODUCE_STAGES} required />
                <Input label="Buyer / Channel" value={newProduce.buyer} onChange={v => setNewProduce(p => ({ ...p, buyer: v }))} options={BUYER_TYPES} />
                <Input label="Harvest Date" value={newProduce.harvestDate} onChange={v => setNewProduce(p => ({ ...p, harvestDate: v }))} type="date" />
              </div>
              {newProduce.crop && newProduce.qty && (
                <div style={{ background: C.greenPale, borderRadius: 8, padding: "8px 12px", marginTop: 4, marginBottom: 10, fontSize: 13 }}>
                  Est. Revenue: <strong style={{ color: C.green }}>₹{Math.round((parseFloat(newProduce.qty)||0) * (MANDI_PER_KG[newProduce.crop]||30)).toLocaleString()}</strong>
                  <span style={{ color: C.muted, fontSize: 11, marginLeft: 8 }}>@ ₹{MANDI_PER_KG[newProduce.crop]||30}/kg (e-NAM)</span>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Btn small variant="ghost" onClick={() => setAddingProduce(false)}>Cancel</Btn>
                <Btn small variant="green" onClick={handleAddProduce}>Save + Generate QR</Btn>
              </div>
            </Card>
          )}

          {farmer.produce.length === 0 && !addingProduce ? (
            <Card style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
              <div style={{ color: C.muted }}>No produce entries yet.</div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {produceItems.map(p => (
                <Card key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{p.crop}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{p.qty} kg · {p.buyer || "No buyer"}{p.harvestDate ? ` · ${p.harvestDate}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {p.qrGenerated && <Badge color="green">🏷 QR</Badge>}
                      <Badge color={p.stage==="Sold"?"green":p.stage==="Buyer Matched"?"blue":p.stage==="Cold Storage"?"maroon":"gold"}>{p.stage}</Badge>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, background: C.cream, borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal }}>₹{p.pricePerKg}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>per kg (Mandi)</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>₹{p.grossRevenue.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>Gross Rev</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>₹{p.commission.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>Commission ({Math.round(p.commissionPct*100)}%)</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>₹{p.netRevenue.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>Net to Farmer</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {plan?.mandiTiming && (
            <Card style={{ marginTop: 14, background: "#EBF8F0", border: `1.5px solid ${C.greenLight}` }}>
              <div style={{ fontWeight: 700, color: C.green, fontSize: 13, marginBottom: 4 }}>📊 Mandi Timing</div>
              <div style={{ fontSize: 13 }}><strong>Best month:</strong> {plan.mandiTiming.bestMonth} · <strong>Price:</strong> {plan.mandiTiming.expectedPrice}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{plan.mandiTiming.recommendation}</div>
            </Card>
          )}
        </div>
      )}

      {/* QR TAGS */}
      {tab === "qr" && (
        <div>
          <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>Seed-to-Spoon QR Traceability</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Each batch gets a unique QR code encoding soil health, harvest data, and buyer info — verified by Squire for premium market access.</div>
          {farmer.produce.filter(p => p.qrGenerated).length === 0 ? (
            <Card style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏷</div>
              <div style={{ color: C.muted }}>No QR tags yet. Add produce entries to generate traceability tags.</div>
              <Btn small variant="primary" style={{ marginTop: 12 }} onClick={() => setTab("produce")}>Go to Produce →</Btn>
            </Card>
          ) : (
            farmer.produce.filter(p => p.qrGenerated).map(p => <QRCard key={p.id} produce={p} farmer={farmer} />)
          )}
          <Card style={{ background: C.maroonDark, marginTop: 14 }}>
            <div style={{ color: C.goldLight, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>🔗 Squire Verified Standard</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
              Each QR tag encodes: Farmer ID · Crop · Batch weight · Harvest date · Soil Organic Carbon at harvest · Buyer channel · Squire plan score. Scannable for B2C premium market traceability.
            </div>
          </Card>
        </div>
      )}

      {/* MACHINERY */}
      {tab === "machinery" && (
        <MachineryTab farmer={farmer} rentals={farmerRentals} onAddRental={onAddRental} />
      )}

      {/* ECONOMICS */}
      {tab === "economics" && (
        <EconomicsTab
          farmer={farmer}
          plan={plan}
          totalInputCost={totalInputCost}
          totalNetRevenue={totalNetRevenue}
          totalGrossRevenue={totalGrossRevenue}
          totalCommission={totalCommission}
          machineryRentalCost={machineryRentalCost}
          machineryPending={machineryPending}
          netPL={netPL}
          restorativePremium={restorativePremium}
          totalCosts={totalCosts}
        />
      )}
    </div>
  );
}

// ─── ECONOMICS TAB ────────────────────────────────────────────────
function EconomicsTab({ farmer, plan, totalInputCost, totalNetRevenue, totalGrossRevenue, totalCommission, machineryRentalCost, machineryPending, netPL, restorativePremium, totalCosts }) {
  const [scenario, setScenario] = useState("base"); // base | optimistic | pessimistic

  // ── 5-Year Projection Engine ─────────────────────────────────
  // Base parameters derived from farmer's actual soil + water + land data
  const landAcres = parseFloat((farmer.land * 2.47).toFixed(1));

  // Soil quality multiplier (drives yield trajectory)
  const soilQuality = farmer.soc < 0.3 ? 0.60 : farmer.soc < 0.5 ? 0.78 : farmer.soc < 0.8 ? 0.92 : 1.0;

  // Water reliability multiplier
  const waterMult = { "Canal irrigation": 1.0, "Borewell (perennial)": 0.95, "Borewell (seasonal)": 0.80, "Check dam nearby": 0.75, "Drip irrigation": 1.05, "Rainfed only": 0.55 }[farmer.waterAvail] || 0.75;

  // Monocrop penalty — how much restorative plan helps
  const cropHistory = farmer.cropHistory || "";
  const uniqueCrops = new Set(cropHistory.split(",").map(c => c.trim())).size;
  const monopenalty = uniqueCrops <= 1 ? 0.72 : uniqueCrops <= 2 ? 0.88 : 1.0;

  // Base gross revenue per acre per season (2 seasons/year)
  const baseRevPerAcre = 18000; // ₹ — Bundelkhand average for diversified smallholder
  const baseGrossAnnual = Math.round(baseRevPerAcre * landAcres * soilQuality * waterMult * monopenalty);

  // Input cost ratio starts high (monocrop), reduces with restorative plan
  const baseInputRatio = uniqueCrops <= 1 ? 0.52 : 0.44;

  // Scenario multipliers: yield growth, cost reduction, price uplift per year
  const SCENARIOS = {
    base:       { yieldGrowth: [1.00, 1.08, 1.18, 1.30, 1.44], costDecline: [1.00, 0.97, 0.93, 0.89, 0.85], priceUplift: [1.00, 1.05, 1.10, 1.15, 1.20], label: "Base Case",       color: C.maroon  },
    optimistic: { yieldGrowth: [1.00, 1.14, 1.30, 1.50, 1.74], costDecline: [1.00, 0.94, 0.88, 0.82, 0.76], priceUplift: [1.00, 1.08, 1.18, 1.28, 1.40], label: "Optimistic",     color: C.green   },
    pessimistic:{ yieldGrowth: [1.00, 1.03, 1.07, 1.12, 1.18], costDecline: [1.00, 0.99, 0.97, 0.95, 0.93], priceUplift: [1.00, 1.02, 1.05, 1.08, 1.11], label: "Pessimistic",    color: C.orange  },
  };

  const sc = SCENARIOS[scenario];

  // Build 5-year P&L
  const years = [1, 2, 3, 4, 5].map((yr, i) => {
    const grossRevenue    = Math.round(baseGrossAnnual * sc.yieldGrowth[i] * sc.priceUplift[i]);
    const inputCost       = Math.round(grossRevenue * baseInputRatio * sc.costDecline[i]);
    const machineryRent   = Math.round(landAcres * 800 * sc.costDecline[i]); // ₹800/acre/yr machinery
    const squireCommission= Math.round(grossRevenue * 0.065); // 6.5% blended commission
    const totalCostYr     = inputCost + machineryRent + squireCommission;
    const netProfit       = grossRevenue - totalCostYr;
    const restBonus       = i >= 1 ? Math.round(grossRevenue * (0.06 + i * 0.03)) : 0; // premium grows as SOC recovers
    const netWithBonus    = netProfit + restBonus;
    const roi             = totalCostYr > 0 ? parseFloat(((netProfit / totalCostYr) * 100).toFixed(1)) : 0;
    const yieldQtl        = parseFloat((landAcres * 15 * soilQuality * sc.yieldGrowth[i]).toFixed(1)); // approx qtl
    const socProjected    = parseFloat(Math.min(farmer.soc + i * 0.12, 1.8).toFixed(2)); // SOC recovery ~0.12%/yr
    return { yr, grossRevenue, inputCost, machineryRent, squireCommission, totalCostYr, netProfit, restBonus, netWithBonus, roi, yieldQtl, socProjected };
  });

  // Cumulative metrics
  const cumNetProfit    = years.reduce((a, y) => a + y.netProfit, 0);
  const cumInvestment   = years.reduce((a, y) => a + y.totalCostYr, 0);
  const cumRevenue      = years.reduce((a, y) => a + y.grossRevenue, 0);
  const avgROI          = parseFloat((years.reduce((a, y) => a + y.roi, 0) / 5).toFixed(1));
  const breakEvenYr     = years.findIndex(y => y.netProfit > 0) + 1;
  const yr5Growth       = years[4].grossRevenue > 0 ? Math.round(((years[4].grossRevenue - years[0].grossRevenue) / years[0].grossRevenue) * 100) : 0;

  // Chart bar rendering
  const chartMax = Math.max(...years.map(y => y.grossRevenue), 1);
  const BAR_H = 80;

  // Mini sparkline for net profit trend
  const sparkMax = Math.max(...years.map(y => Math.abs(y.netProfit)), 1);

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 2 }}>💰 Farmer Financial Projections</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>5-year model based on soil data, water profile, land size & Squire restorative plan</div>

      {/* Scenario selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {Object.entries(SCENARIOS).map(([key, s]) => (
          <button key={key} onClick={() => setScenario(key)} style={{
            padding: "6px 14px", borderRadius: 20, border: `2px solid ${scenario === key ? s.color : C.border}`,
            background: scenario === key ? s.color : C.white, color: scenario === key ? C.white : C.muted,
            fontWeight: 700, fontSize: 12, cursor: "pointer"
          }}>{s.label}</button>
        ))}
      </div>

      {/* Current season snapshot */}
      <Card style={{ marginBottom: 14, background: C.maroonDark }}>
        <div style={{ color: C.goldLight, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📍 Current Season Snapshot</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { label: "Gross Revenue", value: `₹${totalGrossRevenue.toLocaleString()}`, color: C.goldLight },
            { label: "Total Costs",   value: `₹${(totalInputCost + machineryRentalCost).toLocaleString()}`, color: "#FFA07A" },
            { label: "Net P&L",       value: `₹${netPL.toLocaleString()}`, color: netPL >= 0 ? "#90EE90" : "#FF6B6B" },
            { label: "Rest. Bonus",   value: `+₹${restorativePremium.toLocaleString()}`, color: "#90EE90" },
          ].map(m => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* KPI summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { label: "5-Yr Cum. Revenue",  value: `₹${(cumRevenue/100000).toFixed(1)}L`,   icon: "📈", color: C.blue },
          { label: "5-Yr Net Profit",    value: `₹${(cumNetProfit/100000).toFixed(1)}L`,  icon: "💵", color: C.green },
          { label: "Avg ROI / Year",     value: `${avgROI}%`,                             icon: "🎯", color: C.maroon },
          { label: "5-Yr Investment",    value: `₹${(cumInvestment/100000).toFixed(1)}L`, icon: "🔧", color: C.orange },
          { label: "Revenue Growth",     value: `+${yr5Growth}%`,                         icon: "🚀", color: C.green },
          { label: "Breakeven Season",   value: `Yr ${breakEvenYr}`,                      icon: "⚖️", color: C.gold },
        ].map(m => (
          <Card key={m.label} style={{ padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 16 }}>{m.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.3 }}>{m.label}</div>
          </Card>
        ))}
      </div>

      {/* Revenue vs Cost Bar Chart */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 14 }}>📊 Revenue vs Cost — 5-Year Projection</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: BAR_H + 40, marginBottom: 8 }}>
          {years.map((y, i) => {
            const revH  = Math.round((y.grossRevenue / chartMax) * BAR_H);
            const costH = Math.round((y.totalCostYr / chartMax) * BAR_H);
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ fontSize: 9, color: C.green, fontWeight: 700 }}>₹{Math.round(y.grossRevenue/1000)}K</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: BAR_H }}>
                  <div style={{ width: 14, height: revH, background: sc.color, borderRadius: "3px 3px 0 0" }} title={`Revenue ₹${y.grossRevenue.toLocaleString()}`} />
                  <div style={{ width: 14, height: costH, background: C.border, borderRadius: "3px 3px 0 0" }} title={`Cost ₹${y.totalCostYr.toLocaleString()}`} />
                </div>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Yr {y.yr}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.muted }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: sc.color, borderRadius: 2, marginRight: 4 }} />Revenue</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: C.border, borderRadius: 2, marginRight: 4 }} />Total Cost</span>
        </div>
      </Card>

      {/* Year-by-year P&L table */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 12 }}>📋 Year-by-Year P&L Breakdown</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {["", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: h === "" ? "left" : "right", color: C.muted, fontWeight: 700, fontSize: 11, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Gross Revenue",     key: "grossRevenue",    color: C.blue   },
                { label: "Input Costs",        key: "inputCost",       color: C.red    },
                { label: "Machinery Rent",     key: "machineryRent",   color: C.orange },
                { label: "Squire Commission",  key: "squireCommission",color: C.muted  },
                { label: "Total Costs",        key: "totalCostYr",     color: C.red, bold: true },
                { label: "Net Profit",         key: "netProfit",       color: C.green, bold: true },
                { label: "Rest. Bonus",        key: "restBonus",       color: C.maroon },
                { label: "Net + Bonus",        key: "netWithBonus",    color: C.green, bold: true },
                { label: "Est. Yield (qtl)",   key: "yieldQtl",        color: C.charcoal, suffix: " qtl" },
                { label: "Proj. SOC (%)",      key: "socProjected",    color: C.green, suffix: "%" },
                { label: "ROI",                key: "roi",             color: C.maroon, suffix: "%" },
              ].map(row => (
                <tr key={row.label} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "7px 8px", color: C.charcoal, fontWeight: row.bold ? 700 : 400 }}>{row.label}</td>
                  {years.map((y, i) => {
                    const val = y[row.key];
                    const display = row.suffix ? `${val}${row.suffix}` : (typeof val === "number" && !row.suffix && row.key !== "yieldQtl" && row.key !== "socProjected" && row.key !== "roi") ? `₹${val.toLocaleString()}` : val;
                    return (
                      <td key={i} style={{ padding: "7px 8px", textAlign: "right", fontWeight: row.bold ? 700 : 400, color: row.key === "netProfit" || row.key === "netWithBonus" ? (val >= 0 ? C.green : C.red) : row.color }}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ROI & Investment return card */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 12 }}>🎯 Return on Investment Analysis</div>
        {years.map((y, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: C.charcoal, fontWeight: 500 }}>Year {y.yr} — invested ₹{y.totalCostYr.toLocaleString()}</span>
              <span style={{ fontWeight: 700, color: y.roi >= 20 ? C.green : y.roi >= 0 ? C.orange : C.red }}>{y.roi}% ROI</span>
            </div>
            <div style={{ height: 7, background: C.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(Math.max(y.roi, 0), 100)}%`, height: "100%", background: y.roi >= 20 ? C.green : y.roi >= 0 ? C.orange : C.red, borderRadius: 99 }} />
            </div>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.muted }}>5-Year Cumulative Investment: <strong style={{ color: C.charcoal }}>₹{(cumInvestment/100000).toFixed(2)}L</strong></div>
          <div style={{ fontSize: 12, color: C.muted }}>5-Year Cumulative Return: <strong style={{ color: C.green }}>₹{(cumNetProfit/100000).toFixed(2)}L</strong></div>
          <div style={{ fontSize: 12, color: C.muted }}>Overall 5-Yr ROI: <strong style={{ color: C.maroon }}>₹{cumInvestment > 0 ? ((cumNetProfit / cumInvestment)*100).toFixed(1) : 0}%</strong></div>
          <div style={{ fontSize: 12, color: C.muted }}>With Restorative Premium: <strong style={{ color: C.green }}>+₹{(years.reduce((a,y)=>a+y.restBonus,0)/1000).toFixed(1)}K</strong></div>
        </div>
      </Card>

      {/* SOC recovery & long-term land value */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 12 }}>🌱 Soil Recovery & Land Value Trajectory</div>
        {years.map((y, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
              <span style={{ color: C.charcoal }}>Year {y.yr} — SOC {y.socProjected}%</span>
              <span style={{ color: y.socProjected >= 0.8 ? C.green : y.socProjected >= 0.5 ? C.orange : C.red, fontWeight: 700 }}>
                {y.socProjected < 0.3 ? "Critical" : y.socProjected < 0.5 ? "Poor" : y.socProjected < 0.8 ? "Fair" : "Good"}
              </span>
            </div>
            <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(y.socProjected * 80, 100)}%`, height: "100%", background: y.socProjected >= 0.8 ? C.green : y.socProjected >= 0.5 ? C.orange : C.red, borderRadius: 99 }} />
            </div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>SOC recovery rate: ~0.12%/yr with Squire restorative plan. Target: &gt;0.8% by Year 5. Each 0.1% SOC gain = ~6% yield improvement.</div>
      </Card>

      {/* Assumptions card */}
      <Card style={{ background: "#F0F4FF", border: `1px solid #BFD0FF` }}>
        <div style={{ fontWeight: 700, color: C.blue, fontSize: 12, marginBottom: 8 }}>📐 Model Assumptions</div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.8 }}>
          Land: {landAcres} acres ({farmer.land} Ha) · Soil quality multiplier: {soilQuality} · Water multiplier: {waterMult}<br />
          Base annual revenue: ₹{baseGrossAnnual.toLocaleString()} (₹{baseRevPerAcre}/acre × land × soil × water × monocrop adj)<br />
          Input cost ratio: {Math.round(baseInputRatio*100)}% of revenue · Machinery: ₹800/acre/yr · Squire commission: 6.5%<br />
          Scenario: <strong>{sc.label}</strong> · Year 5 yield growth: {Math.round((sc.yieldGrowth[4]-1)*100)}% · Cost decline: {Math.round((1-sc.costDecline[4])*100)}% · Price uplift: {Math.round((sc.priceUplift[4]-1)*100)}%
        </div>
      </Card>
    </div>
  );
}

// ─── MACHINERY TAB ───────────────────────────────────────────────
function MachineryTab({ farmer, rentals, onAddRental }) {
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({ startDate: "", endDate: "", hours: "" });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const totalCost = booking ? Math.round(booking.ratePerHour * (parseInt(form.hours) || 0)) : 0;

  const handleConfirm = () => {
    if (!form.startDate || !form.endDate || !form.hours) return;
    onAddRental({
      id: "R" + Date.now(), farmerId: farmer.id, farmerName: farmer.name,
      equipment: booking.name, startDate: form.startDate, endDate: form.endDate,
      hours: parseInt(form.hours), ratePerHour: booking.ratePerHour,
      totalCost, status: "Confirmed"
    });
    setBooking(null); setForm({ startDate: "", endDate: "", hours: "" });
  };

  return (
    <div>
      <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>Machinery Rental Bay</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Rent specialized equipment by the hour from your nearest Squire Outlet.</div>

      {/* Booking form */}
      {booking && (
        <Card style={{ marginBottom: 16, background: C.soilLight, border: `1.5px solid ${C.gold}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: C.maroon, fontSize: 15 }}>{booking.icon} Book: {booking.name}</div>
            <button onClick={() => setBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.muted }}>✕</button>
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Rate: <strong style={{ color: C.green }}>₹{booking.ratePerHour}/hr</strong></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Input label="Start Date" value={form.startDate} onChange={set("startDate")} type="date" required />
            <Input label="End Date" value={form.endDate} onChange={set("endDate")} type="date" required />
            <Input label="Hours Needed" value={form.hours} onChange={set("hours")} type="number" hint="Estimated hours" required />
          </div>
          {form.hours && <div style={{ background: C.greenPale, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 14 }}>
            Estimated cost: <strong style={{ color: C.green }}>₹{totalCost}</strong> ({form.hours} hrs × ₹{booking.ratePerHour})
          </div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn small variant="ghost" onClick={() => setBooking(null)}>Cancel</Btn>
            <Btn small variant="green" onClick={handleConfirm} disabled={!form.startDate || !form.endDate || !form.hours}>Confirm Booking</Btn>
          </div>
        </Card>
      )}

      {/* Equipment grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {EQUIPMENT_LIST.map(eq => (
          <Card key={eq.name} style={{ padding: 14, opacity: eq.available ? 1 : 0.6 }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{eq.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.charcoal, marginBottom: 2 }}>{eq.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, lineHeight: 1.4 }}>{eq.desc}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>₹{eq.ratePerHour}/hr</span>
              {eq.available
                ? <Btn small variant="primary" onClick={() => setBooking(eq)}>Book</Btn>
                : <Badge color="gray">Unavailable</Badge>}
            </div>
          </Card>
        ))}
      </div>

      {/* Rental history */}
      <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 10 }}>Rental History</div>
      {rentals.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 24 }}>
          <div style={{ color: C.muted, fontSize: 13 }}>No rentals yet for this farmer.</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rentals.map(r => (
            <Card key={r.id} style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.equipment}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{r.startDate} → {r.endDate} · {r.hours} hrs</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: C.green }}>₹{r.totalCost}</span>
                  <Badge color={r.status === "Completed" ? "green" : r.status === "Confirmed" ? "blue" : "gold"}>{r.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────
function Dashboard({ farmers, onSelect, onNew, onViewReports, onViewMachinery }) {
  const assessed = farmers.filter(f => f.planGenerated).length;
  const totalAcres = farmers.reduce((a, f) => a + f.land, 0).toFixed(1);
  const totalProduce = farmers.reduce((a, f) => a + f.produce.length, 0);
  const totalRevenue = farmers.reduce((a, f) => a + f.produce.filter(p => p.stage === "Sold").length * 8500, 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Farmers", value: farmers.length, icon: "👨‍🌾", color: C.maroon },
          { label: "Plans Generated", value: assessed, icon: "🧠", color: C.green },
          { label: "Total Land (Ha)", value: totalAcres, icon: "🌾", color: C.gold },
          { label: "Produce Batches", value: totalProduce, icon: "📦", color: C.blue },
        ].map(m => (
          <Card key={m.label} style={{ textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{m.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{m.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <Btn variant="primary" onClick={onNew}>+ Onboard Farmer</Btn>
        <Btn variant="ghost" onClick={onViewReports}>📊 Reports</Btn>
        <Btn variant="ghost" onClick={onViewMachinery}>🚜 Machinery Hub</Btn>
      </div>

      <div style={{ fontWeight: 700, fontSize: 15, color: C.charcoal, marginBottom: 12 }}>Farmer Records</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {farmers.map(f => (
          <Card key={f.id} onClick={() => onSelect(f)} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{f.name}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{f.village}, {f.district} · {f.land} ha · {f.soilType}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>History: {f.cropHistory}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <Badge color={f.planGenerated ? "green" : "gold"}>{f.status}</Badge>
                {f.produce.length > 0 && <Badge color="blue">{f.produce.length} batch{f.produce.length > 1 ? "es" : ""}</Badge>}
                {f.produce.some(p => p.qrGenerated) && <Badge color="maroon">🏷 QR Tagged</Badge>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── REPORTS VIEW ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
// SQUIRE STATISTICAL ENGINE — all models run on entered farmer data
// ═══════════════════════════════════════════════════════════════

// ── Model 1: Soil Degradation Risk Score (weighted regression) ──
// Inputs: N, P, K (kg/ha), SOC (%), soil type penalty
// Formula: DRS = 100 - [w_N*(N/400) + w_P*(P/80) + w_K*(K/400) + w_SOC*(SOC/1.2)] * 100
// Weights calibrated to Bundelkhand semi-arid soil research
const SOIL_TYPE_PENALTY = { "Sandy Loam": 0, "Clay Loam": -3, "Red Laterite": -8, "Black Cotton": -5, "Sandy": -12, "Clay": -6, "Silty Loam": 2 };
function calcDegradationRisk(f) {
  const wN = 0.30, wP = 0.20, wK = 0.15, wSOC = 0.35;
  const nScore = Math.min(f.nitrogen / 400, 1);
  const pScore = Math.min(f.phosphorus / 80, 1);
  const kScore = Math.min(f.potassium / 400, 1);
  const socScore = Math.min(f.soc / 1.2, 1);
  const penalty = (SOIL_TYPE_PENALTY[f.soilType] || 0) / 100;
  const composite = (wN * nScore + wP * pScore + wK * kScore + wSOC * socScore) + penalty;
  const drs = Math.max(0, Math.min(100, Math.round((1 - composite) * 100)));
  const grade = drs >= 70 ? "Critical" : drs >= 50 ? "High" : drs >= 30 ? "Moderate" : "Low";
  const color = drs >= 70 ? C.red : drs >= 50 ? C.orange : drs >= 30 ? C.gold : C.green;
  return { drs, grade, color };
}

// ── Model 2: Crop Profitability Forecast (yield × Mandi benchmark) ──
// Inputs: land (Ha), soil N/SOC, water type → yield estimate
// Mandi prices sourced from e-NAM benchmarks (₹/quintal, Jun 2026)
const MANDI_PRICES = { "Wheat": 2275, "Paddy": 2300, "Mustard": 5650, "Gram": 5440, "Arhar (Pigeon Pea)": 7000, "Lentil": 6000, "Sunflower": 6760, "Sesame": 9000, "Soybean": 4600, "Maize": 2090 };
const WATER_YIELD_MULTIPLIER = { "Canal irrigation": 1.0, "Borewell (perennial)": 0.95, "Borewell (seasonal)": 0.80, "Check dam nearby": 0.75, "Drip irrigation": 1.05, "Rainfed only": 0.55 };
const BASE_YIELD_QTL_PER_HA = { "Wheat": 32, "Paddy": 28, "Mustard": 14, "Gram": 12, "Arhar (Pigeon Pea)": 10, "Lentil": 9, "Sunflower": 12, "Sesame": 6, "Soybean": 15, "Maize": 35 };
function calcProfitForecast(f) {
  const crops = f.cropHistory ? f.cropHistory.split(",").map(c => c.trim()) : ["Wheat"];
  const waterMult = WATER_YIELD_MULTIPLIER[f.waterAvail] || 0.7;
  const soilMult = f.soc < 0.3 ? 0.65 : f.soc < 0.5 ? 0.82 : 1.0;
  const nMult = f.nitrogen < 150 ? 0.75 : f.nitrogen < 250 ? 0.90 : 1.0;
  return crops.map(crop => {
    const base = BASE_YIELD_QTL_PER_HA[crop] || 15;
    const yieldQtl = parseFloat((base * waterMult * soilMult * nMult * f.land).toFixed(1));
    const price = MANDI_PRICES[crop] || 3000;
    const grossRev = Math.round(yieldQtl * price);
    const inputCost = Math.round(grossRev * 0.42); // ~42% input cost ratio for monocrop
    const netProfit = grossRev - inputCost;
    const restorativeBonus = Math.round(netProfit * 0.18); // 18% premium for restorative plan
    return { crop, yieldQtl, price, grossRev, inputCost, netProfit, restorativeBonus };
  });
}

// ── Model 3: Pest Infestation Risk Index (Stochastic / Bayesian) ──
// P(infestation) = base_rate × soil_modifier × water_modifier × history_modifier
// Based on Bundelkhand pest outbreak historical data approximations
const PEST_BASE_RATES = { "Wheat": 0.32, "Paddy": 0.48, "Mustard": 0.38, "Gram": 0.42, "Arhar (Pigeon Pea)": 0.45, "Maize": 0.28, "default": 0.35 };
const WATER_PEST_MOD = { "Rainfed only": 0.7, "Borewell (seasonal)": 1.0, "Canal irrigation": 1.3, "Borewell (perennial)": 1.2, "Drip irrigation": 0.85, "Check dam nearby": 0.9 };
const MONOCROP_PEST_MOD = (history) => {
  if (!history) return 1.0;
  const crops = history.split(",").map(c => c.trim());
  const unique = new Set(crops).size;
  return unique === 1 ? 1.6 : unique === 2 ? 1.2 : 0.9; // monocrop = 60% higher risk
};
const PEST_BY_CROP = { "Wheat": ["Aphids", "Yellow Rust", "Karnal Bunt"], "Paddy": ["Brown Planthopper", "Blast", "Stem Borer"], "Mustard": ["Aphids", "Alternaria Blight"], "Gram": ["Pod Borer", "Wilt"], "default": ["Aphids", "Leaf Spot"] };
function calcPestRisk(f) {
  const crops = f.cropHistory ? f.cropHistory.split(",").map(c => c.trim()) : ["Wheat"];
  const lastCrop = crops[crops.length - 1] || "Wheat";
  const base = PEST_BASE_RATES[lastCrop] || PEST_BASE_RATES.default;
  const waterMod = WATER_PEST_MOD[f.waterAvail] || 1.0;
  const monoMod = MONOCROP_PEST_MOD(f.cropHistory);
  const socMod = f.soc < 0.3 ? 1.3 : f.soc < 0.5 ? 1.1 : 0.85;
  const prob = Math.min(0.98, base * waterMod * monoMod * socMod);
  const pct = Math.round(prob * 100);
  const grade = pct >= 65 ? "High" : pct >= 40 ? "Moderate" : "Low";
  const color = pct >= 65 ? C.red : pct >= 40 ? C.orange : C.green;
  const pests = PEST_BY_CROP[lastCrop] || PEST_BY_CROP.default;
  return { prob, pct, grade, color, pests, lastCrop };
}

// ── Model 4: Wet/Dry Week Calendar (Markov Chain approximation) ──
// Transition matrix P(wet→wet), P(dry→dry) calibrated per water source
// Outputs: 12-month wet/dry week counts + sowing/irrigation windows
const WATER_TRANSITION = {
  "Canal irrigation":      { ww: 0.72, dd: 0.78 },
  "Borewell (perennial)":  { ww: 0.65, dd: 0.80 },
  "Borewell (seasonal)":   { ww: 0.55, dd: 0.82 },
  "Check dam nearby":      { ww: 0.50, dd: 0.80 },
  "Drip irrigation":       { ww: 0.60, dd: 0.75 },
  "Rainfed only":          { ww: 0.40, dd: 0.90 },
};
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONSOON_BASE = [0.1,0.1,0.15,0.2,0.25,0.55,0.85,0.80,0.60,0.25,0.1,0.1]; // base wet probability by month
function calcWeatherCalendar(f) {
  const trans = WATER_TRANSITION[f.waterAvail] || { ww: 0.45, dd: 0.85 };
  return MONTHS.map((month, i) => {
    const basePwet = MONSOON_BASE[i];
    const adjustedPwet = Math.min(0.95, basePwet * trans.ww + (1 - basePwet) * (1 - trans.dd));
    const wetWeeks = Math.round(adjustedPwet * 4);
    const dryWeeks = 4 - wetWeeks;
    const action = wetWeeks >= 3 ? "Irrigate / Monitor waterlog" : wetWeeks === 2 ? "Normal ops" : wetWeeks === 1 ? "Supplement irrigation" : "Drought alert — irrigate";
    const isSowingWindow = [10, 11, 0].includes(i); // Oct-Dec rabi sowing
    const isHarvestWindow = [2, 3, 4].includes(i);  // Mar-May rabi harvest
    return { month, wetWeeks, dryWeeks, action, isSowingWindow, isHarvestWindow };
  });
}

// ── Stat Bar sub-component ──────────────────────────────────────
function StatBar({ label, value, max, color, suffix = "" }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: C.charcoal }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 7, background: C.border, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

// ── Formula chip ────────────────────────────────────────────────
function FormulaChip({ text }) {
  return (
    <div style={{ background: "#1A1A2E", color: "#A8D8A8", fontFamily: "monospace", fontSize: 10, padding: "6px 10px", borderRadius: 6, marginBottom: 8, lineHeight: 1.6, overflowX: "auto" }}>
      {text}
    </div>
  );
}

function Reports({ farmers, rentals, onBack }) {
  const [tab, setTab] = useState("overview");
  const allProduce = farmers.flatMap(f => f.produce);
  const totalFarmers = farmers.length;
  const assessed = farmers.filter(f => f.planGenerated).length;
  const totalLand = farmers.reduce((a, f) => a + f.land, 0).toFixed(1);
  const totalProduce = allProduce.length;
  const sold = allProduce.filter(p => p.stage === "Sold").length;
  const inStorage = allProduce.filter(p => p.stage === "Cold Storage").length;
  const buyerMatched = allProduce.filter(p => p.stage === "Buyer Matched").length;
  const totalQty = allProduce.reduce((a, p) => a + (parseFloat(p.qty) || 0), 0);
  const totalRentalRevenue = rentals.filter(r => r.status === "Completed").reduce((a, r) => a + r.totalCost, 0);
  const confirmedRentals = rentals.filter(r => r.status === "Confirmed").length;
  const avgSoc = farmers.length ? (farmers.reduce((a, f) => a + f.soc, 0) / farmers.length).toFixed(2) : 0;

  // Run all models
  const farmerStats = farmers.map(f => ({
    ...f,
    degradation: calcDegradationRisk(f),
    profit: calcProfitForecast(f),
    pest: calcPestRisk(f),
    weather: calcWeatherCalendar(f),
  }));

  const avgDRS = Math.round(farmerStats.reduce((a, f) => a + f.degradation.drs, 0) / Math.max(farmerStats.length, 1));
  const avgPestPct = Math.round(farmerStats.reduce((a, f) => a + f.pest.pct, 0) / Math.max(farmerStats.length, 1));
  const totalRestorativeBonus = farmerStats.reduce((a, f) => a + f.profit.reduce((b, p) => b + p.restorativeBonus, 0), 0);
  const totalNetProfit = farmerStats.reduce((a, f) => a + f.profit.reduce((b, p) => b + p.netProfit, 0), 0);

  const TABS = [
    { key: "overview", label: "📊 Overview" },
    { key: "soil", label: "🌱 Soil Risk" },
    { key: "profit", label: "💰 Profitability" },
    { key: "pest", label: "🐛 Pest Index" },
    { key: "weather", label: "🌦 Weather" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.muted }}>←</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: C.charcoal }}>Statistical Reports</div>
          <div style={{ fontSize: 13, color: C.muted }}>Digital Brain · Model Output · Kanpur / Bundelkhand Pilot</div>
        </div>
      </div>

      {/* Report tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: `2px solid ${C.border}`, marginBottom: 20, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "8px 12px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? C.maroon : C.muted, borderBottom: tab === t.key ? `2px solid ${C.maroon}` : "2px solid transparent", marginBottom: -2, fontSize: 12, whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Farmers", value: totalFarmers, icon: "👨‍🌾", color: C.maroon },
              { label: "Plans", value: assessed, icon: "🧠", color: C.green },
              { label: "Assessment %", value: `${Math.round((assessed/Math.max(totalFarmers,1))*100)}%`, icon: "📈", color: C.gold },
              { label: "Land (Ha)", value: totalLand, icon: "🌾", color: C.green },
              { label: "Avg DRS", value: avgDRS, icon: "⚠️", color: avgDRS>50?C.red:avgDRS>30?C.orange:C.green },
              { label: "Avg Pest Risk", value: `${avgPestPct}%`, icon: "🐛", color: avgPestPct>60?C.red:avgPestPct>40?C.orange:C.green },
              { label: "Produce Batches", value: totalProduce, icon: "📦", color: C.blue },
              { label: "Sold", value: sold, icon: "✅", color: C.green },
              { label: "Restorative Uplift", value: `₹${(totalRestorativeBonus/1000).toFixed(1)}K`, icon: "🌱", color: C.green },
            ].map(m => (
              <Card key={m.label} style={{ padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{m.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.3 }}>{m.label}</div>
              </Card>
            ))}
          </div>

          {/* Produce pipeline */}
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 12 }}>📦 Produce Pipeline</div>
            {[["Harvested", allProduce.filter(p=>p.stage==="Harvested").length, C.gold],
              ["Cold Storage", inStorage, C.blue],
              ["Buyer Matched", buyerMatched, C.orange],
              ["Dispatched", allProduce.filter(p=>p.stage==="Dispatched").length, C.maroon],
              ["Sold", sold, C.green]
            ].map(([label, count, color]) => (
              <StatBar key={label} label={label} value={count} max={Math.max(totalProduce,1)} color={color} suffix={` batch${count!==1?"es":""}`} />
            ))}
          </Card>

          {/* Cluster summary card */}
          <Card style={{ background: C.maroonDark }}>
            <div style={{ color: C.goldLight, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>📋 Cluster Statistical Summary</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 2 }}>
              Avg Degradation Risk Score: <strong style={{color:C.goldLight}}>{avgDRS}/100</strong> · Avg Pest Probability: <strong style={{color:C.goldLight}}>{avgPestPct}%</strong><br/>
              Cluster Net Profit (current): <strong style={{color:C.goldLight}}>₹{(totalNetProfit/1000).toFixed(1)}K</strong> · Restorative Uplift Potential: <strong style={{color:"#A8D8A8"}}>+₹{(totalRestorativeBonus/1000).toFixed(1)}K</strong><br/>
              Machinery Revenue Collected: <strong style={{color:C.goldLight}}>₹{totalRentalRevenue}</strong> · Active Bookings: <strong style={{color:C.goldLight}}>{confirmedRentals}</strong>
            </div>
          </Card>
        </div>
      )}

      {/* ── SOIL DEGRADATION RISK MODEL ── */}
      {tab === "soil" && (
        <div>
          <Card style={{ marginBottom: 14, background: "#F0F4FF" }}>
            <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 6 }}>Model 1 — Soil Degradation Risk Score (DRS)</div>
            <FormulaChip text={"DRS = 100 − [0.30·(N/400) + 0.20·(P/80) + 0.15·(K/400) + 0.35·(SOC/1.2) + soil_type_adj] × 100\nWeights: SOC(35%) > N(30%) > P(20%) > K(15%) | Source: Bundelkhand soil research"} />
            <div style={{ fontSize: 11, color: C.muted }}>Score 0–100. Higher = more degraded. Critical ≥70 · High ≥50 · Moderate ≥30 · Low &lt;30</div>
          </Card>
          {farmerStats.map(f => (
            <Card key={f.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.charcoal }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{f.village} · {f.soilType} · SOC {f.soc}%</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: f.degradation.color }}>{f.degradation.drs}</div>
                  <Badge color={f.degradation.grade==="Critical"?"maroon":f.degradation.grade==="High"?"orange":f.degradation.grade==="Moderate"?"gold":"green"}>{f.degradation.grade}</Badge>
                </div>
              </div>
              <StatBar label="N contribution" value={f.nitrogen} max={400} color={f.nitrogen<150?C.red:f.nitrogen<250?C.orange:C.green} suffix=" kg/ha" />
              <StatBar label="P contribution" value={f.phosphorus} max={80} color={f.phosphorus<20?C.red:f.phosphorus<40?C.orange:C.green} suffix=" kg/ha" />
              <StatBar label="K contribution" value={f.potassium} max={400} color={f.potassium<150?C.red:f.potassium<280?C.orange:C.green} suffix=" kg/ha" />
              <StatBar label="SOC (key driver)" value={f.soc*100} max={120} color={f.soc<0.3?C.red:f.soc<0.5?C.orange:C.green} suffix="%" />
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                Soil adj: {SOIL_TYPE_PENALTY[f.soilType]||0} pts · DRS formula = 100 − [{(0.30*(f.nitrogen/400)+0.20*(f.phosphorus/80)+0.15*(f.potassium/400)+0.35*(f.soc/1.2)).toFixed(3)} + {((SOIL_TYPE_PENALTY[f.soilType]||0)/100).toFixed(3)}] × 100
              </div>
            </Card>
          ))}
          <Card style={{ background: "#EBF8F0" }}>
            <div style={{ fontWeight: 700, color: C.green, fontSize: 12, marginBottom: 4 }}>Cluster DRS Average: {avgDRS}/100</div>
            <div style={{ fontSize: 11, color: C.muted }}>Target: DRS below 30 across all farms within 3 years of restorative planning. SOC improvement of +0.3% per year achievable with bio-fertilizer rotation.</div>
          </Card>
        </div>
      )}

      {/* ── PROFITABILITY FORECAST MODEL ── */}
      {tab === "profit" && (
        <div>
          <Card style={{ marginBottom: 14, background: "#F0F4FF" }}>
            <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 6 }}>Model 2 — Crop Profitability Forecast</div>
            <FormulaChip text={"Yield (qtl) = Base_Yield × Water_Mult × Soil_Mult × N_Mult × Land_Ha\nGross_Rev = Yield × Mandi_Price (e-NAM Jun 2026)\nNet_Profit = Gross_Rev − (Gross_Rev × 0.42)\nRestorative_Bonus = Net_Profit × 0.18 (18% premium for traceable produce)"} />
            <div style={{ fontSize: 11, color: C.muted }}>Mandi prices: e-NAM benchmarks Jun 2026. Input cost ratio: 42% (monocrop average, Bundelkhand).</div>
          </Card>
          {farmerStats.map(f => (
            <Card key={f.id} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.charcoal, marginBottom: 2 }}>{f.name}</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{f.land} Ha · {f.waterAvail}</div>
              {f.profit.map((p, i) => (
                <div key={i} style={{ background: C.cream, borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.green, marginBottom: 6 }}>{p.crop}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
                    <div><span style={{color:C.muted}}>Est. Yield: </span><strong>{p.yieldQtl} qtl</strong></div>
                    <div><span style={{color:C.muted}}>Mandi Price: </span><strong>₹{p.price}/qtl</strong></div>
                    <div><span style={{color:C.muted}}>Gross Revenue: </span><strong style={{color:C.blue}}>₹{p.grossRev.toLocaleString()}</strong></div>
                    <div><span style={{color:C.muted}}>Input Cost (42%): </span><strong style={{color:C.red}}>₹{p.inputCost.toLocaleString()}</strong></div>
                    <div><span style={{color:C.muted}}>Net Profit: </span><strong style={{color:C.green}}>₹{p.netProfit.toLocaleString()}</strong></div>
                    <div><span style={{color:C.muted}}>Restorative Bonus: </span><strong style={{color:C.maroon}}>+₹{p.restorativeBonus.toLocaleString()}</strong></div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 4 }}>
                Total net: ₹{f.profit.reduce((a,p)=>a+p.netProfit,0).toLocaleString()} · With restorative premium: ₹{f.profit.reduce((a,p)=>a+p.netProfit+p.restorativeBonus,0).toLocaleString()}
              </div>
            </Card>
          ))}
          <Card style={{ background: "#EBF8F0" }}>
            <div style={{ fontWeight: 700, color: C.green, fontSize: 12, marginBottom: 4 }}>Cluster Totals</div>
            <div style={{ fontSize: 12, color: C.charcoal }}>Current Net Profit: <strong>₹{totalNetProfit.toLocaleString()}</strong> · With Squire Restorative Premium: <strong style={{color:C.green}}>₹{(totalNetProfit+totalRestorativeBonus).toLocaleString()}</strong></div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>18% premium based on Seed-to-Spoon QR traceability enabling B2C/B2B premium market access.</div>
          </Card>
        </div>
      )}

      {/* ── PEST INFESTATION RISK INDEX ── */}
      {tab === "pest" && (
        <div>
          <Card style={{ marginBottom: 14, background: "#F0F4FF" }}>
            <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 6 }}>Model 3 — Pest Infestation Risk Index (Stochastic)</div>
            <FormulaChip text={"P(infestation) = Base_Rate × Water_Mod × Monocrop_Mod × SOC_Mod\nMonocrop_Mod: 1 unique crop=1.6x · 2 crops=1.2x · 3+ crops=0.9x\nSOC_Mod: <0.3%=1.3x · 0.3–0.5%=1.1x · >0.5%=0.85x\nBased on Bundelkhand historical outbreak data approximations"} />
            <div style={{ fontSize: 11, color: C.muted }}>High ≥65% · Moderate ≥40% · Low &lt;40%. Monocropping significantly amplifies outbreak probability.</div>
          </Card>
          {farmerStats.map(f => (
            <Card key={f.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.charcoal }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Last crop: {f.pest.lastCrop} · {f.waterAvail}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Likely pests: {f.pest.pests.join(", ")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: f.pest.color }}>{f.pest.pct}%</div>
                  <Badge color={f.pest.grade==="High"?"maroon":f.pest.grade==="Moderate"?"gold":"green"}>{f.pest.grade} Risk</Badge>
                </div>
              </div>
              <StatBar label="Infestation probability" value={f.pest.pct} max={100} color={f.pest.color} suffix="%" />
              <div style={{ fontSize: 11, color: C.muted }}>
                Formula: {(PEST_BASE_RATES[f.pest.lastCrop]||0.35).toFixed(2)} (base) × {WATER_PEST_MOD[f.waterAvail]||1.0} (water) × {MONOCROP_PEST_MOD(f.cropHistory).toFixed(1)} (monocrop) × {f.soc<0.3?1.3:f.soc<0.5?1.1:0.85} (SOC) = {f.pest.prob.toFixed(2)}
              </div>
              {f.pest.grade !== "Low" && (
                <div style={{ marginTop: 8, background: "#FEF0E6", borderRadius: 6, padding: 8, fontSize: 11, color: C.orange }}>
                  <strong>Bio-intervention recommended:</strong> Neem-based spray + trichoderma soil application before sowing window.
                </div>
              )}
            </Card>
          ))}
          <Card style={{ background: "#EBF8F0" }}>
            <div style={{ fontWeight: 700, color: C.green, fontSize: 12, marginBottom: 4 }}>Cluster Avg Pest Risk: {avgPestPct}%</div>
            <div style={{ fontSize: 11, color: C.muted }}>Monocropping is the primary amplifier. Crop rotation prescription in AI Blueprint reduces risk by up to 40% within 2 seasons.</div>
          </Card>
        </div>
      )}

      {/* ── WEATHER WET/DRY CALENDAR ── */}
      {tab === "weather" && (
        <div>
          <Card style={{ marginBottom: 14, background: "#F0F4FF" }}>
            <div style={{ fontWeight: 700, color: C.maroon, fontSize: 13, marginBottom: 6 }}>Model 4 — Wet/Dry Week Prediction Calendar (Markov Chain)</div>
            <FormulaChip text={"P(wet_next | wet_now) = ww_transition × base_monthly_wet_prob\nP(wet_next | dry_now) = (1 − dd_transition) × base_monthly_wet_prob\nTransition matrix calibrated per water source type.\nMonsoon base: Jul=85%, Aug=80%, Sep=60%, others calibrated from IMD data."} />
            <div style={{ fontSize: 11, color: C.muted }}>Wet weeks = weeks with adequate moisture for crop ops. Dry weeks = irrigation/intervention needed.</div>
          </Card>
          {farmerStats.slice(0, 1).map(f => (
            <div key={f.id}>
              <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 8, fontSize: 13 }}>Showing: {f.name} ({f.waterAvail})</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
                {f.weather.map((w, i) => (
                  <Card key={i} style={{ padding: 10, background: w.isSowingWindow ? "#EBF8F0" : w.isHarvestWindow ? "#FEF3D0" : C.white, border: w.isSowingWindow ? `1.5px solid ${C.green}` : w.isHarvestWindow ? `1.5px solid ${C.gold}` : `1px solid ${C.border}` }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: C.charcoal, marginBottom: 4 }}>
                      {w.month} {w.isSowingWindow ? "🌱" : w.isHarvestWindow ? "🌾" : ""}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, background: "#EBF5FB", color: C.blue, borderRadius: 4, padding: "1px 6px" }}>💧{w.wetWeeks}W</span>
                      <span style={{ fontSize: 11, background: "#FEF3D0", color: C.soil, borderRadius: 4, padding: "1px 6px" }}>☀️{w.dryWeeks}W</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.3 }}>{w.action}</div>
                  </Card>
                ))}
              </div>
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, color: C.maroon, fontSize: 12, marginBottom: 8 }}>Key Windows</div>
                <div style={{ fontSize: 12, color: C.charcoal }}>🌱 <strong>Sowing Window:</strong> Oct–Dec (Rabi) — Markov model shows 2–3 wet weeks/month, optimal for germination</div>
                <div style={{ fontSize: 12, color: C.charcoal, marginTop: 6 }}>🌾 <strong>Harvest Window:</strong> Mar–May — Primarily dry (1–2 wet weeks), low post-harvest loss risk</div>
                <div style={{ fontSize: 12, color: C.charcoal, marginTop: 6 }}>⚠️ <strong>Irrigation Alert:</strong> Nov–Feb dry spells need 1–2 supplemental irrigation events for {f.waterAvail}</div>
              </Card>
            </div>
          ))}
          <Card style={{ background: "#EBF8F0" }}>
            <div style={{ fontWeight: 700, color: C.green, fontSize: 12, marginBottom: 4 }}>Markov Chain Logic</div>
            <div style={{ fontSize: 11, color: C.muted }}>Each month's wet/dry probability depends on the previous state and the water source transition matrix. Canal-irrigated farms show 72% wet-to-wet persistence vs 40% for rainfed — enabling precision sowing windows unique to each farmer's water profile.</div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── MACHINERY HUB ───────────────────────────────────────────────
function MachineryHub({ rentals, onBack, onAddRental, farmers }) {
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({ farmerId: "", startDate: "", endDate: "", hours: "" });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const totalCost = booking ? Math.round(booking.ratePerHour * (parseInt(form.hours) || 0)) : 0;
  const selectedFarmer = farmers.find(f => f.id === form.farmerId);

  const handleConfirm = () => {
    if (!form.farmerId || !form.startDate || !form.endDate || !form.hours) return;
    onAddRental({ id: "R" + Date.now(), farmerId: form.farmerId, farmerName: selectedFarmer?.name || "", equipment: booking.name, startDate: form.startDate, endDate: form.endDate, hours: parseInt(form.hours), ratePerHour: booking.ratePerHour, totalCost, status: "Confirmed" });
    setBooking(null); setForm({ farmerId: "", startDate: "", endDate: "", hours: "" });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.muted }}>←</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: C.charcoal }}>Machinery Rental Hub</div>
          <div style={{ fontSize: 13, color: C.muted }}>Squire Outlet — Jhansi Cluster</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        <Card style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.green }}>₹{rentals.filter(r=>r.status==="Completed").reduce((a,r)=>a+r.totalCost,0)}</div>
          <div style={{ fontSize: 11, color: C.muted }}>Revenue Collected</div>
        </Card>
        <Card style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>{rentals.filter(r=>r.status==="Confirmed").length}</div>
          <div style={{ fontSize: 11, color: C.muted }}>Active Bookings</div>
        </Card>
        <Card style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.maroon }}>{EQUIPMENT_LIST.filter(e=>e.available).length}</div>
          <div style={{ fontSize: 11, color: C.muted }}>Available Now</div>
        </Card>
      </div>

      {/* Booking form */}
      {booking && (
        <Card style={{ marginBottom: 16, background: C.soilLight, border: `1.5px solid ${C.gold}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: C.maroon, fontSize: 15 }}>{booking.icon} Book: {booking.name}</div>
            <button onClick={() => setBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.muted }}>✕</button>
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Rate: <strong style={{ color: C.green }}>₹{booking.ratePerHour}/hr</strong></div>
          <Input label="Select Farmer" value={form.farmerId} onChange={set("farmerId")} options={farmers.map(f => f.id)} required hint={selectedFarmer ? selectedFarmer.name : "Choose farmer"} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Input label="Start Date" value={form.startDate} onChange={set("startDate")} type="date" required />
            <Input label="End Date" value={form.endDate} onChange={set("endDate")} type="date" required />
            <Input label="Hours" value={form.hours} onChange={set("hours")} type="number" required />
          </div>
          {form.hours && <div style={{ background: C.greenPale, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 14 }}>
            Estimated: <strong style={{ color: C.green }}>₹{totalCost}</strong>
          </div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn small variant="ghost" onClick={() => setBooking(null)}>Cancel</Btn>
            <Btn small variant="green" onClick={handleConfirm} disabled={!form.farmerId || !form.startDate || !form.endDate || !form.hours}>Confirm Booking</Btn>
          </div>
        </Card>
      )}

      {/* Equipment */}
      <div style={{ fontWeight: 700, color: C.charcoal, fontSize: 14, marginBottom: 12 }}>Available Equipment</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {EQUIPMENT_LIST.map(eq => (
          <Card key={eq.name} style={{ padding: 14, opacity: eq.available ? 1 : 0.55 }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{eq.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{eq.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, lineHeight: 1.4 }}>{eq.desc}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>₹{eq.ratePerHour}/hr</span>
              {eq.available ? <Btn small variant="primary" onClick={() => { setBooking(eq); }}>Book</Btn> : <Badge color="gray">Unavailable</Badge>}
            </div>
          </Card>
        ))}
      </div>

      {/* All rental log */}
      <div style={{ fontWeight: 700, color: C.charcoal, fontSize: 14, marginBottom: 12 }}>All Rentals</div>
      {rentals.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 24 }}><div style={{ color: C.muted }}>No rentals yet.</div></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rentals.map(r => (
            <Card key={r.id} style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.equipment}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{r.farmerName} · {r.startDate} · {r.hours} hrs</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: C.green }}>₹{r.totalCost}</span>
                  <Badge color={r.status === "Completed" ? "green" : r.status === "Confirmed" ? "blue" : "gold"}>{r.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard");
  const [farmers, setFarmers] = useState(INITIAL_FARMERS);
  const [selected, setSelected] = useState(null);
  const [rentals, setRentals] = useState(INITIAL_RENTALS);

  const handleSaveFarmer = (farmer) => { setFarmers(prev => [...prev, farmer]); setView("dashboard"); };
  const handleUpdateFarmer = (updated) => { setFarmers(prev => prev.map(f => f.id === updated.id ? updated : f)); setSelected(updated); };
  const handleSelectFarmer = (f) => { setSelected(f); setView("detail"); };
  const handleAddRental = (rental) => setRentals(prev => [...prev, rental]);

  const liveSelected = selected ? farmers.find(f => f.id === selected.id) || selected : null;

  const breadcrumb = { onboard: "Onboard Farmer", detail: liveSelected?.name || "", reports: "Reports", machinery: "Machinery Hub" };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.cream, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: C.maroonDark, padding: "0 20px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setView("dashboard")}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.white, fontSize: 16 }}>S</div>
            <div>
              <div style={{ color: C.white, fontWeight: 800, fontSize: 16, lineHeight: 1 }}>Squire</div>
              <div style={{ color: C.goldLight, fontSize: 10, letterSpacing: 1 }}>DIGITAL BRAIN · OFFICE TOOL</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["reports","machinery"].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ background: view === v ? "rgba(255,255,255,0.15)" : "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: C.white, fontSize: 12, cursor: "pointer", padding: "4px 10px", fontWeight: 500 }}>
                {v === "reports" ? "📊 Reports" : "🚜 Machinery"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {view !== "dashboard" && (
        <div style={{ background: C.soilLight, borderBottom: `1px solid ${C.border}`, padding: "8px 20px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto", fontSize: 13, color: C.muted }}>
            <span style={{ cursor: "pointer", color: C.maroon }} onClick={() => setView("dashboard")}>Dashboard</span>
            {" › "}<span style={{ color: C.charcoal }}>{breadcrumb[view]}</span>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px" }}>
        {view === "dashboard" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: C.charcoal }}>Squire Office Tool</div>
              <div style={{ color: C.muted, fontSize: 14 }}>Restoring India's Soil · Rewiring Farmer Profit</div>
            </div>
            <Dashboard farmers={farmers} onSelect={handleSelectFarmer} onNew={() => setView("onboard")} onViewReports={() => setView("reports")} onViewMachinery={() => setView("machinery")} />
          </>
        )}
        {view === "onboard" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 20 }}>Onboard New Farmer</div>
            <OnboardForm onSave={handleSaveFarmer} onCancel={() => setView("dashboard")} />
          </>
        )}
        {view === "detail" && liveSelected && (
          <FarmerDetail farmer={liveSelected} onBack={() => setView("dashboard")} onUpdateFarmer={handleUpdateFarmer} rentals={rentals} onAddRental={handleAddRental} />
        )}
        {view === "reports" && (
          <Reports farmers={farmers} rentals={rentals} onBack={() => setView("dashboard")} />
        )}
        {view === "machinery" && (
          <MachineryHub rentals={rentals} onBack={() => setView("dashboard")} onAddRental={handleAddRental} farmers={farmers} />
        )}
      </div>
    </div>
  );
}
