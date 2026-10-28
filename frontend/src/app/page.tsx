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

export default function HomePage() {
  // Options loaded from backend GET /options
  const [options, setOptions] = useState<RecipeOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Form State
  const [knit, setKnit] = useState<KnitType>("Single");
  const [gsm, setGsm] = useState<number | "">(160);
  const [fabricType, setFabricType] = useState<string>("Single Jersey");
  const [composition, setComposition] = useState<string>("Cotton");
  const [lycra, setLycra] = useState<boolean>(false);
  const [buyer, setBuyer] = useState<string>("");
  const [yarnType, setYarnType] = useState<string>("");
  const [shade, setShade] = useState<ShadeType>("Medium");
  const [form, setForm] = useState<FormType | "">("Open");
  const [fabWidth, setFabWidth] = useState<number | "">("");

  // Submission State
  const [calculating, setCalculating] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Load dropdown options on initial mount
  useEffect(() => {
    loadOptions();
  }, []);

  async function loadOptions() {
    try {
      setLoadingOptions(true);
      setBackendError(null);
      const data = await fetchOptions();
      setOptions(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cannot connect to texHAAB backend";
      setBackendError(msg);
    } finally {
      setLoadingOptions(false);
    }
  }

  // Handle Form Submission
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
      const msg = err instanceof Error ? err.message : "Failed to calculate recipe";
      setRecipeError(msg);
    } finally {
      setCalculating(false);
    }
  }

  function handleReset() {
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
      `Knit: ${knit} | GSM: ${gsm} | Fabric: ${fabricType || "N/A"}`,
      `Machine Dia: ${recipe.machine_dia[0]}" or ${recipe.machine_dia[1]}"`,
      `Gauge: ${recipe.gauge} G`,
      `Yarn Count: ${recipe.yarn_count}s Ne`,
      `Stitch Length: ${recipe.stitch_length}`,
      lycra ? `Lycra Denier: ${recipe.lycra_denier} D` : `Lycra: None (Rigid)`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative min-h-screen text-purple-100 selection:bg-purple-600 selection:text-white">
      {/* Interactive Celestial Black Hole & Starfield Canvas */}
      <BlackHoleCanvas />

      {/* Ambient Cosmic Radial Overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Content wrapper above canvas */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Glossy Glass Navigation Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#070114]/75 border-b border-purple-500/20 shadow-[0_4px_35px_rgba(76,29,149,0.25)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Animated texHAAB Logo with Kinetic Moving Letters */}
            <MovingLogo />

            {/* Backend Connection Status Badge */}
            <div className="flex items-center space-x-3 text-xs">
              {loadingOptions ? (
                <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span className="font-medium">Connecting to Cosmos...</span>
                </div>
              ) : backendError ? (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 font-medium backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <span className="w-2 h-2 mr-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
                    Backend Offline
                  </span>
                  <button
                    onClick={loadOptions}
                    className="px-3 py-1.5 text-xs bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/40 rounded-full text-purple-100 font-semibold transition-all duration-200 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  >
                    Reconnect
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-emerald-500/40 text-emerald-300 font-medium backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  </span>
                  Neural Engine Active
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Banner Sub-Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-[#180a33]/60 to-purple-900/40 border border-purple-500/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(112,26,230,0.18)]">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[11px] font-bold uppercase tracking-wider">
                  Industrial Textile AI
                </span>
                <span className="text-purple-400/60 text-xs">•</span>
                <span className="text-purple-300/80 text-xs font-medium">
                  Bangladesh Knitting Factory Optimization
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-purple-100 to-fuchsia-200 bg-clip-text text-transparent">
                Circular Knitting Machine Recipe Recommender
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-purple-900/40 border border-purple-400/20 text-purple-200">
                <span className="text-fuchsia-400 font-bold">96.3%</span> Gauge Accuracy
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-purple-900/40 border border-purple-400/20 text-purple-200">
                <span className="text-purple-300 font-bold">Top 2</span> Machine Dia
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-purple-900/40 border border-purple-400/20 text-purple-200">
                <span className="text-cyan-400 font-bold">75k+</span> Trained Orders
              </div>
            </div>
          </div>
        </section>

        {/* Main Workspace */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
          {backendError && (
            <div className="mb-6 p-4 rounded-2xl bg-purple-950/70 border border-amber-500/40 text-amber-200 flex items-start space-x-3.5 backdrop-blur-xl shadow-[0_0_25px_rgba(245,158,11,0.2)]">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg shrink-0">
                ⚠️
              </div>
              <div className="text-sm">
                <p className="font-bold text-amber-100">Local Neural Backend Notice</p>
                <p className="text-amber-200/90 mt-0.5">
                  FastAPI service is not detected on port 8000. Start it with{" "}
                  <code className="px-2 py-0.5 rounded bg-black/40 border border-amber-500/30 font-mono text-xs text-amber-300">
                    uvicorn api.main:app --reload
                  </code>{" "}
                  or{" "}
                  <button
                    onClick={loadOptions}
                    className="underline font-bold hover:text-white transition"
                  >
                    click here to reconnect
                  </button>
                  .
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Input Form (7 cols) */}
            <div className="lg:col-span-7 glossy-panel glossy-card-interactive rounded-3xl p-6 sm:p-8">
              {/* Card Header */}
              <div className="border-b border-purple-500/20 pb-5 mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc]" />
                    <h1 className="text-xl font-extrabold text-white tracking-tight">
                      Buyer Order Specifications
                    </h1>
                  </div>
                  <p className="text-xs text-purple-300/70 mt-1">
                    Feed parameters to calculate optimal machine diameter, gauge, yarn count, and stitch length.
                  </p>
                </div>
                <div className="text-2xl opacity-60">✨</div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Required Knits & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Knit Structure Toggle */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                      Knit Structure <span className="text-fuchsia-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-[#120626]/80 border border-purple-500/30">
                      <button
                        type="button"
                        onClick={() => setKnit("Single")}
                        className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 ${
                          knit === "Single"
                            ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-purple-300/50"
                            : "text-purple-300/70 hover:text-white hover:bg-purple-900/30"
                        }`}
                      >
                        Single Knit
                      </button>
                      <button
                        type="button"
                        onClick={() => setKnit("Double")}
                        className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 ${
                          knit === "Double"
                            ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-purple-300/50"
                            : "text-purple-300/70 hover:text-white hover:bg-purple-900/30"
                        }`}
                      >
                        Double Knit
                      </button>
                    </div>
                  </div>

                  {/* Target GSM */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                        Target GSM <span className="text-fuchsia-400">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-purple-400/60">60 - 600 g/m²</span>
                    </div>
                    <input
                      type="number"
                      min={60}
                      max={600}
                      required
                      value={gsm}
                      onChange={(e) => setGsm(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 160"
                      className="w-full px-4 py-2.5 glossy-input text-sm font-bold"
                    />

                    {/* Cosmic Preset Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-purple-400/60 mr-1">Presets:</span>
                      {[140, 160, 180, 220, 260].map((val) => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => setGsm(val)}
                          className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-all duration-200 font-semibold ${
                            gsm === val
                              ? "bg-purple-600/50 border-purple-300 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                              : "border-purple-500/30 text-purple-300/70 hover:bg-purple-900/40 hover:text-white"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 2: Fabric Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Fabric Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                      Fabric Type
                    </label>
                    <select
                      value={fabricType}
                      onChange={(e) => setFabricType(e.target.value)}
                      className="w-full px-3.5 py-2.5 glossy-input text-sm"
                    >
                      <option value="">-- Any / Auto Detect --</option>
                      {options?.fabric_type?.map((ft) => (
                        <option key={ft} value={ft}>
                          {ft}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Composition */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                      Fibre Composition
                    </label>
                    <select
                      value={composition}
                      onChange={(e) => setComposition(e.target.value)}
                      className="w-full px-3.5 py-2.5 glossy-input text-sm"
                    >
                      <option value="">-- Any / Auto Detect --</option>
                      {options?.composition?.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lycra / Spandex Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#180830]/60 to-purple-950/40 border border-purple-500/25 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">Contains Lycra / Elastane</span>
                      {lycra && (
                        <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/30 border border-fuchsia-400/50 text-fuchsia-200 text-[10px] font-bold">
                          Elastic Knit Active
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-purple-300/70 block mt-0.5">
                      Enables AI Lycra denier recommendation model.
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lycra}
                      onChange={(e) => setLycra(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-purple-950/80 border border-purple-500/40 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-[0_0_10px_rgba(255,255,255,0.8)] peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-fuchsia-500 peer-checked:shadow-[0_0_18px_rgba(217,70,239,0.7)]" />
                  </label>
                </div>

                {/* Section 3: Buyer & Optional Parameters */}
                <div className="pt-2 border-t border-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      Additional Factory Floor & Order Parameters
                    </span>
                    <span className="text-[11px] text-purple-400/60">Optional</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Buyer */}
                    <div>
                      <label className="block text-xs font-semibold text-purple-300 mb-1.5">
                        Buyer Name
                      </label>
                      <select
                        value={buyer}
                        onChange={(e) => setBuyer(e.target.value)}
                        className="w-full px-3 py-2 glossy-input text-xs sm:text-sm"
                      >
                        <option value="">-- Optional / Select Buyer --</option>
                        {options?.buyer?.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Yarn Type */}
                    <div>
                      <label className="block text-xs font-semibold text-purple-300 mb-1.5">
                        Yarn Spinning Type
                      </label>
                      <select
                        value={yarnType}
                        onChange={(e) => setYarnType(e.target.value)}
                        className="w-full px-3 py-2 glossy-input text-xs sm:text-sm"
                      >
                        <option value="">-- Optional / Any --</option>
                        {options?.yarn_type?.map((yt) => (
                          <option key={yt} value={yt}>
                            {yt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Shade */}
                    <div>
                      <label className="block text-xs font-semibold text-purple-300 mb-1.5">
                        Color Shade
                      </label>
                      <select
                        value={shade}
                        onChange={(e) => setShade(e.target.value as ShadeType)}
                        className="w-full px-3 py-2 glossy-input text-xs sm:text-sm"
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

                    {/* Form & Width */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-purple-300 mb-1.5">
                          Form
                        </label>
                        <select
                          value={form}
                          onChange={(e) => setForm(e.target.value as FormType | "")}
                          className="w-full px-2.5 py-2 glossy-input text-xs sm:text-sm"
                        >
                          <option value="">Any</option>
                          <option value="Open">Open</option>
                          <option value="Tube">Tube</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-300 mb-1.5">
                          Width (in)
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={120}
                          value={fabWidth}
                          onChange={(e) => setFabWidth(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="e.g. 70"
                          className="w-full px-2.5 py-2 glossy-input text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {recipeError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-sm flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>{recipeError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3.5 pt-3">
                  <button
                    type="submit"
                    disabled={calculating}
                    className="flex-1 py-3.5 px-6 rounded-2xl glossy-btn-cosmic text-white font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {calculating ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        <span>Synthesizing Recipe...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>Recommend Knitting Recipe</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-3.5 px-5 rounded-2xl bg-purple-950/50 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-900/60 transition-all duration-200 text-sm font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Output Card (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glossy-panel glossy-card-interactive rounded-3xl p-6 sm:p-8">
                <div className="border-b border-purple-500/20 pb-4 mb-6 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                      <h2 className="text-xl font-extrabold text-white">Knitting Setup Output</h2>
                    </div>
                    <p className="text-xs text-purple-300/70 mt-0.5">Floor machine specification</p>
                  </div>

                  {recipe && (
                    <button
                      onClick={handleCopySetup}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/40 text-purple-100 transition-all duration-200 shadow-[0_0_12px_rgba(168,85,247,0.3)] flex items-center space-x-1.5"
                    >
                      {copied ? (
                        <>
                          <span className="text-emerald-400">✓</span>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          <span>Copy Setup</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {!recipe ? (
                  <div className="py-14 px-4 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      {/* Animated Hologram Singularity */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 opacity-40 blur-lg animate-pulse" />
                      <div className="absolute inset-1 rounded-full border border-purple-400/40 animate-[spin_10s_linear_infinite]" />
                      <div className="relative w-14 h-14 rounded-2xl bg-[#140728] border border-purple-400/50 flex items-center justify-center text-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]">
                        ⚙️
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white">No Recipe Calculated Yet</h3>
                    <p className="text-xs text-purple-300/70 mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Select buyer order specifications and click &quot;Recommend Knitting Recipe&quot; to synthesize machine setup.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Top 2 Machine Dia Hero Card */}
                    <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-purple-900/60 via-[#210942]/80 to-purple-950/90 border border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.25),inset_0_1px_2px_rgba(255,255,255,0.3)]">
                      {/* Ambient Accent Light */}
                      <div className="absolute -right-8 -top-8 w-28 h-28 bg-fuchsia-500/20 rounded-full blur-2xl pointer-events-none" />

                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-fuchsia-300 block mb-1">
                        Machine Diameter (Top 2 Options)
                      </span>
                      <div className="flex items-baseline space-x-3 my-1">
                        <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-purple-100 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(216,180,254,0.6)]">
                          {recipe.machine_dia[0]}&quot;
                        </span>
                        <span className="text-lg font-bold text-purple-400/80">or</span>
                        <span className="text-3xl sm:text-4xl font-extrabold text-purple-200 drop-shadow-[0_0_10px_rgba(192,132,252,0.4)]">
                          {recipe.machine_dia[1]}&quot;
                        </span>
                      </div>
                      <p className="text-xs text-purple-300/80 mt-1 leading-relaxed">
                        Factory floor can run on either machine depending on open slot availability.
                      </p>
                    </div>

                    {/* Quantum Spec Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Gauge */}
                      <div className="p-4 rounded-2xl bg-[#14082b]/80 border border-purple-500/30 hover:border-purple-400/50 transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                          Machine Gauge
                        </span>
                        <div className="text-2xl font-black text-white flex items-baseline space-x-1">
                          <span>{recipe.gauge}</span>
                          <span className="text-xs font-semibold text-purple-400">G</span>
                        </div>
                      </div>

                      {/* Yarn Count */}
                      <div className="p-4 rounded-2xl bg-[#14082b]/80 border border-purple-500/30 hover:border-purple-400/50 transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                          Yarn Count
                        </span>
                        <div className="text-2xl font-black text-white flex items-baseline space-x-1">
                          <span>{recipe.yarn_count}s</span>
                          <span className="text-xs font-semibold text-purple-400">Ne</span>
                        </div>
                      </div>

                      {/* Stitch Length */}
                      <div className="p-4 rounded-2xl bg-[#14082b]/80 border border-purple-500/30 hover:border-purple-400/50 transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                          Stitch Length
                        </span>
                        <div className="text-2xl font-black text-white">
                          {recipe.stitch_length}
                        </div>
                      </div>

                      {/* Lycra Denier */}
                      <div
                        className={`p-4 rounded-2xl border transition-colors ${
                          lycra
                            ? "bg-gradient-to-br from-fuchsia-950/60 to-purple-950/60 border-fuchsia-500/40 shadow-[0_0_20px_rgba(217,70,239,0.2)]"
                            : "bg-[#14082b]/50 border-purple-500/20 text-purple-400/50"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Lycra Denier
                        </span>
                        <div className="text-2xl font-black">
                          {lycra && recipe.lycra_denier ? (
                            <div className="text-fuchsia-200 flex items-baseline space-x-1">
                              <span>{recipe.lycra_denier}</span>
                              <span className="text-xs font-semibold text-fuchsia-400">D</span>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-purple-400/50">Rigid / None</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Context Summary Pill */}
                    <div className="pt-3 text-xs text-purple-300/80 border-t border-purple-500/20 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-900/50 border border-purple-500/30 font-semibold">
                        {knit} Knit
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-900/50 border border-purple-500/30 font-semibold">
                        {gsm} GSM
                      </span>
                      {fabricType && (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-900/50 border border-purple-500/30 font-semibold">
                          {fabricType}
                        </span>
                      )}
                      {composition && (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-900/50 border border-purple-500/30 font-semibold">
                          {composition}
                        </span>
                      )}
                      {buyer && (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-900/50 border border-purple-500/30 font-semibold">
                          Buyer: {buyer}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Factory Floor Rules & Guidance */}
              <div className="glossy-panel rounded-3xl p-5 text-xs text-purple-300/80 space-y-2.5">
                <div className="font-extrabold text-white flex items-center space-x-2">
                  <span className="text-purple-400">📋</span>
                  <span>Knitting Floor Rules & Standards</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-purple-300/70">
                  <li>Machine diameter shows top 2 candidates to fit active factory inventory.</li>
                  <li>Single/Double knit structure and GSM are mandatory inputs.</li>
                  <li>Inference models trained on historical Bangladesh factory production rows.</li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-purple-500/20 py-6 text-center text-xs text-purple-400/60 backdrop-blur-md bg-[#050110]/50">
          <p>© 2026 texHAAB · Circular Knitting Space-Lab · Deep Cosmic Edition</p>
        </footer>
      </div>
    </div>
  );
}
