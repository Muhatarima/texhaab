"use client";

import { useEffect, useState } from "react";
import { fetchOptions, fetchRecipe } from "../lib/api";
import {
  KnitType,
  ShadeType,
  FormType,
  RecipeOptions,
  RecipeRequest,
  RecipeResponse,
} from "../types/recipe";
import BlackHoleCanvas from "../components/BlackHoleCanvas";
import MovingLogo from "../components/MovingLogo";

const EXCEL_PRESETS = [
  {
    name: "Puma Single Jersey",
    tag: "160 GSM | 70\" Open",
    fabrication: "S/J 75% BCI Cotton, 25% Recycled Cotton",
    gsm: 160,
    fabDia: "70/ inch Open",
    form: "Open" as FormType,
    fabWidth: 70,
    knit: "Single" as KnitType,
    fabricType: "Single Jersey",
    composition: "Cotton",
    lycra: false,
    buyer: "PUMA",
    yarnType: "Carded",
  },
  {
    name: "Vogue 2x1 Lycra Rib",
    tag: "240 GSM | 54\" Open",
    fabrication: "2X1 L RIB 95% BCI Cotton, 5% Elastane",
    gsm: 240,
    fabDia: "54/ inch Open",
    form: "Open" as FormType,
    fabWidth: 54,
    knit: "Double" as KnitType,
    fabricType: "2x1 Rib",
    composition: "Cotton",
    lycra: true,
    buyer: "VOGUE SOURCING",
    yarnType: "Combed",
  },
  {
    name: "Puma Cotton/Poly Fleece",
    tag: "280 GSM | 73\" Open",
    fabrication: "Fleece 68% BCI Cotton, 32% Recycled Polyester",
    gsm: 280,
    fabDia: "73/ inch Open",
    form: "Open" as FormType,
    fabWidth: 73,
    knit: "Single" as KnitType,
    fabricType: "Fleece",
    composition: "Cotton/Poly",
    lycra: false,
    buyer: "PUMA",
    yarnType: "Compact",
  },
  {
    name: "1x1 BCI Cotton Rib",
    tag: "200 GSM | 70\" Open",
    fabrication: "1X1 RIB 100% BCI COTTON",
    gsm: 200,
    fabDia: "70/ inch Open",
    form: "Open" as FormType,
    fabWidth: 70,
    knit: "Double" as KnitType,
    fabricType: "1x1 Rib",
    composition: "Cotton",
    lycra: false,
    buyer: "PUMA",
    yarnType: "Compact",
  },
];

export default function HomePage() {
  const [options, setOptions] = useState<RecipeOptions | null>(null);
  const [, setLoadingOptions] = useState<boolean>(true);

  // Form State
  const [fabrication, setFabrication] = useState<string>("");
  const [fabDiaText, setFabDiaText] = useState<string>("");
  const [knit, setKnit] = useState<KnitType>("Single");
  const [gsm, setGsm] = useState<number | "">(160);
  const [fabricType, setFabricType] = useState<string>("Single Jersey");
  const [composition, setComposition] = useState<string>("Cotton");
  const [lycra, setLycra] = useState<boolean>(false);
  const [buyer, setBuyer] = useState<string>("");
  const [yarnType, setYarnType] = useState<string>("");
  const [shade, setShade] = useState<ShadeType>("Medium");
  const [form, setForm] = useState<FormType | "">("Open");
  const [fabWidth, setFabWidth] = useState<number | "">(70);

  // Submission State
  const [calculating, setCalculating] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    loadOptions();
  }, []);

  async function loadOptions() {
    try {
      setLoadingOptions(true);
      const data = await fetchOptions();
      setOptions(data);
    } catch {
      // Fallback
    } finally {
      setLoadingOptions(false);
    }
  }

  // Auto-parse Fabrication string when typed/pasted
  function handleFabricationChange(text: string) {
    setFabrication(text);
    const upper = text.toUpperCase();

    // 1. Rib & Fabric Type
    if (upper.includes("RIB")) {
      setKnit("Double");
      if (upper.includes("1X1")) setFabricType("1x1 Rib");
      else if (upper.includes("2X2")) setFabricType("2x2 Rib");
      else if (upper.includes("2X1")) setFabricType("2x1 Rib");
      else if (upper.includes("4X2")) setFabricType("4x2 Rib");
      else setFabricType("Rib");
    } else if (upper.includes("INTERLOCK")) {
      setKnit("Double");
      setFabricType(upper.includes("PIQUE") ? "Pique Interlock" : "Interlock");
    } else if (upper.includes("FLEECE") || upper.includes("BRUSHBACK")) {
      setKnit("Single");
      setFabricType("Fleece");
    } else if (upper.includes("TERRY") || upper.includes("LOOPBACK")) {
      setKnit("Single");
      setFabricType(upper.includes("FRENCH") ? "French Terry" : "Terry");
    } else if (upper.includes("PIQUE")) {
      setKnit("Single");
      setFabricType("Pique");
    } else if (upper.includes("WAFFLE")) {
      setKnit("Double");
      setFabricType("Waffle");
    } else if (upper.includes("POINT")) {
      setKnit("Double");
      setFabricType("Pointelle");
    } else if (upper.includes("SLUB")) {
      setKnit("Single");
      setFabricType("Slub S/J");
    } else if (upper.includes("S/J") || upper.includes("SINGLE") || upper.includes("JERSEY")) {
      setKnit("Single");
      setFabricType("Single Jersey");
    }

    // 2. Composition
    const hasCotton = upper.includes("COTTON");
    const hasPoly = upper.includes("POLY") || upper.includes("PES");
    const hasViscose = upper.includes("VISCOSE") || upper.includes("MODAL") || upper.includes("TENCEL");

    if (hasCotton && hasPoly) setComposition("Cotton/Poly");
    else if (hasCotton && hasViscose) setComposition("Cotton/Viscose");
    else if (hasPoly && !hasCotton) setComposition("Polyester");
    else if (hasViscose && !hasCotton) setComposition("Viscose");
    else if (hasCotton) setComposition("Cotton");

    // 3. Lycra / Elastane
    if (
      upper.includes("LYCRA") ||
      upper.includes("ELASTANE") ||
      upper.includes("SPANDEX") ||
      /\bL[\s-]/.test(upper) ||
      /\bL\b/.test(upper)
    ) {
      setLycra(true);
    }
  }

  // Auto-parse Fab Dia string when typed/pasted
  function handleFabDiaChange(text: string) {
    setFabDiaText(text);
    const upper = text.toUpperCase();
    if (upper.includes("TUBE")) setForm("Tube");
    else if (upper.includes("OPEN")) setForm("Open");

    const match = text.match(/(\d+(\.\d+)?)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (val >= 10 && val <= 120) {
        setFabWidth(val);
      }
    }
  }

  // Load factory preset
  function handleLoadPreset(preset: typeof EXCEL_PRESETS[0]) {
    setFabrication(preset.fabrication);
    setFabDiaText(preset.fabDia);
    setGsm(preset.gsm);
    setForm(preset.form);
    setFabWidth(preset.fabWidth);
    setKnit(preset.knit);
    setFabricType(preset.fabricType);
    setComposition(preset.composition);
    setLycra(preset.lycra);
    setBuyer(preset.buyer);
    setYarnType(preset.yarnType);
    setRecipe(null);
    setRecipeError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gsm || Number(gsm) < 60 || Number(gsm) > 600) {
      setRecipeError("Target GSM must be between 60 and 600.");
      return;
    }

    try {
      setCalculating(true);
      setRecipeError(null);
      const requestData: RecipeRequest = {
        knit,
        gsm: Number(gsm),
        fabrication: fabrication || undefined,
        fab_dia: fabDiaText || undefined,
        fabric_type: fabricType || undefined,
        composition: composition || undefined,
        lycra,
        buyer: buyer || undefined,
        yarn_type: yarnType || undefined,
        shade,
        form: form || undefined,
        fab_width: fabWidth !== "" ? Number(fabWidth) : undefined,
      };

      const result = await fetchRecipe(requestData);
      setRecipe(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Calculation failed";
      setRecipeError(msg);
    } finally {
      setCalculating(false);
    }
  }

  function handleReset() {
    setFabrication("");
    setFabDiaText("");
    setKnit("Single");
    setGsm(160);
    setFabricType("Single Jersey");
    setComposition("Cotton");
    setLycra(false);
    setBuyer("");
    setYarnType("");
    setShade("Medium");
    setForm("Open");
    setFabWidth("");
    setRecipe(null);
    setRecipeError(null);
  }

  function handleCopySetup() {
    if (!recipe) return;
    const text = [
      `texHAAB KNITTING SETUP SPECIFICATION`,
      `-----------------------------------`,
      `Order Fabrication: ${fabrication || `${knit} | ${fabricType} | ${composition}`}`,
      `GSM: ${gsm} | Fab Dia: ${fabWidth ? `${fabWidth}" ${form}` : "N/A"}`,
      `-----------------------------------`,
      `Machine Setup: ${recipe.machine_setup?.[0] || `${recipe.machine_dia[0]}X${recipe.gauge}`} (${recipe.machine_dia[0]}" × ${recipe.gauge}G)`,
      `Secondary Setup: ${recipe.machine_setup?.[1] || `${recipe.machine_dia[1]}X${recipe.gauge}`} (${recipe.machine_dia[1]}" × ${recipe.gauge}G)`,
      `Yarn Specification: ${recipe.yarn_spec || `${recipe.yarn_count}s/1 Ne`}`,
      `Stitch Length: ${recipe.stitch_length}`,
      lycra ? `Lycra Denier: ${recipe.lycra_denier} D` : `Elastic: None (Rigid)`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative min-h-screen bg-[#000000] text-white selection:bg-purple-600 selection:text-white">
      <BlackHoleCanvas />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#06010f]/85 border-b border-purple-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <MovingLogo />
          </div>
        </header>

        {/* Main Workspace */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
          {/* Quick Presets from Factory Excel Sheet */}
          <div className="mb-6 p-4 rounded-2xl bg-[#0d021c]/80 border border-purple-500/30 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Quick Test from Factory Excel Dataset (Knit parameters.xlsx)
              </span>
              <span className="text-[11px] text-slate-400">Click to autofill exact order</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {EXCEL_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleLoadPreset(preset)}
                  className="text-left p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 hover:border-purple-400/70 transition group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-purple-200">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-purple-300/80 font-mono mt-0.5">
                    {preset.tag}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Specifications Form (7 cols) */}
            <div className="lg:col-span-7 glossy-panel rounded-2xl p-6 sm:p-8">
              <div className="border-b border-purple-500/25 pb-4 mb-6">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Fabric Order Specifications
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Enter buyer fabric parameters to generate machine setup and yarn counts.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fabrication Direct Text/Paste Box */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-200">
                      Fabrication (Paste directly from Excel or Tech Pack)
                    </label>
                    <span className="text-[11px] text-purple-400 font-mono">Smart Auto-fill</span>
                  </div>
                  <input
                    type="text"
                    value={fabrication}
                    onChange={(e) => handleFabricationChange(e.target.value)}
                    placeholder="e.g. 2X1 L RIB 95% BCI Cotton, 5% Elastane or S/J 100% Cotton"
                    className="w-full px-4 py-2.5 glossy-input text-sm text-white placeholder-slate-400 font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Auto-detects knit structure, rib subtypes, fiber blend percentages, and Lycra.
                  </p>
                </div>

                {/* Row 1: Knit Structure & Target GSM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Knit Structure */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                      Knit Structure <span className="text-fuchsia-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-[#0a0217] border border-purple-500/40">
                      <button
                        type="button"
                        onClick={() => setKnit("Single")}
                        className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                          knit === "Single"
                            ? "bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-300/50"
                            : "text-slate-300 hover:text-white hover:bg-purple-900/40"
                        }`}
                      >
                        Single Knit
                      </button>
                      <button
                        type="button"
                        onClick={() => setKnit("Double")}
                        className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                          knit === "Double"
                            ? "bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-300/50"
                            : "text-slate-300 hover:text-white hover:bg-purple-900/40"
                        }`}
                      >
                        Double Knit
                      </button>
                    </div>
                  </div>

                  {/* Target GSM */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                        Target GSM <span className="text-fuchsia-400">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-slate-300">60 - 600</span>
                    </div>
                    <input
                      type="number"
                      min={60}
                      max={600}
                      required
                      value={gsm}
                      onChange={(e) => setGsm(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="160"
                      className="w-full px-4 py-2.5 glossy-input text-sm font-bold text-white placeholder-slate-400"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {[140, 160, 180, 200, 240, 280].map((val) => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => setGsm(val)}
                          className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition ${
                            gsm === val
                              ? "bg-purple-600 border-purple-300 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                              : "border-purple-500/40 bg-purple-950/40 text-slate-200 hover:bg-purple-800/60 hover:text-white"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: Fabric Type & Composition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Fabric Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                      Fabric Type
                    </label>
                    <select
                      value={fabricType}
                      onChange={(e) => setFabricType(e.target.value)}
                      className="w-full px-3.5 py-2.5 glossy-input text-sm text-white"
                    >
                      <option value="">-- All Types --</option>
                      {options?.fabric_type?.map((ft) => (
                        <option key={ft} value={ft}>
                          {ft}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Composition */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                      Composition
                    </label>
                    <select
                      value={composition}
                      onChange={(e) => setComposition(e.target.value)}
                      className="w-full px-3.5 py-2.5 glossy-input text-sm text-white"
                    >
                      <option value="">-- All Compositions --</option>
                      {options?.composition?.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lycra / Elastane Card */}
                <div className="p-4 rounded-xl bg-[#110526]/90 border border-purple-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">Contains Lycra / Elastane</span>
                    <span className="text-xs text-slate-300">
                      Toggle to include Lycra denier recommendation.
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lycra}
                      onChange={(e) => setLycra(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-[#080214] border border-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-checked:border-purple-300 shadow-inner" />
                  </label>
                </div>

                {/* Fabric Dia Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Fab Dia (Excel Format)
                    </label>
                    <input
                      type="text"
                      value={fabDiaText}
                      onChange={(e) => handleFabDiaChange(e.target.value)}
                      placeholder='e.g. 70/ inch Open or 32" Tube'
                      className="w-full px-3 py-2 glossy-input text-sm text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Form
                      </label>
                      <select
                        value={form}
                        onChange={(e) => setForm(e.target.value as FormType | "")}
                        className="w-full px-2.5 py-2 glossy-input text-sm text-white"
                      >
                        <option value="">Any</option>
                        <option value="Open">Open</option>
                        <option value="Tube">Tube</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Width (in)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={120}
                        value={fabWidth}
                        onChange={(e) => setFabWidth(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="70"
                        className="w-full px-2.5 py-2 glossy-input text-sm text-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Parameters */}
                <div className="pt-2 border-t border-purple-500/25">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">
                    Order Parameters
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Buyer */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Buyer
                      </label>
                      <select
                        value={buyer}
                        onChange={(e) => setBuyer(e.target.value)}
                        className="w-full px-3 py-2 glossy-input text-sm text-white"
                      >
                        <option value="">-- Any Buyer --</option>
                        {options?.buyer?.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Yarn Type */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Spinning Type
                      </label>
                      <select
                        value={yarnType}
                        onChange={(e) => setYarnType(e.target.value)}
                        className="w-full px-3 py-2 glossy-input text-sm text-white"
                      >
                        <option value="">-- Any Spinning --</option>
                        {options?.yarn_type?.map((yt) => (
                          <option key={yt} value={yt}>
                            {yt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Shade */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Color Shade
                      </label>
                      <select
                        value={shade}
                        onChange={(e) => setShade(e.target.value as ShadeType)}
                        className="w-full px-3 py-2 glossy-input text-sm text-white"
                      >
                        {options?.shade?.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        )) || (
                          <>
                            <option value="Light">Light</option>
                            <option value="Medium">Medium</option>
                            <option value="Dark">Dark</option>
                            <option value="Melange">Melange</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {recipeError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-500/60 text-rose-200 text-sm font-semibold">
                    {recipeError}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={calculating}
                    className="flex-1 py-3.5 px-6 rounded-xl glossy-btn-primary text-white font-bold text-sm tracking-wide disabled:opacity-50 transition"
                  >
                    {calculating ? "Calculating Setup..." : "Calculate Knitting Recipe"}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-3.5 px-5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-slate-200 hover:text-white hover:bg-purple-900 font-semibold text-sm transition"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Setup Results (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glossy-panel rounded-2xl p-6 sm:p-8">
                <div className="border-b border-purple-500/25 pb-4 mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">Knitting Setup</h2>
                    <p className="text-xs text-slate-300 mt-0.5">Industrial factory configuration</p>
                  </div>

                  {recipe && (
                    <button
                      onClick={handleCopySetup}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 text-white transition flex items-center space-x-1.5"
                    >
                      <span>{copied ? "Copied" : "Copy Setup"}</span>
                    </button>
                  )}
                </div>

                {!recipe ? (
                  <div className="space-y-4 opacity-40 select-none">
                    <div className="p-5 rounded-xl bg-[#110526]/50 border border-purple-500/20">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-300/60 block mb-1">
                        Machine Dia × Gauge (AxB)
                      </span>
                      <div className="flex items-baseline space-x-3 my-1">
                        <span className="text-5xl font-black text-slate-700">--&quot; × --G</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-[#0a0217]/50 border border-purple-500/20">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300/60 block mb-1">
                          Yarn Count
                        </span>
                        <div className="text-2xl font-black text-slate-700">--</div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0217]/50 border border-purple-500/20">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300/60 block mb-1">
                          Stitch Length
                        </span>
                        <div className="text-2xl font-black text-slate-700">--</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Top Machine Dia x Gauge Hero Card (AxB Excel Format) */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-[#1d0638] to-[#0a0217] border border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                          Knitting Machine Setup (Dia × Gauge)
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-900/80 border border-purple-400/50 text-fuchsia-300 font-bold">
                          Excel Mc Dia: {recipe.machine_setup?.[0] || `${recipe.machine_dia[0]}X${recipe.gauge}`}
                        </span>
                      </div>

                      <div className="flex items-baseline space-x-3 my-2">
                        <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                          {recipe.machine_dia[0]}&quot; × {recipe.gauge}G
                        </span>
                        <span className="text-base font-bold text-purple-300">or</span>
                        <span className="text-3xl sm:text-4xl font-extrabold text-purple-200">
                          {recipe.machine_dia[1]}&quot; × {recipe.gauge}G
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Factory machine floor allocation: {recipe.machine_dia[0]}&quot; cylinder (primary) or {recipe.machine_dia[1]}&quot; cylinder (secondary).
                      </p>
                    </div>

                    {/* Factory Yarn Specification Card */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border border-purple-500/50">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                          Factory Yarn Specification
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-400/40 font-bold">
                          Ne {recipe.yarn_count}s / 1
                        </span>
                      </div>
                      <div className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {recipe.yarn_spec || `${recipe.yarn_count}s/1 ${yarnType || "Combed Compact"} ${composition || "Cotton"}${lycra && recipe.lycra_denier ? ` + ${recipe.lycra_denier}D Lycra` : ""}`}
                      </div>
                      <div className="mt-2 text-xs text-slate-300 flex flex-wrap gap-2">
                        <span className="bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30">
                          Spinning: {yarnType || "Combed Compact"}
                        </span>
                        {lycra && recipe.lycra_denier ? (
                          <span className="bg-fuchsia-950/60 text-fuchsia-300 px-2 py-0.5 rounded border border-fuchsia-500/40">
                            Elastic: {recipe.lycra_denier}D Lycra
                          </span>
                        ) : (
                          <span className="bg-slate-900/60 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                            Elastic: None (Rigid)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detailed Specs Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Gauge */}
                      <div className="p-4 rounded-xl bg-[#0e031f]/90 border border-purple-500/40">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                          Machine Gauge
                        </span>
                        <div className="text-2xl font-black text-white flex items-baseline space-x-1">
                          <span>{recipe.gauge}</span>
                          <span className="text-xs font-semibold text-purple-300">G</span>
                        </div>
                      </div>

                      {/* Stitch Length */}
                      <div className="p-4 rounded-xl bg-[#0e031f]/90 border border-purple-500/40">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                          Stitch Length
                        </span>
                        <div className="text-2xl font-black text-white">
                          {recipe.stitch_length}
                        </div>
                      </div>
                    </div>

                    {/* Order Context Pills */}
                    <div className="pt-3 text-xs text-slate-300 border-t border-purple-500/25 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/40 font-semibold text-white">
                        {knit}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/40 font-semibold text-white">
                        {gsm} GSM
                      </span>
                      {fabricType && (
                        <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/40 font-semibold text-white">
                          {fabricType}
                        </span>
                      )}
                      {composition && (
                        <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/40 font-semibold text-white">
                          {composition}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
