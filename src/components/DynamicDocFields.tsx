import React, { useState } from "react";
import { ActasState } from "../types";
import { 
  CheckSquare, Shield, Users, Plus, Trash2, Car, Layout, 
  Briefcase, RefreshCw, FileEdit, CheckCircle2, User, HelpCircle,
  ChevronDown, ChevronUp, Copy, Check
} from "lucide-react";
import { INITIAL_STATE } from "../templatesData";

// Self-contained CopyButton for quick text reproduction in other forms
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar el texto", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text}
      className={`py-1 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all text-[9.5px] uppercase font-bold cursor-pointer font-sans select-none no-print ${
        copied
          ? "bg-emerald-50 text-emerald-600 border-emerald-250 shadow-sm dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-900"
          : "bg-slate-50 text-slate-500 hover:text-slate-700 border-slate-250 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-900 dark:text-slate-400 dark:border-slate-755 dark:hover:text-slate-200 dark:hover:bg-slate-805"
      }`}
      title={copied ? "¡Copiado al portapapeles!" : "Copiar texto descriptivo"}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-600" />
          <span>¡COPIADO!</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>COPIAR</span>
        </>
      )}
    </button>
  );
};

// --- BASE DE DATOS DE DELITOS DEL CÓDIGO PENAL PERUANO ---
const DELITOS_CPP = [
  {
    categoria: "Vida, Cuerpo y Salud",
    subtipos: [
      { id: "homicidio_simple", nombre: "Homicidio Simple (Art. 106)", redactado: "Presunto Delito Contra la Vida, el Cuerpo y la Salud - HOMICIDIO SIMPLE (Art. 106 del CP), en agravio de [Nombre del Agraviado/Occiso]." },
      { id: "homicidio_calificado", nombre: "Homicidio Calificado (Art. 108)", redactado: "Presunto Delito Contra la Vida, el Cuerpo y la Salud - HOMICIDIO CALIFICADO - ASESINATO (Art. 108 del CP), en agravio de [Nombre del Agraviado/Occiso]." },
      { id: "feminicidio", nombre: "Feminicidio (Art. 108-B)", redactado: "Presunto Delito Contra la Vida, el Cuerpo y la Salud - FEMINICIDIO (Art. 108-B del CP), en agravio de quien en vida fue [Nombre de la Víctima]." },
      { id: "lesiones_graves_leves", nombre: "Lesiones Graves / Leves (Art. 121 / 122)", redactado: "Presunto Delito Contra la Vida, el Cuerpo y la Salud - LESIONES [GRAVES/LEVES] (Art. [121/122] del CP), en agravio de [Nombre del Agraviado]." },
      { id: "agresiones_familiares", nombre: "Agresiones contra las Mujeres o Integrantes del Grupo Familiar (Art. 122-B)", redactado: "Presunto Delito Contra la Vida, el Cuerpo y la Salud - AGRESIONES CONTRA LAS MUJERES O INTEGRANTES DEL GRUPO FAMILIAR (Art. 122-B del CP), en agravio de [Nombre de la Víctima]." }
    ]
  },
  {
    categoria: "Patrimonio",
    subtipos: [
      { id: "hurto_simple", nombre: "Hurto Simple (Art. 185)", redactado: "Presunto Delito Contra el Patrimonio - HURTO SIMPLE (Art. 185 del CP), en agravio de [Nombre del Agraviado / Razón Social]." },
      { id: "hurto_agravado", nombre: "Hurto Agravado (Art. 186)", redactado: "Presunto Delito Contra el Patrimonio - HURTO AGRAVADO (Art. 186 del CP), en agravio de [Nombre del Agraviado / Razón Social]." },
      { id: "robo_simple", nombre: "Robo Simple (Art. 188)", redactado: "Presunto Delito Contra el Patrimonio - ROBO SIMPLE (Art. 188 del CP), en agravio de [Nombre del Agraviado]." },
      { id: "robo_agravado", nombre: "Robo Agravado (Art. 189)", redactado: "Presunto Delito Contra el Patrimonio - ROBO AGRAVADO (Art. 189 del CP), en agravio de [Nombre del Agraviado]." },
      { id: "receptacion", nombre: "Receptación (Art. 194)", redactado: "Presunto Delito Contra el Patrimonio - RECEPTACIÓN (Art. 194 del CP), en agravio de [Nombre del Propietario Original o El Estado]." },
      { id: "estafa", nombre: "Estafa (Art. 196)", redactado: "Presunto Delito Contra el Patrimonio - ESTAFA (Art. 196 del CP), en agravio de [Nombre del Agraviado]." },
      { id: "extorsion", nombre: "Extorsión (Art. 200)", redactado: "Presunto Delito Contra el Patrimonio - EXTORSIÓN (Art. 200 del CP), en agravio de [Nombre del Agraviado / Empresa]." }
    ]
  },
  {
    categoria: "Seguridad Pública",
    subtipos: [
      { id: "conduccion_ebriedad", nombre: "Conducción en Estado de Ebriedad (Art. 274)", redactado: "Presunto Delito Contra la Seguridad Pública - CONDUCCIÓN DE VEHÍCULO EN ESTADO DE EBRIEDAD O DROGADICCIÓN (Art. 274 del CP), en agravio de La Sociedad y El Estado Peruano." },
      { id: "tenencia_armas", nombre: "Tenencia Ilegal de Armas (Art. 279-G)", redactado: "Presunto Delito Contra la Seguridad Pública - FABRICACIÓN, COMERCIALIZACIÓN, USO O TENENCIA ILEGAL DE ARMAS Y MUNICIONES (Art. 279-G del CP), en agravio de El Estado Peruano." },
      { id: "disturbios", nombre: "Disturbios (Art. 315)", redactado: "Presunto Delito Contra la Seguridad Pública - DISTURBIOS (Art. 315 del CP), en agravio de El Estado Peruano y la Colectividad." }
    ]
  },
  {
    categoria: "Salud Pública",
    subtipos: [
      { id: "tid_tipo_base", nombre: "TID - Tipo Base (Art. 296)", redactado: "Presunto Delito Contra la Salud Pública - TRÁFICO ILÍCITO DE DROGAS - PROMOCIÓN O FAVORECIMIENTO (Art. 296 del Tipo Base del CP), en agravio de El Estado Peruano." },
      { id: "tid_microcomercializacion", nombre: "TID - Microcomercialización (Art. 298)", redactado: "Presunto Delito Contra la Salud Pública - TRÁFICO ILÍCITO DE DROGAS - MICROCOMERCIALIZACIÓN O MICROPRODUCCIÓN (Art. 298 del CP), en agravio de El Estado Peruano." }
    ]
  },
  {
    categoria: "Administración Pública",
    subtipos: [
      { id: "violencia_resistencia", nombre: "Violencia o Resistencia a la Autoridad (Art. 365 / 367)", redactado: "Presunto Delito Contra la Administración Pública - VIOLENCIA Y RESISTENCIA A LA AUTORIDAD [AGRAVADA] (Art. [365/367] del CP), en agravio de El Estado - Policía Nacional del Perú, personificado por el [Grado PNP y Nombre del Efectivo]." },
      { id: "cohecho_pasivo_policial", nombre: "Cohecho Pasivo Policial (Art. 395-A)", redactado: "Presunto Delito Contra la Administración Pública - COHECHO PASIVO PROPIO EN EL EJERCICIO DE LA FUNCIÓN POLICIAL (Art. 395-A del CP), en agravio de El Estado Peruano." },
      { id: "cohecho_activo_policial", nombre: "Cohecho Activo en el Ámbito Policial (Art. 398-A)", redactado: "Presunto Delito Contra la Administración Pública - COHECHO ACTIVO EN EL ÁMBITO POLICIAL (Art. 398-A del CP), en agravio de El Estado - Policía Nacional del Perú." }
    ]
  },
  {
    categoria: "Libertad",
    subtipos: [
      { id: "secuestro", nombre: "Secuestro (Art. 152)", redactado: "Presunto Delito Contra la Libertad - SECUESTRO (Art. 152 del CP), en agravio de [Nombre del Agraviado]." },
      { id: "violacion_sexual", nombre: "Violación Sexual (Art. 170)", redactado: "Presunto Delito Contra la Libertad Sexual - VIOLACIÓN SEXUAL (Art. 170 del CP), en agravio de [Nombre de la Víctima] (Identidad Protegida)." },
      { id: "tocamientos_indebidos", nombre: "Tocamientos Indebidos (Art. 176)", redactado: "Presunto Delito Contra la Libertad Sexual - TOCAMIENTOS, ACTOS DE CONNOTACIÓN SEXUAL O ACTOS LIBIDINOSOS SIN CONSENTIMIENTO (Art. 176 del CP), en agravio de [Nombre de la Víctima]." },
      { id: "chantaje", nombre: "Chantaje (Art. 201)", redactado: "Presunto Delito Contra la Libertad - CHANTAJE (Art. 201 del CP), en agravio de [Nombre del Agraviado]." }
    ]
  },
  {
    categoria: "Fe Pública",
    subtipos: [
      { id: "falsificacion_documentos", nombre: "Falsificación de Documentos (Art. 427)", redactado: "Presunto Delito Contra la Fe Pública - FALSIFICACIÓN DE DOCUMENTOS [PÚBLICOS / PRIVADOS] (Art. 427 del CP), en agravio de El Estado y/o [Nombre del Tercer Afectado]." },
      { id: "falsedad_ideologica", nombre: "Falsedad Ideológica (Art. 428)", redactado: "Presunto Delito Contra la Fe Pública - FALSEDAD IDEOLÓGICA (Art. 428 del CP), en agravio de El Estado Peruano [y/o la Institución de Registros correspondientes]." }
    ]
  }
];

interface DynamicDocFieldsProps {
  state: ActasState;
  currentDocId: string;
  onUpdateDocField: (docId: string, field: string, value: any) => void;
  onUpdateNestedDocField: (docId: string, section: string, field: string, value: any) => void;
  isDarkMode?: boolean;
}

export const DynamicDocFields: React.FC<DynamicDocFieldsProps> = ({
  state: rawState,
  currentDocId,
  onUpdateDocField,
  onUpdateNestedDocField,
  isDarkMode = false
}) => {
  const state = {
    ...INITIAL_STATE,
    ...rawState,
    police: { ...INITIAL_STATE.police, ...rawState?.police },
    detenido: { ...INITIAL_STATE.detenido, ...rawState?.detenido },
    intervencion: { ...INITIAL_STATE.intervencion, ...rawState?.intervencion },
    detencion: { ...INITIAL_STATE.detencion, ...rawState?.detencion },
    buenTrato: { ...INITIAL_STATE.buenTrato, ...rawState?.buenTrato },
    comunicacionTelefonica: { ...INITIAL_STATE.comunicacionTelefonica, ...rawState?.comunicacionTelefonica },
    detencionMenor: { ...INITIAL_STATE.detencionMenor, ...rawState?.detencionMenor },
    registroPersonal: { ...INITIAL_STATE.registroPersonal, ...rawState?.registroPersonal },
    registroVehicular: { ...INITIAL_STATE.registroVehicular, ...rawState?.registroVehicular },
    situacionVehicular: { ...INITIAL_STATE.situacionVehicular, ...rawState?.situacionVehicular },
    recepcion: { ...INITIAL_STATE.recepcion, ...rawState?.recepcion },
    incautacionArt203: { ...INITIAL_STATE.incautacionArt203, ...rawState?.incautacionArt203 },
    entregaRecepcionMenor: { ...INITIAL_STATE.entregaRecepcionMenor, ...rawState?.entregaRecepcionMenor },
    lacradoArma: { ...INITIAL_STATE.lacradoArma, ...rawState?.lacradoArma },
    ocurrencia: { ...INITIAL_STATE.ocurrencia, ...rawState?.ocurrencia },
    rotuloEvidencias: { ...INITIAL_STATE.rotuloEvidencias, ...rawState?.rotuloEvidencias },
    cadenaCustodia: { ...INITIAL_STATE.cadenaCustodia, ...rawState?.cadenaCustodia }
  };

  const [openExteriores, setOpenExteriores] = React.useState(false);
  const [openInteriores, setOpenInteriores] = React.useState(false);
  const [openMotor, setOpenMotor] = React.useState(false);
  const [selectedDelitoCat, setSelectedDelitoCat] = React.useState("");
  const [selectedDelitoSub, setSelectedDelitoSub] = React.useState("");
  
  // --- Helpers for Detenidos Adicionales ---
  const handleAddDetenidoAdicional = (docId: "intervencion" | "registroVehicular" | "detencionMenor" | "incautacionArt203" | "entregaRecepcionMenor" | "situacionVehicular") => {
    const currentList = (state[docId] as any)?.detenidosAdicionales || [];
    const newDetenido = {
      nombres: "",
      apellidos: "",
      dni: "",
      naturalDe: "",
      nacidoEl: "",
      estadoCivil: "SOLTERO(A)",
      ocupacion: "",
      gradoInstruccion: "SECUNDARIA COMPLETA",
      domiciliadoEn: "",
      celular: "",
      correo: "",
      sexo: "M",
      edad: "",
      tipo: state.detenido.tipo || "DETENIDO"
    };
    onUpdateDocField(docId, "detenidosAdicionales", [...currentList, newDetenido]);
  };

  const handleRemoveDetenidoAdicional = (docId: "intervencion" | "registroVehicular" | "detencionMenor" | "incautacionArt203" | "entregaRecepcionMenor" | "situacionVehicular", index: number) => {
    const currentList = (state[docId] as any)?.detenidosAdicionales || [];
    const newList = currentList.filter((_: any, i: number) => i !== index);
    onUpdateDocField(docId, "detenidosAdicionales", newList);
  };

  const handleUpdateDetenidoAdicionalField = (
    docId: "intervencion" | "registroVehicular" | "detencionMenor" | "incautacionArt203" | "entregaRecepcionMenor" | "situacionVehicular", 
    index: number, 
    field: string, 
    value: any
  ) => {
    const currentList = (state[docId] as any)?.detenidosAdicionales || [];
    const newList = currentList.map((detData: any, i: number) => {
      if (i === index) {
        return { ...detData, [field]: value };
      }
      return detData;
    });
    onUpdateDocField(docId, "detenidosAdicionales", newList);
  };

  // --- Incautacion Sync Logic ---
  const detencionMenorDetenidos = state.detencionMenor?.detenidosAdicionales || [];
  const registroVehicularDetenidos = state.registroVehicular?.detenidosAdicionales || [];
  const incautacionArt203Detenidos = state.incautacionArt203?.detenidosAdicionales || [];
  const entregaRecepcionMenorDetenidos = state.entregaRecepcionMenor?.detenidosAdicionales || [];
  const situacionVehicularDetenidos = state.situacionVehicular?.detenidosAdicionales || [];

  return (
    <div className={`space-y-4 pt-3 border-t mt-2 ${isDarkMode ? "dark-theme-inputs border-slate-800" : "border-slate-100"}`}>

      {/* --- DETENCION --- */}
      {currentDocId === "detencion" && state.detencion && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
            
            {/* TIPO DE DELITO / Código Penal Peruano */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDarkMode 
                ? "bg-slate-900/50 border-slate-800 text-slate-100" 
                : "bg-emerald-500/5 border-emerald-500/10 text-slate-800"
            }`}>
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? "text-emerald-400" : "text-emerald-700"
                }`}>
                  <Shield className="w-3.5 h-3.5" /> CLASIFICACIÓN DE DELITO (CÓDIGO PENAL PERUANO)
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                  Seleccione el delito y subtipo del cuadro para generar la redacción técnica PNP oficial de manera automática.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1 tracking-wider">1. Tipo de Delito</label>
                  <select
                    value={selectedDelitoCat}
                    onChange={(e) => {
                      setSelectedDelitoCat(e.target.value);
                      setSelectedDelitoSub("");
                    }}
                    className={`w-full text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans ${
                      isDarkMode 
                        ? "bg-slate-950/80 border-slate-800 text-slate-100" 
                        : "bg-white border-slate-250 text-slate-800"
                    }`}
                  >
                    <option value="">-- Seleccione Categoría --</option>
                    {DELITOS_CPP.map((d, idx) => (
                      <option key={idx} value={d.categoria}>{d.categoria}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1 tracking-wider">2. Subtipo del Delito / Art.</label>
                  <select
                    value={selectedDelitoSub}
                    disabled={!selectedDelitoCat}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedDelitoSub(val);
                      if (val) {
                        const catObj = DELITOS_CPP.find(c => c.categoria === selectedDelitoCat);
                        const subObj = catObj?.subtipos.find(s => s.id === val);
                        if (subObj) {
                          onUpdateDocField("detencion", "delitoFlagranteContexto", subObj.redactado);
                        }
                      }
                    }}
                    className={`w-full text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 transition-all font-sans ${
                      isDarkMode 
                        ? "bg-slate-950/80 border-slate-800 text-slate-100" 
                        : "bg-white border-slate-255 text-slate-800"
                    }`}
                  >
                    <option value="">-- Seleccione Subtipo --</option>
                    {DELITOS_CPP.find(c => c.categoria === selectedDelitoCat)?.subtipos.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Motivo / Hecho de la Detención [Flagrante]</label>
              <textarea
                value={state.detencion.delitoFlagranteContexto || ""}
                onChange={(e) => onUpdateDocField("detencion", "delitoFlagranteContexto", e.target.value)}
                rows={5}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
                placeholder="Describa el presunto delito flagrante que motiva el acta..."
              />
              <span className="text-[10px] text-slate-400 block mt-1 leading-normal font-sans">Art. 2° Inc. 24 f Const. y Art. 259 del CPP.</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hora Notificación</label>
                <input
                  type="time"
                  value={state.detencion.horaConcluida || ""}
                  onChange={(e) => onUpdateDocField("detencion", "horaConcluida", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Fecha Notificación</label>
                <input
                  type="date"
                  value={state.detencion.fechaConcluida || ""}
                  onChange={(e) => onUpdateDocField("detencion", "fechaConcluida", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BUEN TRATO --- */}
      {currentDocId === "buenTrato" && state.buenTrato && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
            <label className="flex items-start gap-3 bg-emerald-50/40 p-3.5 rounded-lg border border-emerald-100 select-none cursor-pointer hover:bg-emerald-50 transition-all">
              <input
                type="checkbox"
                checked={!!state.buenTrato.recibioBuenTrato}
                onChange={(e) => onUpdateDocField("buenTrato", "recibioBuenTrato", e.target.checked)}
                className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <div className="text-xs leading-normal">
                <span className="font-bold text-slate-800 text-sm block">Declaración de Buen Trato</span>
                <p className="text-slate-500 mt-1">El detenido firma haber recibido trato digno respetando sus derechos constitucionales.</p>
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hora Firma</label>
                <input
                  type="time"
                  value={state.buenTrato.horaFirma || ""}
                  onChange={(e) => onUpdateDocField("buenTrato", "horaFirma", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Fecha Firma</label>
                <input
                  type="date"
                  value={state.buenTrato.fechaFirma || ""}
                  onChange={(e) => onUpdateDocField("buenTrato", "fechaFirma", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- COMUNICACION TELEFONICA --- */}
      {currentDocId === "comunicacionTelefonica" && state.comunicacionTelefonica && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 font-display">Garantía del Derecho Telefónico (Art. 71 CPP)</h4>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Equipo Telefónico</label>
                <select
                  value={state.comunicacionTelefonica.equipoEmpleado || "Celular"}
                  onChange={(e) => onUpdateDocField("comunicacionTelefonica", "equipoEmpleado", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans cursor-pointer"
                >
                  <option value="Celular">Celular</option>
                  <option value="Fijo">Fijo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Característica Celular</label>
                <input
                  type="text"
                  value={state.comunicacionTelefonica.marcaCaracteristica || ""}
                  onChange={(e) => onUpdateDocField("comunicacionTelefonica", "marcaCaracteristica", e.target.value)}
                  placeholder="Ej.: SAMSUNG GALAXY A54"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Operador / Autoridad</label>
                <input
                  type="text"
                  value={state.comunicacionTelefonica.celularOperador || ""}
                  onChange={(e) => onUpdateDocField("comunicacionTelefonica", "celularOperador", e.target.value)}
                  placeholder="Personal a cargo"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Propiedad Del Celular</label>
                <input
                  type="text"
                  value={state.comunicacionTelefonica.propiedadDe || ""}
                  onChange={(e) => onUpdateDocField("comunicacionTelefonica", "propiedadDe", e.target.value)}
                  placeholder="PNP / PROPIO"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Contacto Destinatario</span>
              
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Celular Llamado</label>
                <input
                  type="text"
                  value={state.comunicacionTelefonica.numeroLlamado || ""}
                  onChange={(e) => onUpdateDocField("comunicacionTelefonica", "numeroLlamado", e.target.value)}
                  placeholder="999..."
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Recibe la Llamada</label>
                <input
                  type="text"
                  value={state.comunicacionTelefonica.recibeLlamada || ""}
                  onChange={(e) => onUpdateDocField("comunicacionTelefonica", "recibeLlamada", e.target.value)}
                  placeholder="Familiar completo"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Vínculo</label>
                  <input
                    type="text"
                    value={state.comunicacionTelefonica.parentesco || ""}
                    onChange={(e) => onUpdateDocField("comunicacionTelefonica", "parentesco", e.target.value)}
                    placeholder="Ej. MADRE / ABOGADO"
                    className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Operador Dest.</label>
                  <input
                    type="text"
                    value={state.comunicacionTelefonica.operadorLlamado || ""}
                    onChange={(e) => onUpdateDocField("comunicacionTelefonica", "operadorLlamado", e.target.value)}
                    placeholder="Ej. CLARO"
                    className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fecha/Hora</label>
                  <input
                    type="text"
                    value={state.comunicacionTelefonica.fechaHoraLlamada || ""}
                    onChange={(e) => onUpdateDocField("comunicacionTelefonica", "fechaHoraLlamada", e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1.5 text-center font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Grabación</label>
                  <select
                    value={state.comunicacionTelefonica.grabacionLlamada || "SI"}
                    onChange={(e) => onUpdateDocField("comunicacionTelefonica", "grabacionLlamada", e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1.5 font-bold cursor-pointer focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  >
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Captura</label>
                  <select
                    value={state.comunicacionTelefonica.capturaPantalla || "SI"}
                    onChange={(e) => onUpdateDocField("comunicacionTelefonica", "capturaPantalla", e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1.5 font-bold cursor-pointer focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  >
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Resultado Técnico de Comunicación</label>
              <textarea
                value={state.comunicacionTelefonica.resultadoComunicacion || ""}
                onChange={(e) => onUpdateDocField("comunicacionTelefonica", "resultadoComunicacion", e.target.value)}
                rows={3}
                placeholder="Indique si contestó, coordinaciones..."
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- DETENCION MENOR --- */}
      {currentDocId === "detencionMenor" && state.detencionMenor && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2">Información Familiar del Menor</h4>
            
            <div className="grid grid-cols-1 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Centro Educativo / Pertenece a</label>
                <input
                  type="text"
                  value={state.detencionMenor.pertenecienteA || ""}
                  onChange={(e) => onUpdateDocField("detencionMenor", "pertenecienteA", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Nombre del Padre</label>
                  <input
                    type="text"
                    value={state.detencionMenor.padreNombre || ""}
                    onChange={(e) => onUpdateDocField("detencionMenor", "padreNombre", e.target.value)}
                    className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Nombre de la Madre</label>
                  <input
                    type="text"
                    value={state.detencionMenor.madreNombre || ""}
                    onChange={(e) => onUpdateDocField("detencionMenor", "madreNombre", e.target.value)}
                    className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Descripción Infracción Flagrante del Menor</label>
              <textarea
                value={state.detencionMenor.motivoInfraccionLeyes || ""}
                onChange={(e) => onUpdateDocField("detencionMenor", "motivoInfraccionLeyes", e.target.value)}
                rows={4}
                placeholder="Infracción a leyes penales..."
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block tracking-wider">A) Comunicación Padre / Madre o Tutor</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={state.detencionMenor.contactoPadreNombre || ""}
                  onChange={(e) => onUpdateDocField("detencionMenor", "contactoPadreNombre", e.target.value)}
                  placeholder="Nombre contacto tutor"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
                <input
                  type="text"
                  value={state.detencionMenor.contactoPadreVinculo || ""}
                  onChange={(e) => onUpdateDocField("detencionMenor", "contactoPadreVinculo", e.target.value)}
                  placeholder="Vínculo tutor"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={state.detencionMenor.contactoPadreDni || ""}
                  onChange={(e) => onUpdateDocField("detencionMenor", "contactoPadreDni", e.target.value)}
                  placeholder="DNI del tutor"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
                <input
                  type="text"
                  value={state.detencionMenor.contactoPadreCelular || ""}
                  onChange={(e) => onUpdateDocField("detencionMenor", "contactoPadreCelular", e.target.value)}
                  placeholder="Celular tutor"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
              <input
                type="text"
                value={state.detencionMenor.contactoPadreObs || ""}
                onChange={(e) => onUpdateDocField("detencionMenor", "contactoPadreObs", e.target.value)}
                placeholder="Observaciones de comunicación familiar"
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[11px] font-bold text-blue-800 uppercase block tracking-wider">B) Comunicación al Fiscal de Familia</span>
              <input
                type="text"
                value={state.detencionMenor.contactoFiscalNombre || ""}
                onChange={(e) => onUpdateDocField("detencionMenor", "contactoFiscalNombre", e.target.value)}
                placeholder="Nombre Fiscal Familia de Turno"
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={state.detencionMenor.contactoFiscalia || ""}
                  onChange={(e) => onUpdateDocField("detencionMenor", "contactoFiscalia", e.target.value)}
                  placeholder="Fiscalía"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <input
                  type="text"
                  value={state.detencionMenor.contactoFiscalCelular || ""}
                  onChange={(e) => onUpdateDocField("detencionMenor", "contactoFiscalCelular", e.target.value)}
                  placeholder="Celular Fiscal"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[11px] font-bold text-purple-800 uppercase block tracking-wider">C) Comunicación al Juez de Inv. Prep.</span>
              <input
                type="text"
                value={state.detencionMenor.contactoJuezNombre || ""}
                onChange={(e) => onUpdateDocField("detencionMenor", "contactoJuezNombre", e.target.value)}
                placeholder="Nombre del Juez Preparatoria"
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={state.detencionMenor.contactoJuezJuzgado || ""}
                  onChange={(e) => onUpdateDocField("detencionMenor", "contactoJuezJuzgado", e.target.value)}
                  placeholder="Juzgado asignado"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <input
                  type="text"
                  value={state.detencionMenor.contactoJuezCelular || ""}
                  onChange={(e) => onUpdateDocField("detencionMenor", "contactoJuezCelular", e.target.value)}
                  placeholder="Celular Juez"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
            </div>


          </div>
        </div>
      )}

      {/* --- REGISTRO PERSONAL / INCAUTACION --- */}
      {currentDocId === "registroPersonal" && state.registroPersonal && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2">Ubicación y Labor del Registro</h4>
            
            <div className="grid grid-cols-1 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Lugar de Registro</label>
                <input
                  type="text"
                  value={state.registroPersonal.lugarRegistro || ""}
                  onChange={(e) => onUpdateDocField("registroPersonal", "lugarRegistro", e.target.value)}
                  placeholder="Ej.: Av. Larco 1210"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Dependencia del Personal</label>
                <input
                  type="text"
                  value={state.registroPersonal.personalLlevaACabo || ""}
                  onChange={(e) => onUpdateDocField("registroPersonal", "personalLlevaACabo", e.target.value)}
                  placeholder="Ej.: Comisaría PNP Miraflores"
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Se deja constancia final</label>
              <textarea
                value={state.registroPersonal.dejaConstancia || ""}
                onChange={(e) => onUpdateDocField("registroPersonal", "dejaConstancia", e.target.value)}
                rows={3}
                placeholder="Obs. finales, trato físico íntegro..."
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hora Término</label>
                <input
                  type="time"
                  value={state.registroPersonal.horaConcluida || ""}
                  onChange={(e) => onUpdateDocField("registroPersonal", "horaConcluida", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Fecha Término</label>
                <input
                  type="date"
                  value={state.registroPersonal.fechaConcluida || ""}
                  onChange={(e) => onUpdateDocField("registroPersonal", "fechaConcluida", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Bienes y Especies de Interés / Seized Goods */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2">Bienes y Especies Incautadas</h4>

            {/* Invitación a exhibir bienes */}
            <div>
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider">Invitado a exhibir bienes voluntariamente</label>
                <CopyButton text={state.registroPersonal.solicitadoExhibirBienes || ""} />
              </div>
              <textarea
                value={state.registroPersonal.solicitadoExhibirBienes || ""}
                onChange={(e) => onUpdateDocField("registroPersonal", "solicitadoExhibirBienes", e.target.value)}
                rows={2}
                placeholder="Ej.: manifestó no poseer armas, procediendo voluntariamente a extraer las pertenencias de sus bolsillos de vestir..."
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* 1. Droga e Insumos Químicos */}
            <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reg_drogasCheck"
                  checked={state.registroPersonal.drogasInsumosCheck || false}
                  onChange={(e) => onUpdateDocField("registroPersonal", "drogasInsumosCheck", e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="reg_drogasCheck" className="text-xs font-bold text-slate-700 uppercase cursor-pointer select-none">
                  Droga e Insumos Químicos (HAY HALLAZGO)
                </label>
              </div>
              {state.registroPersonal.drogasInsumosCheck && (
                <div className="space-y-1.5 pl-6">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Detalle del Hallazgo (Droga/Insumos)</span>
                    <CopyButton text={state.registroPersonal.drogasInsumosDetalle || ""} />
                  </div>
                  <textarea
                    value={state.registroPersonal.drogasInsumosDetalle || ""}
                    onChange={(e) => onUpdateDocField("registroPersonal", "drogasInsumosDetalle", e.target.value)}
                    rows={2.5}
                    placeholder="Especifique tipo, empaque, peso estimado..."
                    className="w-full text-sm bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              )}
            </div>

            {/* 2. Billete y Moneda */}
            <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reg_billeteCheck"
                  checked={state.registroPersonal.billetesMonedasCheck || false}
                  onChange={(e) => onUpdateDocField("registroPersonal", "billetesMonedasCheck", e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="reg_billeteCheck" className="text-xs font-bold text-slate-700 uppercase cursor-pointer select-none">
                  Billete y Moneda (Nacional / Extranjera) (HAY HALLAZGO)
                </label>
              </div>
              {state.registroPersonal.billetesMonedasCheck && (
                <div className="space-y-1.5 pl-6">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Detalle del Hallazgo (Dinero)</span>
                    <CopyButton text={state.registroPersonal.billetesMonedasDetalle || ""} />
                  </div>
                  <textarea
                    value={state.registroPersonal.billetesMonedasDetalle || ""}
                    onChange={(e) => onUpdateDocField("registroPersonal", "billetesMonedasDetalle", e.target.value)}
                    rows={2.5}
                    placeholder="Especifique denominación, número de serie, cantidad..."
                    className="w-full text-sm bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              )}
            </div>

            {/* 3. Munición y Armas */}
            <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reg_armasCheck"
                  checked={state.registroPersonal.municionArmasCheck || false}
                  onChange={(e) => onUpdateDocField("registroPersonal", "municionArmasCheck", e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="reg_armasCheck" className="text-xs font-bold text-slate-700 uppercase cursor-pointer select-none">
                  Munición y Armas de Guerra (HAY HALLAZGO)
                </label>
              </div>
              {state.registroPersonal.municionArmasCheck && (
                <div className="space-y-1.5 pl-6">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Detalle del Hallazgo (Munición/Armas)</span>
                    <CopyButton text={state.registroPersonal.municionArmasDetalle || ""} />
                  </div>
                  <textarea
                    value={state.registroPersonal.municionArmasDetalle || ""}
                    onChange={(e) => onUpdateDocField("registroPersonal", "municionArmasDetalle", e.target.value)}
                    rows={2.5}
                    placeholder="Especifique marca, calibre, serie, cartuchos..."
                    className="w-full text-sm bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                  />
                </div>
              )}
            </div>

            {/* 4. Otros de interés */}
            <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reg_otrosCheck"
                  checked={state.registroPersonal.otrosInteresCheck || false}
                  onChange={(e) => onUpdateDocField("registroPersonal", "otrosInteresCheck", e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="reg_otrosCheck" className="text-xs font-bold text-slate-700 uppercase cursor-pointer select-none">
                  Otros de Interés Policial (ej: celulares, joyas, etc.)
                </label>
              </div>
              {state.registroPersonal.otrosInteresCheck && (
                <div className="space-y-1.5 pl-6">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Detalle del Hallazgo (Celulares, otros)</span>
                    <CopyButton text={state.registroPersonal.otrosInteresDetalle || ""} />
                  </div>
                  <textarea
                    value={state.registroPersonal.otrosInteresDetalle || ""}
                    onChange={(e) => onUpdateDocField("registroPersonal", "otrosInteresDetalle", e.target.value)}
                    rows={2.5}
                    placeholder="Especifique marca, IMEI, color, estado..."
                    className="w-full text-sm bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- REGISTRO VEHICULAR --- */}
      {currentDocId === "registroVehicular" && state.registroVehicular && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2">Características del Vehículo</h4>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Placa</label>
                <input
                  type="text"
                  value={state.registroVehicular.placa || ""}
                  onChange={(e) => onUpdateDocField("registroVehicular", "placa", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Marca</label>
                <input
                  type="text"
                  value={state.registroVehicular.marca || ""}
                  onChange={(e) => onUpdateDocField("registroVehicular", "marca", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Color</label>
                <input
                  type="text"
                  value={state.registroVehicular.color || ""}
                  onChange={(e) => onUpdateDocField("registroVehicular", "color", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Modelo</label>
                <input
                  type="text"
                  value={state.registroVehicular.modelo || ""}
                  onChange={(e) => onUpdateDocField("registroVehicular", "modelo", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Año Fab.</label>
                <input
                  type="text"
                  value={state.registroVehicular.anioFabricacion || ""}
                  onChange={(e) => onUpdateDocField("registroVehicular", "anioFabricacion", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Otros Detalles</label>
                <input
                  type="text"
                  value={state.registroVehicular.otrosDetalleVehiculo || ""}
                  onChange={(e) => onUpdateDocField("registroVehicular", "otrosDetalleVehiculo", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Copilotos / Pasajeros</label>
              <input
                type="text"
                value={state.registroVehicular.personasEnVehiculo || ""}
                onChange={(e) => onUpdateDocField("registroVehicular", "personasEnVehiculo", e.target.value)}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-3.5 align-middle items-center font-sans">
              <div className="col-span-1">
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Solicitud Exhibición</label>
                <select
                  value={state.registroVehicular.solicitudExhibicion || "NEGATIVO"}
                  onChange={(e) => onUpdateDocField("registroVehicular", "solicitudExhibicion", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold cursor-pointer"
                >
                  <option value="POSITIVO">POSITIVO (SI)</option>
                  <option value="NEGATIVO">NEGATIVO (NO)</option>
                </select>
              </div>
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-1.5 gap-2">
                  <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider">Descripción del Bien Exhibido</label>
                  <CopyButton text={state.registroVehicular.descripcionBienExhibido || ""} />
                </div>
                <input
                  type="text"
                  value={state.registroVehicular.descripcionBienExhibido || ""}
                  onChange={(e) => onUpdateDocField("registroVehicular", "descripcionBienExhibido", e.target.value)}
                  disabled={state.registroVehicular.solicitudExhibicion === "NEGATIVO"}
                  placeholder={state.registroVehicular.solicitudExhibicion === "NEGATIVO" ? "No aplica" : "Especifique el bien (ej. tarjeta veh, llave, etc.)"}
                  className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Razones para proceder al Registro</label>
              <textarea
                value={state.registroVehicular.razonesRegistro || ""}
                onChange={(e) => onUpdateDocField("registroVehicular", "razonesRegistro", e.target.value)}
                rows={3}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider">Bienes y Objetos Hallados en Vehículo</label>
                <CopyButton text={state.registroVehicular.bienesObjetoRegistro || ""} />
              </div>
              <textarea
                value={state.registroVehicular.bienesObjetoRegistro || ""}
                onChange={(e) => onUpdateDocField("registroVehicular", "bienesObjetoRegistro", e.target.value)}
                rows={3}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>


          </div>
        </div>
      )}

      {/* --- SITUACION VEHICULAR --- */}
      {currentDocId === "situacionVehicular" && state.situacionVehicular && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2">Inspección General e Inventaría Vehicular</h4>

            <div className="grid grid-cols-1 gap-3.5 bg-rose-50/20 p-3.5 rounded-xl border border-rose-100/55">
              <div>
                <label className="block text-xs uppercase font-bold text-rose-800 mb-1.5 tracking-wider">Lugar / Ubicación de la diligencia vehicular</label>
                <input
                  type="text"
                  value={state.situacionVehicular.lugarInspeccion || ""}
                  onChange={(e) => onUpdateDocField("situacionVehicular", "lugarInspeccion", e.target.value)}
                  placeholder="Ej. Av. Camino Real N° 450, San Isidro"
                  className="w-full text-sm bg-white border border-rose-200 focus:border-rose-500 rounded-lg px-3 py-2 text-slate-850 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hijo de Don (Padre)</label>
                  <input
                    type="text"
                    value={state.situacionVehicular.intervenidoPadreNombre || ""}
                    onChange={(e) => onUpdateDocField("situacionVehicular", "intervenidoPadreNombre", e.target.value)}
                    placeholder="Nombre del padre"
                    className="w-full text-sm bg-white border border-slate-200/80 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hijo de Doña (Madre)</label>
                  <input
                    type="text"
                    value={state.situacionVehicular.intervenidoMadreNombre || ""}
                    onChange={(e) => onUpdateDocField("situacionVehicular", "intervenidoMadreNombre", e.target.value)}
                    placeholder="Nombre de la madre"
                    className="w-full text-sm bg-white border border-slate-200/80 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3.5 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/60">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Placa</label>
                <input
                  type="text"
                  value={state.situacionVehicular.datosGenerales.placa || ""}
                  onChange={(e) => onUpdateNestedDocField("situacionVehicular", "datosGenerales", "placa", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Clase</label>
                <input
                  type="text"
                  value={state.situacionVehicular.clase || ""}
                  onChange={(e) => onUpdateDocField("situacionVehicular", "clase", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Motor N°</label>
                <input
                  type="text"
                  value={state.situacionVehicular.datosGenerales.motorNo || ""}
                  onChange={(e) => onUpdateNestedDocField("situacionVehicular", "datosGenerales", "motorNo", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Chasis N°</label>
                <input
                  type="text"
                  value={state.situacionVehicular.datosGenerales.serieChasis || ""}
                  onChange={(e) => onUpdateNestedDocField("situacionVehicular", "datosGenerales", "serieChasis", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-mono"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">Defina el estado técnico en la inspección (SI, NO, NO_REGISTRA para Exteriores/Interiores; y FUNCIONA, NO FUNCIONA, NO_REGISTRA para Motor):</p>
            
            <div className="space-y-3">
              {/* EXTERIOR */}
              <div className="border border-slate-200 rounded-xl bg-slate-50/55 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenExteriores(!openExteriores)}
                  className="w-full text-left flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all duration-150 cursor-pointer outline-none select-none text-slate-700 font-bold text-sm"
                >
                  <span className="flex items-center gap-2.5 font-bold tracking-tight text-slate-700 uppercase">
                    <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-lg bg-emerald-50 text-xs text-emerald-600 font-bold">1</span>
                    Exteriores
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">({Object.keys(state.situacionVehicular.partesExteriores).length} elementos)</span>
                    {openExteriores ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>
                {openExteriores && (
                  <div className="p-3.5 border-t border-slate-100 bg-white space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {Object.keys(state.situacionVehicular.partesExteriores).map((key) => {
                      const typedKey = key as keyof typeof state.situacionVehicular.partesExteriores;
                      const value = state.situacionVehicular.partesExteriores[typedKey];
                      return (
                        <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                          <span className="truncate w-1/2 text-slate-600 capitalize text-sm">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <select
                            value={value}
                            onChange={(e) => onUpdateNestedDocField("situacionVehicular", "partesExteriores", typedKey, e.target.value)}
                            className="bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="SI">SI</option>
                            <option value="NO">NO</option>
                            <option value="NO_REGISTRA">N/R</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* INTERIOR */}
              <div className="border border-slate-200 rounded-xl bg-slate-50/55 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenInteriores(!openInteriores)}
                  className="w-full text-left flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all duration-150 cursor-pointer outline-none select-none text-slate-700 font-bold text-sm"
                >
                  <span className="flex items-center gap-2.5 font-bold tracking-tight text-slate-700 uppercase">
                    <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-lg bg-emerald-50 text-xs text-emerald-600 font-bold">2</span>
                    Interiores
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">({Object.keys(state.situacionVehicular.partesInteriores).length} elementos)</span>
                    {openInteriores ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>
                {openInteriores && (
                  <div className="p-3.5 border-t border-slate-100 bg-white space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {Object.keys(state.situacionVehicular.partesInteriores).map((key) => {
                      const typedKey = key as keyof typeof state.situacionVehicular.partesInteriores;
                      const value = state.situacionVehicular.partesInteriores[typedKey];
                      return (
                        <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                          <span className="truncate w-1/2 text-slate-600 capitalize text-sm">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <select
                            value={value}
                            onChange={(e) => onUpdateNestedDocField("situacionVehicular", "partesInteriores", typedKey, e.target.value)}
                            className="bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="SI">SI</option>
                            <option value="NO">NO</option>
                            <option value="NO_REGISTRA">N/R</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* MOTOR */}
              <div className="border border-slate-200 rounded-xl bg-slate-50/55 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenMotor(!openMotor)}
                  className="w-full text-left flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all duration-150 cursor-pointer outline-none select-none text-slate-700 font-bold text-sm"
                >
                  <span className="flex items-center gap-2.5 font-bold tracking-tight text-slate-700 uppercase">
                    <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-lg bg-emerald-50 text-xs text-emerald-600 font-bold">3</span>
                    Motor / Accesorios
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">({Object.keys(state.situacionVehicular.motorAccesorios).length} elementos)</span>
                    {openMotor ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>
                {openMotor && (
                  <div className="p-3.5 border-t border-slate-100 bg-white space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {Object.keys(state.situacionVehicular.motorAccesorios).map((key) => {
                      const typedKey = key as keyof typeof state.situacionVehicular.motorAccesorios;
                      const value = state.situacionVehicular.motorAccesorios[typedKey];
                      return (
                        <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                          <span className="truncate w-1/2 text-slate-600 capitalize text-sm">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <select
                            value={value}
                            onChange={(e) => onUpdateNestedDocField("situacionVehicular", "motorAccesorios", typedKey, e.target.value)}
                            className="bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="FUNCIONA">FUNCIONA</option>
                            <option value="NO_FUNCIONA">NO FUNCIONA</option>
                            <option value="NO_REGISTRA">N/R</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Descripción de Estado Físico General</label>
              <textarea
                value={state.situacionVehicular.descripcionEspecificaCompleta || ""}
                onChange={(e) => onUpdateDocField("situacionVehicular", "descripcionEspecificaCompleta", e.target.value)}
                rows={4}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>


          </div>
        </div>
      )}

      {/* --- REGISTRO EQUIPAJES --- */}
      {currentDocId === "registroEquipajes" && state.registroEquipajes && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2 font-display">Registro de Equipajes y Bultos</h4>
            
            <div className="grid grid-cols-1 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Exhibición Voluntaria</label>
                <select
                  value={state.registroEquipajes.solicitudExhibicion || "POSITIVO"}
                  onChange={(e) => onUpdateDocField("registroEquipajes", "solicitudExhibicion", e.target.value)}
                  className="w-full text-sm bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/15 cursor-pointer"
                >
                  <option value="POSITIVO">ENTREGA POSITIVA (Colaboró)</option>
                  <option value="NEGATIVO">NEGATIVO (Registro Forzado)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Descripción Bulto o Maleta</label>
                <input
                  type="text"
                  value={state.registroEquipajes.descripcionBienExhibido || ""}
                  onChange={(e) => onUpdateDocField("registroEquipajes", "descripcionBienExhibido", e.target.value)}
                  placeholder="Ej.: Mochila de lona color azul"
                  className="w-full text-sm bg-white border border-slate-200/80 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Razones para proceder</label>
              <textarea
                value={state.registroEquipajes.razonesRegistro || ""}
                onChange={(e) => onUpdateDocField("registroEquipajes", "razonesRegistro", e.target.value)}
                rows={3}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider">Bienes / Objetos Hallados</label>
                <CopyButton text={state.registroEquipajes.bienesObjetoRegistro || ""} />
              </div>
              <textarea
                value={state.registroEquipajes.bienesObjetoRegistro || ""}
                onChange={(e) => onUpdateDocField("registroEquipajes", "bienesObjetoRegistro", e.target.value)}
                rows={4}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- RECEPCION --- */}
      {currentDocId === "recepcion" && state.recepcion && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2 font-display">Persona que Entrega / Recibe</h4>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Nombres</label>
                <input
                  type="text"
                  value={state.recepcion.personaNombres || ""}
                  onChange={(e) => onUpdateDocField("recepcion", "personaNombres", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Apellidos</label>
                <input
                  type="text"
                  value={state.recepcion.personaApellidos || ""}
                  onChange={(e) => onUpdateDocField("recepcion", "personaApellidos", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">DNI N°</label>
                <input
                  type="text"
                  value={state.recepcion.personaDni || ""}
                  onChange={(e) => onUpdateDocField("recepcion", "personaDni", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Nacionalidad</label>
                <input
                  type="text"
                  value={state.recepcion.personaNacionalidad || ""}
                  onChange={(e) => onUpdateDocField("recepcion", "personaNacionalidad", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Celular</label>
                <input
                  type="text"
                  value={state.recepcion.personaCelular || ""}
                  onChange={(e) => onUpdateDocField("recepcion", "personaCelular", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Parentesco con Detenido</label>
                <input
                  type="text"
                  value={state.recepcion.personaParentescoReferencia || ""}
                  onChange={(e) => onUpdateDocField("recepcion", "personaParentescoReferencia", e.target.value)}
                  placeholder="Ej. HERMANO"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Razones para Entrega / Recepción</label>
              <textarea
                value={state.recepcion.razonesEntrega || ""}
                onChange={(e) => onUpdateDocField("recepcion", "razonesEntrega", e.target.value)}
                rows={3}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Descripción Técnica de Bien Recepcionado</label>
              <textarea
                value={state.recepcion.descripcionBienObjeto || ""}
                onChange={(e) => onUpdateDocField("recepcion", "descripcionBienObjeto", e.target.value)}
                rows={4}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Encargado de Custodia (PNP)</label>
              <input
                type="text"
                value={state.recepcion.funcionarioCustodia || ""}
                onChange={(e) => onUpdateDocField("recepcion", "funcionarioCustodia", e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- OCURRENCIA --- */}
      {currentDocId === "ocurrencia" && state.ocurrencia && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2 font-display">PARTE DE OCURRENCIA</h4>
            
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Asunto del Parte de Ocurrencia</label>
              <input
                type="text"
                value={state.ocurrencia.asunto || ""}
                onChange={(e) => onUpdateDocField("ocurrencia", "asunto", e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-bold"
                placeholder="Ej. REGISTRO DE HECHOS DIVERSOS O ALTERACIÓN DEL ORDEN..."
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hechos Reportados / Ocurridos</label>
              <textarea
                value={state.ocurrencia.detallesOcurrencia || ""}
                onChange={(e) => onUpdateDocField("ocurrencia", "detallesOcurrencia", e.target.value)}
                rows={5}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
                placeholder="Describa de forma ordenada..."
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Medidas Adoptadas por la Autoridad</label>
              <textarea
                value={state.ocurrencia.medidasAdoptadas || ""}
                onChange={(e) => onUpdateDocField("ocurrencia", "medidasAdoptadas", e.target.value)}
                rows={4}
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
                placeholder="Patrullajes, apoyo médico..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hora Conclusión</label>
                <input
                  type="time"
                  value={state.ocurrencia.horaConcluida || ""}
                  onChange={(e) => onUpdateDocField("ocurrencia", "horaConcluida", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Fecha Conclusión</label>
                <input
                  type="date"
                  value={state.ocurrencia.fechaConcluida || ""}
                  onChange={(e) => onUpdateDocField("ocurrencia", "fechaConcluida", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ROTULO EVIDENCIAS --- */}
      {currentDocId === "rotuloEvidencias" && state.rotuloEvidencias && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2 font-display">Rótulo de Indicios y Evidencias</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Carpeta Fiscal</label>
                <input
                  type="text"
                  value={state.rotuloEvidencias.codigoCarpetaFiscal || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "codigoCarpetaFiscal", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Distrito Judicial</label>
                <input
                  type="text"
                  value={state.rotuloEvidencias.distritoJudicial || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "distritoJudicial", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">N° Hallazgo</label>
                <input
                  type="text"
                  value={state.rotuloEvidencias.numHallazgo || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "numHallazgo", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Cant.</label>
                <input
                  type="text"
                  value={state.rotuloEvidencias.cantidad || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "cantidad", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 text-center"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Prioridad</label>
                <input
                  type="text"
                  value={state.rotuloEvidencias.prioridad || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "prioridad", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Dependencia Interviene</label>
              <input
                type="text"
                value={state.rotuloEvidencias.dependenciaInterviene || ""}
                onChange={(e) => onUpdateDocField("rotuloEvidencias", "dependenciaInterviene", e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Lugar Recolección / Dirección</label>
              <input
                type="text"
                value={state.rotuloEvidencias.lugarRecoleccion || ""}
                onChange={(e) => onUpdateDocField("rotuloEvidencias", "lugarRecoleccion", e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Fecha Recolecc.</label>
                <input
                  type="date"
                  value={state.rotuloEvidencias.fechaRecoleccion || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "fechaRecoleccion", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hora Recolecc.</label>
                <input
                  type="time"
                  value={state.rotuloEvidencias.horaRecoleccion || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "horaRecoleccion", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Condición y Descripción del Indicio / Evidencia</label>
              <textarea
                value={state.rotuloEvidencias.descripcionCondicion || ""}
                onChange={(e) => onUpdateDocField("rotuloEvidencias", "descripcionCondicion", e.target.value)}
                rows={3}
                placeholder="Rótulo detallado de indicios..."
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Tipo Embalaje Empleado</label>
              <input
                type="text"
                value={state.rotuloEvidencias.tipoEmbalaje || ""}
                onChange={(e) => onUpdateDocField("rotuloEvidencias", "tipoEmbalaje", e.target.value)}
                placeholder="Ej. Bolsa plástica transparente hermética"
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">Servidor PNP Recolector</span>
              
              <div className="grid grid-cols-2 gap-3.5">
                <input
                  type="text"
                  value={state.rotuloEvidencias.servidorNombres || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "servidorNombres", e.target.value)}
                  placeholder="Nombres recolector"
                  className="text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
                <input
                  type="text"
                  value={state.rotuloEvidencias.servidorDniCip || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "servidorDniCip", e.target.value)}
                  placeholder="DNI / CIP"
                  className="text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <input
                  type="text"
                  value={state.rotuloEvidencias.servidorCargo || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "servidorCargo", e.target.value)}
                  placeholder="Cargo"
                  className="text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
                <input
                  type="text"
                  value={state.rotuloEvidencias.rpm || ""}
                  onChange={(e) => onUpdateDocField("rotuloEvidencias", "rpm", e.target.value)}
                  placeholder="Celular contacto"
                  className="text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <label className="text-xs font-bold block uppercase text-slate-500 mb-1.5">Fecha Embalaje</label>
                  <input
                    type="date"
                    value={state.rotuloEvidencias.fechaEmbalaje || ""}
                    onChange={(e) => onUpdateDocField("rotuloEvidencias", "fechaEmbalaje", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block uppercase text-slate-500 mb-1.5">Hora Embalaje</label>
                  <input
                    type="time"
                    value={state.rotuloEvidencias.horaEmbalaje || ""}
                    onChange={(e) => onUpdateDocField("rotuloEvidencias", "horaEmbalaje", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CADENA CUSTODIA --- */}
      {currentDocId === "cadenaCustodia" && state.cadenaCustodia && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2 font-display">Cadena de Custodia (Evidencias)</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Carpeta Fiscal</label>
                <input
                  type="text"
                  value={state.cadenaCustodia.codigoCarpetaFiscal || ""}
                  onChange={(e) => onUpdateDocField("cadenaCustodia", "codigoCarpetaFiscal", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Distrito Judicial</label>
                <input
                  type="text"
                  value={state.cadenaCustodia.distritoJudicial || ""}
                  onChange={(e) => onUpdateDocField("cadenaCustodia", "distritoJudicial", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Prioridad</label>
                <input
                  type="text"
                  value={state.cadenaCustodia.prioridad || ""}
                  onChange={(e) => onUpdateDocField("cadenaCustodia", "prioridad", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-rose-600 mb-1.5 tracking-wider font-bold">Descripción del Bien Incautado / Custodiado</label>
                <textarea
                  value={state.cadenaCustodia.descripcionBienIncautado || ""}
                  onChange={(e) => onUpdateDocField("cadenaCustodia", "descripcionBienIncautado", e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg px-3 py-2 text-slate-800 font-bold h-24 outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 font-sans"
                  placeholder="Describa de forma pormenorizada el bien, indicio o evidencia incautada..."
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">I. Recepción y Traslado Inicial</span>
              
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500 block mb-1.5">Quien Embala</label>
                  <input
                    type="text"
                    value={state.cadenaCustodia.quienEmbala || ""}
                    onChange={(e) => onUpdateDocField("cadenaCustodia", "quienEmbala", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500 block mb-1.5">Quien Transporta</label>
                  <input
                    type="text"
                    value={state.cadenaCustodia.quienTransporta || ""}
                    onChange={(e) => onUpdateDocField("cadenaCustodia", "quienTransporta", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500 block mb-1.5">CIP / DNI</label>
                  <input
                    type="text"
                    value={state.cadenaCustodia.dniCipInicial || ""}
                    onChange={(e) => onUpdateDocField("cadenaCustodia", "dniCipInicial", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500 block mb-1.5">Cargo Inicial</label>
                  <input
                    type="text"
                    value={state.cadenaCustodia.cargoInicial || ""}
                    onChange={(e) => onUpdateDocField("cadenaCustodia", "cargoInicial", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pb-3 border-b border-slate-100 mb-2">
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500 block mb-1.5">Fecha Embalaje</label>
                  <input
                    type="date"
                    value={state.cadenaCustodia.fechaInicial || ""}
                    onChange={(e) => onUpdateDocField("cadenaCustodia", "fechaInicial", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500 block mb-1.5">Hora Embalaje</label>
                  <input
                    type="time"
                    value={state.cadenaCustodia.horaInicial || ""}
                    onChange={(e) => onUpdateDocField("cadenaCustodia", "horaInicial", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <div className="flex justify-between items-center pb-2.5">
                <span className="font-bold text-xs text-slate-400 uppercase tracking-widest block font-display">II. Continuidad de Custodia</span>
                <button
                  type="button"
                  onClick={() => {
                    const newRecord = {
                      fecha: state.cadenaCustodia.fechaInicial,
                      hora: state.cadenaCustodia.horaInicial,
                      quienRecibe: "",
                      dniCip: "",
                      cargo: "",
                      codigoRecepcion: "",
                      propositoTraslado: "",
                      autoridadAutoriza: "",
                      observaciones: "Recibido de conformidad."
                    };
                    const updated = [...state.cadenaCustodia.registrosContinuidad, newRecord];
                    onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors duration-150 flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Añadir Continuidad
                </button>
              </div>

              {state.cadenaCustodia.registrosContinuidad.map((reg, idx) => (
                <div key={idx} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-xl space-y-3.5 mt-3 relative text-sm transition-all shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = state.cadenaCustodia.registrosContinuidad.filter((_, i) => i !== idx);
                      onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                    }}
                    className="absolute top-3 right-4.5 text-rose-500 hover:text-rose-700 text-xs font-bold transition-colors"
                  >
                    Remover
                  </button>

                  <span className="font-bold text-[10px] text-slate-400 block uppercase tracking-wider">REGISTRO DE TRASPASO N° {idx + 1}</span>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Fecha</label>
                      <input
                        type="date"
                        value={reg.fecha}
                        onChange={(e) => {
                          const updated = [...state.cadenaCustodia.registrosContinuidad];
                          updated[idx].fecha = e.target.value;
                          onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                        }}
                        className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Hora</label>
                      <input
                        type="time"
                        value={reg.hora}
                        onChange={(e) => {
                          const updated = [...state.cadenaCustodia.registrosContinuidad];
                          updated[idx].hora = e.target.value;
                          onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                        }}
                        className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Enlace / Quién Recibe</label>
                      <input
                        type="text"
                        value={reg.quienRecibe}
                        onChange={(e) => {
                          const updated = [...state.cadenaCustodia.registrosContinuidad];
                          updated[idx].quienRecibe = e.target.value;
                          onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                        }}
                        className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-850 focus:outline-none"
                        placeholder="Nombres de quien custodia"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">DNI / CIP Recibe</label>
                      <input
                        type="text"
                        value={reg.dniCip}
                        onChange={(e) => {
                          const updated = [...state.cadenaCustodia.registrosContinuidad];
                          updated[idx].dniCip = e.target.value;
                          onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                        }}
                        className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-850 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Cargo</label>
                      <input
                        type="text"
                        value={reg.cargo}
                        onChange={(e) => {
                          const updated = [...state.cadenaCustodia.registrosContinuidad];
                          updated[idx].cargo = e.target.value;
                          onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                        }}
                        className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-850 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Cód. Rec.</label>
                      <input
                        type="text"
                        value={reg.codigoRecepcion}
                        onChange={(e) => {
                          const updated = [...state.cadenaCustodia.registrosContinuidad];
                          updated[idx].codigoRecepcion = e.target.value;
                          onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                        }}
                        className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-850 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Propósito</label>
                      <input
                        type="text"
                        value={reg.propositoTraslado}
                        onChange={(e) => {
                          const updated = [...state.cadenaCustodia.registrosContinuidad];
                          updated[idx].propositoTraslado = e.target.value;
                          onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                        }}
                        className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-850 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Autorizado por</label>
                    <input
                      type="text"
                      value={reg.autoridadAutoriza}
                      onChange={(e) => {
                        const updated = [...state.cadenaCustodia.registrosContinuidad];
                        updated[idx].autoridadAutoriza = e.target.value;
                        onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                      }}
                      className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-850 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Observaciones / Estado del Embalaje</label>
                    <input
                      type="text"
                      value={reg.observaciones}
                      onChange={(e) => {
                        const updated = [...state.cadenaCustodia.registrosContinuidad];
                        updated[idx].observaciones = e.target.value;
                        onUpdateDocField("cadenaCustodia", "registrosContinuidad", updated);
                      }}
                      className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-850 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- INCAUTACION ART 203 --- */}
      {currentDocId === "incautacionArt203" && state.incautacionArt203 && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2 font-display">Incautación s/ Art. 203 NCPP</h4>
            
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Lugar de Incautación</label>
              <input
                type="text"
                value={state.incautacionArt203.lugarIncautacion || ""}
                onChange={(e) => onUpdateDocField("incautacionArt203", "lugarIncautacion", e.target.value)}
                placeholder="Dirección exacta"
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">Otros Datos del Portador</span>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Madre</label>
                  <input
                    type="text"
                    value={state.incautacionArt203.intervenidoMadreNombre || ""}
                    onChange={(e) => onUpdateDocField("incautacionArt203", "intervenidoMadreNombre", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Padre</label>
                  <input
                    type="text"
                    value={state.incautacionArt203.intervenidoPadreNombre || ""}
                    onChange={(e) => onUpdateDocField("incautacionArt203", "intervenidoPadreNombre", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">Datos del Testigo Presencial</span>
              
              <div className="grid grid-cols-2 gap-3.5">
                <input
                  type="text"
                  value={state.incautacionArt203.testigoNombre || ""}
                  onChange={(e) => onUpdateDocField("incautacionArt203", "testigoNombre", e.target.value)}
                  placeholder="Nombres testigo completo"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
                <input
                  type="text"
                  value={state.incautacionArt203.testigoDni || ""}
                  onChange={(e) => onUpdateDocField("incautacionArt203", "testigoDni", e.target.value)}
                  placeholder="DNI testigo"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <input
                  type="text"
                  value={state.incautacionArt203.testigoEdad || ""}
                  onChange={(e) => onUpdateDocField("incautacionArt203", "testigoEdad", e.target.value)}
                  placeholder="Edad"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
                <input
                  type="text"
                  value={state.incautacionArt203.testigoDomicilio || ""}
                  onChange={(e) => onUpdateDocField("incautacionArt203", "testigoDomicilio", e.target.value)}
                  placeholder="Domicilio testigo..."
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Descripción de Bienes Incautados</label>
              <textarea
                value={state.incautacionArt203.detalleIncautacion || ""}
                onChange={(e) => onUpdateDocField("incautacionArt203", "detalleIncautacion", e.target.value)}
                rows={4}
                placeholder="Marcas, modelos, números de serie, peso..."
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider font-display">Hora Conclusión</label>
                <input
                  type="time"
                  value={state.incautacionArt203.horaConcluida || ""}
                  onChange={(e) => onUpdateDocField("incautacionArt203", "horaConcluida", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-801 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider font-display">Fecha Conclusión</label>
                <input
                  type="date"
                  value={state.incautacionArt203.fechaConcluida || ""}
                  onChange={(e) => onUpdateDocField("incautacionArt203", "fechaConcluida", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-801 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ENTREGA / RECEPCION MENOR --- */}
      {currentDocId === "entregaRecepcionMenor" && state.entregaRecepcionMenor && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2 font-display">Acta de Entrega de Menor de Edad</h4>
            
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Lugar de Entrega Diligencia</label>
              <input
                type="text"
                value={state.entregaRecepcionMenor.lugarUbicado || ""}
                onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "lugarUbicado", e.target.value)}
                placeholder="Ej.: Comisaría del sector..."
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-medium"
              />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">Datos Receptor (Quien recibe al Menor)</span>
              
              <div>
                <input
                  type="text"
                  value={state.entregaRecepcionMenor.receptorNombreCompleto || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "receptorNombreCompleto", e.target.value)}
                  placeholder="Apellidos y nombres completos del receptor"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <input
                  type="text"
                  value={state.entregaRecepcionMenor.receptorDni || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "receptorDni", e.target.value)}
                  placeholder="DNI / Carnet Ext."
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                />
                <input
                  type="text"
                  value={state.entregaRecepcionMenor.receptorEdad || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "receptorEdad", e.target.value)}
                  placeholder="Edad"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <input
                  type="text"
                  value={state.entregaRecepcionMenor.parentescoConMenor || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "parentescoConMenor", e.target.value)}
                  placeholder="Ej. MADRE, PADRE, TÍO"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
                <input
                  type="text"
                  value={state.entregaRecepcionMenor.receptorCelular || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "receptorCelular", e.target.value)}
                  placeholder="Celular"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <input
                  type="text"
                  value={state.entregaRecepcionMenor.receptorPadre || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "receptorPadre", e.target.value)}
                  placeholder="Hijo de don"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
                <input
                  type="text"
                  value={state.entregaRecepcionMenor.receptorMadre || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "receptorMadre", e.target.value)}
                  placeholder="Y doña"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={state.entregaRecepcionMenor.receptorDomicilio || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "receptorDomicilio", e.target.value)}
                  placeholder="Domicilio real declarado completo"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">Datos Civiles del Menor</span>
              
              <div className="grid grid-cols-2 gap-3.5">
                <input
                  type="text"
                  value={state.entregaRecepcionMenor.menorNombreCompleto || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "menorNombreCompleto", e.target.value)}
                  placeholder="Nombres completo menor"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
                <input
                  type="text"
                  value={state.entregaRecepcionMenor.menorDni || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "menorDni", e.target.value)}
                  placeholder="DNI del menor"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Circunstancias de la Entrega (Cuerpo)</label>
              <textarea
                value={state.entregaRecepcionMenor.circunstanciasEntrega || ""}
                onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "circunstanciasEntrega", e.target.value)}
                rows={4}
                placeholder="Detalle protección, obligaciones legales con menor..."
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-slate-100 font-sans">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hora Término</label>
                <input
                  type="time"
                  value={state.entregaRecepcionMenor.horaConcluida || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "horaConcluida", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Fecha Término</label>
                <input
                  type="date"
                  value={state.entregaRecepcionMenor.fechaConcluida || ""}
                  onChange={(e) => onUpdateDocField("entregaRecepcionMenor", "fechaConcluida", e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LACRADO DE ARMA DE FUEGO --- */}
      {currentDocId === "lacradoArma" && state.lacradoArma && (
        <div className="space-y-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2 font-display">Acta de Lacrado de Arma de Fuego</h4>
            
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Oficina Policial (Donde se pone a la vista)</label>
              <input
                type="text"
                value={state.lacradoArma.oficinaPoneALavista || ""}
                onChange={(e) => onUpdateDocField("lacradoArma", "oficinaPoneALavista", e.target.value)}
                placeholder="Ej.: DEPINCRI-SM-MM"
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Arma incautada al {state.detenido.tipo === "RETENIDO" ? "retenido" : state.detenido.tipo === "INTERVENIDO" ? "intervenido" : state.detenido.tipo === "PERSONA" ? "intervenido" : "detenido"} (Nombre completo)</label>
              <input
                type="text"
                value={state.lacradoArma.armaIncautadaAlDetenido || ""}
                onChange={(e) => onUpdateDocField("lacradoArma", "armaIncautadaAlDetenido", e.target.value)}
                placeholder={`Nombre del ${state.detenido.tipo === "RETENIDO" ? "retenido" : state.detenido.tipo === "INTERVENIDO" ? "intervenido" : state.detenido.tipo === "PERSONA" ? "intervenido" : "detenido"}`}
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">Referencia de Incautación (Según consta en Acta)</span>
              
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Nombre del Acta de Referencia</label>
                <input
                  type="text"
                  value={state.lacradoArma.actaConsta || ""}
                  onChange={(e) => onUpdateDocField("lacradoArma", "actaConsta", e.target.value)}
                  placeholder="Ej.: Registro Personal e Incautación"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Fecha del Acta</label>
                  <input
                    type="date"
                    value={state.lacradoArma.fechaActaConsta || ""}
                    onChange={(e) => onUpdateDocField("lacradoArma", "fechaActaConsta", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hora del Acta</label>
                  <input
                    type="time"
                    value={state.lacradoArma.horaActaConsta || ""}
                    onChange={(e) => onUpdateDocField("lacradoArma", "horaActaConsta", e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Suscrita por el / los</label>
                <input
                  type="text"
                  value={state.lacradoArma.suscriptoresActaConsta || ""}
                  onChange={(e) => onUpdateDocField("lacradoArma", "suscriptoresActaConsta", e.target.value)}
                  placeholder="Ej.: Instructor Policial y el intervenido"
                  className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider font-display">Descripción de lo puesto a la vista (Cuerpo del Acta)</label>
              <textarea
                value={state.lacradoArma.dejaConstanciaPuestoALavista || ""}
                onChange={(e) => onUpdateDocField("lacradoArma", "dejaConstanciaPuestoALavista", e.target.value)}
                rows={6}
                placeholder="Detalle de las características del arma de fuego, marca, modelo, calibre, color, número de serie, cacerina, cartuchos, etc."
                className="w-full text-sm bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider font-display">Tipo de Embalaje donde se introduce</label>
              <input
                type="text"
                value={state.lacradoArma.tipoEmbalajeIntroducido || ""}
                onChange={(e) => onUpdateDocField("lacradoArma", "tipoEmbalajeIntroducido", e.target.value)}
                placeholder="Ej.: SOBRE MANILA COLOR MANILA ROTULADO..."
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Hora conclusión de diligencia</label>
              <input
                type="time"
                value={state.lacradoArma.horaConcluida || ""}
                onChange={(e) => onUpdateDocField("lacradoArma", "horaConcluida", e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
