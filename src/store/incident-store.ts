import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Incident } from "@/server/schemas/incident";

interface IncidentStore {
  incidents: Incident[];
  currentIncidentId: string | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  notificationStatus: "idle" | "ready" | "reviewing" | "simulated";

  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  addOrUpdateIncident: (incident: Incident) => void;
  setCurrentIncidentId: (id: string | null) => void;
  setNotificationStatus: (status: IncidentStore["notificationStatus"]) => void;
  getCurrentIncident: () => Incident | undefined;
  clearError: () => void;
}

export const useIncidentStore = create<IncidentStore>()(
  persist(
    (set, get) => ({
      incidents: [],
      currentIncidentId: null,
      isAnalyzing: false,
      analysisError: null,
      notificationStatus: "idle",

      setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
      setAnalysisError: (error) => set({ analysisError: error }),

      addOrUpdateIncident: (incident) =>
        set((state) => {
          const exists = state.incidents.findIndex((i) => i.id === incident.id);
          if (exists >= 0) {
            const updated = [...state.incidents];
            updated[exists] = incident;
            return { incidents: updated };
          }
          return { incidents: [incident, ...state.incidents] };
        }),

      setCurrentIncidentId: (id) => set({ currentIncidentId: id }),

      setNotificationStatus: (status) => set({ notificationStatus: status }),

      getCurrentIncident: () => {
        const state = get();
        return state.incidents.find((i) => i.id === state.currentIncidentId);
      },

      clearError: () => set({ analysisError: null }),
    }),
    {
      name: "resqlens-incidents",
      partialize: (state) => ({
        incidents: state.incidents,
        currentIncidentId: state.currentIncidentId,
      }),
    }
  )
);
