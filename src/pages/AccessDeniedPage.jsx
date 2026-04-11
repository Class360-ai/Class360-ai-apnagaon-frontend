import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, Home, LogIn } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { getRoleHomePath, getRoleLabel } from "../utils/roleUtils";

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const homePath = auth.isLoggedIn ? getRoleHomePath(auth.user?.role) : "/";
  const roleLabel = auth.isLoggedIn ? getRoleLabel(auth.user?.role) : "guest";

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-8">
      <main className="mx-auto max-w-md space-y-4">
        <section className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-8 ring-amber-100">
            <Lock className="h-8 w-8" />
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-amber-700">Access denied</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">You can’t open this area</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {auth.isLoggedIn
              ? `This section is reserved for ${roleLabel} accounts.`
              : "Please sign in to continue to your account area."}
          </p>
          {location.state?.from ? (
            <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">
              Attempted route: <span className="font-black text-slate-700">{location.state.from}</span>
            </p>
          ) : null}
        </section>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => navigate(homePath, { replace: true })}
            className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100"
          >
            <Home className="h-4 w-4" />
            Go to my dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-4 text-sm font-black text-slate-900 shadow-sm ring-1 ring-slate-100"
          >
            <LogIn className="h-4 w-4 text-orange-600" />
            Sign in
          </button>
        </div>
      </main>
    </div>
  );
};

export default AccessDeniedPage;
