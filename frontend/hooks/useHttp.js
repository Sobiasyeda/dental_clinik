import { useCallback, useState } from "react";

const SYSTEMADMIN = "systemadmin";

async function sendHttp(url, config) {
  const response = await fetch(url, config);
  const resData = await response.json();
  return resData;
}

export default function sendHttpRequest(
  endpoint,
  config,
  initialState,
  navigate,
) {
  const [items, setItems] = useState(initialState);
  const [validation, setValidation] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const url = `${baseUrl}${endpoint}`;

  const sendRequest = useCallback(
    async function sendRequest(data) {
      setItems([]);
      setValidation("");
      try {
        const receivedItems = await sendHttp(url, { ...config, body: data });
        if (Array.isArray(receivedItems)) {
          setItems(receivedItems);
        } else if (
          typeof receivedItems === "object" &&
          receivedItems !== null
        ) {
          const { token, status, message, userid, role, user } = receivedItems;
          if (status === "success") {
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("role", role);
            sessionStorage.setItem("id", JSON.stringify(userid));
            sessionStorage.setItem("user", user);
            if (role !== SYSTEMADMIN) {
              navigate("/calendar");
            } else if (role === SYSTEMADMIN) {
              navigate("/systemadmin");
            }
          } else {
            setValidation(message);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    [url, config, navigate],
  );

  return {
    items,
    validation,
    sendRequest,
    setValidation,
  };
}
