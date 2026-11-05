"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  ShieldAlert,
  Lock,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { MyGutBiomeLogo } from "@/components/ui/mygutbiome-logo";

interface AuthGateProps {
  children: React.ReactNode;
}

interface UserSession {
  username: string;
  role: string;
  category?: string;
  expiresAt: number;
}

const STORAGE_KEY = "oneomics_gutbiome_session";
const NIPTON_PORTAL_URL =
  process.env.NEXT_PUBLIC_NIPTON_PORTAL_URL || "http://localhost:3000";

export function AuthGate({ children }: AuthGateProps) {
  const [authStatus, setAuthStatus] = useState<
    "checking" | "authorized" | "denied"
  >("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sessionUser, setSessionUser] = useState<UserSession | null>(null);
  const [isLocal, setIsLocal] = useState<boolean>(false);

  const verifyTokenWithBackend = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        const session: UserSession = {
          username: data.user.username,
          role: data.user.role,
          category: data.user.category,
          expiresAt: data.expiresAt,
        };

        // Strictly tab-scoped storage: when copied to another tab, sessionStorage is EMPTY!
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } catch (_) {}

        // Strip the token from the URL bar immediately so it cannot be copied or bookmarked
        if (typeof window !== "undefined" && window.history && window.history.replaceState) {
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState(null, "", cleanUrl);
        }

        setSessionUser(session);
        setAuthStatus("authorized");
        return true;
      } else {
        setErrorMessage(
          data.message ||
            "Authentication failed: The provided launch token is invalid or has expired."
        );
        setAuthStatus("denied");
        return false;
      }
    } catch (err: any) {
      setErrorMessage(
        "Network error verifying authentication credentials. Please try again."
      );
      setAuthStatus("denied");
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 0. Distinguish between live deployment (Vercel) and local development.
    // Restriction only applies when opened on the live deployment (e.g. https://gut-biome.vercel.app/)
    // Localhost / 127.0.0.1 is completely unrestricted for seamless local development.
    const hostname = window.location.hostname;
    const isLiveDeployment =
      hostname.includes("vercel.app") ||
      hostname.includes("oneomics") ||
      (typeof window !== "undefined" && (window as any).__MOCK_LIVE_DOMAIN === true);

    const isLocalhost =
      !isLiveDeployment && (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.endsWith(".local") ||
        process.env.NODE_ENV === "development"
      );

    if (isLocalhost) {
      setIsLocal(true);
      setSessionUser({
        username: "Local Dev",
        role: "admin",
        category: "dtc",
        expiresAt: Date.now() + 86400000,
      });
      setAuthStatus("authorized");
      return;
    }

    // 1. Check tab-scoped sessionStorage first
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: UserSession = JSON.parse(stored);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          // Slide the session expiration window on activity (8 hours from now)
          parsed.expiresAt = Date.now() + 8 * 60 * 60 * 1000;
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          } catch (_) {}

          setSessionUser(parsed);
          setAuthStatus("authorized");
          return;
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (_) {}

    // 2. Check URL query parameters for ?nipton_token=...
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("nipton_token");

    if (tokenFromUrl) {
      verifyTokenWithBackend(tokenFromUrl);
      return;
    }

    // 3. If embedded in iframe, listen for postMessage handshake from parent Nipton window
    const isEmbedded = window.self !== window.top;
    if (isEmbedded) {
      let handshakeReceived = false;

      const handleMessage = (e: MessageEvent) => {
        if (e.data && e.data.type === "NIPTON_AUTH_HANDSHAKE" && e.data.token) {
          handshakeReceived = true;
          window.removeEventListener("message", handleMessage);
          verifyTokenWithBackend(e.data.token);
        }
      };

      window.addEventListener("message", handleMessage);

      // Notify parent frame that child is ready for handshake
      try {
        window.parent.postMessage({ type: "GUTBIOME_READY_FOR_AUTH" }, "*");
      } catch (_) {}

      // Fallback timer if no handshake arrives within 1 second
      const timer = setTimeout(() => {
        if (!handshakeReceived) {
          window.removeEventListener("message", handleMessage);
          setErrorMessage(
            "Direct link access is restricted. No active Nipton authorization token was detected."
          );
          setAuthStatus("denied");
        }
      }, 1000);

      return () => {
        window.removeEventListener("message", handleMessage);
        clearTimeout(timer);
      };
    }

    // 4. Standalone direct access without token: Block immediately!
    setErrorMessage(
      "Direct link access is prohibited. This application can only be accessed through an authenticated OneOmics Nipton session."
    );
    setAuthStatus("denied");
  }, [verifyTokenWithBackend]);

  // ── Checking / Validating Splash ──────────────────────────────────────────
  if (authStatus === "checking") {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#071311] px-4 text-white">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute h-20 w-20 animate-ping rounded-full bg-emerald-500/20 duration-1000" />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-[#0d2623] shadow-lg shadow-emerald-500/10">
            <KeyRound className="h-8 w-8 animate-pulse text-emerald-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold tracking-wide text-slate-100">
          Verifying OneOmics DTC Credentials
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Authenticating single-tab session security handshake for GutBiome...
        </p>
      </div>
    );
  }

  // ── Access Denied Barrier ─────────────────────────────────────────────────
  if (authStatus === "denied") {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#06110f] via-[#091b18] to-[#06110f] p-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-[#0c1f1d]/90 p-8 shadow-2xl shadow-red-950/40 backdrop-blur-md">
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/40 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/40 bg-red-950/50 text-red-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Access Restricted
                </h3>
                <span className="font-mono text-xs uppercase tracking-wider text-red-400">
                  Direct Link Prohibited
                </span>
              </div>
            </div>
            <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 font-mono text-[11px] text-slate-300">
              DTC Pipeline
            </span>
          </div>

          {/* Description */}
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-sm leading-relaxed text-red-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div>
                  <p className="font-medium text-red-300">
                    Authentication Required
                  </p>
                  <p className="mt-1 text-xs text-red-200/80">
                    {errorMessage ||
                      "Direct access or opening this link in another tab is prohibited. MyGutBiome must be launched from your authenticated OneOmics Nipton account."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-[#1f4f4a]/40 bg-[#071715]/60 p-4 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <Lock className="h-4 w-4" />
                <span>Single-Tab Cryptographic Isolation Active</span>
              </div>
              <p className="text-slate-400">
                To protect clinical microbiome matrices and patient genomics data:
              </p>
              <ul className="ml-5 list-disc space-y-1 text-slate-400">
                <li>Copying this URL to other tabs will not work.</li>
                <li>Direct bookmarks to the Vercel URL are blocked.</li>
                <li>Sessions must originate from an authenticated Nipton login.</li>
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={NIPTON_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-teal-500"
            >
              <span>Launch from OneOmics Nipton</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              onClick={() => {
                setAuthStatus("checking");
                setErrorMessage("");
                window.location.reload();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Authentication</span>
            </button>
          </div>

          {/* Footer info */}
          <div className="mt-6 flex items-center justify-between border-t border-[#1f4f4a]/30 pt-4 text-[11px] text-slate-500 font-mono">
            <span>ONEOMICS • MyGutBiome</span>
            <span>Vercel Edge Gate</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Authorized View ───────────────────────────────────────────────────────
  return (
    <>
      {/* Session Security Indicator (floating badge on top right) */}
      {!isLocal && sessionUser && (
        <div className="fixed top-2 right-3 z-50 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-[#0d2623]/90 px-3 py-1 font-mono text-[10px] text-emerald-300 shadow-md backdrop-blur-xs pointer-events-none print:hidden">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>ONEOMICS AUTH • {sessionUser.username}</span>
        </div>
      )}

      {children}
    </>
  );
}
