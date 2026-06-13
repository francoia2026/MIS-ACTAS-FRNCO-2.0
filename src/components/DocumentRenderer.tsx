import React, { useState, useRef, useEffect } from "react";
import { ActasState } from "../types";
import { Shield, Printer, Info, Check, Square, Coins, AlertTriangle, Camera, RefreshCw, Save, Upload, Download, FileText, ChevronDown } from "lucide-react";
import { PhoneUser } from "../types";
import { INITIAL_STATE } from "../templatesData";

interface DocumentRendererProps {
  state: ActasState;
  currentDocId: string;
  isBlocked?: boolean;
  saldoActas: number;
  onUpdateSaldoActas: (nuevoSaldo: number) => void;
  onShowRecargaModal?: () => void;
  customA4Html?: string | null;
  setCustomA4Html?: (html: string | null) => void;
  isLoadingImage?: boolean;
  setIsLoadingImage?: (isLoading: boolean) => void;
  cargoError?: string | null;
  setCargoError?: (error: string | null) => void;
  currentUser?: PhoneUser | null;
  onLoadState?: (state: ActasState) => void;
  isDarkMode?: boolean;
  isPrintInstance?: boolean;
}

// Helper to convert date strings to readable Spanish format
const formatSpanishDate = (dateStr: string) => {
  if (!dateStr) return "______________";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dia = parseInt(parts[2]);
  const mesIndex = parseInt(parts[1]) - 1;
  const anio = parts[0];
  return `${dia} de ${meses[mesIndex] || "___"} del ${anio}`;
};

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({ 
  state: rawState, 
  currentDocId, 
  isBlocked = false,
  saldoActas,
  onUpdateSaldoActas,
  onShowRecargaModal,
  customA4Html = null,
  setCustomA4Html,
  isLoadingImage = false,
  setIsLoadingImage,
  cargoError = null,
  setCargoError,
  currentUser = null,
  onLoadState,
  isDarkMode = false,
  isPrintInstance = false
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
  const { police, detenido } = state;
  const isLandscape = currentDocId === "cadenaCustodia";
  const isRotulo = currentDocId === "rotuloEvidencias";
  const [printError, setPrintError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [showIframeHelp, setShowIframeHelp] = useState(false);

  const handleSaveToDevice = async (format: "html" | "json" | "doc", autoPrint: boolean = false) => {
    setShowSaveDropdown(false);
    setPrintError(null);

    if (isBlocked) {
      setPrintError("Su licencia está suspendida. No puede descargar el documento.");
      return;
    }
    if (saldoActas <= 0) {
      setPrintError("No tiene tokens suficientes para descargar (Saldo: 0). Por favor, presione + RECARGAR en el panel superior o comuníquese con Soporte.");
      return;
    }

    try {
      // Descontar un token por descargar
      onUpdateSaldoActas(saldoActas - 1);
      const fileSurfix = `${state.detenido?.apellidos || "detenido"}_${state.detenido?.nombres || ""}`.replace(/\s+/g, "_").toLowerCase();

      if (format === "html" || format === "doc") {
        const previewElement = document.getElementById("vista-previa-a4");
        const docHtml = previewElement ? previewElement.innerHTML : "";
        const formattedTitle = currentDocId.toUpperCase().replace(/([A-Z])/g, " $1").trim();
        const pagePadding = isLandscape ? "1.5cm" : (isRotulo ? "1.2cm" : "3.5cm 2.0cm 2.0cm 3.5cm");
        const pageMarginTop = (isLandscape || isRotulo) ? "1.5cm !important" : "3.5cm !important";
        const pageMarginLeft = (isLandscape || isRotulo) ? "1.5cm !important" : "3.5cm !important";
        const pageMarginRight = (isLandscape || isRotulo) ? "1.5cm !important" : "2.0cm !important";
        const pageMarginBottom = (isLandscape || isRotulo) ? "1.5cm !important" : "2.0cm !important";

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${formattedTitle} - ${state.detenido?.apellidos || "Diligencia"}</title>
  <style>
    body {
      background-color: #f1f5f9;
      margin: 0;
      padding: 40px 10px;
      font-family: Arial, Helvetica, sans-serif;
    }
    .print-page-container {
      background-color: #ffffff;
      width: ${isLandscape ? "297mm" : "210mm"};
      min-height: ${isLandscape ? "210mm" : "297mm"};
      margin: 0 auto;
      padding: ${pagePadding};
      box-sizing: border-box;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      position: relative;
    }
    @media print {
      @page {
        size: ${isLandscape ? "A4 landscape" : "A4"};
        margin-top: ${pageMarginTop};
        margin-left: ${pageMarginLeft};
        margin-right: ${pageMarginRight};
        margin-bottom: ${pageMarginBottom};
      }
      body {
        background-color: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .print-page-container {
        box-shadow: none !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important; /* Desactivar padding para evitar duplicidad con @page en impresión física */
      }
    }
    
    .print-page-container:not(.cadena-custodia-portrait), 
    .print-page-container *:not(.cadena-custodia-portrait):not(.cadena-custodia-portrait *) {
      font-family: Arial, Helvetica, sans-serif !important;
      font-style: normal !important;
    }
    .print-page-container {
      background-color: #ffffff !important;
      font-size: 12pt !important;
    }
    
    /* El cuerpo del documento, fecha, asunto y referencia deberán escribirse en letra Arial, tamaño 12, sin negrita */
    .print-page-container p:not(.cadena-custodia-portrait *),
    .print-page-container li:not(.cadena-custodia-portrait *),
    .print-page-container span:not(.signature-footer *):not(.postfirmas *):not(.cadena-custodia-portrait *),
    .print-page-container div:not(.signature-footer *):not(.postfirmas *):not(.cadena-custodia-portrait *):not([style*="Impact"]):not(h1):not(h2),
    .print-page-container td:not(.cadena-custodia-portrait *),
    .print-page-container tr:not(.cadena-custodia-portrait *) {
      font-size: 12pt !important;
      font-family: Arial, Helvetica, sans-serif !important;
      font-style: normal !important;
      font-weight: normal !important; /* SIN NEGRITA */
      line-height: 1.6 !important;
      text-align: justify !important;
      background-image: none !important;
      text-decoration: none !important;
    }
    .print-page-container p {
      margin-bottom: 0.75rem !important;
    }
    
    /* La Denominación del documento deberá escribirse en letra Impact tamaño 16, sin negrita */
    .print-page-container h2, 
    .print-page-container h1, 
    .print-page-container .document-title, 
    .print-page-container .title-f,
    .print-page-container div[style*="Impact"],
    .print-page-container span[style*="Impact"] {
      font-family: Impact, "Arial Black", sans-serif !important;
      font-size: 16pt !important;
      font-weight: bold !important; /* EN NEGRITA */
      text-align: center !important;
      text-transform: uppercase !important;
      border-bottom: none !important;
      padding-bottom: 0px !important;
      margin-top: 1rem !important;
      margin-bottom: 1.5rem !important;
    }
    .print-page-container .postfirmas, 
    .print-page-container .postfirmas *, 
    .print-page-container .signature-footer, 
    .print-page-container .signature-footer * {
      font-size: 11pt !important;
      font-family: Arial, Helvetica, sans-serif !important;
      font-style: normal !important;
      font-weight: normal !important; /* SIN NEGRITA */
    }
    .print-page-container .detencion-firmas,
    .print-page-container .detencion-firmas * {
      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 10pt !important;
      font-style: normal !important;
      font-weight: normal !important; /* SIN NEGRITA */
      line-height: 1.35 !important;
    }
    .print-page-container .detencion-firmas strong {
      font-weight: normal !important; /* SIN NEGRITA */
    }
    .print-page-container .detencion-firmas .text-left {
      text-align: left !important;
    }
    .print-page-container .detencion-firmas .text-center {
      text-align: center !important;
    }
    .print-page-container .detencion-firmas .text-right {
      text-align: right !important;
    }
    .print-page-container .custom-font p,
    .print-page-container p.text-justify,
    .print-page-container .text-justify,
    .print-page-container p,
    .print-page-container .indent-8 {
      text-align: justify !important;
      text-indent: 0px !important;
    }
    .print-page-container .custom-font li,
    .print-page-container .custom-font ul {
      text-align: justify !important;
    }
  </style>
</head>
<body>
  <div class="print-page-container">
    ${docHtml}
  </div>
  ${autoPrint ? `
  <script>
    // Asistente de impresion auto-ejecutable PNP
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
  ` : ""}
</body>
</html>`;

        if (format === "doc") {
          const blob = new Blob(['\ufeff' + fullHtml], { type: "application/msword;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `acta_${currentDocId}_${fileSurfix}.doc`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const fileName = autoPrint ? `clic_aqui_para_imprimir_pdf_${currentDocId}_${fileSurfix}.html` : `acta_${currentDocId}_${fileSurfix}.html`;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        const backupData = {
          version: "2.0_backup",
          savedAt: new Date().toISOString(),
          state: rawState
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `respaldo_actas_${fileSurfix}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

    } catch (err: any) {
      console.error("Error al guardar documento:", err);
      setPrintError("Error al procesar tokens para guardar. Verifique su conexión.");
    }
  };

  const handleLoadJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.version === "2.0_backup" && json.state && onLoadState) {
          onLoadState(json.state);
          alert("¡Copia de seguridad cargada y restaurada con éxito!");
        } else {
          alert("El archivo seleccionado no es un respaldo válido de este sistema de actas.");
        }
      } catch (err) {
        console.error(err);
        alert("Error al leer el archivo JSON de copia de seguridad. Verifique que no esté corrupto.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (isPrintInstance) {
      setZoomScale(1);
      return;
    }
    const handleResize = () => {
      if (containerRef.current) {
        // Measure parent container's width
        const width = containerRef.current.getBoundingClientRect().width;
        // target width: 210mm (portrait) is ~794px, 297mm (landscape) is ~1122px
        const targetWidthBase = isLandscape ? 1122 : 794;
        const targetWidth = isLandscape ? 1150 : 820;
        if (width < targetWidth) {
          // Available space with a tiny margin on mobile
          const available = width - 12;
          const calculated = available / targetWidthBase;
          setZoomScale(Math.max(0.35, Math.min(1, calculated)));
        } else {
          setZoomScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    const timer1 = setTimeout(handleResize, 100);
    const timer2 = setTimeout(handleResize, 350);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [currentDocId, state, isPrintInstance, isLandscape]);

  const parseDateParts = (dateStr: string) => {
    if (!dateStr) return { day: "___", month: "___", year: "______" };
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return { day: parts[2], month: parts[1], year: parts[0] };
    }
    return { day: "___", month: "___", year: "______" };
  };

  const parseDniCip = (dniCipStr: string) => {
    if (!dniCipStr) return { dni: "_______________", cip: "_______________" };
    if (dniCipStr.includes("/")) {
      const parts = dniCipStr.split("/");
      return {
        dni: parts[0].replace(/DNI|CIP|N|°| /gi, "").trim() || "_______________",
        cip: parts[1].replace(/DNI|CIP|N|°| /gi, "").trim() || "_______________"
      };
    }
    if (/^\d+$/.test(dniCipStr.trim())) {
      if (dniCipStr.trim().length === 8) {
        return { dni: dniCipStr.trim(), cip: "_______________" };
      }
      return { dni: "_______________", cip: dniCipStr.trim() };
    }
    if (dniCipStr.toUpperCase().includes("CIP")) {
      return {
        dni: "_______________",
        cip: dniCipStr.replace(/CIP|N|°| /gi, "").trim()
      };
    }
    return {
      dni: dniCipStr.replace(/DNI|N|°| /gi, "").trim(),
      cip: "_______________"
    };
  };

  const recolParts = parseDateParts(state.rotuloEvidencias?.fechaRecoleccion || "");
  const embParts = parseDateParts(state.rotuloEvidencias?.fechaEmbalaje || "");
  const servDniCip = parseDniCip(state.rotuloEvidencias?.servidorDniCip || "");

  const getLabelForTipo = (tipo?: string) => {
    switch (tipo) {
      case "PERSONA": return "La Persona";
      case "RETENIDO": return "El Retenido";
      case "INTERVENIDO": return "El Intervenido";
      default: return "El Detenido";
    }
  };

  const renderStandardHeader = (titleText: string) => {
    const currentDocGroup = state[currentDocId as keyof ActasState] as any;
    const additionalDetenidos: any[] = currentDocGroup?.detenidosAdicionales || [];
    const mainRoleLabel = getLabelForTipo(detenido.tipo);

    return (
      <p className="text-justify indent-8 leading-relaxed mb-4">
        --- En el distrito de <span className="font-bold border-b border-dotted border-black px-1">{police.distrito || "______________"}</span>, Provincia de <span className="font-bold border-b border-dotted border-black px-1">{police.provincia || "______________"}</span>, Ciudad de <span className="font-bold border-b border-dotted border-black px-1">{police.lugarCiudad || "______________"}</span>, siendo las <span className="font-bold border-b border-dotted border-black px-1">{police.hora || "_______"}</span> horas, del día <span className="font-bold border-b border-dotted border-black px-1">{formatSpanishDate(police.fecha)}</span>, presentes en <span className="font-bold border-b border-dotted border-black px-1">{police.unidadPolicial || "la UNIDAD PNP de " + (police.distrito || "______________")}</span> el instructor PNP <span className="font-bold border-b border-dotted border-black px-1">{police.instructorGrado || "_________"} {police.instructorApellidos || "__________________"} {police.instructorNombres || "__________________"}</span>, con CIP N° <span className="font-bold border-b border-dotted border-black px-1">{police.instructorCIP || "________"}</span>, en compañía de <span className="font-bold border-b border-dotted border-black px-1">{police.companiaDe || "_______________________"}</span>, {mainRoleLabel} <span className="font-bold border-b border-dotted border-black px-1">{detenido.apellidos || "__________________"}, {detenido.nombres || "__________________"}</span> (<span className="font-bold border-b border-black">{detenido.edad || "___"}</span>), de nacionalidad <span className="font-bold border-b border-dotted border-black px-1">{detenido.nacionalidad || "PERUANA"}</span>, Natural de <span className="font-bold border-b border-dotted border-black px-1">{detenido.naturalDe || "______________"}</span>, nacido el <span className="font-bold border-b border-dotted border-black px-1">{formatSpanishDate(detenido.nacidoEl)}</span>, estado civil <span className="font-bold border-b border-dotted border-black px-1">{detenido.estadoCivil || "______________"}</span>, ocupación <span className="font-bold border-b border-dotted border-black px-1">{detenido.ocupacion || "______________"}</span>, grado de instrucción <span className="font-bold border-b border-dotted border-black px-1">{detenido.gradoInstruccion || "______________"}</span>, identificado con DNI N° <span className="font-bold border-b border-dotted border-black px-1 font-mono text-[12px]">{detenido.dni || "________"}</span>, domiciliado en <span className="font-bold border-b border-dotted border-black px-1">{detenido.domiciliadoEn || "____________________________"}</span>, celular N° <span className="font-bold border-b border-dotted border-black px-1 font-mono">{detenido.celular || "_________"}</span>, correo electrónico <span className="font-bold border-b border-dotted border-black px-1">{detenido.correo || "____________________"}</span>
        {additionalDetenidos && additionalDetenidos.length > 0 && (
          <>
            {additionalDetenidos.map((det: any, idx: number) => {
              const label = getLabelForTipo(det.tipo || detenido.tipo);
              return (
                <span key={idx}>
                  ; y en calidad de <span className="font-bold">{label.toUpperCase()}</span> a la persona de <span className="font-bold border-b border-dotted border-black px-1">{det.apellidos || "__________________"}, {det.nombres || "__________________"}</span> (<span className="font-bold border-b border-black">{det.edad || "___"}</span>), de nacionalidad <span className="font-bold border-b border-dotted border-black px-1">{det.nacionalidad || "PERUANA"}</span>, Natural de <span className="font-bold border-b border-dotted border-black px-1">{det.naturalDe || "______________"}</span>, nacido el <span className="font-bold border-b border-dotted border-black px-1">{formatSpanishDate(det.nacidoEl)}</span>, estado civil <span className="font-bold border-b border-dotted border-black px-1">{det.estadoCivil || "______________"}</span>, ocupación <span className="font-bold border-b border-dotted border-black px-1">{det.ocupacion || "______________"}</span>, grado de instrucción <span className="font-bold border-b border-dotted border-black px-1">{det.gradoInstruccion || "______________"}</span>, identificado con DNI N° <span className="font-bold border-b border-dotted border-black px-1 font-mono text-[12px]">{det.dni || "________"}</span>, domiciliado en <span className="font-bold border-b border-dotted border-black px-1">{det.domiciliadoEn || "____________________________"}</span>, celular N° <span className="font-bold border-b border-dotted border-black px-1 font-mono">{det.celular || "_________"}</span>, correo electrónico <span className="font-bold border-b border-dotted border-black px-1">{det.correo || "____________________"}</span>
                </span>
              );
            })}
          </>
        )}
        ; {titleText}
      </p>
    );
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saldoActas, isBlocked, currentUser]);

  const handlePrint = async () => {
    setPrintError(null);
    if (isBlocked) {
      setPrintError("Su licencia está suspendida. No puede descargar el documento.");
      return;
    }

    // Detect if inside an iframe (like AI Studio preview panels)
    const isIframe = window.self !== window.top;
    if (isIframe) {
      // Show descriptive instruction modal and don't subtract tokens until they actualize download
      setShowIframeHelp(true);
      return;
    }

    if (saldoActas <= 0) {
      setPrintError("No tiene tokens suficientes para descargar el documento (Saldo: 0). Por favor, presione + RECARGAR en el panel superior.");
      return;
    }
    try {
      // Descontar un token por descargar
      onUpdateSaldoActas(saldoActas - 1);

      setTimeout(() => {
        window.print();
      }, 100);
    } catch (err: any) {
      console.error("Error al descargar o imprimir:", err);
      setPrintError("Error al descargar o imprimir el documento.");
    }
  };

  const getDocTitle = () => {
    switch (currentDocId) {
      case "intervencion": return "ACTA DE INTERVENCIÓN POLICIAL";
      case "detencion": return "NOTIFICACIÓN DE DETENCIÓN";
      case "buenTrato": return "CONSTANCIA DE BUEN TRATO";
      case "comunicacionTelefonica": return "ACTA DE COMUNICACIÓN TELEFÓNICA";
      case "detencionMenor": return "NOTIFICACIÓN DE DETENCIÓN POR INFRACCIÓN A LA LEY PENAL";
      case "registroPersonal": return "ACTA DE REGISTRO PERSONAL E INCAUTACIÓN";
      case "registroVehicular": return "ACTA DE REGISTRO VEHICULAR";
      case "situacionVehicular": return "ACTA DE SITUACIÓN VEHICULAR";
      case "registroEquipajes": return "ACTA DE REGISTRO DE EQUIPAJES O BULTOS";
      case "recepcion": return "ACTA DE RECEPCIÓN";
      case "incautacionArt203": return "ACTA DE INCAUTACIÓN";
      case "entregaRecepcionMenor": return "ACTA DE ENTREGA Y RECEPCIÓN DE MENOR DE EDAD";
      case "lacradoArma": return "ACTA DE LACRADO DE ARMA DE FUEGO";
      case "ocurrencia": return "PARTE DE OCURRENCIA POLICIAL";
      default: return "ACTA POLICIAL";
    }
  };

  // Circular LP red-colored logo modeled exactly on the LP Law portal logo in the screenshots
  const LogoLP = () => (
    <div className="flex items-center gap-2 mb-2 font-display">
      <div className="w-10 h-10 bg-[#C81C24] rounded-full flex items-center justify-center shadow-sm select-none">
        <span className="text-white font-[Playfair_Display] text-lg font-bold italic tracking-tighter leading-none -mt-1">lp</span>
      </div>
      <div className="text-[10px] text-slate-500 font-bold border-l border-slate-300 pl-2 leading-tight">
        POLICÍA NACIONAL<br />DEL PERÚ
      </div>
    </div>
  );

  const getUpperLabelForTipo = (tipo?: string) => {
    switch (tipo) {
      case "PERSONA": return "LA PERSONA";
      case "RETENIDO": return "EL RETENIDO";
      case "INTERVENIDO": return "EL INTERVENIDO";
      default: return "EL DETENIDO";
    }
  };

  // Reusable PNP standard footer matching ST3 Toscano's signature blocks
  const SignatureFooter = ({
    titleInstructor = "EL INSTRUCTOR PNP",
    titleDetenido,
    compact = false,
    hideDetenido = false
  }: {
    titleInstructor?: string;
    titleDetenido?: string;
    compact?: boolean;
    hideDetenido?: boolean;
  }) => {
    const currentDocGroup = state[currentDocId as keyof ActasState] as any;
    const additionalDetenidos: any[] = hideDetenido ? [] : (currentDocGroup?.detenidosAdicionales || []);
    const resolvedTitleDetenido = titleDetenido || getUpperLabelForTipo(detenido.tipo);

    return (
      <div className={compact ? "mt-4 postfirmas" : "mt-12 postfirmas"} style={{ display: "block", width: "100%" }}>
        {hideDetenido ? (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "3rem" }}>
            <tbody>
              <tr>
                <td style={{ width: "100%", textAlign: "center", verticalAlign: "bottom" }}>
                  <div style={{ display: "inline-block", textAlign: "center", width: "15rem" }}>
                    <div style={{ borderTop: "1px solid black", marginBottom: "6px" }}></div>
                    <div style={{ fontWeight: "bold", fontSize: "9pt", lineHeight: "1.3", display: "block" }}>
                      {police.instructorGrado} {police.instructorApellidos} {police.instructorNombres}
                    </div>
                    <div style={{ fontSize: "8.5pt", lineHeight: "1.3", display: "block" }}>
                      CIP N° {police.instructorCIP}
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "8.5pt", lineHeight: "1.3", display: "block" }}>
                      {titleInstructor}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: compact ? "1.5rem" : "3.5rem" }}>
            <tbody>
              <tr>
                {/* INSTRUCTOR COL */}
                <td style={{ width: "50%", textAlign: "center", verticalAlign: "bottom", paddingRight: "1rem" }}>
                  <div style={{ display: "inline-block", textAlign: "center", width: "14rem" }}>
                    <div style={{ borderTop: "1px solid black", marginBottom: "6px" }}></div>
                    <div style={{ fontWeight: "bold", fontSize: "9pt", lineHeight: "1.3", display: "block" }}>
                      {police.instructorGrado} {police.instructorApellidos} {police.instructorNombres}
                    </div>
                    <div style={{ fontSize: "8.5pt", lineHeight: "1.3", display: "block" }}>
                      CIP N° {police.instructorCIP}
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "8.5pt", lineHeight: "1.3", display: "block" }}>
                      {titleInstructor}
                    </div>
                  </div>
                </td>

                {/* DETENIDO COL */}
                <td style={{ width: "50%", verticalAlign: "bottom", paddingLeft: "1rem" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: "left", verticalAlign: "bottom" }}>
                          <div style={{ borderTop: "1px solid black", width: "11rem", marginBottom: "6px" }}></div>
                          <div style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "8.5pt", lineHeight: "1.3", display: "block" }} className="uppercase">
                            {resolvedTitleDetenido}
                          </div>
                          <div style={{ fontWeight: "bold", fontSize: "8.5pt", lineHeight: "1.3", display: "block" }}>
                            {detenido.apellidos}, {detenido.nombres}
                          </div>
                          <div style={{ fontSize: "8.5pt", lineHeight: "1.3", display: "block" }}>
                            DNI N° {detenido.dni}
                          </div>
                        </td>
                        <td style={{ width: "3.5rem", verticalAlign: "bottom", textAlign: "right" }}>
                          <div style={{ width: "3.5rem", height: "4.5rem", border: "1px solid #000000", display: "inline-block" }}></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* ADDITIONAL DETENIDOS SIGNATURES */}
        {additionalDetenidos && additionalDetenidos.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1.5rem" }}>
            <tbody>
              {/* Render two columns per row */}
              {Array.from({ length: Math.ceil(additionalDetenidos.length / 2) }).map((_, rowIndex) => {
                const firstDet = additionalDetenidos[rowIndex * 2];
                const secondDet = additionalDetenidos[rowIndex * 2 + 1];

                return (
                  <tr key={rowIndex}>
                    {/* First additional detenido */}
                    <td style={{ width: "50%", verticalAlign: "bottom", paddingRight: "1rem", paddingTop: "1.5rem" }}>
                      {firstDet && (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <tbody>
                            <tr>
                              <td style={{ textAlign: "left", verticalAlign: "bottom" }}>
                                <div style={{ borderTop: "1px solid black", width: "11rem", marginBottom: "6px" }}></div>
                                <div style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "8.5pt", lineHeight: "1.3", display: "block" }} className="uppercase">
                                  EL {firstDet.tipo || detenido.tipo || "DETENIDO"}
                                </div>
                                <div style={{ fontWeight: "bold", fontSize: "8.5pt", lineHeight: "1.3", display: "block" }}>
                                  {firstDet.apellidos || "_________________"}, {firstDet.nombres || "_______________"}
                                </div>
                                <div style={{ fontSize: "8.5pt", lineHeight: "1.3", display: "block" }}>
                                  DNI N° {firstDet.dni || "________"}
                                </div>
                              </td>
                              <td style={{ width: "3.5rem", verticalAlign: "bottom", textAlign: "right" }}>
                                <div style={{ width: "3.5rem", height: "4.5rem", border: "1px solid #000000", display: "inline-block" }}></div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </td>

                    {/* Second additional detenido (if exists) */}
                    <td style={{ width: "50%", verticalAlign: "bottom", paddingLeft: "1rem", paddingTop: "1.5rem" }}>
                      {secondDet && (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <tbody>
                            <tr>
                              <td style={{ textAlign: "left", verticalAlign: "bottom" }}>
                                <div style={{ borderTop: "1px solid black", width: "11rem", marginBottom: "6px" }}></div>
                                <div style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "8.5pt", lineHeight: "1.3", display: "block" }} className="uppercase">
                                  EL {secondDet.tipo || detenido.tipo || "DETENIDO"}
                                </div>
                                <div style={{ fontWeight: "bold", fontSize: "8.5pt", lineHeight: "1.3", display: "block" }}>
                                  {secondDet.apellidos || "_________________"}, {secondDet.nombres || "_______________"}
                                </div>
                                <div style={{ fontSize: "8.5pt", lineHeight: "1.3", display: "block" }}>
                                  DNI N° {secondDet.dni || "________"}
                                </div>
                              </td>
                              <td style={{ width: "3.5rem", verticalAlign: "bottom", textAlign: "right" }}>
                                <div style={{ width: "3.5rem", height: "4.5rem", border: "1px solid #000000", display: "inline-block" }}></div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div className={`flex-1 ${isDarkMode ? "bg-slate-950/90 text-slate-100" : "bg-slate-100/50 text-slate-800"} backdrop-blur-md flex flex-col h-full overflow-hidden select-text`}>
      {/* Control panel & PDF print trigger */}
      <div className={`p-4 border-b ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} flex items-center justify-between gap-3 shadow-sm no-print`}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón de reinicio si está editado */}
          {customA4Html && setCustomA4Html && (
            <div className="flex items-center gap-2">
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  type="button"
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1"
                  title="Restablecer el documento a su formato original"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restablecer
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-rose-800 text-[10px] font-bold shadow-sm animate-fade-in shrink-0">
                  <span>¿Restablecer cambios?</span>
                  <button
                    onClick={() => {
                      setCustomA4Html(null);
                      setShowResetConfirm(false);
                    }}
                    type="button"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded transition-all active:scale-95 cursor-pointer"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    type="button"
                    className="bg-slate-250 hover:bg-slate-300 text-slate-700 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded transition-all active:scale-95 cursor-pointer border border-slate-300"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Descargar Documento Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSaveDropdown(!showSaveDropdown)}
              className="w-full md:w-auto font-bold text-xs px-4.5 py-2.5 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all bg-[#C81C24] hover:bg-[#A6141A] text-white cursor-pointer hover:scale-[1.01] uppercase tracking-wider select-none"
              title="Opciones de descarga y formatos del acta"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>DESCARGAR</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/80 shrink-0" />
            </button>

            {showSaveDropdown && (
              <>
                {/* Backdrop overlay invisible para cerrar al hacer click fuera */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setShowSaveDropdown(false)}
                />
                <div className={`absolute right-0 mt-2.5 w-64 rounded-xl shadow-xl border p-1 z-50 text-left animate-fade-in ${
                  isDarkMode ? "bg-slate-900 border-slate-800 shadow-slate-950/50" : "bg-white border-slate-200 shadow-slate-300/40"
                }`}>
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/60 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                      tokens pnp: {saldoActas}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                  </div>

                  {/* Opción 1: PDF */}
                  <button
                    onClick={() => {
                      setShowSaveDropdown(false);
                      handlePrint();
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#C81C24] dark:hover:text-white transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#C81C24] shrink-0" />
                    <div className="flex flex-col">
                      <span>DESCARGAR PDF / IMPRIMIR</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">Formato oficial listo para firmar</span>
                    </div>
                  </button>

                  {/* Opción 2: Guardar HTML */}
                  <button
                    onClick={() => {
                      setShowSaveDropdown(false);
                      handleSaveToDevice("html");
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-emerald-600 dark:hover:text-white transition-all cursor-pointer border-t border-slate-100 dark:border-slate-800/30"
                  >
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="flex flex-col">
                      <span>COPIA DIGITAL (.html)</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">Para abrir en navegadores de PC</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {printError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[10.5px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-sans leading-relaxed tracking-tight shadow-sm max-w-xs text-right mt-1">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{printError}</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE AYUDA DE IMPRESIÓN PARA IFRAME */}
      {showIframeHelp && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-slate-100 animate-fade-in">
            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
              <div className="w-10 h-10 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-xs sm:text-sm tracking-wide text-white uppercase font-sans">
                  Alerta de Previsualización (IFrame)
                </h3>
                <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-0.5">SEGURIDAD DEL NAVEGADOR</p>
              </div>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-200 text-left">
              <p>
                Debido a restricciones de seguridad del navegador dentro de la ventana de diseño (Iframe),
                los diálogos automáticos de impresión PDF están desactivados temporalmente en esta pestaña.
              </p>
              
              <div className="bg-slate-950/45 border border-white/5 p-3.5 rounded-xl space-y-4">
                <div className="flex gap-3">
                  <span className="w-5.5 h-5.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono select-none">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-emerald-400 uppercase text-[10.5px] tracking-wider font-sans">
                      Doble Clic para Descarga Asistida (Recomendado)
                    </h4>
                    <p className="text-slate-300 text-[11px] mt-1 pr-1 leading-normal">
                      Haga clic abajo en <strong>"Descargar Asistido"</strong>. Se descargará una copia digital que <strong>abre la ventana de guardar PDF automáticamente</strong> en su PC al hacerle doble clic.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-white/5 pt-3">
                  <span className="w-5.5 h-5.5 bg-sky-500/20 border border-sky-500/30 text-sky-400 font-black rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono select-none">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-sky-400 uppercase text-[10.5px] tracking-wider font-sans">
                      Abrir en Nueva Pestaña
                    </h4>
                    <p className="text-slate-300 text-[11px] mt-1 pr-1 leading-normal">
                      Haga clic en el ícono de la flecha <strong>"Abrir en nueva pestaña" (↗️)</strong> arriba a la derecha de su editor de diseño. Allí funciona de forma nativa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowIframeHelp(false);
                  handleSaveToDevice("html", true);
                }}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/30 border border-emerald-400/20"
              >
                <Download className="w-4 h-4 text-emerald-100" />
                Descargar Asistido
              </button>
              
              <button
                type="button"
                onClick={() => setShowIframeHelp(false)}
                className="py-3 px-4 bg-slate-850 hover:bg-slate-800 active:scale-[0.98] text-slate-300 font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Canvas containing the A4 sheet page */}
      <div 
        ref={containerRef}
        className={`flex-1 p-2 sm:p-6 overflow-y-auto flex justify-center ${isDarkMode ? "bg-slate-950/40" : "bg-slate-100/40"} hide-scrollbar scroll-smooth`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        <div 
          className={`print-container w-full ${isLandscape ? "landscape" : ""}`}
          style={{ 
            maxWidth: isLandscape ? "297mm" : "210mm", 
            minHeight: isLandscape ? "210mm" : "297mm",
            height: zoomScale < 1 ? `calc(${isLandscape ? "210mm" : "297mm"} * ${zoomScale})` : "auto",
            overflow: zoomScale < 1 ? "hidden" : "visible",
            position: "relative"
          }}
        >
          
          <div
            className="print-scaling-wrapper"
            style={{
              width: isLandscape ? "297mm" : "210mm",
              transform: zoomScale < 1 ? `scale(${zoomScale})` : "none",
              transformOrigin: "top center",
              position: zoomScale < 1 ? "absolute" : "relative",
              top: 0,
              left: zoomScale < 1 ? "50%" : "auto",
              marginLeft: zoomScale < 1 ? (isLandscape ? "-148.5mm" : "-105mm") : "0",
            }}
          >
            <div 
              id="print-sheet" 
              className={`print-page bg-white text-black ${isLandscape ? "print-landscape" : (isRotulo ? "print-rotulo" : "")}`}
              style={{
                width: isLandscape ? "297mm" : "210mm",
                minHeight: isLandscape ? "210mm" : "297mm",
                margin: "0 auto",
              }}
            >
              <style dangerouslySetInnerHTML={{ __html: `
                #print-sheet:not(.cadena-custodia-portrait), 
                #print-sheet *:not(.cadena-custodia-portrait):not(.cadena-custodia-portrait *), 
                #vista-previa-a4:not(.cadena-custodia-portrait), 
                #vista-previa-a4 *:not(.cadena-custodia-portrait):not(.cadena-custodia-portrait *) {
                  font-family: Arial, Helvetica, sans-serif !important;
                  font-style: normal !important;
                }
                #print-sheet,
                #vista-previa-a4 {
                  background-color: #ffffff !important;
                  color: #000000 !important;
                  font-size: 12pt !important;
                  scrollbar-width: none !important;
                  -ms-overflow-style: none !important;
                }
                #print-sheet,
                #vista-previa-a4,
                #print-sheet *,
                #vista-previa-a4 * {
                  color: #000000 !important;
                  overflow-wrap: anywhere !important;
                  word-break: break-word !important;
                }
                /* Forzar neutralización absoluta de dark mode dentro del papel imprimible */
                .dark #print-sheet,
                .dark #vista-previa-a4 {
                  background-color: #ffffff !important;
                  color: #000000 !important;
                }
                .dark #print-sheet *,
                .dark #vista-previa-a4 * {
                  color: #000000 !important;
                  background-color: transparent !important;
                }
                .dark #print-sheet th,
                .dark #vista-previa-a4 th {
                  background-color: #f2f2f2 !important;
                  color: #000000 !important;
                }
                .dark #print-sheet td,
                .dark #vista-previa-a4 td,
                .dark #print-sheet table,
                .dark #vista-previa-a4 table {
                  background-color: #ffffff !important;
                  color: #000000 !important;
                  border-color: #000000 !important;
                }
                #print-sheet::-webkit-scrollbar,
                #vista-previa-a4::-webkit-scrollbar {
                  display: none !important;
                  width: 0 !important;
                  height: 0 !important;
                }
                #print-sheet p:not(.cadena-custodia-portrait *),
                #vista-previa-a4 p:not(.cadena-custodia-portrait *),
                #print-sheet li:not(.cadena-custodia-portrait *),
                #vista-previa-a4 li:not(.cadena-custodia-portrait *),
                #print-sheet span:not(.signature-footer *):not(.postfirmas *):not(.cadena-custodia-portrait *),
                #vista-previa-a4 span:not(.signature-footer *):not(.postfirmas *):not(.cadena-custodia-portrait *),
                #print-sheet div:not(.signature-footer *):not(.postfirmas *):not(#vista-previa-a4):not(.print-page):not(.cadena-custodia-portrait *):not([style*="Impact"]),
                #vista-previa-a4 div:not(.signature-footer *):not(.postfirmas *):not(#vista-previa-a4):not(.print-page):not(.cadena-custodia-portrait *):not([style*="Impact"]),
                #print-sheet td:not(.cadena-custodia-portrait *),
                #vista-previa-a4 td:not(.cadena-custodia-portrait *),
                #print-sheet tr:not(.cadena-custodia-portrait *),
                #vista-previa-a4 tr:not(.cadena-custodia-portrait *) {
                  font-size: 12pt !important;
                  font-family: Arial, Helvetica, sans-serif !important;
                  font-style: normal !important;
                  font-weight: normal !important; /* SIN NEGRITA */
                  line-height: 1.6 !important;
                  text-align: justify !important;
                  background-image: none !important;
                }
              #print-sheet p,
              #vista-previa-a4 p {
                margin-bottom: 0.75rem !important;
              }
              #print-sheet h2, 
              #print-sheet h1, 
              #print-sheet .document-title, 
              #print-sheet .title-f,
              #print-sheet div[style*="Impact"],
              #print-sheet span[style*="Impact"],
              #vista-previa-a4 h2,
              #vista-previa-a4 h1,
              #vista-previa-a4 .document-title,
              #vista-previa-a4 .title-f,
              #vista-previa-a4 div[style*="Impact"],
              #vista-previa-a4 span[style*="Impact"] {
                font-family: Impact, "Arial Black", sans-serif !important;
                font-size: 16pt !important;
                font-weight: bold !important; /* EN NEGRITA */
                text-align: center !important;
                text-transform: uppercase !important;
                border-bottom: none !important;
                padding-bottom: 0px !important;
                margin-top: 1rem !important;
                margin-bottom: 1.5rem !important;
              }
              #print-sheet .postfirmas, 
              #print-sheet .postfirmas *, 
              #print-sheet .signature-footer, 
              #print-sheet .signature-footer *,
              #vista-previa-a4 .postfirmas,
              #vista-previa-a4 .postfirmas *,
              #vista-previa-a4 .signature-footer,
              #vista-previa-a4 .signature-footer * {
                font-size: 9pt !important;
                font-family: Arial, Helvetica, sans-serif !important;
                font-style: normal !important;
              }
              #print-sheet .detencion-firmas,
              #print-sheet .detencion-firmas *,
              #vista-previa-a4 .detencion-firmas,
              #vista-previa-a4 .detencion-firmas * {
                font-family: Arial, Helvetica, sans-serif !important;
                font-size: 9.5pt !important;
                font-style: normal !important;
                line-height: 1.35 !important;
              }
              #print-sheet .detencion-firmas strong,
              #vista-previa-a4 .detencion-firmas strong {
                font-weight: bold !important;
              }
              #print-sheet .detencion-firmas .text-left,
              #vista-previa-a4 .detencion-firmas .text-left {
                text-align: left !important;
              }
              #print-sheet .detencion-firmas .text-center,
              #vista-previa-a4 .detencion-firmas .text-center {
                text-align: center !important;
              }
              #print-sheet .detencion-firmas .text-right,
              #vista-previa-a4 .detencion-firmas .text-right {
                text-align: right !important;
              }

              /* Justificación obligatoria y eliminación de sangría para todos los documentos legales */
              #print-sheet .custom-font p,
              #vista-previa-a4 .custom-font p,
              #print-sheet p.text-justify,
              #vista-previa-a4 p.text-justify,
              #print-sheet .text-justify,
              #vista-previa-a4 .text-justify,
              #print-sheet p,
              #vista-previa-a4 p,
              #print-sheet .indent-8,
              #vista-previa-a4 .indent-8 {
                text-align: justify !important;
                text-indent: 0px !important;
              }

              #print-sheet .custom-font li,
              #vista-previa-a4 .custom-font li,
              #print-sheet .custom-font ul,
              #vista-previa-a4 .custom-font ul {
                text-align: justify !important;
              }

            ` }} />
            {isBlocked ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 max-w-md mx-auto h-full">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 border border-rose-200">
                  <Shield className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">GENERACIÓN DE VISTA PREVIA DETENIDA</h3>
                  <p className="text-[10px] text-rose-600 font-mono font-bold uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">Licencia Suspendida</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-700 text-xs text-justify leading-relaxed shadow-sm font-sans">
                  "Tu cuenta no está activa en el sistema. Por favor, envía tu correo de registro al administrador para autorizar tu acceso."
                </div>
                <p className="text-[10px] text-slate-400">Por favor, inicie sesión con una cuenta policial autorizada en el copiloto de la izquierda para redactar y desbloquear las diligencias.</p>
              </div>
            ) : (
              <div 
                id="vista-previa-a4" 
                className="w-full h-full focus:outline-none cursor-text select-text bg-white text-black hover:bg-slate-50/30 font-sans focus:bg-white transition-colors hide-scrollbar"
                style={{ overflow: "visible" }}
                contentEditable={!isBlocked && !isLoadingImage}
                suppressContentEditableWarning={true}
                onCopy={(e) => {
                  e.preventDefault();
                }}
                onCut={(e) => {
                  e.preventDefault();
                }}
                onDragStart={(e) => {
                  e.preventDefault();
                }}
                onBlur={(e) => {
                  if (setCustomA4Html) {
                    setCustomA4Html(e.currentTarget.innerHTML);
                  }
                }}
              >
                {isLoadingImage ? (
                  <div className="flex flex-col items-center justify-center py-40 text-center space-y-4">
                    <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
                    <p className="font-bold text-slate-800 text-sm font-sans">🤖 Leyendo imagen y redactando Parte Policial...</p>
                  </div>
                ) : customA4Html ? (
                  <div dangerouslySetInnerHTML={{ __html: customA4Html }} />
                ) : (
                  <>
                    {/* Header LP Brand removed per user request */}

                    {/* Outer redundant duplicate title removed per user request */}
                    {/* RENDER SHEET DYNAMIC CONTENT BASED ON SECTION */}
            {currentDocId === "intervencion" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginBottom: "20px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                  ACTA DE INTERVENCIÓN POLICIAL
                </div>
                {renderStandardHeader("se procede a redactar la presente Acta de intervención Policial con el siguiente detalle:")}



                {/* Subsections with exact titles from page 1 removed per user request */}
                <div style={{ marginTop: "15px" }}>
                  <div style={{ marginBottom: "15px" }}>
                    <p style={{ textIndent: "20px", textAlign: "justify", marginTop: "5px", lineHeight: "1.5" }}>
                      {state.intervencion.circunstanciasPrecedentes || "Sin circunstancias precedentes registradas."}
                    </p>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <p style={{ textIndent: "20px", textAlign: "justify", marginTop: "5px", lineHeight: "1.5" }}>
                      {state.intervencion.circunstanciasConcomitantes || "Sin circunstancias concomitantes de fuerza mayor registradas."}
                    </p>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <p style={{ textIndent: "20px", textAlign: "justify", marginTop: "5px", lineHeight: "1.5" }}>
                      {state.intervencion.circunstanciasPosteriores || "Sin circunstancias posteriores registradas."}
                    </p>
                  </div>
                </div>



                 <p style={{ textAlign: "justify", marginTop: "15px", lineHeight: "1.5" }}>
                   --- Siendo las <span style={{ fontWeight: "bold" }}>{state.intervencion.horaConcluida}</span> horas del <span style={{ fontWeight: "bold" }}>{formatSpanishDate(state.intervencion.fechaConcluida)}</span> se da por concluida la presente, firmado a continuación los participantes.
                 </p>

                 <SignatureFooter />
               </div>
             )}

             {currentDocId === "detencion" && (() => {
              const conclParts = parseDateParts(state.detencion.fechaConcluida || police.fecha || "");
              
              const getSpanishMonthName = (monthStr: string) => {
                const mIndex = parseInt(monthStr) - 1;
                const meses = [
                  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ];
                return meses[mIndex] || "___________";
              };

              const docTipoTerm = detenido.tipo || "DETENIDO";
              const docTitleTerm = docTipoTerm === "PERSONA" ? "INTERVENCIÓN" : 
                                   docTipoTerm === "INTERVENIDO" ? "INTERVENCIÓN" : 
                                   docTipoTerm === "RETENIDO" ? "RETENCIÓN" : "DETENCIÓN";
              const docVerbTerm = docTipoTerm === "PERSONA" ? "COMO CIUDADANO INTERVENIDO" : 
                                  docTipoTerm === "INTERVENIDO" ? "INTERVENIDO" : 
                                  docTipoTerm === "RETENIDO" ? "RETENIDO" : "DETENIDO";

              return (
                <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px 15px", margin: "0 auto", width: "100%", boxSizing: "border-box", fontSize: "11px", lineHeight: "1.5" }}>
                  {/* DOCUMENT TITLE */}
                  <div style={{ textAlign: "center", marginBottom: "25px", marginTop: "10px" }}>
                    <div style={{ fontFamily: "Impact, sans-serif", fontSize: "16px", fontWeight: "bold", textDecoration: "underline", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      NOTIFICACIÓN DE {docTitleTerm}
                    </div>
                  </div>

                  {/* NOMBRES Y APELLIDOS IN MEMORIAM OF THE PHOTO LAYOUT */}
                  <div style={{ margin: "14px 0" }}>
                    <div style={{ display: "flex", alignItems: "baseline" }}>
                      <strong style={{ minWidth: "165px", letterSpacing: "0.5px", textTransform: "uppercase" }}>NOMBRES Y APELLIDOS</strong>
                      <span style={{ marginRight: "8px" }}>:</span>
                      <div style={{ flex: 1, borderBottom: "1px solid black", fontWeight: "bold", textTransform: "uppercase", paddingBottom: "2px", fontSize: "11px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span>
                          {detenido.apellidos ? `${detenido.apellidos}, ${detenido.nombres}` : "______________________________________________________"}
                        </span>
                        <span style={{ fontWeight: "bold", fontSize: "11px", whiteSpace: "nowrap", marginLeft: "12px", textTransform: "none" }}>
                          ( {detenido.edad ? `${detenido.edad} años` : "      "} )
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DOMICILIO IN MEMORIAM OF THE PHOTO LAYOUT */}
                  <div style={{ margin: "14px 0" }}>
                    <div style={{ display: "flex", alignItems: "baseline" }}>
                      <strong style={{ minWidth: "165px", letterSpacing: "0.5px", textTransform: "uppercase" }}>DOMICILIO</strong>
                      <span style={{ marginRight: "8px" }}>:</span>
                      <div style={{ flex: 1, borderBottom: "1px solid black", fontWeight: "bold", paddingBottom: "2px", fontSize: "11px" }}>
                        {detenido.domiciliadoEn || "______________________________________________________"}
                      </div>
                    </div>
                  </div>

                  {/* UNDERLINED EXPLANATORY PARAGRAPH */}
                  <p style={{ textAlign: "justify", fontSize: "11px", lineHeight: "2.1", marginTop: "15px", marginBottom: "15px" }}>
                    --- MEDIANTE LA PRESENTE SE LE HACE DE CONOCIMIENTO QUE SE ENCUENTRA <strong style={{ textDecoration: "underline" }}>{docVerbTerm}</strong> POR ENCONTRARSE IMPLICADO EN LA PRESUNTA COMISION DEL DELITO: <strong style={{ textDecoration: "underline", textUnderlineOffset: "5px" }}>{state.detencion.delitoFlagranteContexto || "_________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________"}</strong>
                  </p>

                  {/* DERECHOS HEADER */}
                  <p style={{ fontWeight: "bold", fontSize: "11px", margin: "20px 0 10px 0" }}>
                    ASIMISMO SE LE ASISTE LOS SIGUIENTES DERECHOS:
                  </p>

                  {/* DERECHOS LIST */}
                  <ul style={{ listStyleType: "none", paddingLeft: "24px", margin: "0 0 15px 0", fontSize: "10.5px", lineHeight: "1.7" }}>
                    <li style={{ textIndent: "-15px", marginBottom: "6px" }}>
                      - &nbsp; A QUE SE PRESUMA SU INOCENCIA EN TANTO NO HAYA SIDO DECLARADO JUDICIALMENTE RESPONSABLE.
                    </li>
                    <li style={{ textIndent: "-15px", marginBottom: "6px" }}>
                      - &nbsp; A QUE SE RESPETE SU INTEGRIDAD FISICA Y PSIQUICA
                    </li>
                    <li style={{ textIndent: "-15px", marginBottom: "6px" }}>
                      - &nbsp; A SER EXAMINADO POR UN MEDICO LEGISTA O QUIEN HAGA A SU VEZ
                    </li>
                    <li style={{ textIndent: "-15px", marginBottom: "6px" }}>
                      - &nbsp; A SER ASESORADO POR UN ABOGADO
                    </li>
                    <li style={{ textIndent: "-15px", marginBottom: "6px" }}>
                      - &nbsp; A SER INFORMADO DE LAS RAZONES DE SU DETENCION
                    </li>
                    <li style={{ textIndent: "-15px", marginBottom: "6px" }}>
                      - &nbsp; A COMUNICARSE CON SU FAMILIA O A SU ABOGADO U OTRA PERSONA A SU ELECCION.
                    </li>
                  </ul>

                  {/* HORIZONTAL LINE UNDER DERECHOS */}
                  <div style={{ borderBottom: "1.2px solid black", width: "100%", marginBottom: "20px" }}></div>

                  {/* TOWNSHIP DATE CLOSING STATEMENT */}
                  <div style={{ textAlign: "right", fontSize: "11px", margin: "20px 0 32px 0", letterSpacing: "0.2px" }}>
                    <span>{police.distrito || "San Miguel"}</span>, <strong style={{ textDecoration: "underline" }}>{conclParts.day || "____"}</strong> de <strong style={{ textDecoration: "underline" }}>{getSpanishMonthName(conclParts.month)}</strong> del 20<strong style={{ textDecoration: "underline" }}>{conclParts.year ? conclParts.year.slice(2) : "__"}</strong>
                  </div>

                  {/* SIGNATURE SECTION AS COMPLEMENTED BY THE PHOTO */}
                  <div className="detencion-firmas" style={{ display: "flex", justifyContent: "space-between", alignItems: "stretch", marginTop: "30px", gap: "10px" }}>
                    {/* LEFT COLUMN: ENTERADO BLOCK */}
                    <div style={{ width: "42%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div className="text-left" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <div>
                          <strong>ENTERADO:</strong> <span style={{ color: "#333", borderBottom: "1px dotted #888", display: "inline-block", width: "150px", height: "13px" }}></span>
                        </div>
                        <div className="text-center" style={{ width: "90%", fontSize: "8.5pt", margin: "2px 0 10px 0", color: "#444" }}>
                          (FIRMA)
                        </div>
                      </div>
                      <div className="text-left" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div>
                          <strong>NOMBRE:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline", textTransform: "uppercase" }}>{detenido.apellidos ? `${detenido.apellidos}, ${detenido.nombres}` : "................................................."}</span>
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <strong>FECHA:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.fecha ? formatSpanishDate(police.fecha) : "_________/________/________"}</span>
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <strong>HORA:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.hora ? `${police.hora} horas` : "_________:_________"}</span>
                        </div>
                      </div>
                    </div>

                    {/* INDEX DACTILAR BOX IN THE CENTER MATCHING GRAPHIC BOX */}
                    <div style={{ width: "20%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "70px", height: "92px", border: "1.2px solid black", boxSizing: "border-box" }}></div>
                    </div>

                    {/* RIGHT COLUMN: OFFICERS STAMP / INSTRUCTOR SIGNATURE */}
                    <div style={{ width: "38%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", textAlign: "center" }}>
                      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
                        <span style={{ fontWeight: "bold", fontSize: "9.5pt" }}>EL INSTRUCTOR</span>
                        
                        <div style={{ width: "100%", marginTop: "35px" }}>
                          <div style={{ width: "100%", borderBottom: "1px solid black", marginBottom: "5px" }}></div>
                          <div style={{ fontSize: "9pt", lineHeight: "1.2" }}>
                            <span style={{ display: "block", fontWeight: "bold", textTransform: "uppercase" }}>{police.instructorGrado || "______"} {police.instructorApellidos || "__________________"} {police.instructorNombres || "__________________"}</span>
                            <span style={{ display: "block", fontSize: "8pt" }}>CIP N° {police.instructorCIP || "________"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EXTRA ATTESTATIONS IF DETENIDOS ADICIONALES PRE-EXIST */}
                  {state.detencion?.detenidosAdicionales?.map((det: any, idx: number) => (
                    <div key={idx} className="detencion-firmas" style={{ display: "flex", justifyContent: "space-between", alignItems: "stretch", marginTop: "35px", borderTop: "1px dashed #aaa", paddingTop: "20px", gap: "10px" }}>
                      <div style={{ width: "42%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div className="text-left" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          <div>
                            <strong>ENTERADO:</strong> <span style={{ color: "#333", borderBottom: "1px dotted #888", display: "inline-block", width: "150px", height: "13px" }}></span>
                          </div>
                          <div className="text-center" style={{ width: "90%", fontSize: "8.5pt", margin: "2px 0 10px 0", color: "#444" }}>
                            (FIRMA - {getUpperLabelForTipo(det.tipo || detenido.tipo || "DETENIDO")} ADICIONAL)
                          </div>
                        </div>
                        <div className="text-left" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div>
                            <strong>NOMBRE:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline", textTransform: "uppercase" }}>{det.apellidos}, {det.nombres}</span>
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            <strong>FECHA:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.fecha ? formatSpanishDate(police.fecha) : "_________/________/________"}</span>
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            <strong>HORA:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.hora ? `${police.hora} horas` : "_________:_________"}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ width: "20%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "70px", height: "92px", border: "1.2px solid black", boxSizing: "border-box" }}></div>
                      </div>

                      <div style={{ width: "38%" }}></div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {currentDocId === "buenTrato" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginBottom: "20px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                  CONSTANCIA DE BUEN TRATO
                </div>
                <p style={{ textIndent: "30px", textAlign: "justify", lineHeight: "1.6", marginBottom: "15px" }}>
                  --- El ciudadano <strong style={{ textDecoration: "underline" }}>{detenido.apellidos ? `${detenido.apellidos}, ${detenido.nombres}` : "__________________________________________________"}</strong>, de <span style={{ fontWeight: "bold" }}>{detenido.edad || "___"}</span> años de edad, natural de <span style={{ fontWeight: "bold" }}>{detenido.naturalDe || "___________"}</span>, nacido el <span style={{ fontWeight: "bold" }}>{detenido.nacidoEl ? formatSpanishDate(detenido.nacidoEl) : "____/____/____"}</span>, de estado civil <span style={{ fontWeight: "bold" }}>{detenido.estadoCivil || "___________"}</span>, de ocupación <span style={{ fontWeight: "bold" }}>{detenido.ocupacion || "___________"}</span>, con grado de instrucción <span style={{ fontWeight: "bold" }}>{detenido.gradoInstruccion || "___________"}</span>, identificado(a) con DNI/Documento de Identidad Nro. <strong style={{ fontFamily: "monospace" }}>{detenido.dni || "___________"}</strong>, con domicilio real en <span style={{ fontWeight: "bold" }}>{detenido.domiciliadoEn || "__________________________________________________"}</span>, número celular <span style={{ fontWeight: "bold" }}>{detenido.celular || "___________"}</span> y correo electrónico <span style={{ fontWeight: "bold" }}>{detenido.correo || "___________"}</span>, quien suscribe la presente en calidad de <strong>{detenido.tipo || "DETENIDO"}</strong>, deja constancia de haber recibido buen trato físico y psicológico por parte del personal Policial interviniente durante la diligencia y permanencia con dignidad y respeto irrestricto a los Derechos Humanos.
                </p>
                <p style={{ textAlign: "justify", lineHeight: "1.6", marginBottom: "20px" }}>
                  Para mayor constancia firma e imprime su índice dactilar derecho en señal de conformidad.
                </p>

                <p style={{ textAlign: "left", fontSize: "11px", color: "#555", marginTop: "20px" }}>
                  Declarado y firmado el {formatSpanishDate(state.buenTrato.fechaFirma)} a las {state.buenTrato.horaFirma} horas.
                </p>

                <SignatureFooter 
                  titleInstructor="EL INSTRUCTOR" 
                  titleDetenido={
                    detenido.tipo === "RETENIDO" ? "EL RETENIDO" : 
                    detenido.tipo === "INTERVENIDO" ? "EL INTERVENIDO" : 
                    detenido.tipo === "PERSONA" ? "LA PERSONA" : 
                    "EL DETENIDO"
                  } 
                />
              </div>
            )}

            {currentDocId === "detencionMenor" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "4px 8px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "12px", marginBottom: "3px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                  NOTIFICACIÓN DE {detenido.tipo === "RETENIDO" ? "RETENCIÓN" : detenido.tipo === "INTERVENIDO" ? "INTERVENCION" : detenido.tipo === "PERSONA" ? "INTERVENCION" : "DETENCIÓN"} POR INFRACCIÓN A LA LEY PENAL
                </div>
                <p style={{ textAlign: "justify", lineHeight: "1.15", fontSize: "9px", marginBottom: "2px" }}>
                  --- En la ciudad de <span className="font-bold border-b border-dotted border-black px-1">{police.lugarCiudad || "______________"}</span>, Distrito de <span className="font-bold border-b border-dotted border-black px-1">{police.distrito || "______________"}</span>, Provincia de <span className="font-bold border-b border-dotted border-black px-1">{police.provincia || "______________"}</span>, siendo las <span className="font-bold border-b border-dotted border-black px-1">{police.hora || "_______"}</span> horas, del día <span className="font-bold border-b border-dotted border-black px-1">{formatSpanishDate(police.fecha)}</span>, presentes en <span className="font-bold border-b border-dotted border-black px-1">la UNIDAD PNP de {police.distrito || "______________"}</span> el instructor <span className="font-bold border-b border-dotted border-black px-1">{police.instructorGrado || "_________"} {police.instructorApellidos || "__________________"} {police.instructorNombres || "__________________"}</span>, con registro CIP N° <span className="font-bold border-b border-dotted border-black px-1">{police.instructorCIP || "________"}</span>, el menor <span className="font-bold border-b border-dotted border-black px-1">{detenido.apellidos || "__________________"}, {detenido.nombres || "__________________"}</span> (<span className="font-bold border-b border-dotted border-black px-1">{detenido.edad || "___"}</span> años de edad), estudiante / perteneciente a <span className="font-bold border-b border-dotted border-black px-1">{state.detencionMenor.pertenecienteA || "___________________________"}</span>, hijo de Don <span className="font-bold border-b border-dotted border-black px-1">{state.detencionMenor.padreNombre || "___________________________"}</span> y Doña <span className="font-bold border-b border-dotted border-black px-1">{state.detencionMenor.madreNombre || "___________________________"}</span>, natural de <span className="font-bold border-b border-dotted border-black px-1">{detenido.naturalDe || "______________"}</span>, nacido el <span className="font-bold border-b border-dotted border-black px-1">{formatSpanishDate(detenido.nacidoEl)}</span>, de estado civil <span className="font-bold border-b border-dotted border-black px-1">{detenido.estadoCivil || "Soltero"}</span>, de ocupación <span className="font-bold border-b border-dotted border-black px-1">{detenido.ocupacion || "Estudiante"}</span>, grado de instrucción <span className="font-bold border-b border-dotted border-black px-1">{detenido.gradoInstruccion || "______________"}</span>, identificado con DNI N° <span className="font-bold border-b border-dotted border-black px-1 font-mono text-[12px]">{detenido.dni || "________"}</span>, domiciliado en <span className="font-bold border-b border-dotted border-black px-1">{detenido.domiciliadoEn || "____________________________"}</span>, celular N° <span className="font-bold border-b border-dotted border-black px-1 font-mono">{detenido.celular || "_________"}</span>
                  {state.detencionMenor.detenidosAdicionales && state.detencionMenor.detenidosAdicionales.length > 0 && (
                    <>
                      {state.detencionMenor.detenidosAdicionales.map((det: any, idx: number) => (
                        <span key={idx}>
                          ; asimismo, el menor <span className="font-bold border-b border-dotted border-black px-1">{det.apellidos || "__________________"}, {det.nombres || "__________________"}</span> (<span className="font-bold border-b border-dotted border-black px-1">{det.edad || "___"}</span> años de edad), natural de <span className="font-bold border-b border-dotted border-black px-1">{det.naturalDe || "______________"}</span>, estado civil <span className="font-bold border-b border-dotted border-black px-1">{det.estadoCivil || "Soltero"}</span>, ocupación <span className="font-bold border-b border-dotted border-black px-1">{det.ocupacion || "Estudiante"}</span>, grado de instrucción <span className="font-bold border-b border-dotted border-black px-1">{det.gradoInstruccion || "______________"}</span>, identificado con DNI N° <span className="font-bold border-b border-dotted border-black px-1 font-mono text-[12px]">{det.dni || "________"}</span>, domiciliado en <span className="font-bold border-b border-dotted border-black px-1">{det.domiciliadoEn || "____________________________"}</span>, celular N° <span className="font-bold border-b border-dotted border-black px-1 font-mono">{det.celular || "_________"}</span>
                        </span>
                      ))}
                    </>
                  )}
                  ; a quien se le hace de conocimiento que se encuentra <strong>{detenido.tipo === "RETENIDO" ? "RETENIDO" : detenido.tipo === "INTERVENIDO" || detenido.tipo === "PERSONA" ? "INTERVENIDO" : "DETENIDO"}</strong> por infracción a la ley penal flagrante, de conformidad al Art. 2° literal f) inciso 24 de la Constitución Política del Perú, en observancia referida a la Detención Policial previsto en el Art. 39° del DL N°. 1348 - Código de Responsabilidad Penal de Adolescentes:
                </p>

                <p style={{ padding: "2px 0", textAlign: "justify", fontWeight: "bold", margin: "2px 0", lineHeight: "1.15", fontSize: "9px" }}>
                  --- {state.detencionMenor.motivoInfraccionLeyes || "Infracción penal investigada conforme a flagrancia."}
                </p>

                <p style={{ textAlign: "justify", lineHeight: "1.15", fontSize: "8.5px", marginBottom: "2px" }}>
                  En ese sentido, permanecerá en espacio exclusivo para adolescentes en esta Dependencia, separado de adultos, con enfoque de género e interés superior del niño.
                </p>

                <p style={{ textAlign: "justify", fontWeight: "bold", marginTop: "2px", marginBottom: "2px", lineHeight: "1.15", fontSize: "9px" }}>
                  Lectura formal del Artículo 45° del Código RPA.- Derechos del adolescente durante la detención:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "7px", fontFamily: "monospace", marginTop: "4px", marginBottom: "6px" }}>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>1.</span><span>Informado de causa de detención de manera clara y sencilla.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>2.</span><span>Contar con defensor de elección o de oficio desde el inicio.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>3.</span><span>Solicitar inmediato aviso y presencia de padre, madre o tutor.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>4.</span><span>Abstenerse de declarar o guardar absoluto silencio sobre hechos.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>5.</span><span>Identificación del personal policial responsable de su detención.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>6.</span><span>Permanecer en espacios para menores, separados de adultos.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>7.</span><span>Ser examinado por médico legista o profesional de salud.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>8.</span><span>Protección a su integridad personal frente a tratos degradantes.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>9.</span><span>Registro e inventario de pertenencias y devolución íntegra.</span>
                  </div>
                </div>

                <div className="no-print my-6 border-t border-dashed border-slate-300 pt-2 text-center text-[10px] text-slate-400 tracking-wider" style={{ userSelect: "none" }}>
                  --- CONTINÚA EN LA HOJA 2 ---
                </div>
                <div style={{ pageBreakBefore: "always", breakBefore: "page" }}></div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "7px", fontFamily: "monospace", marginTop: "4px", marginBottom: "6px" }}>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>10.</span><span>Comunicación fluida con representantes y personas de confianza.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>11.</span><span>Anotación inmediata del ingreso en los libros oficiales.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>12.</span><span>No uso de grilletes ni esposas salvo resistencia o peligro.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>13.</span><span>No ser constreñido a inculparse o firmar sin su abogado.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>14.</span><span>Expresarse en idioma de origen o contar con un intérprete.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>15.</span><span>Someterse a plazos estrictos y limitados de retención.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>16.</span><span>Puesto a control inmediato del Fiscal de Familia de turno.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>17.</span><span>A la no incomunicación bajo ninguna modality coercitiva.</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", alignContent: "flex-start", textAlign: "justify", lineHeight: "0.9" }}>
                    <span style={{ fontWeight: "bold" }}>18.</span><span>Garantías constitucionales del Código Procesal Penal.</span>
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed black", marginTop: "2px", paddingTop: "2px" }}>
                  <h3 style={{ textDecoration: "underline", textTransform: "uppercase", textAlign: "center", fontWeight: "bold", fontSize: "9px", marginBottom: "2px" }}>COMUNICACIONES</h3>
                  <p style={{ textAlign: "justify", lineHeight: "1.15", fontSize: "8.5px", marginBottom: "2px" }}>
                    Se procede a comunicar la detención inmediata empleando celular N° <span className="font-bold border-b border-dotted border-black px-1">{state.detencionMenor.numCelularUsado || "___________"}</span> Operador: {state.detencionMenor.operadorCelularUsado || "_______"}:
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "8px", lineHeight: "1.15", paddingLeft: "4px" }}>
                    <div>
                      <strong>• Tutor/Padres ({state.detencionMenor.contactoPadreNombre ? "SI" : "NO"}):</strong><br/>
                      Nombres: {state.detencionMenor.contactoPadreNombre || "_________"}<br/>
                      DNI: {state.detencionMenor.contactoPadreDni || "___"} | Cel: {state.detencionMenor.contactoPadreCelular || "___"}<br/>
                      Vínculo: {state.detencionMenor.contactoPadreVinculo || "___"} ({state.detencionMenor.contactoPadreObs || "Ubicado"})
                    </div>
                    <div>
                      <strong>• Fiscal Familia ({state.detencionMenor.contactoFiscalNombre ? "SI" : "NO"}):</strong><br/>
                      Nombres: {state.detencionMenor.contactoFiscalNombre || "_________"}<br/>
                      Fiscalía: {state.detencionMenor.contactoFiscalia || "_________"}<br/>
                      Cel: {state.detencionMenor.contactoFiscalCelular || "___"}
                    </div>
                    <div>
                      <strong>• Juez Familia ({state.detencionMenor.contactoJuezNombre ? "SI" : "NO"}):</strong><br/>
                      Nombres: {state.detencionMenor.contactoJuezNombre || "_________"}<br/>
                      Juzg.: {state.detencionMenor.contactoJuezJuzgado || "_________"}<br/>
                      Cel: {state.detencionMenor.contactoJuezCelular || "___"}
                    </div>
                  </div>
                </div>

                <p style={{ marginTop: "3px", marginBottom: "3px", lineHeight: "1.15", fontSize: "9px" }}>
                  --- Siendo las <span style={{ fontWeight: "bold" }}>{state.detencionMenor.horaConcluida}</span> horas del <span style={{ fontWeight: "bold" }}>{formatSpanishDate(state.detencionMenor.fechaConcluida)}</span>, se concluye la diligencia de menor.
                </p>

                {/* SINGLE ALL-IN-ONE ROW SIGNATURES GROUP */}
                <table className="mt-2 postfirmas" style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.2px", fontFamily: "monospace" }}>
                  <tbody>
                    <tr>
                      {/* INSTRUCTOR PNP */}
                      <td style={{ width: "31%", textAlign: "center", verticalAlign: "bottom", paddingRight: "5px" }}>
                        <div style={{ display: "inline-block", textAlign: "center", width: "100%" }}>
                          <div style={{ borderTop: "1px solid black", marginBottom: "3px" }}></div>
                          <div style={{ fontWeight: "bold", display: "block" }}>{police.instructorGrado} {police.instructorApellidos}</div>
                          <div style={{ display: "block" }}>CIP N° {police.instructorCIP}</div>
                          <div style={{ fontWeight: "bold", display: "block" }}>EL INSTRUCTOR PNP</div>
                        </div>
                      </td>

                      {/* MENOR DETENIDO */}
                      <td style={{ width: "34.5%", verticalAlign: "bottom", paddingLeft: "5px", paddingRight: "5px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <tbody>
                            <tr>
                              <td style={{ textAlign: "left", verticalAlign: "bottom" }}>
                                <div style={{ borderTop: "1px solid black", width: "95%", marginBottom: "3px" }}></div>
                                <div style={{ fontWeight: "bold", display: "block" }}>EL ADOLESCENTE {detenido.tipo === "RETENIDO" ? "RETENIDO" : detenido.tipo === "INTERVENIDO" || detenido.tipo === "PERSONA" ? "INTERVENIDO" : "DETENIDO"}</div>
                                <div style={{ fontWeight: "bold", display: "block" }}>{detenido.apellidos}, {detenido.nombres}</div>
                                <div style={{ display: "block" }}>DNI N° {detenido.dni}</div>
                              </td>
                              <td style={{ width: "35px", verticalAlign: "bottom", textAlign: "right" }}>
                                <div style={{ width: "35px", height: "45px", border: "1px solid black", display: "inline-block" }}></div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>

                      {/* APODERADO / PADRE / TUTOR */}
                      <td style={{ width: "34.5%", verticalAlign: "bottom", paddingLeft: "5px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <tbody>
                            <tr>
                              <td style={{ textAlign: "left", verticalAlign: "bottom" }}>
                                <div style={{ borderTop: "1px solid black", width: "95%", marginBottom: "3px" }}></div>
                                <div style={{ fontWeight: "bold", display: "block" }}>EL RESPONSABLE / TUTOR</div>
                                <div style={{ fontWeight: "bold", display: "block" }}>{state.detencionMenor.contactoPadreNombre || "_____________________"}</div>
                                <div style={{ display: "block" }}>Vínculo: {state.detencionMenor.contactoPadreVinculo || "_______"} | DNI: {state.detencionMenor.contactoPadreDni || "______"}</div>
                              </td>
                              <td style={{ width: "35px", verticalAlign: "bottom", textAlign: "right" }}>
                                <div style={{ width: "35px", height: "45px", border: "1px solid black", display: "inline-block" }}></div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {currentDocId === "registroPersonal" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box", fontSize: "11.5px" }}>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginBottom: "20px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                  ACTA DE REGISTRO PERSONAL E INCAUTACIÓN
                </div>

                <div style={{ textAlign: "justify", lineHeight: "1.7", textIndent: "0px", marginBottom: "15px" }}>
                  --- En el Distrito de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.distrito || "___________"}</span>, siendo las <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.hora || "_______"}</span> horas del día <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{formatSpanishDate(police.fecha)}</span>; en el lugar: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.registroPersonal.lugarRegistro || "________________________________________________________"}</span>. Presente el suscrito <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.instructorGrado || "_________"} {police.instructorApellidos || "__________________"} {police.instructorNombres || "__________________"}</span>, con número de registro CIP N° <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.instructorCIP || "________"}</span>, quien labora en <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.unidadPolicial || state.registroPersonal.personalLlevaACabo || police.companiaDe || "_____________________________________"}</span> y {detenido.tipo === "RETENIDO" ? "el retenido(a)" : detenido.tipo === "PERSONA" ? "la persona" : detenido.tipo === "INTERVENIDO" ? "el intervenido(a)" : "el detenido(a)"} <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.apellidos || "__________________"}, {detenido.nombres || "__________________"}</span>, Sexo (<span style={{ fontWeight: "bold" }}>{detenido.sexo || " "}</span>), de nacionalidad <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.nacionalidad || "PERUANA"}</span>, natural de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.naturalDe || "__________"}</span>, estado civil <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.estadoCivil || "______"}</span>, grado de instrucción <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.gradoInstruccion || "___________"}</span>, fecha de nacimiento <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{formatSpanishDate(detenido.nacidoEl)}</span>, ocupación <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.ocupacion || "_______________"}</span>, identificado con DNI Nro. <span style={{ fontWeight: "bold", textDecoration: "underline", fontFamily: "monospace" }}>{detenido.dni || "_______________"}</span>, con Celular Nro. <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.celular || "____________"}</span>, correo electrónico <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.correo || "______________"}</span>, domiciliado en <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.domiciliadoEn || "_____________________________________"}</span>;
                </div>

                <div style={{ textAlign: "justify", lineHeight: "1.7", textIndent: "0px", marginBottom: "20px" }}>
                  a quien se le procede a realizar el Acta de Registro Personal conforme al siguiente detalle: En cumplimiento de lo dispuesto por el Artículo 210° del Código Procesal Penal, se le invitó a que exhiba y entregue voluntariamente los bienes que lleva consigo, explicándole las razones de su ejecución e indicándole que tiene derecho a ser asistido en este acto por una persona de su confianza (siempre que se pueda ubicar de inmediato y sea mayor de edad); expresando al respecto lo siguiente: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.registroPersonal.solicitadoExhibirBienes || "__________________________________________________________________________________________"}</span>, donde se procede a realizar el registro personal a cargo de la autoridad que suscribe, con los siguientes resultados:
                </div>

                <div style={{ marginTop: "15px", marginBottom: "15px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ paddingLeft: "30px", textIndent: "-30px", textAlign: "justify", lineHeight: "1.7" }}>
                    <span style={{ fontWeight: "bold" }}>- Para Droga e Insumos Químicos ................................... ( {state.registroPersonal.drogasInsumosCheck ? "X" : " "} ) : </span>
                    <span style={{ fontWeight: "bold", textDecoration: "underline" }}>
                      {!state.registroPersonal.drogasInsumosCheck ? "NEGATIVO" : `POSITIVO : ${state.registroPersonal.drogasInsumosDetalle || ""}`}
                    </span>
                  </div>

                  <div style={{ paddingLeft: "30px", textIndent: "-30px", textAlign: "justify", lineHeight: "1.7" }}>
                    <span style={{ fontWeight: "bold" }}>- Para Billete y Moneda Nacional y/o Extranjera .................. ( {state.registroPersonal.billetesMonedasCheck ? "X" : " "} ) : </span>
                    <span style={{ fontWeight: "bold", textDecoration: "underline" }}>
                      {!state.registroPersonal.billetesMonedasCheck ? "NEGATIVO" : `POSITIVO : ${state.registroPersonal.billetesMonedasDetalle || ""}`}
                    </span>
                  </div>

                  <div style={{ paddingLeft: "30px", textIndent: "-30px", textAlign: "justify", lineHeight: "1.7" }}>
                    <span style={{ fontWeight: "bold" }}>- Para Munición y Arma de Guerra .................................. ( {state.registroPersonal.municionArmasCheck ? "X" : " "} ) : </span>
                    <span style={{ fontWeight: "bold", textDecoration: "underline" }}>
                      {!state.registroPersonal.municionArmasCheck ? "NEGATIVO" : `POSITIVO : ${state.registroPersonal.municionArmasDetalle || ""}`}
                    </span>
                  </div>

                  <div style={{ paddingLeft: "30px", textIndent: "-30px", textAlign: "justify", lineHeight: "1.7" }}>
                    <span style={{ fontWeight: "bold" }}>- Para Otros de interés policial .................................. ( {state.registroPersonal.otrosInteresCheck ? "X" : " "} ) : </span>
                    <span style={{ fontWeight: "bold", textDecoration: "underline" }}>
                      {!state.registroPersonal.otrosInteresCheck ? "NEGATIVO" : `POSITIVO : ${state.registroPersonal.otrosInteresDetalle || ""}`}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "15px", marginBottom: "15px", textAlign: "justify", lineHeight: "1.7" }}>
                  <span style={{ fontWeight: "bold", textDecoration: "underline" }}>
                    {state.registroPersonal.dejaConstancia || "Por intermedio de la presente se deja constancia que la diligencia se ejecutó con absoluto respeto de la dignidad personal, sin emplear violencia ni amenazas de ningún tipo, no registrándose novedad de salud."}
                  </span>
                </div>

                <p style={{ marginTop: "15px", textAlign: "justify", lineHeight: "1.6", textIndent: "30px" }}>
                  --- Siendo las <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.registroPersonal.horaConcluida}</span> horas del <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{formatSpanishDate(state.registroPersonal.fechaConcluida)}</span>, se da por concluida la presente acta en presencia del Instructor que certifica, firmando a continuación e imprimiendo su dedo índice derecho {detenido.tipo === "RETENIDO" ? "el retenido" : detenido.tipo === "INTERVENIDO" || detenido.tipo === "PERSONA" ? "el intervenido" : "el detenido"} en señal de total conformidad.
                </p>

                <SignatureFooter 
                  titleInstructor="EL INSTRUCTOR" 
                  titleDetenido={
                    detenido.tipo === "RETENIDO" ? "EL RETENIDO" : 
                    detenido.tipo === "INTERVENIDO" ? "EL INTERVENIDO / REGISTRADO" : 
                    detenido.tipo === "PERSONA" ? "LA PERSONA REGISTRADA" : 
                    "EL DETENIDO"
                  } 
                />
              </div>
            )}

            {currentDocId === "registroVehicular" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginBottom: "20px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                  ACTA DE REGISTRO VEHICULAR
                </div>
                {renderStandardHeader("se procede a realizar el Registro Vehicular de conformidad a lo establecido en el Artículo 210° del Código Procesal Penal, con el siguiente detalle:")}

                {state.registroVehicular.testigoNombres && (
                  <p style={{ textAlign: "justify", textIndent: "40px", fontSize: "11px", lineHeight: "1.6", margin: "10px 0" }}>
                    --- Con la presencia y participación en esta diligencia del testigo presencial, ciudadano(a) <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.registroVehicular.testigoNombres}</span>, identificado(a) con DNI/Documento de Identidad Nro. <span className="font-bold">{state.registroVehicular.testigoIdentificadoDni}</span>, domiciliado(a) en <span className="font-bold">{state.registroVehicular.testigoDomiciliadoEn}</span>, celular N° <span className="font-bold">{state.registroVehicular.testigoCelular}</span>, con relación o parentesco: <span className="font-bold">{state.registroVehicular.testigoParentesco || "Ninguno"}</span>, quién asiste para dar conformidad del acto.
                  </p>
                )}


                <div style={{ marginTop: "15px" }}>
                  <div style={{ padding: "8px 0", marginBottom: "15px" }}>
                    <span style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "11px", display: "block", marginBottom: "5px" }}>CARACTERÍSTICAS DEL VEHÍCULO REGISTRADO:</span>
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "none", fontSize: "11px", fontFamily: "monospace" }}>
                      <tbody>
                        <tr>
                          <td style={{ width: "50%", padding: "2px 0" }}>• <strong>Placa de Rodaje:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.registroVehicular.placa || "___________"}</span></td>
                          <td style={{ width: "50%", padding: "2px 0" }}>• <strong>Marca:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.registroVehicular.marca || "___________"}</span></td>
                        </tr>
                        <tr>
                          <td style={{ padding: "2px 0" }}>• <strong>Color:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.registroVehicular.color || "___________"}</span></td>
                          <td style={{ padding: "2px 0" }}>• <strong>Modelo:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.registroVehicular.modelo || "___________"}</span></td>
                        </tr>
                        <tr>
                          <td style={{ padding: "2px 0" }}>• <strong>Año de Fabricación:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.registroVehicular.anioFabricacion || "_______"}</span></td>
                          <td style={{ padding: "2px 0" }}>• <strong>N° de Personas a bordo:</strong> <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.registroVehicular.personasEnVehiculo || "_______"}</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <span style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "11px", display: "block" }}>I. SOLICITUD DE EXHIBICIÓN DE OBJETOS:</span>
                    <p style={{ paddingLeft: "15px", lineHeight: "1.5" }}>
                      Se solicitó al conductor que exhiba voluntariamente los bienes que transporta en el vehículo: &nbsp;&nbsp;&nbsp;&nbsp; 
                      POSITIVO ( {state.registroVehicular.solicitudExhibicion === "POSITIVO" ? "X" : " "} ) &nbsp;&nbsp;&nbsp;&nbsp; NEGATIVO ( {state.registroVehicular.solicitudExhibicion === "NEGATIVO" ? "X" : " "} )
                    </p>
                    {state.registroVehicular.solicitudExhibicion === "POSITIVO" && (
                      <p style={{ paddingLeft: "15px", marginTop: "5px" }}><strong>Descripción del bien exhibido voluntariamente:</strong> <span style={{ textDecoration: "underline" }}>{state.registroVehicular.descripcionBienExhibido}</span></p>
                    )}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <span style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "11px", display: "block" }}>II. RAZONES QUE MOTIVARON EL REGISTRO VEHICULAR:</span>
                    <p style={{ paddingLeft: "15px", lineHeight: "1.5" }}>{state.registroVehicular.razonesRegistro || "Sospecha de transporte de especies delictuosas."}</p>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <span style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "11px", display: "block" }}>III. BIENES ENCONTRADOS (EN MALETERA, ASIENTOS O COMPARTIMENTOS):</span>
                    <p style={{ paddingLeft: "15px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{state.registroVehicular.bienesObjetoRegistro || "No se hallaron especies delictivas al interior del vehículo."}</p>
                  </div>


                </div>

                <p style={{ marginTop: "15px", lineHeight: "1.5" }}>
                  --- Siendo las <span style={{ fontWeight: "bold" }}>{state.registroVehicular.horaConcluida}</span> horas del <span style={{ fontWeight: "bold" }}>{formatSpanishDate(state.registroVehicular.fechaConcluida)}</span> se da por concluida la diligencia vehicular.
                </p>

                <SignatureFooter 
                  titleInstructor="EL INSTRUCTOR PNP" 
                  titleDetenido={`EL CONDUCTOR / PROPIETARIO (${getUpperLabelForTipo(detenido.tipo)})`} 
                />
              </div>
            )}

            {currentDocId === "situacionVehicular" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "6px 8px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "12px", marginBottom: "6px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                  ACTA DE SITUACIÓN VEHICULAR
                </div>

                {(() => {
                  const getValStr = (val: string | undefined | null) => {
                    if (!val || val === "NO_REGISTRA") return "N/R";
                    if (val === "BUENO" || val === "SI") return "SI";
                    if (val === "MALO" || val === "FALTA" || val === "NO") return "NO";
                    return val;
                  };

                  const getMotorValStr = (val: string | undefined | null) => {
                    if (!val || val === "NO_REGISTRA") return "N/R";
                    if (val === "BUENO" || val === "FUNCIONA") return "FUNCIONA";
                    if (val === "MALO" || val === "FALTA" || val === "NO_FUNCIONA" || val === "NO FUNCIONA") return "NO FUNCIONA";
                    return val;
                  };

                  const ItemRow = ({ label, value }: { label: string; value: string }) => (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2.5px" }}>
                      <span style={{ fontSize: "8px", fontWeight: "normal", textTransform: "uppercase" }}>{label}</span>
                      <span style={{ flex: 1, borderBottom: "1px dotted #000", margin: "0 4px" }}></span>
                      <span style={{ fontSize: "8px", fontWeight: "bold", textDecoration: "underline", minWidth: "30px", textAlign: "right" }}>
                        {value || "N/R"}
                      </span>
                    </div>
                  );

                  return (
                    <>
                      <div style={{ textAlign: "justify", fontSize: "9.5px", lineHeight: "1.35", marginBottom: "6px" }}>
                        --- En la ciudad de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.lugarCiudad || "________"}</span>, siendo las <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.hora || "____"}</span> horas, del día <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.fecha ? formatSpanishDate(police.fecha) : "____"}</span>, en el lugar ubicado en <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.situacionVehicular.lugarInspeccion || "___________________________"}</span>, presentes el Instructor Policial <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.instructorGrado || "_________"} {police.instructorApellidos || "__________________"} {police.instructorNombres || "__________________"}</span>, {getLabelForTipo(detenido.tipo).toLowerCase()} <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.apellidos ? `${detenido.apellidos}, ${detenido.nombres}` : "______________________"}</span>, con <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.edad || "___"}</span> años de edad, de nacionalidad <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.nacionalidad || "PERUANA"}</span>, natural de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.naturalDe || "__________"}</span>, estado civil <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.estadoCivil || "Soltero"}</span>, hijo de don <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.situacionVehicular.intervenidoPadreNombre || "_____________________"}</span> y doña <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.situacionVehicular.intervenidoMadreNombre || "_____________________"}</span>, de ocupación <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.ocupacion || "____________________"}</span>, grado de instrucción <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.gradoInstruccion || "______________"}</span>, identificado con DNI <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.dni || "__________"}</span>, domiciliado en <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.domiciliadoEn || "___________________________"}</span>, número de teléfono celular <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.celular || "_______________"}</span>
                        {state.situacionVehicular.detenidosAdicionales && state.situacionVehicular.detenidosAdicionales.length > 0 && (
                          <>
                            {state.situacionVehicular.detenidosAdicionales.map((det: any, idx: number) => {
                              const roleLabel = getLabelForTipo(det.tipo || detenido.tipo).toLowerCase();
                              return (
                                <span key={idx}>
                                  ; en compañía de {roleLabel} <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.apellidos ? `${det.apellidos}, ${det.nombres}` : "______________________"}</span>, con <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.edad || "___"}</span> años de edad, de sexo <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.sexo || "________"}</span>, de nacionalidad <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.nacionalidad || "PERUANA"}</span>, identificado con DNI <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.dni || "__________"}</span>
                                </span>
                              );
                            })}
                          </>
                        )}
                        , se procede a realizar la presente diligencia de situación vehicular conforme al detalle siguiente:
                      </div>

                      <div style={{ border: "1.5px solid black", padding: "4px 8px", margin: "4px 0", fontSize: "9.5px", lineHeight: "1.3" }}>
                        <div>
                          <strong>1. PLACA N°:</strong> <span style={{ textDecoration: "underline", fontWeight: "bold" }}>{state.situacionVehicular.datosGenerales.placa || "___________"}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <strong>CLASE:</strong> <span style={{ textDecoration: "underline", fontWeight: "bold" }}>{state.situacionVehicular.datosGenerales.clase || "___________"}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <strong>COLOR:</strong> <span style={{ textDecoration: "underline", fontWeight: "bold" }}>{state.situacionVehicular.datosGenerales.color || "___________"}</span>
                        </div>
                        <div style={{ marginTop: "2px" }}>
                          <strong>MOTOR N°:</strong> <span style={{ textDecoration: "underline", fontWeight: "bold" }}>{state.situacionVehicular.datosGenerales.motorNo || "___________"}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <strong>SERIE N°:</strong> <span style={{ textDecoration: "underline", fontWeight: "bold" }}>{state.situacionVehicular.datosGenerales.serieChasis || "___________"}</span>
                        </div>
                      </div>

                      <div style={{ border: "1.5px solid black", padding: "4px 8px", margin: "4px 0", fontSize: "9.5px" }}>
                        <strong>2. ESTADO DE CARROCERÍA:</strong> <span style={{ textDecoration: "underline", fontWeight: "bold" }}>{state.situacionVehicular.datosGenerales.estadoConservacion || "BUENO (SIN ABOLLADURAS DE CONSIDERACIÓN)"}</span>
                      </div>

                      <div style={{ display: "flex", gap: "10px", margin: "4px 0" }}>
                        {/* Column 3. PARTE EXTERIOR */}
                        <div style={{ flex: 1, border: "1.5px solid black", padding: "4px 6px" }}>
                          <div style={{ fontWeight: "bold", borderBottom: "1px solid black", paddingBottom: "2px", marginBottom: "4px", fontSize: "9px" }}>
                            3. PARTE EXTERIOR
                          </div>
                          <div>
                            <ItemRow label="FARO GRANDE DELANTERO" value={getValStr(state.situacionVehicular.partesExteriores.faroGrandeDelantero)} />
                            <ItemRow label="FARO CHICO DELANTERO" value={getValStr(state.situacionVehicular.partesExteriores.faroChicoDelantero)} />
                            <ItemRow label="FAROS POSTERIORES" value={getValStr(state.situacionVehicular.partesExteriores.farosPosteriores)} />
                            <ItemRow label="BISELES" value={getValStr(state.situacionVehicular.partesExteriores.biseles)} />
                            <ItemRow label="LIMPIA PARABRISAS" value={getValStr(state.situacionVehicular.partesExteriores.limpiaParabrisas)} />
                            <ItemRow label="LUNAS" value={getValStr((state.situacionVehicular.partesExteriores as any).lunas || "NO_REGISTRA")} />
                            <ItemRow label="LLANTAS" value={getValStr(state.situacionVehicular.partesExteriores.llantas)} />
                            <ItemRow label="VASOS" value={getValStr(state.situacionVehicular.partesExteriores.vasos)} />
                            <ItemRow label="ESPEJO EXTERIOR" value={getValStr(state.situacionVehicular.partesExteriores.espejoExterior)} />
                            <ItemRow label="CHAPAS" value={getValStr(state.situacionVehicular.partesExteriores.chapas)} />
                            <ItemRow label="ANTENAS" value={getValStr(state.situacionVehicular.partesExteriores.antenas)} />
                            <ItemRow label="PARACHOQUE" value={getValStr(state.situacionVehicular.partesExteriores.parachoques)} />
                            <ItemRow label="LLANTA DE REPUESTO" value={getValStr(state.situacionVehicular.partesExteriores.llantasRepuesto)} />
                            <ItemRow label="PARABRISAS" value={getValStr(state.situacionVehicular.partesExteriores.parabrisas)} />
                            <ItemRow label="OTROS" value={getValStr((state.situacionVehicular.partesExteriores as any).otrosExteriores || "NO_REGISTRA")} />
                          </div>
                        </div>

                        {/* Column 4. PARTE INTERIOR */}
                        <div style={{ flex: 1, border: "1.5px solid black", padding: "4px 6px" }}>
                          <div style={{ fontWeight: "bold", borderBottom: "1px solid black", paddingBottom: "2px", marginBottom: "4px", fontSize: "9px" }}>
                            4. PARTE INTERIOR
                          </div>
                          <div>
                            <ItemRow label="TABLERO" value={getValStr(state.situacionVehicular.partesInteriores.tablero)} />
                            <ItemRow label="CHAPA DE CONTACTO" value={getValStr(state.situacionVehicular.partesInteriores.chapaContacto)} />
                            <ItemRow label="RADIO" value={getValStr(state.situacionVehicular.partesInteriores.radio)} />
                            <ItemRow label="ENCENDEDOR" value={getValStr(state.situacionVehicular.partesInteriores.encendedor)} />
                            <ItemRow label="PISOS" value={getValStr(state.situacionVehicular.partesInteriores.pisos)} />
                            <ItemRow label="MANIJAS" value={getValStr(state.situacionVehicular.partesInteriores.manijas)} />
                            <ItemRow label="CENICEROS" value={getValStr(state.situacionVehicular.partesInteriores.ceniceros)} />
                            <ItemRow label="PARASOLES" value={getValStr(state.situacionVehicular.partesInteriores.parasoles)} />
                            <ItemRow label="ESPEJO INTERIOR" value={getValStr(state.situacionVehicular.partesInteriores.espejoInterior)} />
                            <ItemRow label="CODERAS" value={getValStr(state.situacionVehicular.partesInteriores.coderas)} />
                            <ItemRow label="GATA" value={getValStr(state.situacionVehicular.partesInteriores.gata)} />
                            <ItemRow label="LLAVE DE RUEDAS" value={getValStr(state.situacionVehicular.partesInteriores.llaveRuedas)} />
                            <ItemRow label="PARLANTES" value={getValStr(state.situacionVehicular.partesInteriores.parlante)} />
                            <ItemRow label="ASIENTOS" value={getValStr(state.situacionVehicular.partesInteriores.asientos)} />
                            <ItemRow label="OTROS" value={getValStr((state.situacionVehicular.partesInteriores as any).otrosInteriores || "NO_REGISTRA")} />
                          </div>
                        </div>
                      </div>

                      {/* Section 5. MOTOR */}
                      <div style={{ border: "1.5px solid black", padding: "4px 6px", margin: "4px 0" }}>
                        <div style={{ fontWeight: "bold", borderBottom: "1px solid black", paddingBottom: "2px", marginBottom: "4px", fontSize: "9px" }}>
                          5. MOTOR Y ACCESORIOS
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <div style={{ flex: 1 }}>
                            <ItemRow label="BATERIA" value={getMotorValStr(state.situacionVehicular.motorAccesorios.bateria)} />
                            <ItemRow label="ARRANCADOR" value={getMotorValStr(state.situacionVehicular.motorAccesorios.arrancador)} />
                            <ItemRow label="CARBURADOR" value={getMotorValStr(state.situacionVehicular.motorAccesorios.carburador)} />
                            <ItemRow label="DISTRIBUIDOR" value={getMotorValStr(state.situacionVehicular.motorAccesorios.distribuidor)} />
                            <ItemRow label="TAPA DE ACEITE" value={getMotorValStr(state.situacionVehicular.motorAccesorios.tapaAceite)} />
                            <ItemRow label="CHICOTES" value={getMotorValStr(state.situacionVehicular.motorAccesorios.chicotes)} />
                            <ItemRow label="OTROS" value={getMotorValStr((state.situacionVehicular.motorAccesorios as any).otrosMotor || "NO_REGISTRA")} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <ItemRow label="RADIADOR" value={getMotorValStr(state.situacionVehicular.motorAccesorios.radiador)} />
                            <ItemRow label="ALTERNADOR" value={getMotorValStr(state.situacionVehicular.motorAccesorios.alternador)} />
                            <ItemRow label="PURIFICADOR" value={getMotorValStr(state.situacionVehicular.motorAccesorios.purificador)} />
                            <ItemRow label="BOBINA" value={getMotorValStr(state.situacionVehicular.motorAccesorios.bobina)} />
                            <ItemRow label="BUJIAS" value={getMotorValStr(state.situacionVehicular.motorAccesorios.bujias)} />
                            <ItemRow label="VARILLA M. ACEITE" value={getMotorValStr(state.situacionVehicular.motorAccesorios.varillaAceite)} />
                          </div>
                        </div>
                      </div>

                      <div style={{ border: "1.5px solid black", padding: "4px 6px", margin: "4px 0", fontSize: "9.5px" }}>
                        <strong>6. OBSERVACIONES:</strong>
                        <p style={{ marginTop: "2px", padding: "3px", backgroundColor: "#fafafa", border: "1px solid #ccc", minHeight: "18px", whiteSpace: "pre-wrap", fontSize: "8.5px" }}>
                          {state.situacionVehicular.observaciones || "Sin observaciones específicas registradas."}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "10px", borderTop: "1px dashed black", paddingTop: "4px", fontSize: "9px", marginBottom: "4px" }}>
                        <span style={{ flex: 1 }}><strong>PERENNIZACIÓN FILMADA:</strong> {state.situacionVehicular.perennizacionMedio || "No corresponde"}</span>
                        <span style={{ flex: 1 }}><strong>DESCRIPCIÓN ESPECÍFICA DETALLADA:</strong> {state.situacionVehicular.descripcionEspecificaCompleta || "Se deja constancia del inventario físico visual regular."}</span>
                      </div>

                      <p style={{ marginTop: "6px", lineHeight: "1.3", fontSize: "9.5px" }}>
                        --- Siendo las <span style={{ fontWeight: "bold" }}>{state.situacionVehicular.horaConcluida || "____"}</span> horas, del mismo día, se da por concluida la presente diligencia y una vez leído por los participantes se procede a firmar en señal de conformidad.
                      </p>

                      <SignatureFooter 
                        titleInstructor="PERSONAL PNP" 
                        titleDetenido={getUpperLabelForTipo(detenido.tipo)} 
                        compact={true}
                      />
                    </>
                  );
                })()}
              </div>
            )}

            {currentDocId === "recepcion" && (() => {
              const personaNombre = state.recepcion.personaPersona || (state.recepcion.personaApellidos && state.recepcion.personaNombres ? `${state.recepcion.personaApellidos}, ${state.recepcion.personaNombres}` : "________________");
              const personaDni = state.recepcion.personaDni || "________";
              const personaSexo = state.recepcion.personaSexo || "M";
              const personaEdad = state.recepcion.personaEdad || "___";
              const personaNacionalidad = state.recepcion.personaNacionalidad || "Peruana";
              const personaOcupacion = state.recepcion.personaOcupacion || "_________";
              const personaDomicilio = state.recepcion.personaDomicilio || "_________________________________";
              const personaCelular = state.recepcion.personaCelular || state.recepcion.personaTelefono || "_________";
              const personaParentesco = state.recepcion.personaParentescoReferencia || "Ninguno (Ciudadano interviniente)";

              return (
                <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                  <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginBottom: "20px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                    ACTA DE RECEPCIÓN
                  </div>
                  <p className="text-justify indent-8 leading-relaxed mb-4" style={{ textAlign: "justify", textIndent: "30px", fontSize: "11px", lineHeight: "1.8", margin: "15px 0", fontFamily: "monospace" }}>
                    --- En la ciudad de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.lugarCiudad || "______________"}</span>, Distrito de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.distrito || "______________"}</span>, Provincia de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.provincia || "______________"}</span>, siendo las <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.hora || "_______"}</span> horas, del día <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{formatSpanishDate(police.fecha)}</span>, presentes en <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.unidadPolicial || "la UNIDAD PNP de " + (police.distrito || "______________")}</span>, el instructor PNP <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.instructorGrado || "_________"} {police.instructorApellidos || "__________________"} {police.instructorNombres || "__________________"}</span>, con CIP N° <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.instructorCIP || "________"}</span>, se procede a realizar la presente diligencia de Acta de Recepción de conformidad con las leyes vigentes con el siguiente detalle:
                  </p>

                  <div style={{ marginTop: "15px" }}>
                    <p style={{ textAlign: "justify", textIndent: "30px", fontSize: "11px", lineHeight: "1.8", margin: "15px 0", fontFamily: "monospace" }}>
                      --- Presente ante la autoridad policial el ciudadano(a) <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{personaNombre}</span>, identificado(a) con DNI N° <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{personaDni}</span>, de sexo <span style={{ fontWeight: "bold" }}>{personaSexo}</span>, de <span style={{ fontWeight: "bold" }}>{personaEdad}</span> años de edad, de nacionalidad <span style={{ fontWeight: "bold" }}>{personaNacionalidad}</span>, de ocupación <span style={{ fontWeight: "bold" }}>{personaOcupacion}</span>, domiciliado(a) en <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{personaDomicilio}</span>, con número celular o teléfono <span style={{ fontWeight: "bold" }}>{personaCelular}</span>, quien manifiesta tener el siguiente vínculo o parentesco de referencia con la persona intervenida/investigada: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{personaParentesco}</span>.
                    </p>

                    <p style={{ textAlign: "justify", textIndent: "30px", fontSize: "11px", lineHeight: "1.8", margin: "15px 0", fontFamily: "monospace" }}>
                      --- Al respecto, el ciudadano(a) recurrente, de forma libre y espontánea, manifiesta que procede a hacer la entrega voluntaria debido a: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.recepcion.razonesEntrega || "Entrega de manera voluntaria para el esclarecimiento de los hechos delictivos."}</span>.
                    </p>

                    <p style={{ textAlign: "justify", textIndent: "30px", fontSize: "11px", lineHeight: "1.8", margin: "15px 0", fontFamily: "monospace" }}>
                      --- En este mismo acto, se procede a la recepción física por parte de la autoridad policial de los bienes detallados a continuación: <span style={{ fontWeight: "bold", textDecoration: "underline", whiteSpace: "pre-wrap" }}>{state.recepcion.descripcionBienObjeto || "Descripción de objetos entregados voluntariamente conforme a Ley."}</span>.
                    </p>


                  </div>

                  <p style={{ textAlign: "justify", textIndent: "30px", fontSize: "11px", lineHeight: "1.8", margin: "15px 0", fontFamily: "monospace" }}>
                    --- Siendo las <span style={{ fontWeight: "bold" }}>{state.recepcion.horaConcluida}</span> horas del <span style={{ fontWeight: "bold" }}>{formatSpanishDate(state.recepcion.fechaConcluida)}</span> de la misma fecha, se da por concluido el presente acto de recepción voluntaria, firmando por triplicado los comparecientes.
                  </p>

                  <SignatureFooter titleInstructor="EL INSTRUCTOR PNP" titleDetenido="QUIEN REALIZA LA ENTREGA" />
                </div>
              );
            })()}

            {currentDocId === "ocurrencia" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginBottom: "15px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                  PARTE DE OCURRENCIA POLICIAL
                </div>

                {state.ocurrencia.asunto && (
                  <table style={{ width: "100%", fontFamily: "monospace", fontSize: "11px", marginBottom: "15px", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "80px", fontWeight: "bold", verticalAlign: "top" }}>ASUNTO</td>
                        <td style={{ width: "15px", fontWeight: "bold", verticalAlign: "top" }}>:</td>
                        <td style={{ fontWeight: "bold", textDecoration: "underline", textTransform: "uppercase", textAlign: "justify", fontSize: "11px" }}>
                          {state.ocurrencia.asunto}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}

                <p style={{ textAlign: "justify", lineHeight: "1.5", textIndent: "40px", marginBottom: "15px" }}>
                  --- En el distrito de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.distrito || "___________"}</span>, siendo las <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.hora || "_______"}</span> horas del día <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{formatSpanishDate(police.fecha)}</span>, presentes en <span style={{ fontWeight: "bold" }}>la UNIDAD PNP de {police.distrito || "___________"}</span> el instructor PNP <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.instructorGrado || "_________"} {police.instructorApellidos || "__________________"} {police.instructorNombres || "__________________"}</span> con número de registro CIP N° <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.instructorCIP || "________"}</span>, procede a redactar de forma pormenorizada y legal el presente Parte de Ocurrencia Policial con respecto al servicio ordinario/extraordinario ejecutado:
                </p>

                <div style={{ marginTop: "15px" }}>
                  <p style={{ textAlign: "justify", textIndent: "30px", fontSize: "11px", lineHeight: "1.8", margin: "15px 0", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                    --- {state.ocurrencia.detallesOcurrencia || "Servicio ordinario de patrullaje a pie sin novedades excepcionales previas a la intervención descrita."}
                  </p>

                  <p style={{ textAlign: "justify", textIndent: "30px", fontSize: "11px", lineHeight: "1.8", margin: "15px 0", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                    --- {state.ocurrencia.medidasAdoptadas || "No se registraron patrullajes preventivos adicionales."}
                  </p>
                </div>

                <p style={{ textAlign: "justify", marginTop: "15px", lineHeight: "1.5" }}>
                  --- Siendo las <span style={{ fontWeight: "bold" }}>{state.ocurrencia.horaConcluida}</span> horas del <span style={{ fontWeight: "bold" }}>{formatSpanishDate(state.ocurrencia.fechaConcluida)}</span>, habiéndose restituido las condiciones normales de orden social, se da por finalizado el presente Parte de Ocurrencia Policial firmando en conformidad.
                </p>

                <SignatureFooter 
                  titleInstructor="EL INSTRUCTOR PNP" 
                  hideDetenido={true}
                />
              </div>
            )}

            {currentDocId === "rotuloEvidencias" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                
                {/* Cabecera general de la Carpeta Fiscal - Alineación estricta con tabla invisible */}
                <table style={{ width: "100%", borderCollapse: "collapse", border: "none", fontFamily: "monospace", fontSize: "11px", marginBottom: "15px", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "65%", verticalAlign: "top", border: "none", padding: "2px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                        CÓDIGO ÚNICO DE CARPETA FISCAL : <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{state.rotuloEvidencias.codigoCarpetaFiscal || "_________________________"}</span>
                      </td>
                      <td style={{ width: "35%", verticalAlign: "top", border: "none", padding: "2px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                        PRIORIDAD : <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{state.rotuloEvidencias.prioridad || "___________"}</span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ verticalAlign: "top", border: "none", padding: "2px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                        DISTRITO JUDICIAL              : <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{state.rotuloEvidencias.distritoJudicial || "_________________________"}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Gran recuadro exterior del Rótulo de Indicios */}
                <div style={{ border: "2.5px solid black", padding: "15px", backgroundColor: "#ffffff", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                  
                  <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginBottom: "15px", color: "#000", fontWeight: "bold", wordBreak: "normal" }}>
                    RÓTULO DE INDICIOS / EVIDENCIAS RECOGIDOS<br />
                    (EN CADENA DE CUSTODIA)
                  </div>

                  {/* Cuerpo del Rótulo - Estilo de máquina de escribir con tablas con anchos estrictos de columnas */}
                  <table style={{ width: "100%", borderCollapse: "collapse", border: "none", fontFamily: "monospace", fontSize: "11px", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                    <tbody>
                      <tr>
                        <td colSpan={3} style={{ border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          NÚMERO DE HALLAZGO : <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{state.rotuloEvidencias.numHallazgo || "_______"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%", border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          CANTIDAD : <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{state.rotuloEvidencias.cantidad || "___________"}</span>
                        </td>
                        <td colSpan={2} style={{ width: "50%", border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          UNIDAD DE MEDIDA : <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{state.rotuloEvidencias.unidadMedida || "__________________"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} style={{ border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          DEPENDENCIA, UNIDAD, DIVISIÓN QUE INTERVIENE : <span style={{ fontWeight: "bold", textDecoration: "underline", textTransform: "uppercase", wordBreak: "break-all" }}>{state.rotuloEvidencias.dependenciaInterviene || "________________________________"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} style={{ border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          LUGAR DE RECOLECCIÓN / DIRECCIÓN :
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} style={{ border: "none", padding: "4px 0", textDecoration: "underline", fontWeight: "bold", textTransform: "uppercase", fontSize: "11px", fontFamily: "monospace", color: "#000", wordBreak: "break-all", overflowWrap: "anywhere" }}>
                          {state.rotuloEvidencias.lugarRecoleccion || "________________________________"}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} style={{ border: "none", padding: "8px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          D: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{recolParts.day}</span> &nbsp;&nbsp;&nbsp; M: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{recolParts.month}</span> &nbsp;&nbsp;&nbsp; A: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{recolParts.year}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; HORA: <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{state.rotuloEvidencias.horaRecoleccion || "________"}</span> (0-24 HORAS)
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} style={{ border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          DESCRIPCIÓN Y CONDICIÓN :
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} style={{ border: "none", padding: "4px 0", lineHeight: "1.6", textDecoration: "underline", textUnderlineOffset: "4px", textAlign: "justify", fontWeight: "bold", textTransform: "uppercase", fontSize: "11px", fontFamily: "monospace", color: "#000", wordBreak: "break-all", overflowWrap: "anywhere" }}>
                          {state.rotuloEvidencias.descripcionCondicion || "________________________________________"}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} style={{ border: "none", padding: "8px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          TIPO DE EMBALAJE UTILIZADO : <span style={{ fontWeight: "bold", textDecoration: "underline", textTransform: "uppercase", wordBreak: "break-all" }}>{state.rotuloEvidencias.tipoEmbalaje || "__________________________________"}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Línea divisoria y pie con servidor que recolecta */}
                  <div style={{ marginTop: "20px", borderTop: "1px dashed black", paddingTop: "15px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase", fontSize: "11px", fontFamily: "monospace", color: "#000" }}>
                    SERVIDOR QUE RECOLECTA EL BIEN
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", border: "none", fontFamily: "monospace", fontSize: "11px", marginTop: "10px", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                    <tbody>
                      <tr>
                        <td colSpan={2} style={{ border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          NOMBRE COMPLETO : <span style={{ fontWeight: "bold", textDecoration: "underline", textTransform: "uppercase", wordBreak: "break-all" }}>{state.rotuloEvidencias.servidorNombres || "________________________________"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: "50%", border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          DNI N° : <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{servDniCip.dni}</span>
                        </td>
                        <td style={{ width: "50%", border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          CIP N° : <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{servDniCip.cip}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          CARGO : <span style={{ fontWeight: "bold", textDecoration: "underline", textTransform: "uppercase", wordBreak: "break-all" }}>{state.rotuloEvidencias.servidorCargo || "________________________________"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ border: "none", padding: "18px 0 10px 0", fontSize: "11.5px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          FIRMA : <span style={{ wordBreak: "break-all" }}>________________________</span>
                        </td>
                      </tr>
                       <tr>
                        <td colSpan={2} style={{ border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          FECHA DE EMBALAJE : Día: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{embParts.day}</span> &nbsp;&nbsp;&nbsp; Mes: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{embParts.month}</span> &nbsp;&nbsp;&nbsp; Año: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{embParts.year}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; HORA: <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{state.rotuloEvidencias.horaEmbalaje || "________"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ border: "none", padding: "6px 0", fontSize: "11px", fontFamily: "monospace", color: "#000", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          R.P.M. / CELULAR : <span style={{ fontWeight: "bold", textDecoration: "underline", wordBreak: "break-all" }}>{state.rotuloEvidencias.rpm || "________________________"}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {currentDocId === "cadenaCustodia" && (
              <div className="custom-font cadena-custodia-portrait" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                
                {/* Cabecera general de Carpeta Fiscal - Alineación impecable idéntica */}
                <table style={{ width: "100%", borderCollapse: "collapse", border: "none", fontFamily: "monospace", fontSize: "11px", marginBottom: "15px" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "65%", verticalAlign: "top", border: "none", padding: "2px 0", fontSize: "11px", fontFamily: "monospace", color: "#000" }}>
                        CÓDIGO ÚNICO DE CARPETA FISCAL : <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.cadenaCustodia.codigoCarpetaFiscal || "_________________________"}</span>
                      </td>
                      <td style={{ width: "35%", verticalAlign: "top", border: "none", padding: "2px 0", fontSize: "11px", fontFamily: "monospace", color: "#000" }}>
                        PRIORIDAD : <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.cadenaCustodia.prioridad || "___________"}</span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ verticalAlign: "top", border: "none", padding: "2px 0", fontSize: "11px", fontFamily: "monospace", color: "#000" }}>
                        DISTRITO JUDICIAL              : <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.cadenaCustodia.distritoJudicial || "_________________________"}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Título Principal */}
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginTop: "20px", marginBottom: "20px", textDecoration: "underline", color: "#000", fontWeight: "bold" }}>
                  CADENA DE CUSTODIA
                </div>

                {/* Recuadro de Descripción del Bien Incautado / Custodiado debajo del título */}
                <div style={{ border: "2px solid black", padding: "8px", marginBottom: "15px", fontSize: "10px", lineHeight: "1.4", fontFamily: "monospace", color: "#000", textAlign: "justify" }}>
                  <div style={{ fontWeight: "bold", borderBottom: "1px solid black", paddingBottom: "4px", marginBottom: "6px", textTransform: "uppercase" }}>
                    DESCRIPCIÓN DEL BIEN INCAUTADO / CUSTODIADO:
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", fontWeight: "bold" }}>
                    {state.cadenaCustodia.descripcionBienIncautado || "____________________________________________________________________________________________________"}
                  </div>
                </div>

                {/* Primera Tabla: Datos de embalaje y transporte inicial */}
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", fontFamily: "monospace", fontSize: "9px", textAlign: "center", marginBottom: "25px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                      <th style={{ border: "1px solid black", width: "12%", padding: "5px", fontSize: "8.5px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>FECHA D/M/A</th>
                      <th style={{ border: "1px solid black", width: "8%", padding: "5px", fontSize: "8.5px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>HORA</th>
                      <th style={{ border: "1px solid black", width: "24%", padding: "5px", fontSize: "8.5px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>NOMBRE COMPLETO DE QUIEN EMBALA BIENES INCAUTADOS</th>
                      <th style={{ border: "1px solid black", width: "24%", padding: "5px", fontSize: "8.5px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>NOMBRE COMPLETO DEL 1RO. QUE TRANSPORTA BIENES INCAUTADOS</th>
                      <th style={{ border: "1px solid black", width: "12%", padding: "5px", fontSize: "8.5px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>DNI / CIP</th>
                      <th style={{ border: "1px solid black", width: "10%", padding: "5px", fontSize: "8.5px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>CARGO / INSTITUCIÓN</th>
                      <th style={{ border: "1px solid black", width: "10%", padding: "5px", fontSize: "8.5px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>FIRMA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid black", padding: "6px", fontWeight: "bold", fontSize: "9px", fontFamily: "monospace", color: "#000" }}>
                        {state.cadenaCustodia.fechaInicial ? formatSpanishDate(state.cadenaCustodia.fechaInicial) : "D:__ M:__ A:____"}
                      </td>
                      <td style={{ border: "1px solid black", padding: "6px", fontWeight: "bold", fontSize: "9px", fontFamily: "monospace", color: "#000" }}>
                        {state.cadenaCustodia.horaInicial || "__:__"}
                      </td>
                      <td style={{ border: "1px solid black", padding: "6px", fontWeight: "bold", textAlign: "left", fontSize: "9px", textTransform: "uppercase", fontFamily: "monospace", color: "#000" }}>
                        {state.cadenaCustodia.quienEmbala || "ST2. PNP MARCOS SOLANO CABRERA"}
                      </td>
                      <td style={{ border: "1px solid black", padding: "6px", fontWeight: "bold", textAlign: "left", fontSize: "9px", textTransform: "uppercase", fontFamily: "monospace", color: "#000" }}>
                        {state.cadenaCustodia.quienTransporta || "S2. PNP ALVAREZ CHAVEZ PEDRO"}
                      </td>
                      <td style={{ border: "1px solid black", padding: "6px", fontWeight: "bold", fontSize: "9px", textTransform: "uppercase", fontFamily: "monospace", color: "#000" }}>
                        {state.cadenaCustodia.dniCipInicial || "___________"}
                      </td>
                      <td style={{ border: "1px solid black", padding: "6px", fontWeight: "bold", fontSize: "9px", textTransform: "uppercase", fontFamily: "monospace", color: "#000" }}>
                        {state.cadenaCustodia.cargoInicial || "___________"}
                      </td>
                      <td style={{ border: "1px solid black", padding: "6px", fontStyle: "italic", fontSize: "8px", fontFamily: "monospace", color: "#888" }}>
                        (Firma)
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Título de la sección de Continuidad */}
                <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "11px", fontFamily: "monospace", marginTop: "25px", marginBottom: "15px", textTransform: "uppercase", color: "#000" }}>
                  REGISTRO DE CONTINUIDAD DE CUSTODIA DE ELEMENTOS MATERIALES, EVIDENCIAS Y BIENES INCAUTADOS
                </div>

                {/* Segunda Tabla: Registro detallado de la continuidad (10 columnas estrictas con anchos fijos en porcentajes) */}
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", fontFamily: "monospace", fontSize: "8px", textAlign: "center" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                      <th style={{ border: "1px solid black", width: "10%", padding: "5px", fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>FECHA D/M/A</th>
                      <th style={{ border: "1px solid black", width: "6%", padding: "5px", fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>HORA</th>
                      <th style={{ border: "1px solid black", width: "20%", padding: "5px", fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>NOMBRE COMPLETO DE QUIEN RECIBE LOS BIENES INCAUTADOS</th>
                      <th style={{ border: "1px solid black", width: "10%", padding: "5px", fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>DNI / CIP</th>
                      <th style={{ border: "1px solid black", width: "10%", padding: "5px", fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>CARGO / INSTITUCIÓN</th>
                      <th style={{ border: "1px solid black", width: "10%", padding: "5px", fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>CÓDIGO DE RECEPCIÓN</th>
                      <th style={{ border: "1px solid black", width: "10%", padding: "5px", fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>PROPÓSITO DEL TRASLADO</th>
                      <th style={{ border: "1px solid black", width: "12%", padding: "5px", fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>AUTORIDAD QUE AUTORIZA TRASLADO O DESTINO FINAL</th>
                      <th style={{ border: "1px solid black", width: "6%", padding: "5px", fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>FIRMA</th>
                      <th style={{ border: "1px solid black", width: "6%", padding: "5px", fontSize: "8px", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>OBSERVACIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const recordsList = state.cadenaCustodia.registrosContinuidad || [];
                      const renderedRows = recordsList.map((reg, rIdx) => (
                        <tr key={`real-${rIdx}`}>
                          <td style={{ border: "1px solid black", padding: "4px", fontWeight: "bold", fontSize: "8px", fontFamily: "monospace", color: "#000" }}>
                            {reg.fecha ? formatSpanishDate(reg.fecha) : ""}
                          </td>
                          <td style={{ border: "1px solid black", padding: "4px", fontWeight: "bold", fontSize: "8px", fontFamily: "monospace", color: "#000" }}>
                            {reg.hora || ""}
                          </td>
                          <td style={{ border: "1px solid black", padding: "4px", fontWeight: "bold", textAlign: "left", fontSize: "8px", textTransform: "uppercase", fontFamily: "monospace", color: "#000" }}>
                            {reg.quienRecibe || ""}
                          </td>
                          <td style={{ border: "1px solid black", padding: "4px", fontWeight: "bold", fontSize: "8px", textTransform: "uppercase", fontFamily: "monospace", color: "#000" }}>
                            {reg.dniCip || ""}
                          </td>
                          <td style={{ border: "1px solid black", padding: "4px", fontWeight: "bold", fontSize: "8px", textTransform: "uppercase", fontFamily: "monospace", color: "#000" }}>
                            {reg.cargo || ""}
                          </td>
                          <td style={{ border: "1px solid black", padding: "4px", fontWeight: "bold", fontSize: "8px", textTransform: "uppercase", fontFamily: "monospace", color: "#000" }}>
                            {reg.codigoRecepcion || ""}
                          </td>
                          <td style={{ border: "1px solid black", padding: "4px", fontWeight: "bold", fontSize: "8px", textTransform: "uppercase", fontFamily: "monospace", color: "#000" }}>
                            {reg.propositoTraslado || ""}
                          </td>
                          <td style={{ border: "1px solid black", padding: "4px", fontWeight: "bold", fontSize: "8px", textTransform: "uppercase", fontFamily: "monospace", color: "#000" }}>
                            {reg.autoridadAutoriza || ""}
                          </td>
                          <td style={{ border: "1px solid black", padding: "4px", fontStyle: "italic", fontSize: "7px", fontFamily: "monospace", color: "#888" }}>
                            {reg.quienRecibe ? "(Firma)" : ""}
                          </td>
                          <td style={{ border: "1px solid black", padding: "4px", textAlign: "left", fontSize: "8px", textTransform: "uppercase", fontWeight: "bold", fontFamily: "monospace", color: "#000" }}>
                            {reg.observaciones || ""}
                          </td>
                        </tr>
                      ));

                      const minRows = 4;
                      const blankRowsCount = Math.max(0, minRows - recordsList.length);
                      const blankRows = Array.from({ length: blankRowsCount }).map((_, bIdx) => (
                        <tr key={`blank-${bIdx}`}>
                          <td style={{ border: "1px solid black", padding: "12px", fontSize: "8px" }}>&nbsp;</td>
                          <td style={{ border: "1px solid black", padding: "12px", fontSize: "8px" }}>&nbsp;</td>
                          <td style={{ border: "1px solid black", padding: "12px", fontSize: "8px" }}>&nbsp;</td>
                          <td style={{ border: "1px solid black", padding: "12px", fontSize: "8px" }}>&nbsp;</td>
                          <td style={{ border: "1px solid black", padding: "12px", fontSize: "8px" }}>&nbsp;</td>
                          <td style={{ border: "1px solid black", padding: "12px", fontSize: "8px" }}>&nbsp;</td>
                          <td style={{ border: "1px solid black", padding: "12px", fontSize: "8px" }}>&nbsp;</td>
                          <td style={{ border: "1px solid black", padding: "12px", fontSize: "8px" }}>&nbsp;</td>
                          <td style={{ border: "1px solid black", padding: "12px", fontSize: "8px" }}>(Firma)</td>
                          <td style={{ border: "1px solid black", padding: "12px", fontSize: "8px" }}>&nbsp;</td>
                        </tr>
                      ));

                      return [...renderedRows, ...blankRows];
                    })()}
                  </tbody>
                </table>
              </div>
            )}

            {currentDocId === "incautacionArt203" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginBottom: "20px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                  ACTA DE INCAUTACIÓN
                </div>

                <p style={{ textAlign: "justify", textIndent: "30px", fontSize: "11px", lineHeight: "1.8", margin: "15px 0", fontFamily: "monospace" }}>
                  --- En la ciudad de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.lugarCiudad || "_________"}</span>, siendo las <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.hora || "____"}</span> horas, del día <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{formatSpanishDate(police.fecha)}</span>, en el lugar ubicado en <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.lugarIncautacion || "___________________"}</span>, presentes el Instructor Policial <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.instructorGrado || "_________"} {police.instructorApellidos || "__________________"} {police.instructorNombres || "__________________"}</span>, el {detenido.tipo === "DETENIDO" ? "detenido" : detenido.tipo === "RETENIDO" ? "retenido" : detenido.tipo === "PERSONA" ? "persona" : "intervenido"} <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.apellidos ? `${detenido.apellidos}, ${detenido.nombres}` : "______________________"}</span>, con <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.edad || "___"}</span> años de edad, de nacionalidad <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.nacionalidad || "PERUANA"}</span>, natural de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.naturalDe || "__________"}</span>, estado civil <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.estadoCivil || "__________"}</span>, hijo de don <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.intervenidoPadreNombre || "_____________________"}</span> y doña <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.intervenidoMadreNombre || "_____________________"}</span>, de ocupación <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.ocupacion || "____________________"}</span>, grado de instrucción <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.gradoInstruccion || "______________"}</span>, identificado con DNI <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.dni || "__________"}</span>, domiciliado en <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.domiciliadoEn || "___________________________"}</span>, número de teléfono celular <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{detenido.celular || "_______________"}</span>
                  {state.incautacionArt203.detenidosAdicionales && state.incautacionArt203.detenidosAdicionales.length > 0 && (
                    <>
                      {state.incautacionArt203.detenidosAdicionales.map((det: any, idx: number) => {
                        const label = getLabelForTipo(det.tipo || detenido.tipo).toLowerCase();
                        return (
                          <span key={idx}>
                            , el {label} <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.apellidos ? `${det.apellidos}, ${det.nombres}` : "______________________"}</span>, con <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.edad || "___"}</span> años de edad, de nacionalidad <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.nacionalidad || "PERUANA"}</span>, natural de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.naturalDe || "__________"}</span>, estado civil <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.estadoCivil || "__________"}</span>, hijo de don <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.padreNombre || "_____________________"}</span> y doña <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.madreNombre || "_____________________"}</span>, de ocupación <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.ocupacion || "____________________"}</span>, grado de instrucción <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.gradoInstruccion || "______________"}</span>, identificado con DNI <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.dni || "__________"}</span>, domiciliado en <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.domiciliadoEn || "___________________________"}</span>, número de teléfono celular <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{det.celular || "_______________"}</span>
                          </span>
                        );
                      })}
                    </>
                  )}
                  {" "}y el testigo <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoNombre || "___________________________"}</span>, con <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoEdad || "___"}</span> años de edad, natural de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoNaturalDe || "______________"}</span>, estado civil <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoEstadoCivil || "__________"}</span>, hijo de don <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoPadreNombre || "________________________"}</span> y doña <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoMadreNombre || "________________________"}</span>, de ocupación <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoOcupacion || "_______________________"}</span>, grado de instrucción <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoInstruccion || "______________"}</span>, identificado con DNI <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoDni || "_______________"}</span>, domiciliado en <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoDomicilio || "____________________"}</span>, número de teléfono celular <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.incautacionArt203.testigoCelular || "______________"}</span>, en base al Art. 203 Inc. 3 del NCPP y lo establecido en el Acuerdo Plenario N° 5-2010/CJ-116: en se procede a levantar la presente <span style={{ fontWeight: "bold" }}>ACTA DE INCAUTACIÓN</span>, conforme el siguiente detalle:
                </p>

                <div style={{ marginTop: "15px" }}>
                  <div style={{ marginBottom: "15px" }}>
                    <p style={{ textIndent: "30px", borderBottom: "1px dashed black", paddingBottom: "12px", lineHeight: "1.6", minHeight: "100px", whiteSpace: "pre-wrap", fontSize: "11px" }}>
                      {state.incautacionArt203.detalleIncautacion || "Sustancias, especies, armas, dinero, equipos tecnológicos u otros relacionados con la flagrancia delictiva."}
                    </p>
                  </div>
                </div>

                <p style={{ marginTop: "25px", lineHeight: "1.6", textAlign: "justify", fontSize: "11px" }}>
                  --- Siendo las <span style={{ fontWeight: "bold" }}>{state.incautacionArt203.horaConcluida || "____"}</span> horas del <span style={{ fontWeight: "bold" }}>{state.incautacionArt203.fechaConcluida ? formatSpanishDate(state.incautacionArt203.fechaConcluida) : "____"}</span>, del mismo día, se da por concluida la presente diligencia y una vez leído por los participantes se procede a firmar en señal de conformidad.
                </p>

                <SignatureFooter titleInstructor="PERSONAL PNP" titleDetenido={detenido.tipo === "DETENIDO" ? "EL DETENIDO" : detenido.tipo === "RETENIDO" ? "EL RETENIDO" : detenido.tipo === "PERSONA" ? "LA PERSONA" : "EL INTERVENIDO"} />

                {state.incautacionArt203.testigoNombre && (
                  <div className="mt-8 flex justify-center postfirmas">
                    <div className="text-center flex flex-col items-center justify-end">
                      <div className="w-48 border-t border-black mb-1 mt-10"></div>
                      <span className="block uppercase">EL TESTIGO</span>
                      <span className="font-bold block">{state.incautacionArt203.testigoNombre}</span>
                      <span>DNI N° {state.incautacionArt203.testigoDni || "________"}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentDocId === "entregaRecepcionMenor" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginBottom: "20px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                  ACTA DE ENTREGA Y RECEPCIÓN DE MENOR DE EDAD
                </div>
                
                <p className="text-justify indent-8 leading-relaxed mb-4">
                  --- En la ciudad de <span className="font-bold border-b border-dotted border-black px-1">{police.lugarCiudad || "______________"}</span>, Distrito de <span className="font-bold border-b border-dotted border-black px-1">{police.distrito || "______________"}</span>, Provincia de <span className="font-bold border-b border-dotted border-black px-1">{police.provincia || "______________"}</span>, siendo las <span className="font-bold border-b border-dotted border-black px-1">{police.hora || "_______"}</span> horas, del día <span className="font-bold border-b border-dotted border-black px-1">{formatSpanishDate(police.fecha)}</span>, presentes en <span className="font-bold border-b border-dotted border-black px-1">la UNIDAD PNP de {police.distrito || "______________"}</span> el instructor PNP <span className="font-bold border-b border-dotted border-black px-1">{police.instructorGrado || "_________"} {police.instructorApellidos || "__________________"} {police.instructorNombres || "__________________"}</span>, con CIP N° <span className="font-bold border-b border-dotted border-black px-1">{police.instructorCIP || "________"}</span>, con el fin de salvaguardar y de conformidad al Principio del Interés Superior del Niño consagrado en la Constitución y las Normas de Familia vigentes, se procede a redactar la presente Acta de Entrega y Recepción del Menor de Edad en favor de su progenitor, familiar o tutor legal responsable, con el siguiente detalle
                  {state.entregaRecepcionMenor.detenidosAdicionales && state.entregaRecepcionMenor.detenidosAdicionales.length > 0 && (
                    <>
                      , registrándose también en esta diligencia a: 
                      {state.entregaRecepcionMenor.detenidosAdicionales.map((det: any, idx: number) => (
                        <span key={idx}>
                          {idx > 0 ? ", " : " "} <span className="font-bold">{det.apellidos || "___________"}, {det.nombres || "__________"}</span> (DNI N° <span className="font-bold">{det.dni || "______"}</span>, <span className="font-bold">{det.edad || "___"}</span> años, {det.sexo === "M" ? "MASCULINO" : "FEMENINO"}, nacido el {det.nacidoEl ? formatSpanishDate(det.nacidoEl) : "____"}, natural de {det.naturalDe || "____"}, domiciliado en {det.domiciliadoEn || "____"})
                        </span>
                      ))}
                    </>
                  )}:
                </p>

                <div style={{ marginTop: "12px", fontSize: "11px", lineHeight: "1.8" }}>
                  <p style={{ textAlign: "justify", textIndent: "30px", marginBottom: "8px" }}>
                    --- Se hace entrega del adolescente o menor de edad <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.menorNombreCompleto || "________________________________"}</span>, identificado(a) con DNI N° <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.menorDni || "________"}</span>, quien fuera ubicado/encontrado en la siguiente dirección o circunstancia: <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.lugarUbicado || "________________________________"}</span>, constatándose que se encuentra bajo condiciones idóneas de resguardo físico y psicológico para este acto de entrega.
                  </p>

                  <p style={{ textAlign: "justify", textIndent: "30px", marginBottom: "8px" }}>
                    --- Asimismo, se hace presente en esta sede policial el(la) señor(a) o receptor responsable <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorNombreCompleto || "________________________________"}</span>, identificado(a) con DNI N° <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorDni || "________"}</span>, de <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorEdad || "___"}</span> años de edad, natural de <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorNaturalDe || "________"}</span>, de estado civil <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorEstadoCivil || "________"}</span>, filiación de los progenitores don(ña) <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorPadre || "_______"}</span> y doña <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorMadre || "_______"}</span>, de ocupación actual <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorOcupacion || "________"}</span>, con grado de instrucción <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorInstruccion || "________"}</span>, número celular de contacto <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorCelular || "_________"}</span> y domiciliado(a) real en <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.receptorDomicilio || "________________________________"}</span>, quien acredita fehacientemente tener el parentesco, vínculo o calidad de <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>{state.entregaRecepcionMenor.parentescoConMenor || "________________"}</span> respecto del menor de edad tutelado.
                  </p>

                  <p style={{ textAlign: "justify", textIndent: "30px", marginBottom: "8px" }}>
                    --- Respecto a los pormenores del hallazgo, resguardo inmediato de la integridad física, y compromisos formales e incondicionales asumidos por el receptor, se deja expresa constancia del siguiente detalle fáctico y obligaciones de ley: <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.circunstanciasEntrega || "Detalles de cómo fue ubicado el menor de edad y el compromiso formal de protección e idoneidad física/moral asumido por el receptor."}</span>; suscribiéndose bajo la fe del juramento de protección, respondiendo ante las autoridades competentes civiles y de familia de cualquier incumplimiento regulado en las normas del Código de los Niños y Adolescentes y leyes afines.
                  </p>
                </div>

                <p style={{ marginTop: "15px", lineHeight: "1.5" }}>
                  --- Siendo las <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.horaConcluida || "____"}</span> horas del <span style={{ fontWeight: "bold" }}>{state.entregaRecepcionMenor.fechaConcluida ? formatSpanishDate(state.entregaRecepcionMenor.fechaConcluida) : "____"}</span> se da por concluido el presente acto de entrega del menor, firmando los intervinientes en duplicado en señal de fe y entera conformidad.
                </p>

                <SignatureFooter titleInstructor="EL INSTRUCTOR PNP" titleDetenido="FAMILIAR / RECEPTOR DEL MENOR" />

                {state.entregaRecepcionMenor.menorNombreCompleto && (
                  <div className="mt-12 text-center flex flex-col items-center">
                    <div className="w-48 border-t border-black mb-1"></div>
                    <span className="font-bold block uppercase">{state.entregaRecepcionMenor.menorNombreCompleto}</span>
                    <span>EL MENOR DE EDAD RESGUARDADO</span>
                  </div>
                )}
              </div>
            )}

            {currentDocId === "lacradoArma" && (
              <div className="custom-font" style={{ fontFamily: "monospace", color: "#000000", backgroundColor: "#ffffff", padding: "10px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: "16px", marginBottom: "25px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px" }}>
                  ACTA DE LACRADO DE ARMA DE FUEGO
                </div>

                <p style={{ textAlign: "justify", fontSize: "12px", lineHeight: "1.9", margin: "15px 0" }}>
                  --- En el Distrito de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.distrito || "_______________"}</span>, siendo las <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{police.hora || "____"}</span> horas del día <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{formatSpanishDate(police.fecha)}</span>, en una de las oficinas de <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.lacradoArma.oficinaPoneALavista || "DEPINCRI-SM-MM"}</span>, pone a la vista el Arma incautada al detenido: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.lacradoArma.armaIncautadaAlDetenido || "________________________________________________________"}</span>; según consta en el Acta de: <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.lacradoArma.actaConsta || "___________________________________________"}</span>; de fecha <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.lacradoArma.fechaActaConsta ? formatSpanishDate(state.lacradoArma.fechaActaConsta) : "__________"}</span> a horas <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.lacradoArma.horaActaConsta || "____"}</span>, la misma que fue suscrita por el <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.lacradoArma.suscriptoresActaConsta || "________________________________________________________"}</span>;
                </p>

                <p style={{ fontSize: "12px", fontWeight: "bold", marginTop: "20px", marginBottom: "15px" }}>
                  Donde en este acto se deja constancia lo puesto a la vista es:
                </p>

                <div style={{ minHeight: "260px", padding: "5px 0", lineHeight: "2.1", fontSize: "11px", textAlign: "justify" }}>
                  {state.lacradoArma.dejaConstanciaPuestoALavista ? (
                    <div style={{ whiteSpace: "pre-wrap", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
                      {state.lacradoArma.dejaConstanciaPuestoALavista}
                    </div>
                  ) : (
                    Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} style={{ borderBottom: "1px solid #000000", height: "24px", width: "100%" }}></div>
                    ))
                  )}
                </div>

                <p style={{ marginTop: "25px", fontSize: "12px", lineHeight: "1.9", textAlign: "justify" }}>
                  --- ACTO SEGUIDO SE PROCEDIO A INTRODUCIR LO ANTES SEÑALADO EN <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.lacradoArma.tipoEmbalajeIntroducido || "___________________________________________________"}</span>, CON LA FIRMA DEL INSTRUCTOR, SE CONCLUYE SIENDO LAS <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{state.lacradoArma.horaConcluida || "____"}</span> HORAS DEL DIA DE LA FECHA.
                </p>

                <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between", padding: "0 40px", fontSize: "12px" }}>
                  <div style={{ textAlign: "center", width: "200px" }}>
                    <div style={{ borderTop: "1px solid #000000", marginTop: "50px", marginBottom: "10px" }}></div>
                    <span style={{ fontWeight: "bold", display: "block" }}>ES CONFORME</span>
                    {detenido.nombres && (
                      <span style={{ fontSize: "10px", textTransform: "uppercase" }}>{detenido.apellidos}, {detenido.nombres}</span>
                    )}
                  </div>

                  <div style={{ textAlign: "center", width: "200px" }}>
                    <div style={{ borderTop: "1px solid #000000", marginTop: "50px", marginBottom: "10px" }}></div>
                    <span style={{ fontWeight: "bold", display: "block" }}>INSTRUCTOR PNP</span>
                    {police.instructorApellidos && (
                      <span style={{ fontSize: "10px", textTransform: "uppercase" }}>{police.instructorGrado} {police.instructorApellidos}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
                  </>
                )}
              </div>
            )}

          </div>

        </div>

        </div>
      </div>
    </div>
  );
};
