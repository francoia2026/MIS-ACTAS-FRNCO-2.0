import React, { useState, useEffect, useCallback } from "react";

const STORAGE_KEYS = {
  nombres: "pnp_history_nombres",
  apellidos: "pnp_history_apellidos",
  unidad: "pnp_history_unidad"
};

const MAX_HISTORY_ITEMS = 8;

export function useHistoryAutocomplete() {
  const [historyNombres, setHistoryNombres] = useState<string[]>([]);
  const [historyApellidos, setHistoryApellidos] = useState<string[]>([]);
  const [historyUnidad, setHistoryUnidad] = useState<string[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const n = localStorage.getItem(STORAGE_KEYS.nombres);
      const a = localStorage.getItem(STORAGE_KEYS.apellidos);
      const u = localStorage.getItem(STORAGE_KEYS.unidad);

      if (n) setHistoryNombres(JSON.parse(n));
      else {
        // Seed default names list if empty
        const defaultNames = ["JUAN CARLOS", "LUIS ALBERTO", "CARLOS ANDRES", "MARIA ELENA", "JOSE LUIS"];
        setHistoryNombres(defaultNames);
        localStorage.setItem(STORAGE_KEYS.nombres, JSON.stringify(defaultNames));
      }

      if (a) setHistoryApellidos(JSON.parse(a));
      else {
        // Seed default surnames list if empty
        const defaultSurnames = ["QUISPE MAMANI", "FLORES RAMIREZ", "RODRIGUEZ SOTO", "GONZALES DIAZ", "SANCHEZ GOMEZ"];
        setHistoryApellidos(defaultSurnames);
        localStorage.setItem(STORAGE_KEYS.apellidos, JSON.stringify(defaultSurnames));
      }

      if (u) setHistoryUnidad(JSON.parse(u));
      else {
        // Seed default units if empty
        const defaultUnits = ["COMISARIA PNP SAN ANDRES", "DIVINCRI", "DEPINCRI", "COMISARIA PNP ALFONSO UGARTE", "COMISARIA PNP MIRAFLORES"];
        setHistoryUnidad(defaultUnits);
        localStorage.setItem(STORAGE_KEYS.unidad, JSON.stringify(defaultUnits));
      }
    } catch (e) {
      console.error("Error reading autocomplete history from localStorage:", e);
    }
  }, []);

  // Add a new entry to the specific history list
  const addEntry = useCallback((type: "nombres" | "apellidos" | "unidad", value: string) => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed || trimmed.length < 2) return;

    const storageKey = STORAGE_KEYS[type];
    let setter: React.Dispatch<React.SetStateAction<string[]>>;

    if (type === "nombres") {
      setter = setHistoryNombres;
    } else if (type === "apellidos") {
      setter = setHistoryApellidos;
    } else {
      setter = setHistoryUnidad;
    }

    setter((prev) => {
      // Remove element if it already exists to move it to the front
      const filtered = prev.filter((item) => item.toUpperCase() !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error("Error saving history item:", e);
      }
      return updated;
    });
  }, []);

  // Save all current values of police to history (e.g. on blur, or when generating documents)
  const savePoliceToHistory = useCallback((instructorNombres?: string, instructorApellidos?: string, unidadPolicial?: string) => {
    if (instructorNombres) addEntry("nombres", instructorNombres);
    if (instructorApellidos) addEntry("apellidos", instructorApellidos);
    if (unidadPolicial) addEntry("unidad", unidadPolicial);
  }, [addEntry]);

  // Helpers to get filtered suggestions based on current query
  const getSuggestions = useCallback((type: "nombres" | "apellidos" | "unidad", query: string): string[] => {
    const trimmedQuery = query.trim().toUpperCase();
    const list = type === "nombres" ? historyNombres : type === "apellidos" ? historyApellidos : historyUnidad;
    if (!trimmedQuery) {
      // Return first few items if query is empty (to act as default recommendations)
      return list.slice(0, 5);
    }
    return list.filter((item) => item.toUpperCase().includes(trimmedQuery)).slice(0, 5);
  }, [historyNombres, historyApellidos, historyUnidad]);

  return {
    historyNombres,
    historyApellidos,
    historyUnidad,
    addEntry,
    savePoliceToHistory,
    getSuggestions
  };
}
