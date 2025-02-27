import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { getAuthToken } from "../utils/event-utils.js";
import { fetchData } from "./fetchData.js";

export function useAuthorization(page) {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  // const token = getAuthToken();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    async function checkAuth() {
      try {
        const resdata = await fetchData("/viewauth", "POST", { page: page });
        if (resdata) {
          setMessage(resdata.message);
        } else {
          sessionStorage.clear();
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      }
    }

    checkAuth();
  }, [page, navigate, token]);

  return {
    message,
  };
}
