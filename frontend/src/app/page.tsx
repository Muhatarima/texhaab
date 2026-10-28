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
      const msg = err instanceof Error ? err.message : "Service unavailable";
      setBackendError(msg);
    } finally {
      setLoadingOptions(false);
    }
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
    <div className="relative min-h-screen bg-[#000000] text-white selection:bg-purple-600 selection:text-white">
      {/* Pure Space Black Hole & Starfield Canvas */}
      <BlackHoleCanvas />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Industry Standard Top Navigation Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#06010f]/85 border-b border-purple-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            {/* Logo: Moving/Circulating 'tex' + Fixed 'HAAB' */}
            <MovingLogo />

            {/* Clean System Status Indicator */}
            <div className="flex items-center space-x-3 text-xs">
              {loadingOptions ? (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-200">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span className="font-semibold text-xs">Connecting...</span>
                </div>
              ) : backendError ? (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-200 font-semibold text-xs">
                    <span className="w-2 h-2 mr-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                    API Offline
                  </span>
                  <button
                    onClick={loadOptions}
                    className="px-3 py-1 text-xs bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 rounded-full text-white font-semibold transition"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#110526]/90 border border-emerald-500/50 text-emerald-300 font-semibold text-xs shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <span className="w-2 h-2 mr-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                  System Online
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Specifications Form (7 cols) */}
            <div className="lg:col-span-7 glossy-panel rounded-2xl p-6 sm:p-8">
              <div className="border-b border-purple-500/25 pb-4 mb-6">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Fabric Order Specifications
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Specify fabric parameters to generate circular knitting machine setup.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      {[140, 160, 180, 220, 260].map((val) => (
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

                {/* Optional Parameters */}
                <div className="pt-2 border-t border-purple-500/25">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">
                    Order Parameters
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <option value="">-- Select Buyer --</option>
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
                        Yarn Type
                      </label>
                      <select
                        value={yarnType}
                        onChange={(e) => setYarnType(e.target.value)}
                        className="w-full px-3 py-2 glossy-input text-sm text-white"
                      >
                        <option value="">-- Select Yarn Type --</option>
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

                    {/* Form & Width */}
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
                          placeholder="Width"
                          className="w-full px-2.5 py-2 glossy-input text-sm text-white font-medium"
                        />
                      </div>
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
                    <p className="text-xs text-slate-300 mt-0.5">Machine configuration</p>
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
                  <div className="py-16 px-4 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-xl font-bold text-purple-300 mb-3">
                      ⚙
                    </div>
                    <h3 className="text-sm font-bold text-white">Ready for Specification</h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                      Enter order specifications and click Calculate Knitting Recipe to display machine setup.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Top 2 Machine Dia Hero Card */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-[#1d0638] to-[#0a0217] border border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-1">
                        Machine Diameter (Top 2 Options)
                      </span>
                      <div className="flex items-baseline space-x-3 my-1">
                        <span className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                          {recipe.machine_dia[0]}&quot;
                        </span>
                        <span className="text-xl font-bold text-purple-300">or</span>
                        <span className="text-4xl font-extrabold text-purple-200">
                          {recipe.machine_dia[1]}&quot;
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Operable on either diameter based on available machine floor.
                      </p>
                    </div>

                    {/* Quantum Spec Grid */}
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

                      {/* Yarn Count */}
                      <div className="p-4 rounded-xl bg-[#0e031f]/90 border border-purple-500/40">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                          Yarn Count
                        </span>
                        <div className="text-2xl font-black text-white flex items-baseline space-x-1">
                          <span>{recipe.yarn_count}s</span>
                          <span className="text-xs font-semibold text-purple-300">Ne</span>
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

                      {/* Lycra Denier */}
                      <div className="p-4 rounded-xl bg-[#0e031f]/90 border border-purple-500/40">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                          Lycra Denier
                        </span>
                        <div className="text-2xl font-black text-white">
                          {lycra && recipe.lycra_denier ? (
                            <div className="flex items-baseline space-x-1 text-fuchsia-300">
                              <span>{recipe.lycra_denier}</span>
                              <span className="text-xs font-semibold text-fuchsia-400">D</span>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">Not Applicable</span>
                          )}
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

              {/* Technical Operating Guidelines */}
              <div className="glossy-panel rounded-2xl p-5 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <span>Factory Machine Guidelines</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Machine diameter shows top 2 recommendations to maximize floor utilization.</li>
                  <li>Single/Double knit and GSM are required baseline parameters.</li>
                  <li>Inference models optimize for target shrinkage and fabric stability.</li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-purple-500/20 py-4 text-center text-xs text-slate-400 bg-[#04010a]/90">
          <p>© 2026 texHAAB · Circular Knitting AI</p>
        </footer>
      </div>
    </div>
  );
}
