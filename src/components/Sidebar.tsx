import React, { useState, useEffect } from "react";
import { Shield, Users, CheckSquare, Plus, FileText, ChevronRight, Printer, ChevronDown, ChevronUp, Sparkles, Camera, Eye, Copy, Smartphone, Key, Coins, Lock, X } from "lucide-react";
import { LISTA_DOCUMENTOS } from "../templatesData";
import { SharedPoliceMetadata, SharedDetenidoMetadata, ActasState } from "../types";
import { DynamicDocFields } from "./DynamicDocFields";
import { useHistoryAutocomplete } from "../hooks/useHistoryAutocomplete";
// No Firebase imports

const USED_FIELDS_MAP: Record<string, { police: string[]; detenido: string[] }> = {
  intervencion: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "companiaDe", "distrito", "provincia", "fecha", "hora", "unidadPolicial"],
    detenido: ["tipo", "nombres", "apellidos", "nacionalidad", "naturalDe", "dni", "edad", "sexo", "estadoCivil", "nacidoEl", "domiciliadoEn", "celular", "ocupacion", "gradoInstruccion"]
  },
  detencion: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "distrito", "provincia", "fecha", "hora", "unidadPolicial"],
    detenido: ["tipo", "nombres", "apellidos", "nacionalidad", "naturalDe", "dni", "edad", "sexo", "estadoCivil", "nacidoEl", "domiciliadoEn", "celular", "ocupacion", "gradoInstruccion"]
  },
  buenTrato: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "distrito", "provincia", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos", "dni", "edad", "sexo", "domiciliadoEn", "celular"]
  },
  comunicacionTelefonica: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "distrito", "provincia", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos", "dni", "edad", "sexo"]
  },
  detencionMenor: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "distrito", "provincia", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos", "naturalDe", "dni", "edad", "sexo", "estadoCivil", "nacidoEl", "domiciliadoEn", "celular", "ocupacion", "gradoInstruccion"]
  },
  registroPersonal: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "distrito", "provincia", "fecha", "hora", "unidadPolicial"],
    detenido: ["tipo", "nombres", "apellidos", "nacionalidad", "naturalDe", "dni", "sexo", "estadoCivil", "nacidoEl", "domiciliadoEn", "celular", "ocupacion", "gradoInstruccion"]
  },
  registroVehicular: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "companiaDe", "distrito", "provincia", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos", "nacionalidad", "naturalDe", "dni", "edad", "sexo", "estadoCivil", "nacidoEl", "domiciliadoEn", "celular", "ocupacion", "gradoInstruccion"]
  },
  situacionVehicular: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos", "nacionalidad", "naturalDe", "dni", "edad", "estadoCivil", "domiciliadoEn", "celular", "ocupacion", "gradoInstruccion"]
  },
  registroEquipajes: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "companiaDe", "distrito", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos", "naturalDe", "dni", "edad", "sexo", "estadoCivil", "nacidoEl", "domiciliadoEn", "celular", "ocupacion", "gradoInstruccion"]
  },
  recepcion: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "distrito", "provincia", "fecha", "hora", "unidadPolicial"],
    detenido: ["tipo", "nombres", "apellidos", "dni", "edad", "sexo"]
  },
  incautacionArt203: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos", "nacionalidad", "naturalDe", "dni", "edad", "estadoCivil", "domiciliadoEn", "celular", "ocupacion", "gradoInstruccion"]
  },
  entregaRecepcionMenor: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "distrito", "provincia", "fecha", "hora", "unidadPolicial"],
    detenido: ["tipo", "nombres", "apellidos", "dni", "edad", "sexo"]
  },
  lacradoArma: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "companiaDe", "distrito", "provincia", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos", "dni", "edad", "sexo"]
  },
  ocurrencia: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "instructorCIP", "companiaDe", "distrito", "provincia", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos"]
  },
  rotuloEvidencias: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "distrito", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos"]
  },
  cadenaCustodia: {
    police: ["instructorGrado", "instructorNombres", "instructorApellidos", "distrito", "fecha", "hora"],
    detenido: ["tipo", "nombres", "apellidos"]
  }
};

interface SidebarProps {
  state: ActasState;
  police: SharedPoliceMetadata;
  detenido: SharedDetenidoMetadata;
  intervencion: any;
  onUpdateDocField: (docId: any, field: string, value: any) => void;
  onUpdateNestedDocField: (docId: string, section: string, field: string, value: any) => void;
  activeDocuments: string[];
  currentDocId: string;
  onUpdatePolice: (field: keyof SharedPoliceMetadata, value: string) => void;
  onUpdateDetenido: (field: keyof SharedDetenidoMetadata, value: any) => void;
  onToggleDocument: (docId: string) => void;
  onSelectCurrentDoc: (docId: string) => void;
  saldoActas: number;
  onPrint: () => void;
  onAddDetenidoAdicional: () => void;
  currentUser?: any;
  onUpdateUser?: (user: any) => void;
  onUpdateSaldoActas?: (nuevoSaldo: number) => void;
  onShowCameraModal?: () => void;
  previewComponent?: React.ReactNode;
  isDarkMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  state,
  police,
  detenido,
  intervencion,
  onUpdateDocField,
  onUpdateNestedDocField,
  activeDocuments,
  currentDocId,
  onUpdatePolice,
  onUpdateDetenido,
  onToggleDocument,
  onSelectCurrentDoc,
  saldoActas,
  onPrint,
  onAddDetenidoAdicional,
  currentUser,
  onUpdateUser,
  onUpdateSaldoActas,
  onShowCameraModal,
  previewComponent,
  isDarkMode = false
}) => {
  const [isPoliceExpanded, setIsPoliceExpanded] = useState(false);
  const [isDetenidoExpanded, setIsDetenidoExpanded] = useState(false);
  const [isCircunstanciasExpanded, setIsCircunstanciasExpanded] = useState(false);
  const [activeSuggestionField, setActiveSuggestionField] = useState<"nombres" | "apellidos" | "unidad" | null>(null);
  const { getSuggestions, savePoliceToHistory } = useHistoryAutocomplete();

  // Helper function to check if a specific field is used in the selected document type
  const isFieldUsed = (section: "police" | "detenido", field: string): boolean => {
    const docConfig = USED_FIELDS_MAP[currentDocId];
    if (!docConfig) return true;
    return docConfig[section]?.includes(field) ?? true;
  };

  // Renders a high-fidelity, polished status badge with a fine neon-glow indicator
  const renderStatusBadge = (status: { label: string, color: string }) => {
    const isListo = status.label === "LISTO";
    const isIncompleto = status.label === "INCOMPLETO";
    return (
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border tracking-wide flex items-center gap-1.5 transition-all select-none ${status.color} ${
        isListo ? (isDarkMode ? "shadow-[0_0_8px_rgba(16,185,129,0.35)] border-emerald-500/30" : "shadow-[0_0_6px_rgba(16,185,129,0.18)] border-emerald-400/40") : ""
      }`}>
        {isListo && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
        )}
        {isIncompleto && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
          </span>
        )}
        <span>{status.label}</span>
      </span>
    );
  };

  // Status indicators for each section card
  const getPoliceStatus = () => {
    const fields = [police.instructorNombres, police.instructorApellidos, police.instructorGrado, police.instructorCIP];
    const filledCount = fields.filter(f => f && f.trim() !== "").length;
    if (filledCount === fields.length) {
      return { label: "LISTO", color: isDarkMode ? "bg-emerald-950/40 text-emerald-300 border-emerald-900/30" : "bg-emerald-50 text-emerald-700 border-emerald-300" };
    }
    if (filledCount > 0) {
      return { label: "INCOMPLETO", color: isDarkMode ? "bg-amber-950/40 text-amber-300 border-amber-900/30 font-bold" : "bg-amber-50 text-amber-600 border-amber-300 font-bold" };
    }
    return { label: "VACÍO", color: isDarkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-400 border-slate-300" };
  };

  const getDetenidoStatus = () => {
    const fields = [detenido.nombres, detenido.apellidos, detenido.dni, detenido.domiciliadoEn];
    const filledCount = fields.filter(f => f && String(f).trim() !== "").length;
    if (filledCount === fields.length) {
      return { label: "LISTO", color: isDarkMode ? "bg-emerald-950/40 text-emerald-300 border-emerald-900/30" : "bg-emerald-50 text-emerald-700 border-emerald-300" };
    }
    if (filledCount > 0) {
      return { label: "INCOMPLETO", color: isDarkMode ? "bg-amber-950/40 text-amber-300 border-amber-900/30 font-bold" : "bg-amber-50 text-amber-600 border-amber-300 font-bold" };
    }
    return { label: "VACÍO", color: isDarkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-400 border-slate-300" };
  };

  const getEspecificosStatus = () => {
    const docData = (state as any)[currentDocId];
    if (!docData) return { label: "VACÍO", color: isDarkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-400 border-slate-300" };
    const stringKeys = Object.keys(docData).filter(
      (k) => k !== "detenidosAdicionales" && typeof docData[k] === "string"
    );
    if (stringKeys.length === 0) return { label: "LISTO", color: isDarkMode ? "bg-emerald-950/40 text-emerald-300 border-emerald-900/30" : "bg-emerald-50 text-emerald-700 border-emerald-300" };
    const filledCount = stringKeys.filter((k) => docData[k] && docData[k].trim() !== "").length;
    if (filledCount === stringKeys.length) {
      return { label: "LISTO", color: isDarkMode ? "bg-emerald-950/40 text-emerald-300 border-emerald-900/30" : "bg-emerald-50 text-emerald-700 border-emerald-300" };
    }
    if (filledCount > 0) {
      return { label: "INCOMPLETO", color: isDarkMode ? "bg-amber-950/40 text-amber-300 border-amber-900/30 font-bold" : "bg-amber-50 text-amber-605 border-amber-300 font-bold" };
    }
    return { label: "VACÍO", color: isDarkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-400 border-slate-300" };
  };

  // Modern input classes combining light and dark mode with consistent emerald focus accents and beautiful disabled state styling
  const getInputClass = (extra: string = "") => {
    return `text-xs rounded transition-all duration-150 outline-none w-full border ${
      isDarkMode 
        ? "bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-40 disabled:bg-slate-900 disabled:hover:border-slate-800" 
        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-45 disabled:bg-slate-100 disabled:hover:border-slate-200"
    } disabled:cursor-not-allowed ${extra}`;
  };

  const getLabelClass = (extra: string = "") => {
    return `block text-[10px] uppercase tracking-wider font-bold mb-1 ${
      isDarkMode ? "text-slate-400" : "text-slate-400"
    } ${extra}`;
  };

  // Renders a styled label that automatically looks greyed out and appended with "(No aplica)" when it is disabled in the active document
  const renderLabel = (section: "police" | "detenido", field: string, text: string) => {
    const isUsed = isFieldUsed(section, field);
    return (
      <label className={getLabelClass(isUsed ? "" : "opacity-45 font-medium line-through decoration-dotted")}>
        {text} {!isUsed && <span className="text-[9px] font-normal lowercase tracking-normal text-rose-500 font-sans italic"> (No aplica a esta acta)</span>}
      </label>
    );
  };

  const getCardBgClass = () => {
    if (isDarkMode) {
      return "bg-slate-900/40 hover:bg-emerald-950/10 p-4 rounded-2xl border-2 border-slate-800/80 hover:border-emerald-550/20 shadow-sm hover:shadow-md transition-all duration-300 tactile-card group";
    } else {
      return "bg-emerald-50/5 hover:bg-emerald-50/25 p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-500/20 shadow-sm hover:shadow-md transition-all duration-300 tactile-card group";
    }
  };

  return (
    <div className={`w-full ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"} border-r flex flex-col h-full overflow-y-auto no-print shadow-md`}>
      {/* Selector de Actas en Dropdown Accesible */}
      <div className={`p-4 border-b ${isDarkMode ? "border-slate-800 bg-emerald-950/10" : "border-slate-100 bg-emerald-50/40"} space-y-3`}>
        <div>
          <label className={`block text-xs font-bold ${isDarkMode ? "text-slate-300" : "text-slate-700"} uppercase tracking-wider mb-2 flex items-center gap-1.5 font-display`}>
            <FileText className="w-4 h-4 text-emerald-600" />
            Seleccione Acta a Redactar
          </label>
          
          <select
            value={currentDocId}
            onChange={(e) => {
              const selectedId = e.target.value;
              // Si seleccionamos un acta que no está activa, la activamos automáticamente
              if (!activeDocuments.includes(selectedId)) {
                onToggleDocument(selectedId);
              }
              onSelectCurrentDoc(selectedId);
            }}
            className={`w-full text-xs font-semibold ${isDarkMode ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-800"} border rounded-lg p-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer shadow-sm transition-all`}
          >
            {LISTA_DOCUMENTOS.map((doc) => {
              const isActive = activeDocuments.includes(doc.id);
              return (
                <option key={doc.id} value={doc.id} className={`text-xs font-sans ${isDarkMode ? "bg-slate-900 text-slate-200" : "text-slate-800"}`}>
                  {isActive ? "✓  " : "    "} {doc.title}
                </option>
              );
            })}
          </select>
        </div>



        {/* VENTANAS DE TRABAJO (TABS MÚLTIPLES) */}
        <div className="pt-3 border-t border-slate-200/55 dark:border-slate-800/60 mt-1">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ventanas / Actas en Curso</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold border border-slate-200/50 dark:border-slate-800/40">
              {activeDocuments.length} Abierta(s)
            </span>
          </div>

          {activeDocuments.length === 0 ? (
            <div className={`text-[10px] font-medium p-3 text-center border-2 border-dashed rounded-xl ${isDarkMode ? "border-slate-800 text-slate-500 bg-slate-950/20" : "border-slate-200 text-slate-400 bg-slate-50/50"}`}>
              Seleccione un acta arriba para abrir una ventana de redacción.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
              {activeDocuments.map((docId) => {
                const docInfo = LISTA_DOCUMENTOS.find(d => d.id === docId);
                if (!docInfo) return null;
                const isCurrent = docId === currentDocId;
                return (
                  <div
                    key={docId}
                    onClick={() => onSelectCurrentDoc(docId)}
                    className={`relative py-1.5 px-2.5 rounded-lg border transition-all duration-150 cursor-pointer select-none flex items-center justify-between group/tab gap-2 ${
                      isCurrent
                        ? (isDarkMode 
                            ? "bg-emerald-950/45 hover:bg-emerald-950/60 border-emerald-500/80 text-emerald-350 shadow-[0_0_10px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/20" 
                            : "bg-emerald-50/90 hover:bg-emerald-100/70 text-emerald-800 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.04)] ring-1 ring-emerald-400/10")
                        : (isDarkMode 
                            ? "bg-slate-950/40 border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200" 
                            : "bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-600 hover:text-slate-805")
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrent ? "bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" : "bg-slate-400/80"}`} />
                      <span className="text-[10px] font-bold truncate pr-3" title={docInfo.title}>
                        {docInfo.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDocument(docId);
                      }}
                      className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 p-0.5 rounded transition-all cursor-pointer shrink-0"
                      title="Cerrar esta ventana"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>



      {/* Global Police Information Card */}
      <div className={`p-3 border-b ${isDarkMode ? "border-slate-800/80" : "border-slate-100/80"}`}>
        <div className={getCardBgClass()}>
          <button
            type="button"
            onClick={() => setIsPoliceExpanded(!isPoliceExpanded)}
            className={`w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none focus:outline-none ${isDarkMode ? "text-slate-200 group-hover:text-emerald-400" : "text-slate-700 group-hover:text-emerald-900"}`}
          >
            <span className="flex items-center gap-2 font-display text-left">
              <Shield className="w-4 h-4 text-emerald-600 group-hover:text-emerald-705 transition-colors" />
              <span>1. Datos Policiales PNP</span>
              {renderStatusBadge(getPoliceStatus())}
            </span>
            {isPoliceExpanded ? (
              <ChevronDown className="w-4 h-4 text-emerald-600 transition-transform duration-200" />
            ) : (
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isDarkMode ? "text-slate-500 group-hover:text-emerald-450" : "text-slate-400 group-hover:text-emerald-500"}`} />
            )}
          </button>

          {isPoliceExpanded && (
            <div className="space-y-3.5 mt-4 transition-all duration-300">
              {isFieldUsed("police", "instructorNombres") && (
                <div>
                  {renderLabel("police", "instructorNombres", "Instructor PNP (Interviniente)")}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative w-full">
                      <input
                        type="text"
                        value={police.instructorNombres}
                        onChange={(e) => onUpdatePolice("instructorNombres", e.target.value)}
                        onFocus={() => setActiveSuggestionField("nombres")}
                        onBlur={() => {
                          if (police.instructorNombres) savePoliceToHistory(police.instructorNombres, undefined, undefined);
                          setTimeout(() => setActiveSuggestionField(prev => prev === "nombres" ? null : prev), 200);
                        }}
                        placeholder="Nombres"
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                      {activeSuggestionField === "nombres" && (
                        <div className={`absolute z-30 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded shadow-lg border text-xs divide-y ${
                          isDarkMode 
                            ? "bg-slate-900 border-slate-700 text-slate-100 divide-slate-800" 
                            : "bg-white border-slate-200 text-slate-700 divide-slate-100"
                        }`}>
                          {getSuggestions("nombres", police.instructorNombres).length > 0 ? (
                            getSuggestions("nombres", police.instructorNombres).map((s, idx) => (
                              <div
                                key={idx}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  onUpdatePolice("instructorNombres", s);
                                  setActiveSuggestionField(null);
                                }}
                                className={`px-2.5 py-1.5 text-left cursor-pointer font-bold uppercase transition-colors ${
                                  isDarkMode ? "hover:bg-slate-800 text-emerald-400" : "hover:bg-slate-50 text-emerald-700"
                                }`}
                              >
                                {s}
                              </div>
                            ))
                          ) : (
                            <div className="px-2.5 py-1.5 text-slate-500 italic text-[10px] text-left">No hay sugerencias</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="relative w-full">
                      <input
                        type="text"
                        value={police.instructorApellidos}
                        onChange={(e) => onUpdatePolice("instructorApellidos", e.target.value)}
                        onFocus={() => setActiveSuggestionField("apellidos")}
                        onBlur={() => {
                          if (police.instructorApellidos) savePoliceToHistory(undefined, police.instructorApellidos, undefined);
                          setTimeout(() => setActiveSuggestionField(prev => prev === "apellidos" ? null : prev), 200);
                        }}
                        placeholder="Apellidos"
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                      {activeSuggestionField === "apellidos" && (
                        <div className={`absolute z-30 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded shadow-lg border text-xs divide-y ${
                          isDarkMode 
                            ? "bg-slate-900 border-slate-700 text-slate-100 divide-slate-800" 
                            : "bg-white border-slate-200 text-slate-700 divide-slate-100"
                        }`}>
                          {getSuggestions("apellidos", police.instructorApellidos).length > 0 ? (
                            getSuggestions("apellidos", police.instructorApellidos).map((s, idx) => (
                              <div
                                key={idx}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  onUpdatePolice("instructorApellidos", s);
                                  setActiveSuggestionField(null);
                                }}
                                className={`px-2.5 py-1.5 text-left cursor-pointer font-bold uppercase transition-colors ${
                                  isDarkMode ? "hover:bg-slate-800 text-emerald-400" : "hover:bg-slate-50 text-emerald-700"
                                }`}
                              >
                                {s}
                              </div>
                            ))
                          ) : (
                            <div className="px-2.5 py-1.5 text-slate-500 italic text-[10px] text-left">No hay sugerencias</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(isFieldUsed("police", "instructorGrado") || isFieldUsed("police", "instructorCIP")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {isFieldUsed("police", "instructorGrado") && (
                    <div>
                      {renderLabel("police", "instructorGrado", "Grado PNP")}
                      <input
                        type="text"
                        value={police.instructorGrado}
                        onChange={(e) => onUpdatePolice("instructorGrado", e.target.value)}
                        placeholder="ST3. PNP"
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                    </div>
                  )}
                  {isFieldUsed("police", "instructorCIP") && (
                    <div>
                      {renderLabel("police", "instructorCIP", "Carnet CIP")}
                      <input
                        type="text"
                        value={police.instructorCIP}
                        onChange={(e) => onUpdatePolice("instructorCIP", e.target.value)}
                        placeholder="CIP N°"
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                    </div>
                  )}
                </div>
              )}

              {(isFieldUsed("police", "distrito") || isFieldUsed("police", "provincia")) && (
                <div>
                  {renderLabel("police", "distrito", "Ubicación (Distrito / Prov)")}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {isFieldUsed("police", "distrito") && (
                      <input
                        type="text"
                        value={police.distrito}
                        onChange={(e) => onUpdatePolice("distrito", e.target.value)}
                        placeholder="MIRAFLORES"
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                    )}
                    {isFieldUsed("police", "provincia") && (
                      <input
                        type="text"
                        value={police.provincia}
                        onChange={(e) => onUpdatePolice("provincia", e.target.value)}
                        placeholder="LIMA"
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                    )}
                  </div>
                </div>
              )}

              {(isFieldUsed("police", "fecha") || isFieldUsed("police", "hora")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {isFieldUsed("police", "fecha") && (
                    <div>
                      {renderLabel("police", "fecha", "Fecha")}
                      <input
                        type="date"
                        value={police.fecha}
                        onChange={(e) => onUpdatePolice("fecha", e.target.value)}
                        className={getInputClass("px-2 py-1")}
                      />
                    </div>
                  )}
                  {isFieldUsed("police", "hora") && (
                    <div>
                      {renderLabel("police", "hora", "Hora Inicio")}
                      <input
                        type="time"
                        value={police.hora}
                        onChange={(e) => onUpdatePolice("hora", e.target.value)}
                        className={getInputClass("px-2 py-1")}
                      />
                    </div>
                  )}
                </div>
              )}

              {isFieldUsed("police", "companiaDe") && (
                <div>
                  {renderLabel("police", "companiaDe", "En compañía de (Compañero PNP)")}
                  <input
                    type="text"
                    value={police.companiaDe}
                    onChange={(e) => onUpdatePolice("companiaDe", e.target.value)}
                    placeholder="S3. PNP..."
                    className={getInputClass("px-2.5 py-1.5")}
                  />
                </div>
              )}

              {isFieldUsed("police", "unidadPolicial") && (
                <div>
                  {renderLabel("police", "unidadPolicial", "Unidad Policial (UNIDAD PNP/Comisaría)")}
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={police.unidadPolicial || ""}
                      onChange={(e) => onUpdatePolice("unidadPolicial", e.target.value)}
                      onFocus={() => setActiveSuggestionField("unidad")}
                      onBlur={() => {
                        if (police.unidadPolicial) savePoliceToHistory(undefined, undefined, police.unidadPolicial);
                        setTimeout(() => setActiveSuggestionField(prev => prev === "unidad" ? null : prev), 200);
                      }}
                      placeholder="UNIDAD PNP SAN ANDRÉS"
                      className={getInputClass("px-2.5 py-1.5")}
                    />
                    {activeSuggestionField === "unidad" && (
                      <div className={`absolute z-30 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded shadow-lg border text-xs divide-y ${
                        isDarkMode 
                          ? "bg-slate-900 border-slate-700 text-slate-100 divide-slate-800" 
                          : "bg-white border-slate-200 text-slate-700 divide-slate-100"
                      }`}>
                        {getSuggestions("unidad", police.unidadPolicial || "").length > 0 ? (
                          getSuggestions("unidad", police.unidadPolicial || "").map((s, idx) => (
                            <div
                              key={idx}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                onUpdatePolice("unidadPolicial", s);
                                setActiveSuggestionField(null);
                              }}
                              className={`px-2.5 py-1.5 text-left cursor-pointer font-bold uppercase transition-colors ${
                                isDarkMode ? "hover:bg-slate-800 text-emerald-400" : "hover:bg-slate-50 text-emerald-700"
                              }`}
                            >
                              {s}
                            </div>
                          ))
                        ) : (
                          <div className="px-2.5 py-1.5 text-slate-500 italic text-[10px] text-left">No hay sugerencias</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global Detenido Information Card */}
      <div className={`p-3 border-b ${isDarkMode ? "border-slate-800/80" : "border-slate-100/80"}`}>
        <div className={getCardBgClass()}>
          <button
            type="button"
            onClick={() => setIsDetenidoExpanded(!isDetenidoExpanded)}
            className={`w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none focus:outline-none ${isDarkMode ? "text-slate-200 group-hover:text-emerald-400" : "text-slate-700 group-hover:text-emerald-900"}`}
          >
            <span className="flex items-center gap-2 font-display text-left">
              <Users className="w-4 h-4 text-emerald-600 group-hover:text-emerald-705 transition-colors" />
              <span>2. Datos del Intervenido</span>
              {renderStatusBadge(getDetenidoStatus())}
            </span>
            {isDetenidoExpanded ? (
              <ChevronDown className="w-4 h-4 text-emerald-600 transition-transform duration-200" />
            ) : (
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isDarkMode ? "text-slate-500 group-hover:text-emerald-455" : "text-slate-400 group-hover:text-emerald-500"}`} />
            )}
          </button>

          {isDetenidoExpanded && (
            <div className="space-y-3.5 mt-4 transition-all duration-300">
              {isFieldUsed("detenido", "tipo") && (
                <div>
                  {renderLabel("detenido", "tipo", "Rol / Condición de la Persona")}
                  <div className="flex gap-2">
                    <select
                      value={detenido.tipo || "DETENIDO"}
                      onChange={(e) => onUpdateDetenido("tipo", e.target.value)}
                      className={getInputClass("px-2.5 py-1.5 font-bold cursor-pointer")}
                    >
                      <option value="PERSONA">PERSONA</option>
                      <option value="INTERVENIDO">INTERVENIDO</option>
                      <option value="DETENIDO">DETENIDO</option>
                      <option value="RETENIDO">RETENIDO</option>
                    </select>
                    <button
                      type="button"
                      onClick={onAddDetenidoAdicional}
                      className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm shrink-0"
                      title="Agregar otro ciudadano adicional al acta"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                      Agregar
                    </button>
                  </div>
                </div>
              )}

              {isFieldUsed("detenido", "nombres") && (
                <div>
                  {renderLabel("detenido", "nombres", "Nombres y Apellidos")}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={detenido.nombres}
                      onChange={(e) => onUpdateDetenido("nombres", e.target.value || "")}
                      placeholder="Nombres"
                      className={getInputClass("px-2.5 py-1.5")}
                    />
                    <input
                      type="text"
                      value={detenido.apellidos}
                      onChange={(e) => onUpdateDetenido("apellidos", e.target.value || "")}
                      placeholder="Apellidos"
                      className={getInputClass("px-2.5 py-1.5")}
                    />
                  </div>
                </div>
              )}

              {(isFieldUsed("detenido", "nacionalidad") || isFieldUsed("detenido", "naturalDe")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {isFieldUsed("detenido", "nacionalidad") && (
                    <div>
                      {renderLabel("detenido", "nacionalidad", "Nacionalidad")}
                      <input
                        type="text"
                        value={detenido.nacionalidad || ""}
                        onChange={(e) => onUpdateDetenido("nacionalidad", e.target.value || "")}
                        placeholder="PERUANA"
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                    </div>
                  )}
                  {isFieldUsed("detenido", "naturalDe") && (
                    <div>
                      {renderLabel("detenido", "naturalDe", "Lugar de Nacimiento (Natural de)")}
                      <input
                        type="text"
                        value={detenido.naturalDe || ""}
                        onChange={(e) => onUpdateDetenido("naturalDe", e.target.value || "")}
                        placeholder="CHICLAYO"
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                    </div>
                  )}
                </div>
              )}

              {(isFieldUsed("detenido", "dni") || isFieldUsed("detenido", "edad")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {isFieldUsed("detenido", "dni") && (
                    <div>
                      {renderLabel("detenido", "dni", "DNI / Carnet Ext.")}
                      <input
                        type="text"
                        value={detenido.dni}
                        onChange={(e) => onUpdateDetenido("dni", e.target.value || "")}
                        placeholder="8 dígitos"
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                    </div>
                  )}
                  {isFieldUsed("detenido", "edad") && (
                    <div>
                      {renderLabel("detenido", "edad", "Edad (Años)")}
                      <input
                        type="number"
                        value={detenido.edad}
                        onChange={(e) => onUpdateDetenido("edad", e.target.value || "")}
                        placeholder="Edad"
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                    </div>
                  )}
                </div>
              )}

              {(isFieldUsed("detenido", "sexo") || isFieldUsed("detenido", "estadoCivil")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {isFieldUsed("detenido", "sexo") && (
                    <div>
                      {renderLabel("detenido", "sexo", "Sexo")}
                      <select
                        value={detenido.sexo}
                        onChange={(e) => onUpdateDetenido("sexo", e.target.value as "M" | "F")}
                        className={getInputClass("px-2.5 py-1.5 font-bold")}
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>
                  )}
                  {isFieldUsed("detenido", "estadoCivil") && (
                    <div>
                      {renderLabel("detenido", "estadoCivil", "Estado Civil")}
                      <select
                        value={detenido.estadoCivil || "SOLTERO(A)"}
                        onChange={(e) => onUpdateDetenido("estadoCivil", e.target.value)}
                        className={getInputClass("px-2.5 py-1.5 font-bold cursor-pointer")}
                      >
                        <option value="SOLTERO(A)">SOLTERO(A)</option>
                        <option value="CASADO(A)">CASADO(A)</option>
                        <option value="DIVORCIADO(A)">DIVORCIADO(A)</option>
                        <option value="VIUDO(A)">VIUDO(A)</option>
                        <option value="CONVIVIENTE">CONVIVIENTE</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {isFieldUsed("detenido", "nacidoEl") && (
                <div>
                  {renderLabel("detenido", "nacidoEl", "Nacido El (Fecha Nac.)")}
                  <input
                    type="date"
                    value={detenido.nacidoEl}
                    onChange={(e) => onUpdateDetenido("nacidoEl", e.target.value || "")}
                    className={getInputClass("px-2 py-1")}
                  />
                </div>
              )}

              {isFieldUsed("detenido", "domiciliadoEn") && (
                <div>
                  {renderLabel("detenido", "domiciliadoEn", "Domicilio Real")}
                  <input
                    type="text"
                    value={detenido.domiciliadoEn}
                    onChange={(e) => onUpdateDetenido("domiciliadoEn", e.target.value || "")}
                    placeholder="Dirección exacta"
                    className={getInputClass("px-2.5 py-1.5")}
                  />
                </div>
              )}

              {(isFieldUsed("detenido", "celular") || isFieldUsed("detenido", "ocupacion")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {isFieldUsed("detenido", "celular") && (
                    <div>
                      {renderLabel("detenido", "celular", "Celular")}
                      <input
                        type="text"
                        value={detenido.celular}
                        onChange={(e) => onUpdateDetenido("celular", e.target.value || "")}
                        placeholder="999..."
                        className={getInputClass("px-2.5 py-1.5")}
                      />
                    </div>
                  )}
                  {isFieldUsed("detenido", "ocupacion") && (
                    <div>
                      {renderLabel("detenido", "ocupacion", "Ocupación")}
                      <input
                        type="text"
                        value={detenido.ocupacion}
                        onChange={(e) => onUpdateDetenido("ocupacion", e.target.value || "")}
                        placeholder="Ocupación"
                        className={getInputClass("px-2.5 py-1.5 font-medium")}
                      />
                    </div>
                  )}
                </div>
              )}

              {isFieldUsed("detenido", "gradoInstruccion") && (
                <div>
                  {renderLabel("detenido", "gradoInstruccion", "Instrucción (Grado de Instrucción)")}
                  <select
                    value={detenido.gradoInstruccion || "SECUNDARIA COMPLETA"}
                    onChange={(e) => onUpdateDetenido("gradoInstruccion", e.target.value)}
                    className={getInputClass("px-2.5 py-1.5 font-bold cursor-pointer")}
                  >
                    <option value="ANALFABETO">ANALFABETO</option>
                    <option value="PRIMARIA INCOMPLETA">PRIMARIA INCOMPLETA</option>
                    <option value="PRIMARIA COMPLETA">PRIMARIA COMPLETA</option>
                    <option value="SECUNDARIA INCOMPLETA">SECUNDARIA INCOMPLETA</option>
                    <option value="SECUNDARIA COMPLETA">SECUNDARIA COMPLETA</option>
                    <option value="SUPERIOR INCOMPLETA">SUPERIOR INCOMPLETA</option>
                    <option value="SUPERIOR COMPLETA">SUPERIOR COMPLETA</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global Campos Especificos Card */}
      <div className={`p-3 border-b ${isDarkMode ? "border-slate-800/80" : "border-slate-100/80"}`}>
        <div className={getCardBgClass()}>
          <button
            type="button"
            onClick={() => setIsCircunstanciasExpanded(!isCircunstanciasExpanded)}
            className={`w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none focus:outline-none ${isDarkMode ? "text-slate-200 group-hover:text-emerald-400" : "text-slate-700 group-hover:text-emerald-900"}`}
          >
            <span className="flex items-center gap-2 font-display text-left">
              <CheckSquare className="w-4 h-4 text-emerald-600 group-hover:text-emerald-705 transition-colors" />
              <span>3. CAMPOS ESPECIFICOS</span>
              {renderStatusBadge(getEspecificosStatus())}
            </span>
            {isCircunstanciasExpanded ? (
              <ChevronDown className="w-4 h-4 text-emerald-600 transition-transform duration-200" />
            ) : (
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isDarkMode ? "text-slate-500 group-hover:text-emerald-455" : "text-slate-400 group-hover:text-emerald-500"}`} />
            )}
          </button>

          {isCircunstanciasExpanded && (
            <div className="space-y-3.5 mt-4 transition-all duration-300">
              {/* Only show Intervención specific fields when Intervención is currentDocId */}
              {currentDocId === "intervencion" && (
                <>
                  {/* 01. Circunstancias Precedentes */}
                  <div>
                    <label className={getLabelClass("mb-1.5")}>01. Circunstancias Precedentes</label>
                    <textarea
                      value={intervencion.circunstanciasPrecedentes || ""}
                      onChange={(e) => onUpdateDocField("intervencion", "circunstanciasPrecedentes", e.target.value)}
                      rows={3}
                      className={getInputClass("px-2.5 py-1.5 resize-none font-sans")}
                      placeholder="Señale cómo se inicia o qué motivó..."
                    />
                  </div>

                  {/* 02. Circunstancias Concomitantes */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={getLabelClass()}>02. Circunstancias Concomitantes</label>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(intervencion.circunstanciasConcomitantes || "");
                        }}
                        className={`text-[9px] ${isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"} px-2 py-0.5 rounded transition-all font-semibold flex items-center gap-1 cursor-pointer`}
                        title="Copiar texto de circunstancias concomitantes"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copiar</span>
                      </button>
                    </div>
                    <textarea
                      value={intervencion.circunstanciasConcomitantes || ""}
                      onChange={(e) => onUpdateDocField("intervencion", "circunstanciasConcomitantes", e.target.value)}
                      rows={3}
                      className={getInputClass("px-2.5 py-1.5 resize-none font-sans")}
                      placeholder="Señale las acciones de captura, flagrancia..."
                    />
                  </div>

                  {/* 03. Circunstancias Posteriores */}
                  <div>
                    <label className={getLabelClass("mb-1.5")}>03. Circunstancias Posteriores</label>
                    <textarea
                      value={intervencion.circunstanciasPosteriores || ""}
                      onChange={(e) => onUpdateDocField("intervencion", "circunstanciasPosteriores", e.target.value)}
                      rows={3}
                      className={getInputClass("px-2.5 py-1.5 resize-none font-sans")}
                      placeholder="Señale el traslado, lectura y actas..."
                    />
                  </div>

                  {/* 04. Diligencia Concluida (Cierre del Acta de Intervención) */}
                  <div className={`border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"} pt-3 mt-3`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>04. Conclusión del Acta</span>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const localHours = String(now.getHours()).padStart(2, '0');
                          const localMinutes = String(now.getMinutes()).padStart(2, '0');
                          const localTime = `${localHours}:${localMinutes}`;
                          const year = now.getFullYear();
                          const month = String(now.getMonth() + 1).padStart(2, '0');
                          const day = String(now.getDate()).padStart(2, '0');
                          const localDate = `${year}-${month}-${day}`;
                          
                          onUpdateDocField("intervencion", "horaConcluida", localTime);
                          onUpdateDocField("intervencion", "fechaConcluida", localDate);
                        }}
                        className={`text-[9px] ${isDarkMode ? "bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-305" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"} px-2.5 py-0.5 rounded transition-all font-semibold flex items-center gap-1 cursor-pointer active:scale-95`}
                      >
                        Establecer Actual
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={getLabelClass()}>Hora Cierre</label>
                        <input
                          type="text"
                          placeholder="21:15"
                          value={intervencion.horaConcluida || ""}
                          onChange={(e) => onUpdateDocField("intervencion", "horaConcluida", e.target.value)}
                          className={getInputClass("px-2.5 py-1 font-mono")}
                        />
                      </div>
                      <div>
                        <label className={getLabelClass()}>Fecha Cierre</label>
                        <input
                          type="date"
                          value={intervencion.fechaConcluida || ""}
                          onChange={(e) => onUpdateDocField("intervencion", "fechaConcluida", e.target.value)}
                          className={getInputClass("px-2.5 py-1 font-mono")}
                        />
                      </div>
                    </div>
                  </div>


                </>
              )}

              {/* DYNAMIC ADDITIONAL FIELDS DEPENDING ON SELECTED DOCUMENT TYPE */}
              <DynamicDocFields 
                state={state}
                currentDocId={currentDocId}
                onUpdateDocField={onUpdateDocField}
                onUpdateNestedDocField={onUpdateNestedDocField}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
