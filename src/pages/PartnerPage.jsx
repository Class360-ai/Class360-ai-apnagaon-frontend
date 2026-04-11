import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, MapPin, Phone, UploadCloud } from "lucide-react";
import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import useTranslation from "../utils/useTranslation";
import { getWhatsAppLink, safeGenerateMessage } from "../utils/whatsappUtils";
import { useUser } from "../context/UserContext";

const categoryOptions = [
  { value: "grocery", label: "Grocery" },
  { value: "fresh-produce", label: "Fresh Produce" },
  { value: "dairy", label: "Dairy" },
  { value: "medical", label: "Medical" },
  { value: "food-snacks", label: "Food & Snacks" },
  { value: "sweet-shop", label: "Sweet Shop" },
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "carpenter", label: "Carpenter" },
  { value: "teacher-coaching", label: "Teacher / Coaching" },
  { value: "ride-service", label: "Ride Service" },
  { value: "tailor-salon", label: "Tailor / Salon" },
  { value: "other", label: "Other" },
];

const partnerTypes = [
  { value: "shop", label: "Shop" },
  { value: "service", label: "Service" },
];

const PartnerPage = () => {
  const { lang } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    whatsapp: "",
    category: "",
    village: user?.village || "",
    address: "",
    timings: "",
    description: "",
    deliveryAvailable: false,
    serviceArea: "",
    imageUrl: "",
    type: "shop",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const requiredFields = [
    "businessName",
    "ownerName",
    "phone",
    "whatsapp",
    "category",
    "village",
    "address",
    "type",
  ];

  const validationErrors = useMemo(() => {
    return requiredFields.reduce((acc, key) => {
      if (!form[key] || String(form[key]).trim() === "") {
        acc[key] = true;
      }
      return acc;
    }, {});
  }, [form]);

  const isFormValid = Object.keys(validationErrors).length === 0;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const prepareSubmissionPayload = () => ({
    ...form,
    submittedAt: new Date().toISOString(),
    status: "pending",
    source: "partner-registration",
  });

  const handleSubmit = () => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!form[field] || String(form[field]).trim() === "") {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = prepareSubmissionPayload();
    console.log("Partner submission ready for backend:", payload);

    const message = safeGenerateMessage("partner-signup", {
      ...form,
      village: form.village || "Azamgarh",
      lang,
    });

    const whatsappUrl = getWhatsAppLink(message);

    setSubmitted(true);
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-emerald-50 pb-24">
      <Header onLocationClick={() => navigate("/profile")} />

      <div className="p-4 space-y-6">
        <div className="rounded-[32px] bg-white/95 p-5 shadow-xl ring-1 ring-emerald-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {lang === "hi" ? "आपका हिस्सा बनें" : "Become a Partner"}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                {lang === "hi" ? "अपना शॉप या सेवा लिस्ट करें" : "List Your Shop / Service"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                {lang === "hi"
                  ? "स्थानीय ग्राहकों तक पहुंचें, व्हाट्सएप ऑर्डर प्राप्त करें और अपने व्यवसाय को बढ़ाएं।"
                  : "Reach local customers, receive WhatsApp orders, and grow your business online."}
              </p>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-white shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/20 text-2xl">
                  🤝
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                    {lang === "hi" ? "साझेदारी" : "Join ApnaGaon"}
                  </p>
                  <p className="text-sm text-white/90">
                    {lang === "hi" ? "स्थानीय बिज़नेस के लिए" : "For local businesses"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[32px] bg-white p-4 shadow-xl ring-1 ring-emerald-100">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-emerald-50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-3xl bg-white p-3 text-emerald-600 shadow-sm">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{lang === "hi" ? "अधिक ग्राहक" : "Get more customers"}</h2>
                  <p className="text-sm text-slate-600">{lang === "hi" ? "अपनी दुकान को स्थानीय दर्शकों तक पहुँचाएं" : "Bring your shop to local audiences"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-3xl bg-white p-3 text-emerald-600 shadow-sm">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{lang === "hi" ? "व्हाट्सएप ऑर्डर" : "Receive WhatsApp orders"}</h2>
                  <p className="text-sm text-slate-600">{lang === "hi" ? "ग्राहक सीधे व्हाट्सएप पर ऑर्डर भेजें" : "Customers can message orders directly"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-3xl bg-white p-3 text-emerald-600 shadow-sm">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{lang === "hi" ? "स्थानीय भरोसा" : "Build trust locally"}</h2>
                  <p className="text-sm text-slate-600">{lang === "hi" ? "अपने गाँव के ग्राहकों के साथ भरोसा बनाएं" : "Build trust with village customers"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-3xl bg-white p-3 text-emerald-600 shadow-sm">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{lang === "hi" ? "ऑनलाइन बढ़ें" : "Grow your business online"}</h2>
                  <p className="text-sm text-slate-600">{lang === "hi" ? "डिजिटल लिस्टिंग के साथ पहुंच बढ़ाएं" : "Increase reach with digital listing"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-5 shadow-xl ring-1 ring-emerald-100">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {lang === "hi" ? "रजिस्ट्रेशन फॉर्म" : "Registration Form"}
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                {lang === "hi" ? "अपनी दुकान जोड़ें" : "Add your shop"}
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">
              <ArrowRight className="h-4 w-4" />
              {lang === "hi" ? "सुरक्षित और आसान" : "Safe & easy"}
            </span>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "बिज़नेस का नाम" : "Business Name"}</label>
                <input
                  value={form.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none ${errors.businessName ? "border-red-400" : "border-slate-200"}`}
                  placeholder={lang === "hi" ? "आपके व्यवसाय का नाम" : "Enter your business name"}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "स्वामी का नाम" : "Owner Name"}</label>
                <input
                  value={form.ownerName}
                  onChange={(e) => handleChange("ownerName", e.target.value)}
                  className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none ${errors.ownerName ? "border-red-400" : "border-slate-200"}`}
                  placeholder={lang === "hi" ? "स्वामी का नाम" : "Enter owner name"}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "फ़ोन" : "Phone"}</label>
                <input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none ${errors.phone ? "border-red-400" : "border-slate-200"}`}
                  placeholder="9123456789"
                  type="tel"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">WhatsApp</label>
                <input
                  value={form.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none ${errors.whatsapp ? "border-red-400" : "border-slate-200"}`}
                  placeholder="919123456789"
                  type="tel"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "श्रेणी" : "Category"}</label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none ${errors.category ? "border-red-400" : "border-slate-200"}`}
                >
                  <option value="">{lang === "hi" ? "श्रेणी चुनें" : "Select a category"}</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "गाँव" : "Village"}</label>
                <input
                  value={form.village}
                  onChange={(e) => handleChange("village", e.target.value)}
                  className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none ${errors.village ? "border-red-400" : "border-slate-200"}`}
                  placeholder={lang === "hi" ? "आपका गाँव" : "Enter your village"}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "पता" : "Address"}</label>
              <textarea
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none ${errors.address ? "border-red-400" : "border-slate-200"}`}
                rows={3}
                placeholder={lang === "hi" ? "अपना पूरा पता लिखें" : "Enter full address"}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "समय" : "Timings"}</label>
                <input
                  value={form.timings}
                  onChange={(e) => handleChange("timings", e.target.value)}
                  className="mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none border-slate-200"
                  placeholder={lang === "hi" ? "उदाहरण: 9am - 8pm" : "e.g. 9am - 8pm"}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "सर्विस क्षेत्र" : "Service Area"}</label>
                <input
                  value={form.serviceArea}
                  onChange={(e) => handleChange("serviceArea", e.target.value)}
                  className="mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none border-slate-200"
                  placeholder={lang === "hi" ? "उदा. 5km radius" : "e.g. 5km radius"}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "टाइप" : "Type"}</label>
                <select
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none border-slate-200"
                >
                  {partnerTypes.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "डिलीवरी उपलब्ध" : "Delivery Available"}</label>
                <div className="mt-2 flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-3">
                  <input
                    id="deliveryAvailable"
                    type="checkbox"
                    checked={form.deliveryAvailable}
                    onChange={(e) => handleChange("deliveryAvailable", e.target.checked)}
                    className="h-4 w-4 text-emerald-600 accent-emerald-600"
                  />
                  <label htmlFor="deliveryAvailable" className="text-sm text-slate-700">
                    {lang === "hi" ? "हाँ" : "Yes"}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "विवरण" : "Description"}</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="mt-2 w-full rounded-3xl border px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none border-slate-200"
                rows={4}
                placeholder={lang === "hi" ? "अपने बिज़नेस का छोटा परिचय दें" : "Describe your shop or service"}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">{lang === "hi" ? "इमेज URL" : "Image URL"}</label>
              <div className="mt-2 flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <UploadCloud className="h-5 w-5 text-emerald-600" />
                <input
                  value={form.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  className="w-full border-none bg-transparent text-sm outline-none"
                  placeholder={lang === "hi" ? "इमेज लिंक पेस्ट करें" : "Paste image URL"}
                  type="url"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row items-stretch">
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-3xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white shadow-xl transition hover:bg-emerald-700 hover:shadow-2xl"
            >
              {lang === "hi" ? "व्हाट्सएप पर सबमिट करें" : "Submit via WhatsApp"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {lang === "hi" ? "घर लौटें" : "Back Home"}
            </button>
          </div>

          {!isFormValid && Object.keys(errors).length > 0 && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {lang === "hi"
                ? "कृपया सभी आवश्यक फ़ील्ड भरें।"
                : "Please fill in all required fields."}
            </div>
          )}

          {submitted && (
            <div className="rounded-3xl border border-green-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              {lang === "hi"
                ? "आपकी जानकारी भेज दी गई है। व्हाट्सएप पर आगे की पुष्टि करें।"
                : "Your request has been sent. Please confirm on WhatsApp."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerPage;
