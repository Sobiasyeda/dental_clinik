// import { getAuthToken } from "../utils/event-utils.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchData } from "./fetchData.js";

const useSystemAdminAuthorization = (page) => {
  const [message, setMessage] = useState("");
  console.log("MESSAGE", message);
  const token = true; // getAuthToken()
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    async function systemAuthorization() {
      try {
        const resdata = await fetchData("/systemadmin", "POST", { page: page });
        if (resdata) {
          setMessage(resdata.message);
        } else {
          sessionStorage.clear();
          navigate("/");
        }
      } catch (error) {
        console.log(error);
        navigate("/");
      }
    }
    systemAuthorization();
  }, [navigate, page]); // token to be added

  return {
    message,
  };
};

export default useSystemAdminAuthorization;
