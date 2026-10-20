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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xl tracking-tight shadow-sm">
              tH
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">texHAAB</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Knitting AI v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500">Circular Knitting Recipe Recommender</p>
            </div>
          </div>

          {/* Backend Connection Status Badge */}
          <div className="flex items-center space-x-2 text-xs">
            {loadingOptions ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 animate-pulse">
                Connecting to backend...
              </span>
            ) : backendError ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-medium">
                  <span className="w-2 h-2 mr-1.5 rounded-full bg-rose-500"></span>
                  Backend Offline
                </span>
                <button
                  onClick={loadOptions}
                  className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded text-slate-700 transition"
                >
                  Retry
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-500"></span>
                Backend Ready
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {backendError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start space-x-3">
            <span className="text-xl">⚠️</span>
            <div className="text-sm">
              <p className="font-semibold">Backend connection notice:</p>
              <p className="mt-0.5">
                Ensure your FastAPI server is running (`uvicorn api.main:app --reload`).{" "}
                <button
                  onClick={loadOptions}
                  className="underline font-semibold hover:text-amber-900 ml-1"
                >
                  Click to reconnect.
                </button>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
            <div className="border-b border-slate-100 pb-5 mb-6">
              <h1 className="text-xl font-bold text-slate-900">Buyer Order Specifications</h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter buyer requirements to generate machine dia, gauge, yarn count, and stitch length.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Required Knits & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Knit Structure */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Knit Structure <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setKnit("Single")}
                      className={`py-2 text-sm font-semibold rounded-md transition ${
                        knit === "Single"
                          ? "bg-white text-teal-800 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Single Knit
                    </button>
                    <button
                      type="button"
                      onClick={() => setKnit("Double")}
                      className={`py-2 text-sm font-semibold rounded-md transition ${
                        knit === "Double"
                          ? "bg-white text-teal-800 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Double Knit
                    </button>
                  </div>
                </div>

                {/* Target GSM */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Target GSM <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">60 - 600</span>
                  </div>
                  <input
                    type="number"
                    min={60}
                    max={600}
                    required
                    value={gsm}
                    onChange={(e) => setGsm(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 160"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                  />
                  {/* Preset Tags */}
                  <div className="flex space-x-1.5 mt-2">
                    {[140, 160, 180, 220, 260].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setGsm(val)}
                        className={`text-[11px] px-2 py-0.5 rounded border transition ${
                          gsm === val
                            ? "bg-teal-50 border-teal-300 text-teal-800 font-semibold"
                            : "border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Core Fabric Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fabric Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Fabric Type
                  </label>
                  <select
                    value={fabricType}
                    onChange={(e) => setFabricType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
                  >
                    <option value="">-- Any / Auto Detect --</option>
                    {options?.fabric_type?.map((ft) => (
                      <option key={ft} value={ft}>
                        {ft}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fibre Composition */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Composition
                  </label>
                  <select
                    value={composition}
                    onChange={(e) => setComposition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
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

              {/* Lycra / Spandex Checkbox */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">Contains Lycra / Elastane</span>
                  <span className="text-xs text-slate-500">
                    If checked, texHAAB will recommend the Lycra denier setup.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lycra}
                    onChange={(e) => setLycra(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* Section 3: Buyer & Optional Parameters */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Additional Floor & Order Details (Optional)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Buyer */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Buyer Name
                    </label>
                    <select
                      value={buyer}
                      onChange={(e) => setBuyer(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Yarn Spinning Type
                    </label>
                    <select
                      value={yarnType}
                      onChange={(e) => setYarnType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Color Shade
                    </label>
                    <select
                      value={shade}
                      onChange={(e) => setShade(e.target.value as ShadeType)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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

                  {/* Form & Finished Width */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Form
                      </label>
                      <select
                        value={form}
                        onChange={(e) => setForm(e.target.value as FormType | "")}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Any</option>
                        <option value="Open">Open</option>
                        <option value="Tube">Tube</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Width (in)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={120}
                        value={fabWidth}
                        onChange={(e) => setFabWidth(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 70"
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {recipeError && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  {recipeError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="submit"
                  disabled={calculating}
                  className="flex-1 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center space-x-2"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      <span>Calculating Recipe...</span>
                    </>
                  ) : (
                    <span>Recommend Knitting Recipe</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="py-3 px-4 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Output Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
              <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Knitting Setup</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Floor specification output</p>
                </div>
                {recipe && (
                  <button
                    onClick={handleCopySetup}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    {copied ? "Copied!" : "Copy Setup"}
                  </button>
                )}
              </div>

              {!recipe ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl font-semibold mb-4">
                    ⚙️
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No Recipe Calculated Yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Fill in the buyer order details and click &quot;Recommend Knitting Recipe&quot; to see the recommended machine setup.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Top 2 Machine Dia */}
                  <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block mb-1">
                      Machine Diameter (Top 2 Options)
                    </span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-extrabold text-teal-950">
                        {recipe.machine_dia[0]}&quot;
                      </span>
                      <span className="text-lg font-medium text-teal-700">or</span>
                      <span className="text-2xl font-bold text-teal-900">
                        {recipe.machine_dia[1]}&quot;
                      </span>
                    </div>
                    <p className="text-xs text-teal-700 mt-1.5">
                      Knitting floor can use either diameter depending on available machines.
                    </p>
                  </div>

                  {/* Grid for Gauge, Yarn Count, Stitch Length */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Gauge */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Machine Gauge
                      </span>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {recipe.gauge}{" "}
                        <span className="text-sm font-medium text-slate-500">G</span>
                      </div>
                    </div>

                    {/* Yarn Count */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Yarn Count
                      </span>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {recipe.yarn_count}s{" "}
                        <span className="text-sm font-medium text-slate-500">Ne</span>
                      </div>
                    </div>

                    {/* Stitch Length */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Stitch Length
                      </span>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {recipe.stitch_length}
                      </div>
                    </div>

                    {/* Lycra Denier */}
                    <div
                      className={`p-4 rounded-xl border ${
                        lycra
                          ? "bg-amber-50 border-amber-200 text-amber-950"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider block mb-1">
                        Lycra Denier
                      </span>
                      <div className="text-2xl font-extrabold">
                        {lycra && recipe.lycra_denier ? (
                          <>
                            {recipe.lycra_denier}{" "}
                            <span className="text-sm font-medium">D</span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-slate-400">Not Applicable</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Context Summary Pill */}
                  <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                      {knit} Knit
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                      {gsm} GSM
                    </span>
                    {fabricType && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                        {fabricType}
                      </span>
                    )}
                    {composition && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                        {composition}
                      </span>
                    )}
                    {buyer && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                        Buyer: {buyer}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Factory Standards Guidance Card */}
            <div className="bg-slate-100/70 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <span>📋</span>
                <span>Factory Floor Rules</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>Dia is shown as top 2 options because the floor utilizes open machines.</li>
                <li>Single / Double knit and GSM are required for all recommendations.</li>
                <li>Settings are validated on historical factory order lines.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
