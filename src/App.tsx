import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { DocumentRenderer } from "./components/DocumentRenderer";
import { INITIAL_STATE, LISTA_DOCUMENTOS } from "./templatesData";
import { LP_DERECHO_EMPTY_JSON } from "./lpTemplatesSchema";
import { ActasState, SharedPoliceMetadata, SharedDetenidoMetadata } from "./types";
import { Menu, ShieldAlert, Printer, RefreshCw, FileText, CheckCircle, ShieldOff, Coins, Key, Sparkles, AlertCircle, Lock, PlusCircle, Camera, AlertTriangle, X, RotateCw, Video, VideoOff, Database, Smartphone, UserCheck, Edit3, Eye, Moon, Sun, Trash2, MessageSquare, LogOut, Cloud, CloudOff, Mic, Pause, Play, Square, Volume2 } from "lucide-react";
import { PhoneUser } from "./types";
import {
  seedDefaultUsersIfNeeded,
  subscribeToUsers,
  saveUserToFirebase,
  deleteUserFromFirebase,
  loadUserDraft,
  saveUserDraft
} from "./lib/firebaseSync";

// 2. LISTA BLANCA DE CORREOS - DESACTIVADA A PETICIÓN DEL USUARIO PARA DEJAR REINANTE LA AUTORIZACIÓN POR KEY/TOKENS LOCALES
export const usuariosAutorizados: string[] = [];

export default function App() {
  const [state, setState] = useState<ActasState>(() => {
    try {
      const saved = sessionStorage.getItem("pnp_actas_state");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading state from sessionStorage:", e);
    }
    return INITIAL_STATE;
  });

  React.useEffect(() => {
    try {
      sessionStorage.setItem("pnp_actas_state", JSON.stringify(state));
    } catch (e) {
      console.error("Error saving state to sessionStorage:", e);
    }
  }, [state]);

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [showMenu, setShowMenu] = useState<boolean>(false);

  // Persistent Dark Mode state from localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("darkMode", String(next));
      return next;
    });
  };

  // States for Camera Conversion of physical document photos
  const [customA4Html, setCustomA4Html] = useState<string | null>(null);
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [cargoError, setCargoError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Live Camera states
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Video Ref to attach stream
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Voice Recorder States
  const [showVoiceRecorderModal, setShowVoiceRecorderModal] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recorderError, setRecorderError] = useState<string | null>(null);
  const [isConvertingAudio, setIsConvertingAudio] = useState<boolean>(false);
  const [targetDocType, setTargetDocType] = useState<string>(() => "intervencion");

  // Keep a ref to clean up recording timers and media recorders
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<any>(null);

  const startRecording = async () => {
    setRecorderError(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm" };
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all track streams to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // Get chunks every 250ms
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("No se pudo iniciar la grabación de voz:", err);
      setRecorderError("No se pudo acceder al micrófono. Asegúrate de otorgar los permisos correspondientes.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const convertRecordedAudio = async () => {
    if (!audioBlob) return;
    setIsConvertingAudio(true);
    setRecorderError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result as string;

          const response = await fetch("/api/convert-audio-document", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              docType: targetDocType,
              audio: base64Audio,
              police: state.police,
              detenido: state.detenido,
              docState: state[targetDocType as keyof ActasState],
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Error al procesar el audio.");
          }

          const data = await response.json();

          if (targetDocType === "intervencion") {
            if (data.precedentes) handleUpdateDocField("intervencion", "circunstanciasPrecedentes", data.precedentes);
            if (data.concomitantes) handleUpdateDocField("intervencion", "circunstanciasConcomitantes", data.concomitantes);
            if (data.posteriores) handleUpdateDocField("intervencion", "circunstanciasPosteriores", data.posteriores);
          } else {
            const textResult = data.result || "";
            if (!textResult) {
              throw new Error("La IA no devolvió redacción para el acta.");
            }

            switch (targetDocType) {
              case "detencion":
                handleUpdateDocField("detencion", "delitoFlagranteContexto", textResult);
                break;
              case "comunicacionTelefonica":
                handleUpdateDocField("comunicacionTelefonica", "resultadoComunicacion", textResult);
                break;
              case "detencionMenor":
                handleUpdateDocField("detencionMenor", "motivoInfraccionLeyes", textResult);
                break;
              case "registroPersonal":
                handleUpdateDocField("registroPersonal", "bienesObjetoRegistro", textResult);
                break;
              case "registroVehicular":
                handleUpdateDocField("registroVehicular", "bienesObjetoRegistro", textResult);
                break;
              case "registroEquipajes":
                handleUpdateDocField("registroEquipajes", "bienesObjetoRegistro", textResult);
                break;
              case "recepcion":
                handleUpdateDocField("recepcion", "descripcionBienObjeto", textResult);
                break;
              case "incautacion":
                handleUpdateDocField("incautacion", "individualizacionBien", textResult);
                break;
              case "situacionVehicular":
                handleUpdateDocField("situacionVehicular", "descripcionEspecificaCompleta", textResult);
                break;
              default:
                break;
            }
          }

          setState((prev) => ({
            ...prev,
            currentDocId: targetDocType,
          }));

          setShowVoiceRecorderModal(false);
          alert(`¡Audio procesado con éxito! Se ha redactado y actualizado el documento "${LISTA_DOCUMENTOS.find(d => d.id === targetDocType)?.title || targetDocType}".`);
          
          setAudioUrl(null);
          setAudioBlob(null);
          setRecordingTime(0);
        } catch (innerErr: any) {
          console.error(innerErr);
          setRecorderError(innerErr.message || "Error al conectar con el motor de transcripción IA.");
        } finally {
          setIsConvertingAudio(false);
        }
      };
    } catch (err: any) {
      console.error(err);
      setRecorderError(err.message || "Error general al codificar el audio.");
      setIsConvertingAudio(false);
    }
  };

  React.useEffect(() => {
    // Si cambia el ID del acta actual o el estado de los documentos, restablecemos para ver el formulario normal
    setCustomA4Html(null);
    setCargoError(null);
  }, [state.currentDocId]);

  const processImageData = async (base64String: string) => {
    setIsLoadingImage(true);
    setCustomA4Html(null);
    setCargoError(null);
    setUploadedPhotoBase64(base64String);
    // Cambiar automáticamente a la pestaña de vista previa para ver el estado de carga y redacción instantáneo
    setActiveTab("preview");

    try {
      const response = await fetch("/api/convert-photo-parte", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: base64String })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al procesar la imagen con Gemini.");
      }

      const data = await response.json();
      const respuestaIA = data.result;

      // Guardamos en estado para la persistencia React-safe
      setCustomA4Html(respuestaIA);

      // Inyección DOM directa tal como lo requiere exactamente la directiva
      setTimeout(() => {
        const container = document.getElementById("vista-previa-a4");
        if (container) {
          container.innerHTML = respuestaIA;
        }
      }, 100);

    } catch (error: any) {
      console.error(error);
      setCargoError(error.message || "Error al conectar con la API de conversión.");
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await processImageData(base64String);
        if (e.target) {
          e.target.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setCargoError("Fallo al leer la foto seleccionada.");
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const startCamera = async (currentFacing: "environment" | "user" = facingMode) => {
    try {
      setCameraError(null);
      setIsCameraActive(false);

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraActive(true);

      // Bind to video ref when it mounts
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.error("Error playing video stream:", err);
          });
        }
      }, 200);

    } catch (err: any) {
      console.error("getUserMedia error:", err);
      let errMsg = "No se pudo acceder a la cámara.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errMsg = "Permiso de cámara denegado. Por favor, habilite el acceso de cámara en los permisos de su navegador o use la opción de 'Subir Archivo'.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errMsg = "No se detectó ninguna cámara física instalada en este dispositivo.";
      } else {
        errMsg = `Error de acceso a la cámara: ${err.message || err}`;
      }
      setCameraError(errMsg);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleFacingMode = () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the current frame of the video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

        // Auto close and clean the stream
        stopCamera();
        setShowCameraModal(false);

        // Process the captured image with generative AI
        await processImageData(dataUrl);
      }
    } catch (err: any) {
      console.error("Capture photo error:", err);
      setCargoError("Fallo al capturar la foto de la cámara.");
    } finally {
      setIsCapturing(false);
    }
  };

  // Sesión local para mantener estados comunes, cargada desde localStorage "pnp_phone_session"
  const [currentUser, setCurrentUser] = useState<PhoneUser>(() => {
    try {
      const session = localStorage.getItem("pnp_phone_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed && parsed.phoneNumber && (parsed.tokens || 0) <= 0) {
          localStorage.removeItem("pnp_phone_session");
          return {};
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error al cargar la sesión", e);
    }
    return {}; // Vacío significa pantalla de bloqueo activa
  });

  // Lista global de usuarios administrada en localStorage
  const [users, setUsers] = useState<PhoneUser[]>(() => {
    try {
      const savedUsers = localStorage.getItem("pnp_users");
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        // Garantizar que los administradores requeridos existan en la lista
        const adminIds = ["952171449FR", "931615705JR"];
        let updated = false;
        adminIds.forEach(adminPhone => {
          if (!parsed.some((u: any) => u.phoneNumber === adminPhone)) {
            parsed.push({ phoneNumber: adminPhone, tokens: 9999, autorizado: true, user_gemini_api_key: "" });
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem("pnp_users", JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error al cargar usuarios", e);
    }
    const defaults: PhoneUser[] = [
      { phoneNumber: "952171449FR", tokens: 9999, autorizado: true, user_gemini_api_key: "" },
      { phoneNumber: "931615705JR", tokens: 9999, autorizado: true, user_gemini_api_key: "" },
      { phoneNumber: "999999999", tokens: 9999, autorizado: true, user_gemini_api_key: "" },
      { phoneNumber: "987654321", tokens: 15, autorizado: true, user_gemini_api_key: "" },
      { phoneNumber: "900100200", tokens: 5, autorizado: true, user_gemini_api_key: "" }
    ];
    localStorage.setItem("pnp_users", JSON.stringify(defaults));
    return defaults;
  });

  // El saldo de tokens lee del usuario actual si está logeado. Si no, usa el saldo global o un default.
  const saldoActas = currentUser?.tokens !== undefined ? currentUser.tokens : 0;

  const updateSaldoActas = (val: number | ((prev: number) => number)) => {
    if (!currentUser.phoneNumber) return;
    let nextTokens = 0;
    if (typeof val === "function") {
      nextTokens = val(currentUser.tokens || 0);
    } else {
      nextTokens = val;
    }
    nextTokens = Math.max(0, nextTokens);
    
    const updatedUser = { ...currentUser, tokens: nextTokens };
    setCurrentUser(updatedUser);
    localStorage.setItem("pnp_phone_session", JSON.stringify(updatedUser));

    // Guardar saldo actualizado directamente en Firebase
    saveUserToFirebase(updatedUser).catch((e) => console.error("Error guardando saldo en Firebase:", e));

    setUsers((prevUsers) => {
      const uList = prevUsers.map(u => u.phoneNumber === currentUser.phoneNumber ? { ...u, tokens: nextTokens } : u);
      localStorage.setItem("pnp_users", JSON.stringify(uList));
      return uList;
    });
  };

  const setSaldoActas = updateSaldoActas;
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showRecargaModal, setShowRecargaModal] = useState(false);
  const [deleteConfirmPhone, setDeleteConfirmPhone] = useState<string | null>(null);

  // States fields for admin adding new user
  const [adminAddPhone, setAdminAddPhone] = useState("");
  const [adminAddTokens, setAdminAddTokens] = useState("0");

  const [loginPhone, setLoginPhone] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'verifying' | 'connected' | 'offline' | 'permission-denied' | 'unknown-error'>('connected');

  const handlePhoneLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginPhone.trim()) {
      setLoginError("Por favor, ingrese un número de teléfono válido.");
      return;
    }

    const sanitizedPhone = loginPhone.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(); // Alfanumérico en mayúsculas
    if (sanitizedPhone.length < 8) {
      setLoginError("Un identificador del agente PNP debe tener al menos 8 caracteres.");
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      // Buscar si existe el usuario
      let user = users.find(u => u.phoneNumber === sanitizedPhone);

      if (!user) {
        // Registrar automáticamente con 0 tokens
        user = {
          phoneNumber: sanitizedPhone,
          tokens: 0,
          autorizado: true,
          user_gemini_api_key: ""
        };
        const updatedUsers = [...users, user];
        setUsers(updatedUsers);
        localStorage.setItem("pnp_users", JSON.stringify(updatedUsers));
        
        // Registrar automáticamente en la base de datos central en la nube
        saveUserToFirebase(user).catch((e) => console.error("Error registrando usuario inicial en Firebase:", e));
      }

      // Si el usuario tiene 0 o menos tokens, no dejarlo ingresar
      if ((user.tokens || 0) <= 0) {
        setLoginError("ACCESO DENEGADO: Su cuenta tiene 0 tokens. Comunique con el enlace de soporte inferior para solicitar recarga e ingresar.");
        setIsLoggingIn(false);
        return;
      }

      // Iniciar sesión
      setCurrentUser(user);
      localStorage.setItem("pnp_phone_session", JSON.stringify(user));
      setIsLoggingIn(false);
      setLoginPhone("");
    }, 400);
  };

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Sincronizar dinámicamente la lista de usuarios y saldos desde Firebase Firestore en tiempo real
  React.useEffect(() => {
    // 1. Sembrar los agentes PNP de prueba por defecto si la base de datos está vacía en la nube
    const defaults: PhoneUser[] = [
      { phoneNumber: "952171449FR", tokens: 9999, autorizado: true, user_gemini_api_key: "" },
      { phoneNumber: "931615705JR", tokens: 9999, autorizado: true, user_gemini_api_key: "" },
      { phoneNumber: "999999999", tokens: 9999, autorizado: true, user_gemini_api_key: "" },
      { phoneNumber: "987654321", tokens: 15, autorizado: true, user_gemini_api_key: "" },
      { phoneNumber: "900100200", tokens: 5, autorizado: true, user_gemini_api_key: "" }
    ];
    seedDefaultUsersIfNeeded(defaults);

    // 2. Suscribirse en tiempo real a la colección de "users" en Firebase
    const unsubscribe = subscribeToUsers(
      (updatedUsers) => {
        setUsers(updatedUsers);
        localStorage.setItem("pnp_users", JSON.stringify(updatedUsers));
        
        // Mantener el saldo de tokens del currentUser alineado si el Admin lo recarga remoto
        if (currentUser?.phoneNumber) {
          const matching = updatedUsers.find(u => u.phoneNumber === currentUser.phoneNumber);
          if (matching && (matching.tokens !== currentUser.tokens || matching.autorizado !== currentUser.autorizado)) {
            setCurrentUser(matching);
            localStorage.setItem("pnp_phone_session", JSON.stringify(matching));
          }
        }
        setConnectionStatus("connected");
      },
      () => {
        setConnectionStatus("offline");
      }
    );

    return () => unsubscribe();
  }, [currentUser?.phoneNumber]);

  // Cargar borrador guardado en Firebase cuando inicia sesión
  React.useEffect(() => {
    if (!currentUser?.phoneNumber) return;
    
    let active = true;
    const fetchDraft = async () => {
      try {
        const remoteDraft = await loadUserDraft(currentUser.phoneNumber!);
        if (remoteDraft && active) {
          setState(remoteDraft);
        }
      } catch (err) {
        console.error("Error cargando borrador remoto:", err);
      }
    };
    fetchDraft();
    
    return () => {
      active = false;
    };
  }, [currentUser?.phoneNumber]);

  // Auto-guardado de campos de actas en Firebase al cambiar datos (con debounce de 2 segundos para ahorrar cuota)
  React.useEffect(() => {
    if (!currentUser?.phoneNumber) return;
    
    setIsCloudSynced(false);
    const handler = setTimeout(() => {
      saveUserDraft(currentUser.phoneNumber!, state)
        .then(() => {
          setIsCloudSynced(true);
        })
        .catch((err) => {
          console.error("Error en auto-guardado en la nube:", err);
          setIsCloudSynced(false);
        });
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [state, currentUser?.phoneNumber]);

  const handleReconnect = async () => {
    setConnectionStatus('connected');
  };

  // Controladores de conexión al arrancar y de legado para saldo
  React.useEffect(() => {
    // Sincronizar el saldo del localStorage "saldoActas" anterior si existiera y no tuviera saldo guardado
    const savedLegacy = localStorage.getItem("saldoActas");
    if (savedLegacy !== null && currentUser?.phoneNumber) {
      const parsedLegacy = parseInt(savedLegacy, 10);
      if (!isNaN(parsedLegacy) && parsedLegacy >= 0 && currentUser.tokens !== parsedLegacy) {
        updateSaldoActas(parsedLegacy);
        localStorage.removeItem("saldoActas");
      }
    }

    // Permitir cerrar la sesión al agregar ?logout=true a la URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("logout") === "true") {
      localStorage.removeItem("pnp_phone_session");
      setCurrentUser({});
      
      const url = new URL(window.location.href);
      url.searchParams.delete("logout");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [currentUser?.phoneNumber]);

  const allowedAdmins = ["952171449FR", "931615705JR"];
  const isUserAdmin = currentUser?.phoneNumber ? allowedAdmins.includes(currentUser.phoneNumber) : false;
  const showAdminButton = isUserAdmin;

  // 3. LOGIC DE VALIDACIÓN DESACTIVADA: El sistema ya no bloquea por correo electrónico
  const isBlocked = false;

  // Update global PNP Police metadata
  const handleUpdatePolice = (field: keyof SharedPoliceMetadata, value: string) => {
    setState((prev) => ({
      ...prev,
      police: {
        ...prev.police,
        [field]: value
      }
    }));
  };

  // Update global Detenu suspect metadata
  const handleUpdateDetenido = (field: keyof SharedDetenidoMetadata, value: string) => {
    setState((prev) => ({
      ...prev,
      detenido: {
        ...prev.detenido,
        [field]: value
      }
    }));
  };

  const handleSidebarAddDetenido = () => {
    const docId = state.currentDocId;
    const docSupportsAdicionales = [
      "intervencion",
      "registroVehicular",
      "incautacionArt203",
      "entregaRecepcionMenor"
    ].includes(docId);

    const targetDocId = docSupportsAdicionales ? docId : "intervencion";

    setState((prev: any) => {
      const currentList = prev[targetDocId]?.detenidosAdicionales || [];
      const newDetenido: SharedDetenidoMetadata = {
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
        sexo: "M",
        edad: "",
        tipo: prev.detenido.tipo || "DETENIDO"
      };
      
      return {
        ...prev,
        [targetDocId]: {
          ...prev[targetDocId],
          detenidosAdicionales: [...currentList, newDetenido]
        }
      };
    });
  };

  // Toggle activation of document in the dossier (Trabajar varias actas a la vez)
  const handleToggleDocument = (docId: string) => {
    setState((prev) => {
      const isAlreadyActive = prev.activeDocuments.includes(docId);
      let active: string[];
      if (isAlreadyActive) {
        // Si ya está activa, la quitamos del listado de ventanas activas
        active = prev.activeDocuments.filter((id) => id !== docId);
      } else {
        // Si no está activa, la agregamos a las ventanas activas
        active = [...prev.activeDocuments, docId];
      }

      // Asegurar que haya una seleccionada si la actual fue desactivada
      let nextDocId = prev.currentDocId;
      if (nextDocId === docId && isAlreadyActive) {
        nextDocId = active.length > 0 ? active[0] : "";
      } else if (!isAlreadyActive) {
        nextDocId = docId;
      }

      return {
        ...prev,
        activeDocuments: active,
        currentDocId: nextDocId
      };
    });
  };

  // Set selected document for focused editing & preview
  const handleSelectCurrentDoc = (docId: string) => {
    setState((prev) => ({
      ...prev,
      currentDocId: docId
    }));
  };

  // Update fields on dynamic documents
  const handleUpdateDocField = (docId: string, field: string, value: any) => {
    setState((prev) => ({
      ...prev,
      [docId]: {
        ...(prev[docId as keyof ActasState] as object),
        [field]: value
      }
    }));
  };

  // Update sub-objects (nested, used for situations technical checklist)
  const handleUpdateNestedDocField = (docId: string, section: string, field: string, value: any) => {
    setState((prev: any) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        [section]: {
          ...prev[docId][section],
          [field]: value
        }
      }
    }));
  };

  // Clear current dossier data to reset defaults
  const handleReset = () => {
    let confirmReset = true;
    try {
      confirmReset = window.confirm("¿Está seguro de que desea restablecer todos los campos a los valores predeterminados? Se perderán los borradores actuales.");
    } catch (e) {
      console.warn("window.confirm blocked by iframe sandbox, resetting directly", e);
    }
    if (confirmReset) {
      setState(INITIAL_STATE);
    }
  };

  const handleCopyEmptyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(LP_DERECHO_EMPTY_JSON, null, 2));
  };

  const handleDownloadEmptyJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(LP_DERECHO_EMPTY_JSON, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "actas_plantilla_lp_derecho.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadEmptyTemplate = () => {
    setState({
      police: {
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
        unidadPolicial: ""
      },
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
        sexo: "M",
        edad: "",
        tipo: "DETENIDO",
        nacionalidad: ""
      },
      activeDocuments: ["intervencion"],
      currentDocId: "intervencion",
      intervencion: {
        circunstanciasPrecedentes: "",
        circunstanciasConcomitantes: "",
        circunstanciasPosteriores: "",
        horaConcluida: "",
        fechaConcluida: "",
        registroPersonalRealizado: false,
        lecturaDerechosRealizado: false,
        lacradoInmovilizacionRealizado: false,
        cadenaCustodiaRealizado: false,
        detenidosAdicionales: []
      },
      detencion: {
        delitoFlagranteContexto: "",
        horaConcluida: "",
        fechaConcluida: ""
      },
      buenTrato: {
        recibioBuenTrato: false,
        horaFirma: "",
        fechaFirma: ""
      },
      comunicacionTelefonica: {
        equipoEmpleado: "Celular",
        telFijo: "",
        telCelular: "",
        garantizaDerechoDe: "",
        celularOperador: "",
        marcaCaracteristica: "",
        propiedadDe: "",
        numeroLlamado: "",
        operadorLlamado: "",
        fechaHoraLlamada: "",
        recibeLlamada: "",
        parentesco: "",
        duracionHoras: "",
        duracionMin: "",
        duracionSeg: "",
        grabacionLlamada: "NO",
        capturaPantalla: "NO",
        resultadoComunicacion: "",
        horaConcluida: "",
        fechaConcluida: ""
      },
      detencionMenor: {
        pertenecienteA: "",
        padreNombre: "",
        madreNombre: "",
        motivoInfraccionLeyes: "",
        contactoPadreNombre: "",
        contactoPadreVinculo: "",
        contactoPadreDniEnabled: "NO",
        contactoPadreDni: "",
        contactoPadreCelular: "",
        contactoPadreObs: "",
        contactoFiscalNombre: "",
        contactoFiscalia: "",
        contactoFiscalCargo: "",
        contactoFiscalCelular: "",
        contactoFiscalObs: "",
        contactoJuezNombre: "",
        contactoJuezJuzgado: "",
        contactoJuezCargo: "",
        contactoJuezCelular: "",
        contactoJuezObs: "",
        numCelularUsado: "",
        operadorCelularUsado: "",
        marcaCelularUsada: "",
        propiedadCelularUsada: "",
        horaConcluida: "",
        fechaConcluida: "",
        detenidosAdicionales: []
      },
      registroPersonal: {
        lugarRegistro: "",
        hijoDeDon: "",
        hijoDeDona: "",
        solicitadoExhibirBienes: "",
        personalLlevaACabo: "",
        drogasInsumosCheck: false,
        drogasInsumosDetalle: "",
        billetesMonedasCheck: false,
        billetesMonedasDetalle: "",
        municionArmasCheck: false,
        municionArmasDetalle: "",
        otrosInteresCheck: false,
        otrosInteresDetalle: "",
        dejaConstancia: "",
        horaConcluida: "",
        fechaConcluida: ""
      },
      registroVehicular: {
        personasEnVehiculo: "",
        solicitudExhibicion: "NEGATIVO",
        descripcionBienExhibido: "",
        placa: "",
        marca: "",
        color: "",
        modelo: "",
        anioFabricacion: "",
        otrosDetalleVehiculo: "",
        razonesRegistro: "",
        testigoNombres: "",
        testigoIdentificadoDni: "",
        testigoDomiciliadoEn: "",
        testigoCelular: "",
        testigoParentesco: "",
        bienesObjetoRegistro: "",
        filmacionMedio: "",
        razonesNoLevantarEnLugar: "",
        negativaFirmarRazon: "",
        horaConcluida: "",
        fechaConcluida: "",
        detenidosAdicionales: []
      },
      situacionVehicular: {
        datosGenerales: {
          placa: "",
          clase: "",
          color: "",
          marcaModelo: "",
          motorNo: "",
          serieChasis: "",
          estadoConservacion: "",
          tipoVehiculo: "MAYOR"
        },
        partesExteriores: {
          faroGrandeDelantero: "NO_REGISTRA",
          faroChicoDelantero: "NO_REGISTRA",
          farosPosteriores: "NO_REGISTRA",
          biseles: "NO_REGISTRA",
          limpiaParabrisas: "NO_REGISTRA",
          llantas: "NO_REGISTRA",
          vasos: "NO_REGISTRA",
          espejoExterior: "NO_REGISTRA",
          chapas: "NO_REGISTRA",
          antenas: "NO_REGISTRA",
          parachoques: "NO_REGISTRA",
          llantasRepuesto: "NO_REGISTRA",
          parabrisas: "NO_REGISTRA"
        },
        partesInteriores: {
          tablero: "NO_REGISTRA",
          chapaContacto: "NO_REGISTRA",
          radio: "NO_REGISTRA",
          encendedor: "NO_REGISTRA",
          pisos: "NO_REGISTRA",
          manijas: "NO_REGISTRA",
          ceniceros: "NO_REGISTRA",
          parasoles: "NO_REGISTRA",
          espejoInterior: "NO_REGISTRA",
          coderas: "NO_REGISTRA",
          gata: "NO_REGISTRA",
          llaveRuedas: "NO_REGISTRA",
          parlante: "NO_REGISTRA",
          asientos: "NO_REGISTRA"
        },
        motorAccesorios: {
          motor: "NO_REGISTRA",
          bateria: "NO_REGISTRA",
          arrancador: "NO_REGISTRA",
          carburador: "NO_REGISTRA",
          distribuidor: "NO_REGISTRA",
          tapaAceite: "NO_REGISTRA",
          chicotes: "NO_REGISTRA",
          radiador: "NO_REGISTRA",
          alternador: "NO_REGISTRA",
          purificador: "NO_REGISTRA",
          bobina: "NO_REGISTRA",
          bujias: "NO_REGISTRA",
          varillaAceite: "NO_REGISTRA"
        },
        descripcionEspecificaCompleta: "",
        perennizacionMedio: "",
        observaciones: "",
        negativaFirmarRazon: "",
        fechaConcluida: "",
        horaConcluida: "",
        intervenidoPadreNombre: "",
        intervenidoMadreNombre: "",
        lugarInspeccion: "",
        detenidosAdicionales: []
      },
      registroEquipajes: {
        solicitudExhibicion: "NEGATIVO",
        descripcionBienExhibido: "",
        placaVehiculoAsociado: "",
        marcaVehiculoAsociado: "",
        colorVehiculoAsociado: "",
        modeloVehiculoAsociado: "",
        anioVehiculoAsociado: "",
        otrosVehiculoAsociado: "",
        razonesRegistro: "",
        testigoNombres: "",
        testigoIdentificadoDni: "",
        testigoDomiciliadoEn: "",
        testigoCelular: "",
        testigoParentesco: "",
        apremianteSexoDistinto: "",
        bienesObjetoRegistro: "",
        filmacionMedio: "",
        razonesNoLevantarEnLugar: "",
        negativaFirmarRazon: "",
        horaConcluida: "",
        fechaConcluida: ""
      },
      recepcion: {
        personaNombres: "",
        personaApellidos: "",
        personaGradoInstruccion: "",
        personaDni: "",
        personaSexo: "M",
        personaEdad: "",
        personaTelefono: "",
        personaCelular: "",
        personaParentescoReferencia: "",
        personaDomicilio: "",
        personaNacionalidad: "",
        personaOcupacion: "",
        personaTrabajo: "",
        razonesEntrega: "",
        descripcionBienObjeto: "",
        perennizacionRecepcion: "",
        funcionarioCustodia: "",
        negativaFirmarRazon: "",
        horaConcluida: "",
        fechaConcluida: ""
      },
      ocurrencia: {
        asunto: "",
        detallesOcurrencia: "",
        medidasAdoptadas: "",
        horaConcluida: "",
        fechaConcluida: ""
      }
    });
  };

  const handleLoadLPPreset = () => {
    setState({
      police: {
        lugarCiudad: "TRUJILLO",
        distrito: "EL PORVENIR",
        provincia: "TRUJILLO",
        fecha: "2026-06-03",
        hora: "04:30",
        instructorNombres: "CARLOS RAÚL",
        instructorApellidos: "TOSCANO ALZAMORA",
        instructorGrado: "SNT1. PNP",
        instructorCIP: "31049281",
        companiaDe: "S3. PNP REYES LÓPEZ ALAN",
        unidadPolicial: "AREINCO PNP TRUJILLO"
      },
      detenido: {
        nombres: "JOSÉ SEBASTIÁN",
        apellidos: "MENDOZA GARRIDO",
        dni: "47581930",
        naturalDe: "CHICLAYO",
        nacidoEl: "1995-10-18",
        estadoCivil: "SOLTERO",
        ocupacion: "COMERCIANTE INFORMAL",
        gradoInstruccion: "SECUNDARIA COMPLETA",
        domiciliadoEn: "AV. SÁNCHEZ CARRIÓN N° 1250, EL PORVENIR",
        celular: "921847593",
        correo: "jose.mendoza95@gmail.com",
        sexo: "M",
        edad: "30",
        tipo: "DETENIDO",
        nacionalidad: "PERUANA"
      },
      activeDocuments: ["intervencion", "detencion", "buenTrato", "registroPersonal"],
      currentDocId: "intervencion",
      intervencion: {
        circunstanciasPrecedentes: "El personal de la Comisaría PNP El Porvenir se encontraba ejecutando patrullaje preventivo permanente al amparo del Plan cuadrante seguro en zonas críticas del distrito.",
        circunstanciasConcomitantes: "A la altura del Jr. Astillas cuadra 8, se presenció cómo el conductor del mototaxi con placa de rodaje 4819-A3 realizaba maniobras peligrosas de zig-zag evasivas al percatarse de la patrulla policial, deteniéndose de manera abrupta e impactando contra un contenedor metálico de basura.",
        circunstanciasPosteriores: "Al descender se procedió a la retención del investigado quien denotaba evidente estado de alteración etílica extrema. Ofreció forcejeos vigorosos insultando a la autoridad policial, de modo que fue reducido con firmeza técnica de acuerdo al Manual de Uso de la Fuerza.",
        horaConcluida: "05:15",
        fechaConcluida: "2026-06-03",
        registroPersonalRealizado: true,
        lecturaDerechosRealizado: true,
        lacradoInmovilizacionRealizado: true,
        cadenaCustodiaRealizado: true,
        detenidosAdicionales: []
      },
      detencion: {
        delitoFlagranteContexto: "Presunto Delito Contra la Seguridad Pública - Conducción de Vehículo Motorizado en Estado de Ebriedad (Dosaje preliminar etílico cualitativo positivo), y Resistencia Activa a la Autoridad.",
        horaConcluida: "05:30",
        fechaConcluida: "2026-06-03"
      },
      buenTrato: {
        recibioBuenTrato: true,
        horaFirma: "05:40",
        fechaFirma: "2026-06-03"
      },
      comunicacionTelefonica: {
        equipoEmpleado: "Celular",
        telFijo: "",
        telCelular: "921847593",
        garantizaDerechoDe: "JOSÉ SEBASTIÁN MENDOZA GARRIDO",
        celularOperador: "SNT1. PNP TOSCANO ALZAMORA CARLOS RAÚL",
        marcaCaracteristica: "SAMSUNG GALAXY A34 REVESTIDO DE SILICONA AZUL",
        propiedadDe: "EL DETENIDO",
        numeroLlamado: "931221144",
        operadorLlamado: "CLARO",
        fechaHoraLlamada: "2026-06-03 04:55",
        recibeLlamada: "MARÍA LUISA GARRIDO VILLANUEVA",
        parentesco: "MADRE",
        duracionHoras: "00",
        duracionMin: "02",
        duracionSeg: "15",
        grabacionLlamada: "NO",
        capturaPantalla: "SI",
        resultadoComunicacion: "Comunicación entablada eficazmente con su madre. Se le detalló la imputación investigadora (peligro común por alcohol y desacato policial) y el confinamiento inmediato en los calabozos de El Porvenir.",
        horaConcluida: "06:00",
        fechaConcluida: "2026-06-03"
      },
      detencionMenor: {
        pertenecienteA: "",
        padreNombre: "",
        madreNombre: "",
        motivoInfraccionLeyes: "No aplica por tratarse de un ciudadano plenamente mayor de edad.",
        contactoPadreNombre: "",
        contactoPadreVinculo: "",
        contactoPadreDniEnabled: "NO",
        contactoPadreDni: "",
        contactoPadreCelular: "",
        contactoPadreObs: "",
        contactoFiscalNombre: "",
        contactoFiscalia: "",
        contactoFiscalCargo: "",
        contactoFiscalCelular: "",
        contactoFiscalObs: "",
        contactoJuezNombre: "",
        contactoJuezJuzgado: "",
        contactoJuezCargo: "",
        contactoJuezCelular: "",
        contactoJuezObs: "",
        numCelularUsado: "",
        operadorCelularUsado: "",
        marcaCelularUsada: "",
        propiedadCelularUsada: "",
        horaConcluida: "",
        fechaConcluida: "",
        detenidosAdicionales: []
      },
      registroPersonal: {
        lugarRegistro: "Intersección de la Av. Larco con Calle San Martin - Miraflores",
        hijoDeDon: "ALBERTO RAMIREZ GUTIERREZ",
        hijoDeDona: "MARIA SOTO VILLANUEVA",
        solicitadoExhibirBienes: "manifestó no poseer armas, procediendo voluntariamente a extraer las pertenencias de sus bolsillos de vestir.",
        personalLlevaACabo: "la Comisaría PNP Miraflores",
        drogasInsumosCheck: false,
        drogasInsumosDetalle: "NEGATIVO (No se encontró sustancias u otras sustancias tóxicas prohibidas por Ley).",
        billetesMonedasCheck: true,
        billetesMonedasDetalle: "POSITIVO: Se halló la cantidad de S/ 150.00 (ciento cincuenta soles) en billetes sueltos de S/ 50.00 pesos cada uno.",
        municionArmasCheck: false,
        municionArmasDetalle: "NEGATIVO (No porta armas de fuego, armas blancas ni cartuchos de munición correspondientes).",
        otrosInteresCheck: true,
        otrosInteresDetalle: "POSITIVO: Un teléfono celular marca Samsung Galaxy A34 color azul en su bolsillo delantero derecho.",
        dejaConstancia: "La presente diligencia culminó sin maltratos físicos, respetando de manera integral los derechos ciudadanos fundamentales consagrados en la Constitución.",
        horaConcluida: "04:50",
        fechaConcluida: "2026-06-03"
      },
      registroVehicular: {
        personasEnVehiculo: "Únicamente el intervenido en el asiento de mandos de conducción.",
        solicitudExhibicion: "POSITIVO",
        descripcionBienExhibido: "Tarjeta de identificación vehicular física y una llave de estrella pequeña.",
        placa: "4819-A3",
        marca: "WANSIN",
        color: "AZUL CORAL",
        modelo: "WY150ZH",
        anioFabricacion: "2020",
        otrosDetalleVehiculo: "Un mototaxi de tres ruedas con chapa de contacto forzada preexistente.",
        razonesRegistro: "Comprobar el origen lícito de la unidad de transporte menor y registrar recipientes con alcohol.",
        testigoNombres: "PEDRO ENRIQUE VÁSQUEZ CHACÓN",
        testigoIdentificadoDni: "18293041",
        testigoDomiciliadoEn: "JR. PROGRESO N° 440, EL PORVENIR",
        testigoCelular: "931204859",
        testigoParentesco: "NINGUNO (TRANSEÚNTE)",
        bienesObjetoRegistro: "Detrás del asiento del conductor se hallaron dos botellas vacías de cerveza marca Cristal de 620ml.",
        filmacionMedio: "Cámara personal del Instructor PNP.",
        razonesNoLevantarEnLugar: "Zona con alto índice delictuoso de aglomeración hostil.",
        negativaFirmarRazon: "",
        horaConcluida: "05:00",
        fechaConcluida: "2026-06-03",
        detenidosAdicionales: []
      },
      situacionVehicular: {
        datosGenerales: {
          placa: "4819-A3",
          clase: "TRICICLO DE REPARTO / MOTOTAXI",
          color: "AZUL CORAL",
          marcaModelo: "WANSIN WY150ZH",
          motorNo: "WS162FMJ392410",
          serieChasis: "KPOZY4829JHA10254",
          estadoConservacion: "REGULAR",
          tipoVehiculo: "MENOR"
        },
        partesExteriores: {
          faroGrandeDelantero: "BUENO",
          faroChicoDelantero: "BUENO",
          farosPosteriores: "BUENO",
          biseles: "MALO",
          limpiaParabrisas: "FALTA",
          llantas: "BUENO",
          vasos: "FALTA",
          espejoExterior: "BUENO",
          chapas: "MALO",
          antenas: "FALTA",
          parachoques: "BUENO",
          llantasRepuesto: "FALTA",
          parabrisas: "BUENO"
        },
        partesInteriores: {
          tablero: "BUENO",
          chapaContacto: "MALO",
          radio: "FALTA",
          encendedor: "FALTA",
          pisos: "BUENO",
          manijas: "MALO",
          ceniceros: "FALTA",
          parasoles: "BUENO",
          espejoInterior: "BUENO",
          coderas: "BUENO",
          gata: "FALTA",
          llaveRuedas: "FALTA",
          parlante: "FALTA",
          asientos: "BUENO"
        },
        motorAccesorios: {
          motor: "FUNCIONA",
          bateria: "FUNCIONA",
          arrancador: "FUNCIONA",
          carburador: "FUNCIONA",
          distribuidor: "NO_REGISTRA",
          tapaAceite: "FUNCIONA",
          chicotes: "FUNCIONA",
          radiador: "NO_REGISTRA",
          alternador: "NO_REGISTRA",
          purificador: "FUNCIONA",
          bobina: "FUNCIONA",
          bujias: "FUNCIONA",
          varillaAceite: "FUNCIONA"
        },
        descripcionEspecificaCompleta: "El mototaxi menor azul muestra una hendidura leve en el techo de lona del guardabarros lateral y la chapa de contacto presenta daños de manipulación violenta.",
        perennizacionMedio: "Dos fotografías a color impresas.",
        observaciones: "El investigado declaró que el vehículo pertenece a su tío pero cuenta con autorización verbal para manejar.",
        negativaFirmarRazon: "",
        fechaConcluida: "2026-06-03",
        horaConcluida: "05:20",
        intervenidoPadreNombre: "ALFONSO CASAS MERCADO",
        intervenidoMadreNombre: "ESTELA DIAZ ORTEGA",
        lugarInspeccion: "Intersección de la Av. Progreso y calle Los Incas",
        detenidosAdicionales: []
      },
      registroEquipajes: {
        solicitudExhibicion: "NEGATIVO",
        descripcionBienExhibido: "",
        placaVehiculoAsociado: "",
        marcaVehiculoAsociado: "",
        colorVehiculoAsociado: "",
        modeloVehiculoAsociado: "",
        anioVehiculoAsociado: "",
        otrosVehiculoAsociado: "",
        razonesRegistro: "",
        testigoNombres: "",
        testigoIdentificadoDni: "",
        testigoDomiciliadoEn: "",
        testigoCelular: "",
        testigoParentesco: "",
        apremianteSexoDistinto: "",
        bienesObjetoRegistro: "",
        filmacionMedio: "",
        razonesNoLevantarEnLugar: "",
        negativaFirmarRazon: "",
        horaConcluida: "",
        fechaConcluida: ""
      },
      recepcion: {
        personaNombres: "",
        personaApellidos: "",
        personaGradoInstruccion: "",
        personaDni: "",
        personaSexo: "M",
        personaEdad: "",
        personaTelefono: "",
        personaCelular: "",
        personaParentescoReferencia: "",
        personaDomicilio: "",
        personaNacionalidad: "",
        personaOcupacion: "",
        personaTrabajo: "",
        razonesEntrega: "",
        descripcionBienObjeto: "",
        perennizacionRecepcion: "",
        funcionarioCustodia: "",
        negativaFirmarRazon: "",
        horaConcluida: "",
        fechaConcluida: ""
      },
      ocurrencia: {
        asunto: "CONDUCCIÓN TEMERARIA, ALTERACIÓN DE LA TRANQUILIDAD Y DAÑOS MATERIALES",
        detallesOcurrencia: "Se recibió un aviso radial de la Central de Emergencias 105 Trujillana advirtiendo maniobras temerarias de una unidad menor en inmediaciones de la Av. Sánchez Carrión, perturbando la tranquilidad pública.",
        medidasAdoptadas: "Se reaccionó de manera ipso-facta logrando la ubicación e interrupción de la marcha del investigado tras embestir contenedor público de residuos urbanos, normalizando el orden de barrio de inmediato.",
        horaConcluida: "05:45",
        fechaConcluida: "2026-06-03"
      }
    });
  };

  const handleGlobalPrint = () => {
    // Asegurar que el acta actual que se está editando esté marcada como activa en el expediente
    if (!state.activeDocuments.includes(state.currentDocId)) {
      setState((prev) => {
        const active = [prev.currentDocId];
        return {
          ...prev,
          activeDocuments: active
        };
      });
    }

    // Disparar la impresión real
    setTimeout(() => {
      window.print();
    }, 150);
  };



  // Lock Screen Intercept
  if (!currentUser || !currentUser.phoneNumber) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative antialiased transition-all ${
        isDarkMode ? "dark bg-slate-950 text-slate-105" : "bg-slate-50 text-slate-900"
      }`}>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] pointer-events-none" />
        
        <div className={`w-full max-w-md z-10 rounded-3xl border shadow-2xl p-6 sm:p-8 relative overflow-hidden transition-all ${
          isDarkMode ? "bg-slate-900/95 border-slate-800 shadow-emerald-950/20" : "bg-white border-slate-200 shadow-slate-300/40"
        }`}>
          {/* PNP Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-yellow-500 to-emerald-600" />
          
          <div className="flex flex-col items-center text-center space-y-4">
            {/* PNP Crest Badge */}
            <div className="w-16 h-16 bg-emerald-950/40 border border-emerald-500/35 rounded-2xl flex items-center justify-center text-emerald-450 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all">
              <ShieldAlert className="w-9 h-9 animate-pulse text-emerald-450" />
            </div>

            <div>
              <p className="text-[10px] tracking-widest font-mono text-slate-400 font-extrabold uppercase mt-0.5">
                SISTEMA INTEGRADO DE REDACCIÓN DE ACTAS
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handlePhoneLoginSubmit} className="w-full space-y-4 pt-2 text-left">
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                  Identificador del Agente (N° Celular PNP)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                    placeholder="Ingrese su identificador / contraseña"
                    className={`w-full text-sm pl-10 pr-4 py-3 rounded-xl border font-mono tracking-widest focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? "bg-slate-950 border-slate-80 border border-slate-800 text-emerald-300 placeholder-slate-600 focus:border-emerald-500" 
                        : "bg-slate-100 border-slate-200 text-emerald-800 placeholder-slate-400 focus:border-emerald-500"
                    }`}
                  />
                </div>
              </div>

              {loginError && (
                <div className="text-[11px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/15 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 animate-bounce" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold font-display uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-emerald-950/20 active:shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>VERIFICANDO ENLACE PNP...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-250" />
                    <span>INGRESAR AL SISTEMA</span>
                  </>
                )}
              </button>
            </form>

            {/* Enlaces de WhatsApp para Registro / Soporte */}
            <div className="w-full pt-4 border-t border-dashed border-slate-300 dark:border-slate-800 text-left space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block font-mono tracking-wider">
                ¿Aún no tienes acceso? Solicítalo aquí:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`/api/soporte-pnp?op=1&id=${encodeURIComponent(loginPhone || currentUser?.phoneNumber || "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600/10 hover:bg-emerald-600/25 border border-emerald-600/20 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10.5px] font-extrabold transition-all text-center uppercase cursor-pointer hover:scale-[1.02]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Soporte 1</span>
                </a>
                <a
                  href={`/api/soporte-pnp?op=2&id=${encodeURIComponent(loginPhone || currentUser?.phoneNumber || "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600/10 hover:bg-emerald-600/25 border border-emerald-600/20 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10.5px] font-extrabold transition-all text-center uppercase cursor-pointer hover:scale-[1.02]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Soporte 2</span>
                </a>
              </div>
            </div>

            {/* Theme Toggle option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 hover:text-slate-350 cursor-pointer flex items-center gap-1"
              >
                {isDarkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                CAMBIAR MODO {isDarkMode ? "CLARO" : "OSCURO"}
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen h-[100dvh] overflow-hidden ${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-800"} flex flex-col font-sans select-none antialiased`}>
      
      {/* APP TOP DASHBOARD HEADER - HIDE IN PRINT */}
      <header className="bg-slate-900 text-white px-4 sm:px-5 py-3 flex flex-row items-center justify-between gap-3 border-b border-slate-800 shadow-md no-print shrink-0 relative">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-600/90 rounded-lg flex items-center justify-center text-white shadow-[0_0_12px_rgba(16,185,129,0.55)] border border-emerald-500/20 shrink-0">
            <ShieldAlert className="w-5 sm:w-5.5 h-5 sm:h-5.5 animate-pulse text-emerald-100" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold tracking-wide font-display uppercase truncate">
              Generador de Actas Policiales
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono select-none flex items-center gap-1.5 mt-0.5 truncate">
              <span>BY FRANCO 2.0</span>
              <span className="inline-block w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse shrink-0" />
              <span className="text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest uppercase truncate">LINEA SEGURA</span>
            </p>
          </div>
        </div>

        <div className="relative shrink-0 flex items-center gap-2">
          {cargoError && (
            <div className="hidden md:flex text-red-400 text-[10.5px] font-semibold px-2.5 py-1 bg-red-950/40 border border-red-900/30 rounded-lg items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{cargoError}</span>
            </div>
          )}

          {/* Botón Hamburguesa */}
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-700/50 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-sm"
            title="Menú de Acciones"
          >
            <Menu className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0 text-slate-300" />
            <span>MENÚ</span>
          </button>

          {/* Menú Desplegable (Dropdown) */}
          {showMenu && (
            <>
              {/* Overlay invisible para cerrar el menú si se hace click fuera */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)}
              />
              
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-left">
                {/* 1. Botón de Modo Claro / Oscuro */}
                <button
                  type="button"
                  onClick={() => {
                    toggleDarkMode();
                    setShowMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>MODO CLARO</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>MODO OSCURO</span>
                    </>
                  )}
                </button>

                {/* 2. Botón FOTO IA */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCameraModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer border-t border-slate-800/40"
                >
                  <Camera className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>FOTO IA (ESCANEAR)</span>
                </button>

                {/* 2.5. Botón GRABADORA DE VOZ */}
                <button
                  type="button"
                  onClick={() => {
                    setShowVoiceRecorderModal(true);
                    setTargetDocType(state.currentDocId || "intervencion");
                    setShowMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer border-t border-slate-800/40"
                >
                  <Mic className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                  <span>GRABADORA DE VOZ IA</span>
                </button>

                {/* 3. Botón de Administración de Usuarios (si aplica) */}
                {showAdminButton && (
                  <button
                    onClick={() => {
                      setShowAdminModal(true);
                      setShowMenu(false);
                    }}
                    type="button"
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer border-t border-slate-800/40"
                  >
                    <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>ADMINISTRACIÓN PNP</span>
                  </button>
                )}

                {/* 4. Botón de Salir (Cerrar Sesión) - Extramadamente discreto y difícil de apretar por casualidad */}
                {currentUser && currentUser.phoneNumber && (
                  <button
                    onClick={() => {
                      localStorage.removeItem("pnp_phone_session");
                      setCurrentUser({});
                      setShowMenu(false);
                      // Limpiar sessionStorage y reiniciar inputs
                      sessionStorage.removeItem("pnp_actas_state");
                      setState(INITIAL_STATE);
                    }}
                    type="button"
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all cursor-pointer border-t border-slate-800/40"
                  >
                    <LogOut className="w-4 h-4 text-rose-500/80 shrink-0" />
                    <span>CERRAR SESIÓN</span>
                  </button>
                )}
              </div>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </header>

      {/* COMPACT INTERACTIVE MONITOR WORKSPACE */}
      <div className="flex-1 flex flex-col overflow-hidden h-full relative">
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full pb-[72px] lg:pb-0">
          {/* SIDEBAR COLUMNS PANEL */}
          <div className={`${activeTab === "editor" ? "block" : "hidden lg:block"} lg:w-3/5 w-full shrink-0 h-full overflow-hidden`}>
            <Sidebar
              state={state}
              police={state.police}
              detenido={state.detenido}
              intervencion={state.intervencion}
              onUpdateDocField={handleUpdateDocField}
              onUpdateNestedDocField={handleUpdateNestedDocField}
              activeDocuments={state.activeDocuments}
              currentDocId={state.currentDocId}
              onUpdatePolice={handleUpdatePolice}
              onUpdateDetenido={handleUpdateDetenido}
              onToggleDocument={handleToggleDocument}
              onSelectCurrentDoc={handleSelectCurrentDoc}
              saldoActas={saldoActas}
              onPrint={handleGlobalPrint}
              onAddDetenidoAdicional={handleSidebarAddDetenido}
              currentUser={currentUser}
              onUpdateUser={setCurrentUser}
              onUpdateSaldoActas={setSaldoActas}
              onShowCameraModal={() => setShowCameraModal(true)}
              isDarkMode={isDarkMode}
              previewComponent={
                <DocumentRenderer 
                  state={state} 
                  currentDocId={state.currentDocId} 
                  isBlocked={isBlocked} 
                  saldoActas={saldoActas}
                  onUpdateSaldoActas={updateSaldoActas}
                  onShowRecargaModal={() => setShowRecargaModal(true)}
                  customA4Html={customA4Html}
                  setCustomA4Html={setCustomA4Html}
                  isLoadingImage={isLoadingImage}
                  setIsLoadingImage={setIsLoadingImage}
                  cargoError={cargoError}
                  setCargoError={setCargoError}
                  currentUser={currentUser}
                  onLoadState={setState}
                  isDarkMode={isDarkMode}
                />
              }
            />
          </div>

          {/* LIVE RENDERER PREVIEW CANVAS */}
          <div className={`lg:w-2/5 flex-1 h-full overflow-hidden no-print ${activeTab === "preview" ? "block" : "hidden lg:block"}`}>
            <div className={`w-full h-full flex flex-col ${uploadedPhotoBase64 ? "xl:flex-row" : ""}`}>
              {/* PHOTO VIEW ZONE */}
              {uploadedPhotoBase64 && (
                <div className={`w-full xl:w-[420px] 2xl:w-[460px] shrink-0 border-b xl:border-b-0 xl:border-r ${isDarkMode ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-slate-50"} flex flex-col h-[320px] xl:h-full relative overflow-hidden group`}>
                  {/* Panel Header */}
                  <div className={`p-3 border-b ${isDarkMode ? "bg-slate-900/40 border-slate-850 text-slate-100" : "bg-slate-100/50 border-slate-200"} flex items-center justify-between z-10 shrink-0`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className={`text-[10px] font-black uppercase tracking-widest truncate font-mono ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                        FOTO / DOCUMENTO ORIGEN
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 px-2.5 py-1 text-slate-100 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm shadow-emerald-500/15 active:scale-95 flex items-center gap-1"
                        title="Subir otra foto para procesar"
                      >
                        <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                        <span>REEMPLAZAR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadedPhotoBase64(null)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/80"}`}
                        title="Ocultar foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contain photo centered */}
                  <div className={`flex-1 overflow-auto p-4 flex items-center justify-center ${isDarkMode ? "bg-slate-950/40" : "bg-slate-101/30"}`}>
                    <img
                      src={uploadedPhotoBase64}
                      alt="Documento original"
                      className={`max-w-full max-h-full object-contain rounded-xl shadow-md border transition-all ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}

              {/* GENERATED A4 DIGITAL PREVIEW */}
              <div className="flex-1 h-full overflow-hidden relative flex flex-col">
                <DocumentRenderer 
                  state={state} 
                  currentDocId={state.currentDocId} 
                  isBlocked={isBlocked} 
                  saldoActas={saldoActas}
                  onUpdateSaldoActas={updateSaldoActas}
                  onShowRecargaModal={() => setShowRecargaModal(true)}
                  customA4Html={customA4Html}
                  setCustomA4Html={setCustomA4Html}
                  isLoadingImage={isLoadingImage}
                  setIsLoadingImage={setIsLoadingImage}
                  cargoError={cargoError}
                  setCargoError={setCargoError}
                  currentUser={currentUser}
                  onLoadState={setState}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>
        </div>

        {/* THUMB-OPTIMIZED ACTION & NAVIGATION FOOTER (MOBILE & TABLET LOWER ZONE) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3.5 flex items-center justify-between gap-3 z-50 shadow-2xl no-print select-none">
          {/* Tab 1: REDACTAR */}
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.97] cursor-pointer ${
              activeTab === "editor"
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.45)] border border-emerald-400"
                : "bg-slate-800 text-slate-300 hover:bg-slate-755 border border-slate-700"
            }`}
          >
            <Edit3 className="w-4 h-4 shrink-0" />
            <span>REDACTAR</span>
          </button>

          {/* Tab 2: VISTA PREVIA */}
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.97] cursor-pointer ${
              activeTab === "preview"
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.45)] border border-emerald-400"
                : "bg-slate-800 text-slate-300 hover:bg-slate-755 border border-slate-700"
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span>VISTA PREVIA</span>
          </button>
        </div>
      </div>

      {/* DUAL RENDER DEDICATED ONLY FOR PAPER PRINTER IN BULK */}
      {/* This renders only under printer layout, stacking all active documents sequential to fit nicely in A4 bond sheets */}
      <div className="hidden print:block print:w-full">
        {state.activeDocuments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs italic">
            Ningún documento seleccionado para impresión.
          </div>
        ) : (
          state.activeDocuments.map((docId) => (
            <div key={docId} className="page-break">
              <DocumentRenderer 
                state={state} 
                currentDocId={docId} 
                isBlocked={isBlocked} 
                saldoActas={saldoActas}
                onUpdateSaldoActas={updateSaldoActas}
                onShowRecargaModal={() => setShowRecargaModal(true)}
                customA4Html={customA4Html}
                setCustomA4Html={setCustomA4Html}
                isLoadingImage={isLoadingImage}
                setIsLoadingImage={setIsLoadingImage}
                cargoError={cargoError}
                setCargoError={setCargoError}
                currentUser={currentUser}
                isPrintInstance={true}
              />
            </div>
          ))
        )}
      </div>

      {/* MODAL DE CÁMARA & COPIADORA FOTO IA */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-950/60 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                  <Camera className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    ASISTENTE DE ESCANEO "FOTO IA"
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    PROCESADOR ELECTRÓNICO DE DOCUMENTOS PNP
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setShowCameraModal(false);
                }}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-350 leading-relaxed">
                Escanee o tome una foto nítida de un acta física, apuntes de campo u otro parte policial. La Inteligencia Artificial de Gemini procesará la imagen de forma directa y generará la versión digitalizada e impecable del acta.
              </p>

              {/* LIVE CAMERA VIEWER SECTION */}
              <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative aspect-video flex flex-col items-center justify-center">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* A4 Scanner Blueprint Crop Overlay line */}
                    <div className="absolute inset-4 border border-dashed border-emerald-500/30 rounded-lg pointer-events-none flex items-center justify-center">
                      <div className="text-[9px] text-emerald-400/40 font-mono uppercase bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/15">
                        Encuadre el Documento Aquí
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-805">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        La cámara está apagada o inhabilitada
                      </p>
                      <p className="text-[10px] text-slate-400 max-w-sm mt-1">
                        Inicie la transmisión en vivo para tomar una fotografía instantánea del acta con la cámara de su teléfono o computadora.
                      </p>
                    </div>
                  </div>
                )}

                {/* Camera Loader / Status Overlay */}
                {isCapturing && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 z-10">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-xs text-emerald-400 font-mono uppercase tracking-wider font-bold">
                      Capturando Imagen...
                    </p>
                  </div>
                )}
              </div>

              {/* CAMERA ERROR ALERTS */}
              {cameraError && (
                <div className="bg-red-950/40 border border-red-900/30 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <p className="font-bold text-red-300">Aviso de Compatibilidad</p>
                    <p className="text-red-400 mt-0.5 leading-relaxed">{cameraError}</p>
                  </div>
                </div>
              )}

              {/* ACTION BUTTON CONTROLS */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {isCameraActive ? (
                  <>
                    <button
                      onClick={capturePhoto}
                      type="button"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                    >
                      <Camera className="w-4 h-4 shrink-0" />
                      Capturar y Procesar Documento
                    </button>

                    <button
                      onClick={toggleFacingMode}
                      type="button"
                      className="bg-slate-805 hover:bg-slate-800 text-slate-200 border border-slate-705 font-extrabold text-[11px] uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                      title="Girar Cámara (Trasera / Frontal)"
                    >
                      <RotateCw className="w-4 h-4 shrink-0 animate-spin-slow" />
                      Girar ({facingMode === "environment" ? "Trasera" : "Frontal"})
                    </button>

                    <button
                      onClick={stopCamera}
                      type="button"
                      className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer"
                    >
                      Apagar Cámara
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startCamera()}
                      type="button"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-emerald-100 shrink-0" />
                      Habilitar Cámara en Vivo
                    </button>

                    <button
                      onClick={() => {
                        setShowCameraModal(false);
                        fileInputRef.current?.click();
                      }}
                      type="button"
                      className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-slate-350 shrink-0" />
                      Subir archivo de Foto (Galería)
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-950/40 px-5 py-3 border-t border-slate-850 text-center">
              <span className="text-[10px] text-slate-500 font-mono">
                Estándar Código Procesal Penal del Perú • Redacción Policial Asistida
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GRABADORA DE VOZ IA */}
      {showVoiceRecorderModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-950/60 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                  <Mic className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    GRABADORA DE VOZ IA
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    DICTADO DIRECTO Y REDACCIÓN ELECTRÓNICA PNP
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  cancelRecording();
                  setShowVoiceRecorderModal(false);
                }}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-350 leading-relaxed">
                Hable de forma clara y pausada detallando los hechos de la diligencia. La Inteligencia Artificial de Gemini transcribirá su voz y la convertirá en actas redactadas con estricto apego al estándar del Código Procesal Penal.
              </p>

              {/* 1. SELECCIÓN DE RECEPTOR DE ACTA */}
              <div className="space-y-1.5">
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Seleccione Acta para Insertar Redacción:
                </label>
                <select
                  disabled={isRecording || isConvertingAudio}
                  value={targetDocType}
                  onChange={(e) => setTargetDocType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-slate-700 transition-all cursor-pointer font-bold uppercase tracking-wide font-sans"
                >
                  {LISTA_DOCUMENTOS.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title} ({doc.pages})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. AREA GRABADORA PRINCIPAL */}
              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center relative min-h-[160px] space-y-4">
                {/* Visualizer / Pulse wave */}
                {isRecording && !isPaused ? (
                  <div className="flex items-center gap-1.5 h-10">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1.5 h-9 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-7 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                    <span className="w-1.5 h-10 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.5s]" />
                  </div>
                ) : isPaused ? (
                  <div className="flex items-center gap-1 h-10 opacity-40">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-805 flex items-center justify-center text-slate-500">
                    <Mic className="w-5 h-5 text-slate-400" />
                  </div>
                )}

                {/* Time indicators */}
                <div className="text-center">
                  <p className="text-xl font-mono font-bold tracking-widest text-white">
                    {(() => {
                      const mins = Math.floor(recordingTime / 60);
                      const secs = recordingTime % 60;
                      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                    })()}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono uppercase mt-0.5 tracking-wider">
                    {isRecording ? (isPaused ? "GRABACIÓN EN PAUSA" : "GRABANDO SEÑAL DE AUDIO") : "DISPOSITIVO LISTO"}
                  </p>
                </div>

                {/* Micro record control buttons */}
                <div className="flex items-center gap-3">
                  {!isRecording && !audioUrl ? (
                    <button
                      onClick={startRecording}
                      disabled={isConvertingAudio}
                      type="button"
                      className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white font-extrabold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Iniciar Grabación
                    </button>
                  ) : isRecording ? (
                    <>
                      {isPaused ? (
                        <button
                          onClick={resumeRecording}
                          type="button"
                          className="bg-slate-800 hover:bg-slate-755 text-slate-200 font-extrabold text-[10px] uppercase tracking-wider py-2 px-3 border border-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 text-amber-400" />
                          Continuar
                        </button>
                      ) : (
                        <button
                          onClick={pauseRecording}
                          type="button"
                          className="bg-slate-800 hover:bg-slate-755 text-slate-200 font-extrabold text-[10px] uppercase tracking-wider py-2 px-3 border border-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Pause className="w-3.5 h-3.5 text-amber-500" />
                          Pausar
                        </button>
                      )}

                      <button
                        onClick={stopRecording}
                        type="button"
                        className="bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 border border-rose-900/35 font-extrabold text-[10px] uppercase tracking-wider py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5" />
                        Terminar
                      </button>
                    </>
                  ) : null}

                  {(isRecording || audioUrl) && (
                    <button
                      onClick={cancelRecording}
                      disabled={isConvertingAudio}
                      type="button"
                      className="text-slate-505 hover:text-slate-350 text-[10px] font-bold uppercase tracking-wider px-2 cursor-pointer"
                    >
                      Resetear
                    </button>
                  )}
                </div>
              </div>

              {/* 3. REVIEW AUDIO PLAYBACK SECTION */}
              {audioUrl && !isRecording && (
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-805 flex flex-col space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Escuchar Grabación de Borrador:
                    </span>
                  </div>
                  <audio src={audioUrl} controls className="w-full h-8 cursor-pointer" />
                </div>
              )}

              {/* RECORDER DEVIATION REPORT ERRORS */}
              {recorderError && (
                <div className="bg-red-950/40 border border-red-900/30 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <p className="font-bold text-red-300">Aviso del Sistema</p>
                    <p className="text-red-400 mt-0.5 leading-relaxed">{recorderError}</p>
                  </div>
                </div>
              )}

              {/* ACTION BUTTON CONTROLS TO SEND TO IA */}
              {audioUrl && !isRecording && (
                <button
                  onClick={convertRecordedAudio}
                  disabled={isConvertingAudio}
                  type="button"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-100" />
                  <span>Procesar y Redactar Acta de Voz</span>
                </button>
              )}

              {/* LOADER PANEL */}
              {isConvertingAudio && (
                <div className="bg-slate-950 rounded-xl p-5 border border-emerald-900/40 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                  <div className="text-center space-y-1">
                    <p className="text-[10.5px] font-extrabold text-emerald-400 font-mono uppercase tracking-wider animate-pulse">
                      Sincronizando con Gemini AI...
                    </p>
                    <p className="text-[9px] text-slate-500 max-w-xs leading-relaxed font-mono">
                      Transcribiendo dictado, estructurando contenido y aplicando terminología oficial del Código Procesal Penal.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-950/40 px-5 py-3 border-t border-slate-850 text-center">
              <span className="text-[10px] text-slate-500 font-mono">
                Dictado Penal • PNP Generación de Actas Electrónicas por Voz
              </span>
            </div>
          </div>
        </div>
      )}



      {/* MODAL DE ADMINISTRACIÓN PNP */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[1010] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-950/60 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center text-white">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                    PANEL DE ADMINISTRACIÓN DE TOKENS Y USUARIOS PNP
                  </h3>
                  <p className="text-[10px] text-amber-500 font-mono font-extrabold uppercase">
                    Control de Auditoría Reservado • PNP Generación de Actas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Registrar nuevo usuario */}
              <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 font-mono">
                  + Registrar Nueva Cuenta de Agente PNP
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                      N° de Celular (ID)
                    </label>
                    <input
                      type="text"
                      value={adminAddPhone}
                      onChange={(e) => setAdminAddPhone(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                      placeholder="Ej. LAP87654321"
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-350 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                       Tokens Iniciales
                    </label>
                    <input
                      type="number"
                      value={adminAddTokens}
                      onChange={(e) => setAdminAddTokens(e.target.value)}
                      placeholder="Default 0"
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-350 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!adminAddPhone.trim() || adminAddPhone.length < 8) {
                        alert("Por favor ingrese un celular o identificador de al menos 8 caracteres.");
                        return;
                      }
                      const tk = parseInt(adminAddTokens, 10);
                      const initialTokens = isNaN(tk) ? 0 : tk;
                      
                      // Check if already registered
                      if (users.some(u => u.phoneNumber === adminAddPhone)) {
                        alert("Este usuario ya se encuentra registrado en el sistema.");
                        return;
                      }

                      const newUser: PhoneUser = {
                        phoneNumber: adminAddPhone,
                        tokens: initialTokens,
                        autorizado: true,
                        user_gemini_api_key: ""
                      };

                      // Registrar nuevo agente en la base de datos de Firebase
                      saveUserToFirebase(newUser)
                        .then(() => {
                          const newList = [...users, newUser];
                          setUsers(newList);
                          localStorage.setItem("pnp_users", JSON.stringify(newList));
                          setAdminAddPhone("");
                          setAdminAddTokens("0");
                        })
                        .catch((err) => {
                          console.error("Error registrando usuario en Firebase:", err);
                          alert("Ocurrió un error al registrar en la nube.");
                        });
                    }}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.97] transition-all text-white rounded-xl text-xs font-extrabold uppercase font-mono cursor-pointer"
                  >
                    REGISTRAR AGENTE
                  </button>
                </div>
              </div>

              {/* Lista de usuarios */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                  Usuarios Activos y Balances Registrados ({users.length})
                </h4>

                <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/20">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/65 text-[10px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-850 font-mono">
                        <th className="p-3">N° TELÉFONO (ID)</th>
                        <th className="p-3">SALDO TOKENS</th>
                        <th className="p-3">ESTADO / ROL</th>
                        <th className="p-3 text-right">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {users.map((u) => {
                        const isSelf = u.phoneNumber === currentUser?.phoneNumber;
                        return (
                          <tr key={u.phoneNumber} className={`text-xs ${isSelf ? "bg-emerald-950/15" : "hover:bg-slate-800/40"}`}>
                            <td className="p-3 font-mono font-bold tracking-wider">
                              {u.phoneNumber} {isSelf && <span className="ml-1 text-[8.5px] bg-emerald-905 border border-emerald-500/30 text-emerald-300 font-extrabold p-0.5 px-1.5 rounded-lg">TÚ</span>}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-extrabold">
                                <Coins className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                <span>{u.tokens}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`text-[9.5px] font-mono leading-none py-0.5 px-1.5 font-black uppercase border rounded ${
                                u.phoneNumber === "999999999"
                                  ? "bg-amber-950/40 text-amber-400 border-amber-900/40"
                                  : "bg-slate-900/60 text-slate-400 border-slate-800"
                              }`}>
                                {u.phoneNumber === "999999999" ? "ADMIN" : "REGULAR"}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1 flex-wrap">
                                {/* Botones rápidos de sumar/restar tokens */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newList = users.map(user => {
                                      if (user.phoneNumber === u.phoneNumber) {
                                        const tk = Math.max(0, user.tokens + 10);
                                        const updated = { ...user, tokens: tk };
                                        saveUserToFirebase(updated).catch(err => console.error("Error Firebase:", err));
                                        if (isSelf) {
                                          setTimeout(() => updateSaldoActas(tk), 10);
                                        }
                                        return updated;
                                      }
                                      return user;
                                    });
                                    setUsers(newList);
                                    localStorage.setItem("pnp_users", JSON.stringify(newList));
                                  }}
                                  className="px-1.5 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 rounded font-black text-[9px] cursor-pointer"
                                  title="Añadir +10 Tokens"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  disabled={u.tokens === 0}
                                  onClick={() => {
                                    const newList = users.map(user => {
                                      if (user.phoneNumber === u.phoneNumber) {
                                        const tk = Math.max(0, user.tokens - 10);
                                        const updated = { ...user, tokens: tk };
                                        saveUserToFirebase(updated).catch(err => console.error("Error Firebase:", err));
                                        if (isSelf) {
                                          setTimeout(() => updateSaldoActas(tk), 10);
                                        }
                                        return updated;
                                      }
                                      return user;
                                    });
                                    setUsers(newList);
                                    localStorage.setItem("pnp_users", JSON.stringify(newList));
                                  }}
                                  className="px-1.5 py-0.5 bg-rose-955 hover:bg-rose-900 border border-rose-950 rounded font-black text-[9px] disabled:opacity-50 cursor-pointer text-rose-400"
                                  title="Restar -10 Tokens"
                                >
                                  -10
                                </button>

                                <span className="text-slate-700 px-1 font-mono text-[9px]">|</span>

                                {/* Ajustador manual directo */}
                                <input
                                  type="number"
                                  value={u.tokens}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/\D/g, ""), 10);
                                    const numTokens = isNaN(val) ? 0 : val;
                                    const newList = users.map(user => {
                                      if (user.phoneNumber === u.phoneNumber) {
                                        const updated = { ...user, tokens: numTokens };
                                        saveUserToFirebase(updated).catch(err => console.error("Error Firebase:", err));
                                        if (isSelf) {
                                          setTimeout(() => updateSaldoActas(numTokens), 10);
                                        }
                                        return updated;
                                      }
                                      return user;
                                    });
                                    setUsers(newList);
                                    localStorage.setItem("pnp_users", JSON.stringify(newList));
                                  }}
                                  className="w-16 text-center text-xs font-mono font-black py-0.5 bg-slate-950 border border-slate-800 rounded text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                                  title="Ajuste fino de actas"
                                />

                                {/* Botón de eliminar */}
                                {deleteConfirmPhone === u.phoneNumber ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newList = users.filter(user => user.phoneNumber !== u.phoneNumber);
                                        setUsers(newList);
                                        localStorage.setItem("pnp_users", JSON.stringify(newList));
                                        deleteUserFromFirebase(u.phoneNumber).catch(err => console.error("Error Firebase:", err));
                                        setDeleteConfirmPhone(null);
                                      }}
                                      className="flex items-center gap-1 py-1.5 px-2 bg-rose-700 hover:bg-rose-600 text-white rounded font-extrabold text-[9px] cursor-pointer transition-all uppercase animate-pulse border border-rose-500"
                                      title="Sí, eliminar definitivamente del sistema PNP"
                                    >
                                      <Trash2 className="w-3 h-3 text-white shrink-0" />
                                      <span>CONFIRMAR BORRADO</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmPhone(null)}
                                      className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-extrabold text-[9px] cursor-pointer transition-all uppercase border border-slate-700"
                                      title="Cancelar acción"
                                    >
                                      X
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isSelf}
                                    onClick={() => {
                                      setDeleteConfirmPhone(u.phoneNumber || null);
                                    }}
                                    className="flex items-center gap-1 py-1 px-2 mb-1 sm:mb-0 bg-rose-950/80 hover:bg-rose-900 border border-rose-900 text-rose-300 rounded font-black text-[9.5px] disabled:opacity-30 disabled:hover:bg-rose-950/80 disabled:cursor-not-allowed cursor-pointer transition-all uppercase"
                                    title="Eliminar este agente del sistema"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                    <span>BORRAR</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-950/60 p-4 border-t border-slate-800 flex justify-between items-center no-print">
              <span className="text-[10px] text-slate-500 font-mono">
                Consola Central de Operación Administrativa PNP
              </span>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="py-1.5 px-4 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-xl text-[10.5px] font-extrabold uppercase transition-all tracking-wider cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
