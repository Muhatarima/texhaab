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
  const [, setLoadingOptions] = useState<boolean>(true);

  // Form State
  const [knit, setKnit] = useState<KnitType>("Single");
  const [gsm, setGsm] = useState<number | "">(160);
  const [fabricType, setFabricType] = useState<string>("Single Jersey");
  const [composition, setComposition] = useState<string>("Cotton");
  const [lycra, setLycra] = useState<boolean>(false);
  const [buyer, setBuyer] = useState<string>("");
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
      const data = await fetchOptions();
      setOptions(data);
    } catch {
      // Graceful fallback
    } finally {
      setLoadingOptions(false);
    }
  }

  function handleFabricTypeChange(val: string) {
    setFabricType(val);
    if (
      val.includes("Rib") ||
      val === "Interlock" ||
      val === "Pointelle" ||
      val === "Waffle" ||
      val === "Pique Interlock"
    ) {
      setKnit("Double");
    } else {
      setKnit("Single");
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
    setShade("Medium");
    setForm("Open");
    setFabWidth("");
    setRecipe(null);
    setRecipeError(null);
  }

  function handleCopySetup() {
    if (!recipe) return;
    const lines = [
      `Order: ${knit} | ${gsm} GSM | ${fabricType || "N/A"} | ${composition || "N/A"}${buyer ? ` | Buyer: ${buyer}` : ""}`,
      `Machine Setup: ${recipe.machine_dia[0]}" × ${recipe.gauge}G (or ${recipe.machine_dia[1]}" × ${recipe.gauge}G)`,
      `Yarn Count: ${recipe.yarn_count}s Ne`,
      `Stitch Length: ${recipe.stitch_length}`,
      lycra && recipe.lycra_denier ? `Lycra: ${recipe.lycra_denier}D` : `Lycra: None`,
      recipe.expected_proc_loss != null ? `Est. Process Loss: ${recipe.expected_proc_loss}%` : null,
    ].filter(Boolean).join("\n");

    navigator.clipboard.writeText(lines);
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form (7 cols) */}
            <div className="lg:col-span-7 glossy-panel rounded-2xl p-6 sm:p-8">
              <div className="border-b border-purple-500/25 pb-4 mb-6">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Fabric Specifications
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Knit Structure & Target GSM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Knit Structure */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                      Knit Structure
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
                        Target GSM
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

                    {/* Presets */}
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
                      onChange={(e) => handleFabricTypeChange(e.target.value)}
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

                {/* Lycra Toggle */}
                <div className="p-4 rounded-xl bg-[#110526]/90 border border-purple-500/40 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Contains Lycra / Elastane</span>

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

                {/* Buyer, Shade, Form & Width */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-purple-500/25">
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
                        className="w-full px-2 py-2 glossy-input text-sm text-white"
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
                    {calculating ? "Calculating..." : "Calculate Recipe"}
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

            {/* Right Column: Results (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glossy-panel rounded-2xl p-6 sm:p-8">
                <div className="border-b border-purple-500/25 pb-4 mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-extrabold text-white">Knitting Recipe</h2>

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
                        Machine Setup
                      </span>
                      <div className="flex items-baseline space-x-3 my-1">
                        <span className="text-5xl font-black text-slate-700">--&quot; × --G</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0a0217]/50 border border-purple-500/20">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300/60 block mb-1">
                        Yarn Count
                      </span>
                      <div className="text-3xl font-black text-slate-700">--s Ne</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-3.5 rounded-xl bg-[#0a0217]/50 border border-purple-500/20">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/60 block mb-1">
                          Stitch Length
                        </span>
                        <div className="text-xl font-black text-slate-700">--</div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#0a0217]/50 border border-purple-500/20">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/60 block mb-1">
                          Lycra Denier
                        </span>
                        <div className="text-xl font-black text-slate-700">--</div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#0a0217]/50 border border-purple-500/20">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/60 block mb-1">
                          Est. Proc Loss
                        </span>
                        <div className="text-xl font-black text-slate-700">--%</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Machine Setup */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-[#1d0638] to-[#0a0217] border border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-1">
                        Machine Setup
                      </span>

                      <div className="flex items-baseline space-x-3 my-2">
                        <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                          {recipe.machine_dia[0]}&quot; × {recipe.gauge}G
                        </span>
                        <span className="text-base font-bold text-purple-300">or</span>
                        <span className="text-3xl sm:text-4xl font-extrabold text-purple-200">
                          {recipe.machine_dia[1]}&quot; × {recipe.gauge}G
                        </span>
                      </div>
                    </div>

                    {/* Yarn Count */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-[#16042e] to-[#0c021a] border border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.25)]">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-1">
                        Yarn Count
                      </span>

                      <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline space-x-2 my-1">
                        <span>{recipe.yarn_count}s</span>
                        <span className="text-sm font-semibold text-purple-300">Ne</span>
                        <span className="text-xs text-slate-400 font-mono ml-2">({recipe.yarn_count}s/1)</span>
                      </div>
                    </div>

                    {/* Stitch Length, Lycra Specs, and Expected Process Loss */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Stitch Length */}
                      <div className="p-3.5 rounded-xl bg-[#0e031f]/90 border border-purple-500/40">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                          Stitch Length
                        </span>
                        <div className="text-2xl font-black text-white">
                          {recipe.stitch_length}
                        </div>
                      </div>

                      {/* Lycra Denier */}
                      <div className="p-3.5 rounded-xl bg-[#0e031f]/90 border border-purple-500/40">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                          Lycra Denier
                        </span>
                        <div className="text-2xl font-black text-white">
                          {lycra && recipe.lycra_denier ? (
                            <div className="flex items-baseline space-x-1 text-fuchsia-300">
                              <span>{recipe.lycra_denier}</span>
                              <span className="text-xs font-semibold text-fuchsia-400">D</span>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">None</span>
                          )}
                        </div>
                      </div>

                      {/* Process Loss */}
                      <div className="p-3.5 rounded-xl bg-[#0e031f]/90 border border-purple-500/40">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                          Est. Proc Loss
                        </span>
                        <div className="text-2xl font-black text-emerald-400">
                          {recipe.expected_proc_loss != null ? (
                            <div className="flex items-baseline space-x-0.5">
                              <span>{recipe.expected_proc_loss}</span>
                              <span className="text-xs font-semibold text-emerald-300">%</span>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Summary Badges */}
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
                      {buyer && (
                        <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/40 font-semibold text-purple-300">
                          {buyer}
                        </span>
                      )}
                    </div>

                    {/* Factory Production Orders Validation from Excel */}
                    {recipe.historical_orders && recipe.historical_orders.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-200">
                              Factory Orders Validation
                            </h3>
                          </div>
                          <span className="text-[10px] font-mono text-purple-300/90 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-500/30">
                            Excel Dataset Matches
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mb-3">
                          Past bulk production runs from the factory floor for this spec:
                        </p>

                        <div className="space-y-2.5">
                          {recipe.historical_orders.map((ord, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-[#0a0217]/90 border border-purple-500/30 hover:border-purple-400/50 transition-all text-xs"
                            >
                              <div className="flex justify-between items-center mb-1 font-mono">
                                <span className="text-purple-300 font-bold">
                                  Order #{ord.order_no}
                                </span>
                                <span className="text-slate-200 bg-purple-900/50 px-2 py-0.5 rounded text-[11px] font-semibold border border-purple-500/30">
                                  {ord.buyer}
                                </span>
                              </div>

                              <div className="text-slate-200 font-medium text-[11px] mb-2">
                                {ord.fabrication} • {ord.gsm} GSM {ord.fab_dia ? `• ${ord.fab_dia}` : ""}
                              </div>

                              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-purple-500/20 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Mc Setup</span>
                                  <span className="font-mono font-bold text-white">{ord.mc_dia}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Stitch Length</span>
                                  <span className="font-mono font-bold text-white">{ord.st_length}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Proc Loss</span>
                                  <span className="font-mono font-bold text-emerald-400">
                                    {ord.proc_loss != null ? `${ord.proc_loss}%` : "—"}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 pt-1.5 border-t border-purple-500/15">
                                <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Mill Yarn Lot / Count:</span>
                                <span className="font-mono text-purple-200 text-[10px] break-all leading-relaxed">
                                  {ord.yarn_count}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
