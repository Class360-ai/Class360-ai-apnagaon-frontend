import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import { safeFetch, servicePartnersAPI } from "../utils/api";

const initialForm = {
  name: "",
  phone: "",
  serviceType: "electrician",
  experience: "",
  area: "",
  address: "",
  availableTimings: "",
  emergencyAvailable: false,
  idProof: "",
  photo: "",
  lat: "",
  lon: "",
};

const ServicePartnerOnboardingPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    const nextErrors = {};
    ["name", "phone", "serviceType", "area", "address", "availableTimings"].forEach((key) => {
      if (!String(form[key] || "").trim()) nextErrors[key] = "Required";
    });
    if (form.lat && !Number.isFinite(Number(form.lat))) nextErrors.lat = "Latitude must be numeric";
    if (form.lon && !Number.isFinite(Number(form.lon))) nextErrors.lon = "Longitude must be numeric";
    setErrors(nextErrors);
    return nextErrors;
  };

  const submit = async () => {
    setMessage("");
    if (Object.keys(validate()).length) {
      setMessage("Please complete the required service partner details.");
      return;
    }
    const saved = await safeFetch(() => servicePartnersAPI.apply({ ...form, lat: form.lat ? Number(form.lat) : null, lon: form.lon ? Number(form.lon) : null, status: "pending" }), null);
    if (saved) {
      setMessage("Service partner application submitted for approval.");
      setForm(initialForm);
      setErrors({});
    } else {
      setMessage("Backend unavailable. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-5">
      <main className="mx-auto max-w-2xl space-y-4">
        <section className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-orange-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><Wrench className="h-7 w-7" /></span>
          <p className="mt-4 text-xs font-black uppercase tracking-wide text-orange-600">Service Partner</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Join ApnaGaon services</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Electrician, plumber, repair, tutor, ride, and village services.</p>
        </section>
        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="grid gap-3 md:grid-cols-2">
            {["name", "phone", "serviceType", "experience", "area", "address", "availableTimings", "idProof", "photo", "lat", "lon"].map((key) => (
              <div key={key} className="space-y-1">
                <input value={form[key]} onChange={(event) => update(key, event.target.value)} className={`w-full rounded-2xl border px-3 py-3 text-sm outline-none ${errors[key] ? "border-red-400" : "border-slate-200"}`} placeholder={key.replace(/([A-Z])/g, " $1")} />
                {errors[key] ? <p className="text-[11px] font-bold text-red-600">{errors[key]}</p> : null}
              </div>
            ))}
            <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.emergencyAvailable} onChange={(event) => update("emergencyAvailable", event.target.checked)} /> Emergency available</label>
          </div>
          {message ? <p className="mt-3 rounded-2xl bg-orange-50 p-3 text-xs font-bold text-orange-700">{message}</p> : null}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={submit} className="rounded-full bg-orange-500 px-4 py-4 text-sm font-black text-white">Submit Application</button>
            <button type="button" onClick={() => navigate("/")} className="rounded-full bg-white px-4 py-4 text-sm font-black text-slate-700 ring-1 ring-slate-200">Back Home</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ServicePartnerOnboardingPage;
