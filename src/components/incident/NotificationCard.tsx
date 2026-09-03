"use client";

import { useState } from "react";
import {
  Bell,
  Send,
  Eye,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import type { NotificationDraft } from "@/server/schemas/incident";

interface NotificationCardProps {
  draft: NotificationDraft;
  onSimulate: (editedDraftMessage?: string, userNotes?: string) => Promise<void>;
  isSimulating: boolean;
  isSimulated: boolean;
  className?: string;
}

export function NotificationCard({
  draft,
  onSimulate,
  isSimulating,
  isSimulated,
  className = "",
}: NotificationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userNotes, setUserNotes] = useState(draft.userNotes || "");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = draft.formattedMessage || draft.summary;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateClick = async () => {
    await onSimulate(draft.formattedMessage, userNotes);
  };

  return (
    <div
      className={`rounded-2xl border border-purple-500/30 bg-gray-950/70 p-6 shadow-2xl backdrop-blur-sm ${className}`}
      role="region"
      aria-label="Emergency Notification Draft & Simulation"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Emergency Notification Draft</h3>
            <p className="text-xs text-gray-400">Review, customize notes, and trigger demo simulation</p>
          </div>
        </div>

        <div>
          {isSimulated ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              NOTIFICATION SENT (SIMULATED)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/40 bg-purple-500/15 text-purple-300">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-400" />
              </span>
              NOTIFICATION READY
            </span>
          )}
        </div>
      </div>

      {/* Notification Body Preview */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/90 p-4 font-mono text-xs text-gray-200 leading-relaxed shadow-inner mb-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
            Structured Notification Content
          </span>
          <button
            onClick={handleCopy}
            type="button"
            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-1.5 text-gray-300">
          <p className="font-bold text-white text-sm">
            {draft.incidentType.toUpperCase()}
          </p>
          <p>
            <span className="text-gray-500">Location: </span>
            <span className="text-emerald-300 font-semibold">{draft.location}</span>
          </p>
          <p>
            <span className="text-gray-500">Potentially affected: </span>
            <span className="text-orange-300">{draft.peoplePotentiallyAffected}</span>
          </p>
          <div>
            <span className="text-gray-500">Visible hazards:</span>
            <ul className="pl-4 mt-0.5 space-y-0.5 text-amber-200">
              {draft.visibleHazards.map((h, i) => (
                <li key={i}>• {h}</li>
              ))}
            </ul>
          </div>
          <p>
            <span className="text-gray-500">Summary: </span>
            <span>{draft.summary}</span>
          </p>
          {userNotes && (
            <p className="border-t border-gray-800 pt-1 text-cyan-300">
              <span className="text-gray-500">Additional note: </span>
              {userNotes}
            </p>
          )}
          <p className="pt-2 border-t border-gray-800 text-[11px] text-amber-400/80">
            {draft.uncertaintyNotice}
          </p>
        </div>
      </div>

      {/* Editable Notes Section */}
      {!isSimulated && (
        <div className="mb-4">
          <label
            htmlFor="user-notes-input"
            className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between"
          >
            <span>Add Additional Context / Landmarks (Optional):</span>
            <span className="text-gray-500 text-[11px] font-normal">Included in draft</span>
          </label>
          <textarea
            id="user-notes-input"
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="e.g. Near the main entrance gate, traffic blocked on northbound lane..."
            rows={2}
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>
      )}

      {/* Simulation Result or Actions */}
      {isSimulated ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>✓ Demo notification prepared</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>✓ Simulated notification recorded</span>
          </div>
          <p className="text-xs text-gray-400 pt-1 border-t border-emerald-500/20">
            Recorded in local analysis history. No real emergency call was made or dispatched.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              id="review-notification-btn"
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-3 text-sm font-bold text-purple-300 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <span>REVIEW DETAILS</span>
            </button>

            <button
              type="button"
              id="simulate-notification-btn"
              onClick={handleSimulateClick}
              disabled={isSimulating}
              className={`flex-1 rounded-xl px-5 py-3 text-sm font-extrabold flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-95 ${
                isSimulating
                  ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-purple-950/40 cursor-pointer border border-purple-400/30"
              }`}
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>SIMULATING NOTIFICATION...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>SIMULATE NOTIFICATION</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-center text-gray-500">
            For real emergencies, always contact your official local emergency number.
          </p>
        </div>
      )}
    </div>
  );
}
