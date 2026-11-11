"use client";

import { useMemo, useState } from "react";
import { calculateWorkday, formatDuration } from "@/lib/calculations.js";

const blankPeriod = () => ({ id: crypto.randomUUID(), start: "", breakStart: "", breakEnd: "", end: "" });

export default function WorkHoursCalculator() {
  const [periods, setPeriods] = useState([blankPeriod()]);
  const [expectedEnabled, setExpectedEnabled] = useState(false);
  const [expectedHours, setExpectedHours] = useState("8");
  const [expectedMinutes, setExpectedMinutes] = useState("0");
  const [touched, setTouched] = useState(false);
  const result = useMemo(() => {
    if (!touched) return { data: null, error: "" };
    try { return { data: calculateWorkday(periods, expectedEnabled ? expectedHours : 0, expectedEnabled ? expectedMinutes : 0), error: "" }; }
    catch (error) { return { data: null, error: error.message }; }
  }, [periods, expectedEnabled, expectedHours, expectedMinutes, touched]);

  function update(id, key, value) {
    setTouched(true);
    setPeriods((current) => current.map((period) => period.id === id ? { ...period, [key]: value } : period));
  }
  function addPeriod() {
    setTouched(true);
    setPeriods((current) => [...current, blankPeriod()]);
  }
  function removePeriod(id) {
    setTouched(true);
    setPeriods((current) => current.length === 1 ? current : current.filter((period) => period.id !== id));
  }

  return <section className="tool-workspace" aria-label="Calculadora de horas trabalhadas">
    <div className="work-periods">
      <div className="section-heading compact-heading"><div><h2>Períodos de trabalho</h2><p className="field-hint">Horários finais anteriores ao início são considerados no dia seguinte.</p></div><button className="button button-small button-outline" type="button" onClick={addPeriod}>+ Adicionar período</button></div>
      {periods.map((period, index) => <fieldset className="period-card" key={period.id}>
        <legend>Período {index + 1}</legend>
        <div className="field-grid period-fields">
          {[["start", "Início do trabalho"], ["breakStart", "Início da pausa (opcional)"], ["breakEnd", "Fim da pausa (opcional)"], ["end", "Fim do trabalho"]].map(([key, label]) => <label className="field" key={key}><span>{label}</span><input type="time" value={period[key]} onChange={(event) => update(period.id, key, event.target.value)} /></label>)}
        </div>
        {periods.length > 1 && <button className="quiet-button" type="button" onClick={() => removePeriod(period.id)}>Remover período</button>}
      </fieldset>)}
    </div>
    <label className="checkbox-field"><input type="checkbox" checked={expectedEnabled} onChange={(event) => { setExpectedEnabled(event.target.checked); setTouched(true); }} /><span>Comparar com uma jornada diária esperada</span></label>
    {expectedEnabled && <div className="expected-fields">
      <label className="field"><span>Horas esperadas</span><input type="number" min="0" max="24" step="1" value={expectedHours} onChange={(event) => { setExpectedHours(event.target.value); setTouched(true); }} /></label>
      <label className="field"><span>Minutos adicionais</span><input type="number" min="0" max="59" step="1" value={expectedMinutes} onChange={(event) => { setExpectedMinutes(event.target.value); setTouched(true); }} /></label>
    </div>}
    <button className="button button-primary" type="button" onClick={() => setTouched(true)}>Calcular jornada</button>
    {result.error && <p className="form-error" role="alert">{result.error}</p>}
    {result.data && <div className="hours-result" aria-live="polite">
      <div><span>Total trabalhado</span><strong>{formatDuration(result.data.worked)}</strong></div>
      <div><span>Total de pausas</span><strong>{formatDuration(result.data.breaks)}</strong></div>
      {expectedEnabled && <div><span>{result.data.difference >= 0 ? "Horas extras em relação à jornada" : "Horas faltantes em relação à jornada"}</span><strong>{formatDuration(result.data.difference)}</strong></div>}
    </div>}
    <p className="tool-privacy-hint">Este cálculo soma os horários informados; não interpreta regras legais ou acordos de trabalho.</p>
  </section>;
}
