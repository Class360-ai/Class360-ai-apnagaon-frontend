import React from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import ErrorState from "../components/ErrorState";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-orange-50/40 to-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <ErrorState
          icon={Home}
          title="Page not found"
          description="This page doesn't exist, but we can safely take you back home."
          primaryAction={() => navigate("/")}
          primaryActionText="Go home"
          secondaryAction={() => navigate("/help")}
          secondaryActionText="Get help"
          helperText="Launch-ready ApnaGaon"
        />
      </div>
    </div>
  );
};

export default NotFoundPage;
