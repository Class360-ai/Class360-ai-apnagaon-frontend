import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authAPI, safeFetch } from "../utils/api";

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const data = await safeFetch(() => authAPI.users(), []);
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
      <main className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Go back"><ArrowLeft className="h-5 w-5" /></button>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Users className="h-5 w-5" /></span>
          <div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Admin</p><h1 className="text-xl font-black text-slate-950">Users</h1></div>
        </div>
        {loading ? <p className="rounded-[24px] bg-white p-5 text-sm font-bold text-slate-500">Loading users...</p> : null}
        <section className="grid gap-3">
          {users.map((user) => (
            <article key={user._id || user.id || user.email} className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-black text-slate-950">{user.name}</p><p className="text-xs font-bold text-slate-500">{user.email} / {user.phone || "No phone"}</p></div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-700 ring-1 ring-emerald-100">{user.role}</span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default AdminUsersPage;
