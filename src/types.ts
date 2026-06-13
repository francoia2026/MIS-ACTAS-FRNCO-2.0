/**
 * Definición de tipos de datos para las Actas Policiales de Perú.
 */

export interface SharedPoliceMetadata {
  lugarCiudad: string;
  distrito: string;
  provincia: string;
  fecha: string;
  hora: string;
  instructorNombres: string;
  instructorApellidos: string;
  instructorGrado: string;
  instructorCIP: string;
  companiaDe: string;
  unidadPolicial?: string;
}

export interface SharedDetenidoMetadata {
  nombres: string;
  apellidos: string;
  dni: string;
  naturalDe: string;
  nacidoEl: string;
  estadoCivil: string;
  ocupacion: string;
  gradoInstruccion: string;
  domiciliadoEn: string;
  celular: string;
  correo: string;
  sexo: "M" | "F";
  edad: string;
  tipo?: "DETENIDO" | "RETENIDO" | "INTERVENIDO" | "PERSONA";
  nacionalidad?: string;
}

// 1. ACTA DE INTERVENCION POLICIAL
export interface ActaIntervencion {
  circunstanciasPrecedentes: string;
  circunstanciasConcomitantes: string;
  circunstanciasPosteriores: string;
  horaConcluida: string;
  fechaConcluida: string;
  registroPersonalRealizado: boolean;
  lecturaDerechosRealizado: boolean;
  lacradoInmovilizacionRealizado: boolean;
  cadenaCustodiaRealizado: boolean;
  detenidosAdicionales?: SharedDetenidoMetadata[];
}

// 2. ACTA DE DETENCION
export interface ActaDetencion {
  delitoFlagranteContexto: string; // delito o infracción por la cual es capturado
  horaConcluida: string;
  fechaConcluida: string;
}

// 3. CONSTANCIA DE BUEN TRATO
export interface ConstanciaBuenTrato {
  recibioBuenTrato: boolean;
  horaFirma: string;
  fechaFirma: string;
}

// 4. ACTA DE COMUNICACION TELEFONICA
export interface ActaComunicacionTelefonica {
  equipoEmpleado: "Fijo" | "Celular";
  telFijo: string;
  telCelular: string;
  garantizaDerechoDe: string;
  celularOperador: string;
  marcaCaracteristica: string;
  propiedadDe: string;
  numeroLlamado: string;
  operadorLlamado: string;
  fechaHoraLlamada: string;
  recibeLlamada: string;
  parentesco: string;
  duracionHoras: string;
  duracionMin: string;
  duracionSeg: string;
  grabacionLlamada: "SI" | "NO";
  capturaPantalla: "SI" | "NO";
  resultadoComunicacion: string; // llamadas realizadas de forma (1,2..) resultando que...
  horaConcluida: string;
  fechaConcluida: string;
}

// 5. ACTA DE DETENCION DE MENOR DE EDAD
export interface ActaDetencionMenor {
  pertenecienteA: string; // institución, colegio, etc.
  padreNombre: string;
  madreNombre: string;
  motivoInfraccionLeyes: string; // hecho por el cual se le detiene
  contactoPadreNombre: string;
  contactoPadreVinculo: string;
  contactoPadreDniEnabled: "SI" | "NO";
  contactoPadreDni: string;
  contactoPadreCelular: string;
  contactoPadreObs: string;
  contactoFiscalNombre: string;
  contactoFiscalia: string;
  contactoFiscalCargo: string;
  contactoFiscalCelular: string;
  contactoFiscalObs: string;
  contactoJuezNombre: string;
  contactoJuezJuzgado: string;
  contactoJuezCargo: string;
  contactoJuezCelular: string;
  contactoJuezObs: string;
  numCelularUsado: string;
  operadorCelularUsado: string;
  marcaCelularUsada: string;
  propiedadCelularUsada: string;
  horaConcluida: string;
  fechaConcluida: string;
  detenidosAdicionales?: SharedDetenidoMetadata[];
}

// 6. ACTA DE REGISTRO PERSONAL (ACTA DE REGISTRO PERSONAL E INCAUTACIÓN)
export interface ActaRegistroPersonal {
  lugarRegistro: string;
  hijoDeDon: string;
  hijoDeDona: string;
  solicitadoExhibirBienes: string;
  personalLlevaACabo: string;
  drogasInsumosCheck: boolean;
  drogasInsumosDetalle: string;
  billetesMonedasCheck: boolean;
  billetesMonedasDetalle: string;
  municionArmasCheck: boolean;
  municionArmasDetalle: string;
  otrosInteresCheck: boolean;
  otrosInteresDetalle: string;
  dejaConstancia: string;
  horaConcluida: string;
  fechaConcluida: string;
}

// 7. ACTA DE REGISTRO VEHICULAR
export interface ActaRegistroVehicular {
  personasEnVehiculo: string;
  solicitudExhibicion: "POSITIVO" | "NEGATIVO";
  descripcionBienExhibido: string;
  placa: string;
  marca: string;
  color: string;
  modelo: string;
  anioFabricacion: string;
  otrosDetalleVehiculo: string;
  razonesRegistro: string;
  testigoNombres: string;
  testigoIdentificadoDni: string;
  testigoDomiciliadoEn: string;
  testigoCelular: string;
  testigoParentesco: string;
  bienesObjetoRegistro: string; // ubicación y descripción
  filmacionMedio: string;
  razonesNoLevantarEnLugar: string;
  negativaFirmarRazon: string;
  horaConcluida: string;
  fechaConcluida: string;
  detenidosAdicionales?: SharedDetenidoMetadata[];
}

// 8. ACTA DE SITUACION VEHICULAR
export interface ActaSituacionVehicular {
  datosGenerales: {
    placa: string;
    clase: string; // clase de vehículo mayor/menor
    color: string;
    marcaModelo: string;
    motorNo: string;
    serieChasis: string;
    estadoConservacion: string;
    tipoVehiculo: "MAYOR" | "MENOR";
  };
  partesExteriores: {
    faroGrandeDelantero: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    faroChicoDelantero: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    farosPosteriores: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    biseles: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    limpiaParabrisas: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    llantas: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    vasos: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    espejoExterior: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    chapas: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    antenas: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    parachoques: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    llantasRepuesto: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    parabrisas: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
  };
  partesInteriores: {
    tablero: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    chapaContacto: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    radio: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    encendedor: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    pisos: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    manijas: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    ceniceros: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    parasoles: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    espejoInterior: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    coderas: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    gata: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    llaveRuedas: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    parlante: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
    asientos: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "SI" | "NO";
  };
  motorAccesorios: {
    motor: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    bateria: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    arrancador: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    carburador: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    distribuidor: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    tapaAceite: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    chicotes: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    radiador: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    alternador: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    purificador: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    bobina: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    bujias: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
    varillaAceite: "BUENO" | "MALO" | "FALTA" | "NO_REGISTRA" | "FUNCIONA" | "NO_FUNCIONA";
  };
  descripcionEspecificaCompleta: string; // descripción detallada partes
  perennizacionMedio: string; // filmado y medio utilizado
  observaciones: string;
  negativaFirmarRazon: string;
  fechaConcluida: string;
  horaConcluida: string;
  intervenidoPadreNombre?: string;
  intervenidoMadreNombre?: string;
  lugarInspeccion?: string;
  detenidosAdicionales?: SharedDetenidoMetadata[];
}

// 9. ACTA DE REGISTRO DE EQUIPAJES O BULTOS
export interface ActaRegistroEquipajes {
  solicitudExhibicion: "POSITIVO" | "NEGATIVO";
  descripcionBienExhibido: string;
  placaVehiculoAsociado: string;
  marcaVehiculoAsociado: string;
  colorVehiculoAsociado: string;
  modeloVehiculoAsociado: string;
  anioVehiculoAsociado: string;
  otrosVehiculoAsociado: string;
  razonesRegistro: string;
  testigoNombres: string;
  testigoIdentificadoDni: string;
  testigoDomiciliadoEn: string;
  testigoCelular: string;
  testigoParentesco: string;
  apremianteSexoDistinto: string;
  bienesObjetoRegistro: string;
  filmacionMedio: string;
  razonesNoLevantarEnLugar: string;
  negativaFirmarRazon: string;
  horaConcluida: string;
  fechaConcluida: string;
}

// 10. ACTA DE RECEPCION
export interface ActaRecepcion {
  personaNombres: string;
  personaApellidos: string;
  personaGradoInstruccion: string;
  personaDni: string;
  personaSexo: "M" | "F";
  personaEdad: string;
  personaTelefono: string;
  personaCelular: string;
  personaParentescoReferencia: string;
  personaDomicilio: string;
  personaNacionalidad: string;
  personaOcupacion: string;
  personaTrabajo: string;
  razonesEntrega: string;
  descripcionBienObjeto: string;
  perennizacionRecepcion: string;
  funcionarioCustodia: string;
  negativaFirmarRazon: string;
  horaConcluida: string;
  fechaConcluida: string;
}

// 12. PARTE DE OCURRENCIA
export interface ActaOcurrencia {
  asunto: string;
  detallesOcurrencia: string;
  medidasAdoptadas: string;
  horaConcluida: string;
  fechaConcluida: string;
}

// 13. RÓTULO DE INDICIOS / EVIDENCIAS / ELEMENTOS RECOGIDOS (EN CADENA DE CUSTODIA)
export interface ActaRotuloEvidencias {
  codigoCarpetaFiscal: string;
  prioridad: string;
  distritoJudicial: string;
  numHallazgo: string;
  cantidad: string;
  unidadMedida: string;
  dependenciaInterviene: string;
  lugarRecoleccion: string;
  fechaRecoleccion: string; // YYYY-MM-DD
  horaRecoleccion: string; // HH:MM
  descripcionCondicion: string;
  tipoEmbalaje: string;
  servidorNombres: string;
  servidorDniCip: string;
  servidorCargo: string;
  fechaEmbalaje: string; // YYYY-MM-DD
  horaEmbalaje: string; // HH:MM
  rpm: string;
}

// 14. CADENA DE CUSTODIA
export interface CadenaCustodiaRegistro {
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  quienRecibe: string;
  dniCip: string;
  cargo: string;
  codigoRecepcion: string;
  propositoTraslado: string;
  autoridadAutoriza: string;
  observaciones: string;
}

export interface ActaCadenaCustodia {
  codigoCarpetaFiscal: string;
  distritoJudicial: string;
  prioridad: string;
  descripcionBienIncautado?: string;
  quienEmbala: string;
  quienTransporta: string;
  dniCipInicial: string;
  cargoInicial: string;
  fechaInicial: string; // YYYY-MM-DD
  horaInicial: string; // HH:MM
  registrosContinuidad: CadenaCustodiaRegistro[];
}

// 15. ACTA DE INCAUTACIÓN (ART. 203 INC. 3 NCPP / PLENARIO 5-2010)
export interface ActaIncautacionArt203 {
  vincularConPrincipal?: boolean;
  situacionPersona?: "INTERVENIDO" | "DETENIDO" | "RETENIDO" | "PERSONA";
  lugarIncautacion: string;
  intervenidoNombre: string;
  intervenidoEdad: string;
  intervenidoNaturalDe: string;
  intervenidoEstadoCivil: string;
  intervenidoPadreNombre: string;
  intervenidoMadreNombre: string;
  intervenidoOcupacion: string;
  intervenidoInstruccion: string;
  intervenidoDni: string;
  intervenidoDomicilio: string;
  intervenidoCelular: string;
  testigoNombre: string;
  testigoEdad: string;
  testigoNaturalDe: string;
  testigoEstadoCivil: string;
  testigoPadreNombre: string;
  testigoMadreNombre: string;
  testigoOcupacion: string;
  testigoInstruccion: string;
  testigoDni: string;
  testigoDomicilio: string;
  testigoCelular: string;
  detalleIncautacion: string;
  horaConcluida: string;
  fechaConcluida: string;
  detenidosAdicionales?: SharedDetenidoMetadata[];
}

// 16. ACTA DE ENTREGA Y RECEPCIÓN DE MENOR DE EDAD
export interface ActaEntregaRecepcionMenor {
  lugarUbicado: string;
  receptorNombreCompleto: string;
  receptorEdad: string;
  receptorNaturalDe: string;
  receptorEstadoCivil: string;
  receptorPadre: string;
  receptorMadre: string;
  receptorOcupacion: string;
  receptorInstruccion: string;
  receptorDni: string;
  receptorDomicilio: string;
  receptorCelular: string;
  parentescoConMenor: string;
  menorNombreCompleto: string;
  menorDni: string;
  circunstanciasEntrega: string;
  horaConcluida: string;
  fechaConcluida: string;
  detenidosAdicionales?: SharedDetenidoMetadata[];
}

// 17. ACTA DE LACRADO DE ARMA DE FUEGO
export interface ActaLacradoArma {
  oficinaPoneALavista: string;
  armaIncautadaAlDetenido: string;
  actaConsta: string;
  fechaActaConsta: string;
  horaActaConsta: string;
  suscriptoresActaConsta: string;
  dejaConstanciaPuestoALavista: string;
  tipoEmbalajeIntroducido: string;
  horaConcluida: string;
}

// Global Document State
export interface ActasState {
  police: SharedPoliceMetadata;
  detenido: SharedDetenidoMetadata;
  activeDocuments: string[]; // IDS of documents selected for generation
  currentDocId: string; // Selected document ID for editing/viewing
  intervencion: ActaIntervencion;
  detencion: ActaDetencion;
  buenTrato: ConstanciaBuenTrato;
  comunicacionTelefonica: ActaComunicacionTelefonica;
  detencionMenor: ActaDetencionMenor;
  registroPersonal: ActaRegistroPersonal;
  registroVehicular: ActaRegistroVehicular;
  situacionVehicular: ActaSituacionVehicular;
  registroEquipajes: ActaRegistroEquipajes;
  recepcion: ActaRecepcion;
  ocurrencia: ActaOcurrencia;
  rotuloEvidencias: ActaRotuloEvidencias;
  cadenaCustodia: ActaCadenaCustodia;
  incautacionArt203: ActaIncautacionArt203;
  entregaRecepcionMenor: ActaEntregaRecepcionMenor;
  lacradoArma: ActaLacradoArma;
}

export interface DocumentInfo {
  id: string;
  title: string;
  pages: string;
  cppArticle: string;
}

export interface PhoneUser {
  phoneNumber?: string;
  tokens?: number;
  tokens_disponibles?: number;
  autorizado?: boolean;
  user_gemini_api_key?: string;
}
