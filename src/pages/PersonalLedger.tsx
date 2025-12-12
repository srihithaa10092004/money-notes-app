import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This page now redirects to the main dashboard with personal space
const PersonalLedger = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard - the user can switch to personal space there
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
};

export default PersonalLedger;
