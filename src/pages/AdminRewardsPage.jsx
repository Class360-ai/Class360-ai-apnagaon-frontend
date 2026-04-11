import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import AdminRewardPanel from "../components/AdminRewardPanel";

const AdminRewardsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header onLocationClick={() => navigate("/profile")} />
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <AdminRewardPanel />
      </div>
    </div>
  );
};

export default AdminRewardsPage;
