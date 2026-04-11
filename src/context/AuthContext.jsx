import React, { useEffect, useMemo, useState } from "react";
import { AUTH_STORAGE_KEY, authAPI, safeFetch } from "../utils/api";
import { AuthContext } from "./authContextValue";
import { getRoleHomePath, normalizeRole } from "../utils/roleUtils";

const readAuth = () => {
  try {
    const saved = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : { token: "", user: null };
    return parsed?.user ? { ...parsed, user: normalizeUser(parsed.user) } : parsed;
  } catch {
    return { token: "", user: null };
  }
};

const writeAuth = (auth) => {
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } catch {
    // Auth still works in memory.
  }
};

const normalizeUser = (user = null) => {
  if (!user) return null;
  const role = normalizeRole(user.role);
  return {
    ...user,
    role,
    displayRole: role,
    homePath: getRoleHomePath(role),
  };
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(readAuth);

  useEffect(() => {
    if (!auth.token) return;
    const syncMe = async () => {
      const result = await safeFetch(() => authAPI.me(), null);
      if (result?.user) {
        const nextAuth = { token: auth.token, user: normalizeUser(result.user) };
        setAuth(nextAuth);
        writeAuth(nextAuth);
      }
    };
    syncMe();
  }, [auth.token]);

  const login = async (identifier, password, mode = "customer") => {
    const result = await safeFetch(() => authAPI.login(mode === "customer" ? { phone: identifier, password } : { email: identifier, password }), null);
    if (!result?.token || !result?.user) return { ok: false, message: "Login failed. Check email/password or backend." };
    const nextAuth = { token: result.token, user: normalizeUser(result.user) };
    setAuth(nextAuth);
    writeAuth(nextAuth);
    return { ok: true, user: nextAuth.user };
  };

  const register = async (payload) => {
    const result = await safeFetch(() => authAPI.register(payload), null);
    if (!result?.token || !result?.user) return { ok: false, message: "Registration failed. Please try again." };
    const nextAuth = { token: result.token, user: normalizeUser(result.user) };
    setAuth(nextAuth);
    writeAuth(nextAuth);
    return { ok: true, user: nextAuth.user };
  };

  const signup = register;

  const getCurrentUser = () => auth.user;

  const updateProfile = async (payload) => {
    const result = await safeFetch(() => authAPI.updateMe(payload), null);
    if (!result?.user) return { ok: false, message: "Unable to update profile" };
    const nextAuth = { ...auth, user: normalizeUser(result.user) };
    setAuth(nextAuth);
    writeAuth(nextAuth);
    return { ok: true, user: nextAuth.user };
  };

  const logout = () => {
    const empty = { token: "", user: null };
    setAuth(empty);
    writeAuth(empty);
  };

  const value = useMemo(
    () => ({
      ...auth,
      login,
      register,
      signup,
      updateProfile,
      logout,
      getCurrentUser,
      isLoggedIn: Boolean(auth.token && auth.user),
      role: normalizeRole(auth.user?.role),
      homePath: getRoleHomePath(auth.user?.role),
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
