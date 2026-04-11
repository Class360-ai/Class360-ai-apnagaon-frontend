import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import useTranslation from "../utils/useTranslation";
import { getSmartVillageCategories } from "../data/categories";

const ServicesPage = () => {
  const { lang } = useTranslation();
  const navigate = useNavigate();
  const serviceCategories = getSmartVillageCategories();

  if (!serviceCategories || serviceCategories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onLocationClick={() => navigate("/profile")} />
        <EmptyState
          title={lang === "hi" ? "कोई सेवाएं नहीं मिली" : "No services found"
          }
          description={lang === "hi" ? "कृपया बाद में फिर से प्रयास करें" : "Please try again later"}
          action={() => navigate("/")}
          actionText={lang === "hi" ? "घर लौटें" : "Back Home"}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header onLocationClick={() => navigate("/profile")} />
      <div className="px-4 py-5">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {lang === "hi" ? "सेवाएं एक्सप्लोर करें" : "Explore Services"}
          </h1>
          <p className="text-sm text-gray-600">
            {lang === "hi"
              ? "अपने गाँव के भरोसेमंद सेवा प्रदाता चुनें"
              : "Choose trusted service providers in your village"}
          </p>
        </div>

        <div className="grid gap-4">
          {serviceCategories.map((category) => (
            <button
              key={category.slug}
              onClick={() => navigate(`/${category.slug}`)}
              className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${category.color} text-2xl`}>
                  {category.emoji}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {lang === "hi" ? category.nameHi || category.name : category.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {lang === "hi" ? category.descriptionHi || category.description : category.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
