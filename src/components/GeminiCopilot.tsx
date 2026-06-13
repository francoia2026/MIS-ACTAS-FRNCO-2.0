import React, { useState, useEffect } from "react";
import { Sparkles, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { ActasState } from "../types";
import { LISTA_DOCUMENTOS } from "../templatesData";
// No Firebase imports

interface GeminiCopilotProps {
  currentDocId: string;
  police: ActasState["police"];
  detenido: ActasState["detenido"];
  docState: any;
  onUpdateDocField: (docId: string, field: string, value: any) => void;
  currentUser: any;
  onUpdateUser: (user: any) => void;
  isBlocked?: boolean;
  saldoActas: number;
  onUpdateSaldoActas: (nuevoSaldo: number) => void;
}

export const GeminiCopilot: React.FC<GeminiCopilotProps> = ({
  currentDocId,
  police,
  detenido,
  docState,
  onUpdateDocField,
  currentUser,
  onUpdateUser,
  isBlocked = false,
  saldoActas,
  onUpdateSaldoActas
}) => {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeDoc = LISTA_DOCUMENTOS.find((d) => d.id === currentDocId);

  // Sync draft notes placeholder and text when document change
  useEffect(() => {
    setNotes("");
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [currentDocId]);

  // Perform Gemini Redaction call
  const handleGenerateActa = async () => {
    if (isBlocked) {
      setErrorMsg("Tu cuenta no está activa en el sistema. Copiloto bloqueado.");
      return;
    }



    if (!notes.trim()) {
      setErrorMsg("Por favor, ingrese un borrador o apuntes breves para procesar la redacción.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      const response = await fetch("/api/generate-narrative", {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: currentDocId,
          notes: notes,
          police,
          detenido,
          docState,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Ocurrió un error al procesar en el servidor.");
      }

      const data = await response.json();

      // Apply the generated output directly to state fields
      if (currentDocId === "intervencion") {
        if (data.precedentes) onUpdateDocField("intervencion", "circunstanciasPrecedentes", data.precedentes);
        if (data.concomitantes) onUpdateDocField("intervencion", "circunstanciasConcomitantes", data.concomitantes);
        if (data.posteriores) onUpdateDocField("intervencion", "circunstanciasPosteriores", data.posteriores);
        setSuccessMsg("¡Circunstancias Precedentes, Concomitantes y Posteriores adaptadas correctamente!");
      } else {
        // Map general results
        const textResult = data.result || "";
        if (!textResult) {
          throw new Error("No se recibió respuesta redactada de la IA.");
        }

        switch (currentDocId) {
          case "detencion":
            onUpdateDocField("detencion", "delitoFlagranteContexto", textResult);
            break;
          case "comunicacionTelefonica":
            onUpdateDocField("comunicacionTelefonica", "resultadoComunicacion", textResult);
            break;
          case "detencionMenor":
            onUpdateDocField("detencionMenor", "motivoInfraccionLeyes", textResult);
            break;
          case "registroPersonal":
            onUpdateDocField("registroPersonal", "bienesObjetoRegistro", textResult);
            break;
          case "registroVehicular":
            onUpdateDocField("registroVehicular", "bienesObjetoRegistro", textResult);
            break;
          case "registroEquipajes":
            onUpdateDocField("registroEquipajes", "bienesObjetoRegistro", textResult);
            break;
          case "recepcion":
            onUpdateDocField("recepcion", "descripcionBienObjeto", textResult);
            break;
          case "incautacion":
            onUpdateDocField("incautacion", "individualizacionBien", textResult);
            break;
          case "situacionVehicular":
            onUpdateDocField("situacionVehicular", "descripcionEspecificaCompleta", textResult);
            break;
          default:
            setErrorMsg("No se encontró mapeo de campo directo para esta sección de acta.");
            break;
        }
        setSuccessMsg(`¡El contenido del acta para "${activeDoc?.title}" ha sido redactado e insertado en tiempo real!`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al conectar con el servidor de Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fills for Notes helper
  const getPlaceholderForNotes = () => {
    switch (currentDocId) {
      case "intervencion":
        return "Borrador opcional: 'vimos al tipo jalar mochila a turista en jr carabaya, corrimos, lo atrapamos con serenazgo a 2 cuadras, recuperamos mochila, lo trajimos a la comisaría...'";
      case "detencion":
        return "Borrador opcional: 'Se le detuvo por arrebato violento de cartera a la Sra. Gomez en flagrancia...'";
      case "registroPersonal":
        return "Borrador opcional: 'Bolsillo derecho: celular robado iPhone 13; Bolsillo izquierdo: billetera de cuero S/ 45; Cintura: destornillador punta estrella...'";
      case "registroVehicular":
        return "Borrador opcional: 'Debajo de alfombra copiloto un cuchillo cocinero y 3 envoltorios de pasta básica...'";
      case "comunicacionTelefonica":
        return "Borrador opcional: 'Llamé a su abogado de confianza Dr. Ruiz, dijo que viaja de inmediato para presenciar...'";
      case "registroEquipajes":
        return "Borrador opcional: 'Mochila negra: Laptop marca HP serie borrada y cargador...'";
      case "incautacion":
        return "Borrador opcional: 'Celular Samsung plateado con IMEI clonado, lo metí en bolsa plástica con rótulo 023...'";
      case "situacionVehicular":
        return "Borrador opcional: 'Lunas delanteras rotas, llanta repuesto desgastada, raspones puerta copiloto...'";
      default:
        return "Ingrese notas breves del hecho en lenguaje coloquial para que Gemini redacte el formato legal...";
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 mb-6 relative overflow-hidden">
      {/* Decorative ambient subtle light representing Gemini background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-emerald-950/40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0 border border-emerald-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-200">
              Copiloto de Redacción Gemini AI
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Motor Activo: <span className="text-emerald-400 font-semibold">Gemini 1.5 Flash</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Interactive Input Notes Segment */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span>Borrador Rápido o Apuntes de Campo:</span>
            <span className="text-[9px] font-mono text-slate-500 lowercase">
              ({activeDoc?.title})
            </span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={getPlaceholderForNotes()}
            rows={3}
            className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500/60 placeholder-slate-650 focus:ring-1 focus:ring-emerald-500/30 font-sans transition-all"
          />
          <p className="text-[9px] text-slate-500 leading-normal font-sans">
            💡 <span className="font-semibold text-slate-400">Consejo:</span> El motor redactará el acta automáticamente cruzando estos apuntes con los campos estructurados del instructor y del detenido.
          </p>
        </div>

        {/* Feedback logs */}
        {errorMsg && (
          <div className="flex items-start gap-2 bg-rose-950/40 border border-rose-900/30 text-rose-300 p-2.5 rounded-lg text-xs leading-normal">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/35 text-emerald-300 p-2.5 rounded-lg text-xs leading-normal">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Generate action block */}
        <button
          onClick={handleGenerateActa}
          disabled={isLoading || isBlocked}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-display font-semibold text-xs tracking-wider uppercase cursor-pointer select-none transition-all shadow-md group ${
            isLoading || isBlocked
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-950/40 hover:shadow-lg active:scale-[0.98]"
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isLoading ? "animate-spin text-slate-500" : "text-emerald-200 group-hover:scale-110 transition-transform"}`} />
          {isLoading ? "PROCESANDO CON INTELIGENCIA ARTIFICIAL..." : `Redactar "${activeDoc?.title || "Acta"}"`}
        </button>
      </div>
    </div>
  );
};
