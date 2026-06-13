/**
 * Estructuras de datos oficiales en formato JSON basadas estrictamente en:
 * "Actas-en-flagrante-delito-LPDerecho.pdf" 
 * 
 * Contiene todas las casillas, campos de texto, opciones y secciones de firmas
 * sin omitir ningún campo, organizados en objetos independientes por acta.
 */

export const LP_DERECHO_EMPTY_JSON = {
  acta_intervencion_policial: {
    lugarCiudad: "",
    distrito: "",
    provincia: "",
    fecha: "",
    hora: "",
    instructorNombres: "",
    instructorApellidos: "",
    instructorGrado: "",
    instructorCIP: "",
    companiaDe: "",
    detenido: {
      nombres: "",
      apellidos: "",
      dni: "",
      naturalDe: "",
      nacidoEl: "",
      estadoCivil: "",
      ocupacion: "",
      gradoInstruccion: "",
      domiciliadoEn: "",
      celular: "",
      correo: "",
      sexo: "",
      edad: ""
    },
    circunstanciasPrecedentes: "",
    circunstanciasConcomitantes: "",
    circunstanciasPosteriores: "",
    comisariaDisposicion: "",
    lucracionDerechosArt71: false,
    actasAdjuntas: {
      registroPersonalVehicularHallazgoEntrega: false,
      lecturaDerechosDetencion: false,
      lacradoInmovilizacion: false,
      cadenaCustodiaFormatosA6yA7: false
    },
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      instructorFirma: false,
      detenidoFirma: false,
      detenidoHuellaDactilar: false
    }
  },
  acta_detencion_y_lectura_derechos: {
    lugarCiudad: "",
    fecha: "",
    hora: "",
    instructorGrado: "",
    instructorApellidos: "",
    instructorNombres: "",
    detenidoNombres: "",
    detenidoApellidos: "",
    detenidoDni: "",
    delitoInfraccionContexto: "",
    derechosLeidos: {
      hacerValerDerechosPorAbogado: false,
      conocerCargosYMotivoDetencion: false,
      designarPersonaOInstitucionAComunicar: false,
      asistenciaPorAbogadoDefensor: false,
      abstenerseDeclaraPresenciaAbogado: false,
      noMedioCoactivoIntimidatorioDignidad: false,
      examenPorMedicoLegistaUOtroProfesional: false
    },
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      instructorFirma: false,
      detenidoEnteradoFirma: false,
      detenidoHuellaDactilar: false
    }
  },
  constancia_buen_trato: {
    lugarCiudad: "",
    fecha: "",
    hora: "",
    detenidoNombres: "",
    detenidoApellidos: "",
    detenidoDni: "",
    declaraBuenTratoFisicoPsicologico: false,
    respetoDignidadYDerechosHumanos: false,
    fechaFirma: "",
    horaFirma: "",
    firmas: {
      instructorFirma: false,
      detenidoFirma: false,
      detenidoHuellaDactilar: false
    }
  },
  acta_comunicacion_telefonica: {
    lugarCiudad: "",
    fecha: "",
    hora: "",
    equipoEmpleado: "", // Fijo, Celular
    marcaCaracteristica: "",
    propiedadDe: "",
    personalOperadorPNP: "",
    numeroLlamado: "",
    operadorLlamado: "",
    fechaHoraEnlace: "",
    recibeLlamadaFamiliar: "",
    parentescoVinculo: "",
    duracion: {
      horas: "",
      minutos: "",
      segundos: ""
    },
    grabacionLlamada: false,
    capturaPantalla: false,
    resultadoComunicacionLlamada: "",
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      instructorFirma: false,
      detenidoFirma: false,
      detenidoHuellaDactilar: false
    }
  },
  acta_detencion_menor_edad: {
    lugarCiudad: "",
    fecha: "",
    hora: "",
    menorNombres: "",
    menorApellidos: "",
    menorNaturalDe: "",
    menorNacidoEl: "",
    menorEstadoCivil: "",
    menorOcupacion: "",
    menorGradoInstruccion: "",
    menorDni: "",
    menorDomicilio: "",
    menorCelular: "",
    menorCorreo: "",
    menorSexo: "",
    menorEdad: "",
    pertenecienteA: "",
    padreNombre: "",
    madreNombre: "",
    motivoInfraccionLeyes: "",
    contactoPadreTutor: {
      nombre: "",
      vinculo: "",
      dni: "",
      celular: "",
      observaciones: ""
    },
    contactoFiscalFamilia: {
      nombre: "",
      fiscalia: "",
      cargo: "",
      celular: "",
      observaciones: ""
    },
    contactoJuezInvestigacionPreparatoria: {
      nombre: "",
      juzgado: "",
      cargo: "",
      celular: "",
      observaciones: ""
    },
    celularUsadoParaComunicaciones: {
      numero: "",
      operador: "",
      marca: "",
      propiedad: ""
    },
    garantiasMenorLeidas1al18: false,
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      instructorFirma: false,
      menorDetenidoFirma: false,
      menorHuellaDactilar: false,
      padreTutorPresenteFirma: false
    }
  },
  acta_registro_personal_e_incautacion: {
    lugarCiudad: "",
    distrito: "",
    provincia: "",
    fecha: "",
    hora: "",
    instructorNombres: "",
    instructorApellidos: "",
    instructorGrado: "",
    instructorCIP: "",
    detenidoNombres: "",
    detenidoApellidos: "",
    detenidoDni: "",
    solicitudExhibicionEntrega: {
      realizada: false,
      positivo: false,
      negativo: false,
      bienEntregadoDescripcion: ""
    },
    razonesRegistroPersonal: "",
    bienesEncontradosUbicacionDescripcion: "",
    apremianteSexoDistinto: {
      requerido: false,
      presenciaDePersona: "",
      razonUrgenciaJustificacion: ""
    },
    filmacionMedioEmpleado: {
      filmado: false,
      medioDetalle: ""
    },
    lugarLevantamientoActa: "",
    razonesNoLevantamientoEnLugarIntervencion: "",
    negativaFirmarRazon: "",
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      instructorFirma: false,
      detenidoFirma: false,
      detenidoHuellaDactilar: false,
      testigoFirma: false,
      testigoNombreDni: ""
    }
  },
  acta_registro_vehicular: {
    lugarCiudad: "",
    distrito: "",
    provincia: "",
    fecha: "",
    hora: "",
    personasHalladasEnVehiculo: "",
    solicitudExhibicionCopiasDocumentos: {
      realizada: false,
      positivo: false,
      negativo: false,
      documentosExhibidos: ""
    },
    caracteristicasVehiculo: {
      placaNro: "",
      marca: "",
      color: "",
      modelo: "",
      anioFabricacion: "",
      otrosDetalles: ""
    },
    razonesRegistroVehicular: "",
    testigoPresencial: {
      nombres: "",
      dni: "",
      domicilio: "",
      celular: "",
      parentescoRelacionConIntervenido: ""
    },
    bienesEncontradosUbicacionDescripcion: "",
    filmacionMedioEmpleado: {
      filmado: false,
      medioDetalle: ""
    },
    lugarLevantamientoActa: "",
    razonesNoLevantamientoEnLugarIntervencion: "",
    negativaFirmarRazon: "",
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      instructorFirma: false,
      conductorFirma: false,
      conductorHuellaDactilar: false,
      testigoFirma: false
    }
  },
  acta_situacion_vehicular: {
    datosGenerales: {
      placa: "",
      clase: "",
      color: "",
      marcaModelo: "",
      motorNo: "",
      serieChasis: "",
      estadoConservacion: "",
      tipoVehiculo: "" // MAYOR, MENOR
    },
    partesExteriores: {
      faroGrandeDelantero: "", // BUENO, MALO, FALTA, NO_REGISTRA
      faroChicoDelantero: "",
      farosPosteriores: "",
      biseles: "",
      limpiaParabrisas: "",
      llantas: "",
      vasos: "",
      espejoExterior: "",
      chapas: "",
      antenas: "",
      parachoques: "",
      llantasRepuesto: "",
      parabrisas: ""
    },
    partesInteriores: {
      tablero: "",
      chapaContacto: "",
      radio: "",
      encendedor: "",
      pisos: "",
      manijas: "",
      ceniceros: "",
      parasoles: "",
      espejoInterior: "",
      coderas: "",
      gata: "",
      llaveRuedas: "",
      parlante: "",
      asientos: ""
    },
    motorAccesorios: {
      motor: "",
      bateria: "",
      arrancador: "",
      carburador: "",
      distribuidor: "",
      tapaAceite: "",
      chicotes: "",
      radiador: "",
      alternador: "",
      purificador: "",
      bobina: "",
      bujias: "",
      varillaAceite: ""
    },
    descripcionEspecificaADetalle: "",
    perennizacionMedio: "",
    observaciones: "",
    negativaFirmarRazon: "",
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      entregueConformeFirma: false,
      recibiConformeFirma: false
    }
  },
  acta_registro_equipajes_bultos: {
    lugarCiudad: "",
    distrito: "",
    provincia: "",
    fecha: "",
    hora: "",
    solicitudExhibicionEquipaje: {
      realizada: false,
      positivo: false,
      negativo: false,
      descripcionBultoExhibido: ""
    },
    vehiculoAsociadoEquipaje: {
      placa: "",
      marca: "",
      color: "",
      modelo: "",
      anioFabricacion: "",
      otrosDetalles: ""
    },
    razonesRegistroBulto: "",
    testigoPresencial: {
      nombres: "",
      dni: "",
      domicilio: "",
      celular: "",
      parentescoRelacionConIntervenido: ""
    },
    bienesEncontradosUbicacionDescripcion: "",
    filmacionMedioEmpleado: {
      filmado: false,
      medioDetalle: ""
    },
    lugarLevantamientoActa: "",
    razonesNoLevantamientoEnLugarIntervencion: "",
    negativaFirmarRazon: "",
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      instructorFirma: false,
      propietarioFirma: false,
      propietarioHuellaDactilar: false,
      testigoFirma: false
    }
  },
  acta_recepcion: {
    lugarCiudad: "",
    distrito: "",
    provincia: "",
    fecha: "",
    hora: "",
    personaQueEntrega: {
      nombres: "",
      apellidos: "",
      dni: "",
      sexo: "",
      edad: "",
      domicilio: "",
      telefono: "",
      celular: "",
      parentescoRelacionReferenciaConDetenido: "",
      nacionalidad: "",
      gradoInstruccion: "",
      ocupacion: "",
      centroTrabajo: ""
    },
    razonesPorLasQueSeRecibeOCanalizaEntrega: "",
    descripcionTecnicaBienRecibido: "",
    perennizacionMedioRecep: {
      filmado: false,
      fotografiado: false,
      detalleMedio: ""
    },
    funcionarioPNPOferenteCustodia: "",
    negativaFirmarRazon: "",
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      instructorRecibeFirma: false,
      personaEntregaFirma: false,
      personaEntregaHuellaDactilar: false
    }
  },
  acta_incautacion_flagrancia_delictiva: {
    departamento: "",
    provincia: "",
    lugarCiudad: "",
    fecha: "",
    hora: "",
    identificacionPersonalPNPJefatura: "",
    lugarIncautacionExacto: "",
    descripcionBienObjetoIncautado: "",
    individualizacionBienMarcasRotulado: "",
    perennizacionMedioRecep: {
      filmacion: false,
      fotografia: false,
      otros: false,
      otrosDetalle: ""
    },
    causasExcepcionalesNoLevantarEnLugar: "",
    negativaFirmarRazon: "",
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      instructorFirma: false,
      detenidoFirma: false,
      detenidoHuellaDactilar: false
    }
  },
  parte_ocurrencia_policial: {
    lugarCiudad: "",
    distrito: "",
    provincia: "",
    fecha: "",
    hora: "",
    detallesOcurrenciaHechos: "",
    medidasAdoptadasPatrullaje: "",
    horaConcluida: "",
    fechaConcluida: "",
    firmas: {
      instructorPNP: false
    }
  }
};
