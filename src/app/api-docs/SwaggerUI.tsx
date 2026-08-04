"use client";

import { useCallback, useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

type SwaggerUIWrapperProps = {
  spec: object;
};

type AuthUser = {
  user_name: string;
  email: string;
};

type AuthStatus =
  | { state: "checking" }
  | { state: "authenticated"; user: AuthUser }
  | { state: "unauthenticated" }
  | { state: "error" };

export default function SwaggerUIWrapper({
  spec,
}: SwaggerUIWrapperProps) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    state: "checking",
  });

  const checkAuth = useCallback(async () => {
    setAuthStatus({ state: "checking" });

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        setAuthStatus({ state: "unauthenticated" });
        return;
      }

      if (!response.ok) {
        setAuthStatus({ state: "error" });
        return;
      }

      const result = await response.json();

      setAuthStatus({
        state: "authenticated",
        user: {
          user_name: result.data.user.user_name,
          email: result.data.user.email,
        },
      });
    } catch {
      setAuthStatus({ state: "error" });
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void checkAuth();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [checkAuth]);

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            {authStatus.state === "checking" ? (
              <p className="font-medium text-amber-600">
                🟡 Checking session...
              </p>
            ) : null}

            {authStatus.state === "authenticated" ? (
              <div>
                <p className="font-semibold text-green-600">
                  🟢 Authenticated
                </p>
                <p className="text-sm text-slate-600">
                  {authStatus.user.user_name} — {authStatus.user.email}
                </p>
              </div>
            ) : null}

            {authStatus.state === "unauthenticated" ? (
              <p className="font-semibold text-red-600">
                🔴 Not authenticated
              </p>
            ) : null}

            {authStatus.state === "error" ? (
              <p className="font-semibold text-red-600">
                🔴 Unable to check session
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={checkAuth}
            disabled={authStatus.state === "checking"}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Refresh auth status
          </button>
        </div>
      </section>

      <SwaggerUI spec={spec} />
    </main>
  );
}
