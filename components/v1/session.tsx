"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * v1 client-only session state (AGENT_RULES.md Rule 1).
 *
 * The entire store lives in React memory for the life of the tab. Nothing is
 * persisted (no localStorage, no cookies, no server) and nothing is transmitted.
 * A refresh intentionally clears it — v1 stores zero personal data.
 */

export type AidPath = "fafsa" | "cadaa" | "counselor" | null;

// A single worksheet answer. Kept deliberately loose: v1 never inspects the
// meaning of an answer, it only carries it to the client-side worksheet.
export type AnswerValue = string | number | boolean | string[] | null;

export interface SessionState {
  path: AidPath;
  answers: Record<string, AnswerValue>;
}

export interface SessionContextValue extends SessionState {
  setPath: (path: AidPath) => void;
  setAnswer: (key: string, value: AnswerValue) => void;
  setAnswers: (patch: Record<string, AnswerValue>) => void;
  reset: () => void;
}

const initialState: SessionState = { path: null, answers: {} };

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initialState);

  const setPath = useCallback((path: AidPath) => {
    setState((prev) => ({ ...prev, path }));
  }, []);

  const setAnswer = useCallback((key: string, value: AnswerValue) => {
    setState((prev) => ({ ...prev, answers: { ...prev.answers, [key]: value } }));
  }, []);

  const setAnswers = useCallback((patch: Record<string, AnswerValue>) => {
    setState((prev) => ({ ...prev, answers: { ...prev.answers, ...patch } }));
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<SessionContextValue>(
    () => ({ ...state, setPath, setAnswer, setAnswers, reset }),
    [state, setPath, setAnswer, setAnswers, reset],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
