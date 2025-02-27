import { useEffect, useState } from "react";
import { faSquareFacebook } from "@awesome.me/kit-507fd02030/icons/classic/brands";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchData } from "../../hooks/fetchData.js";

const APP_ID = import.meta.env.VITE_SMILES_CRAFT_ID;
const GRAPH_API_VERSION = import.meta.env.VITE_GRAPH_API_VERSION;
const CONFIGURATION_ID = import.meta.env.VITE_CONFIGURATION_ID;

const WhatsAppSignup = () => {
  const [isFBReady, setIsFBReady] = useState(false);
  const [clientPhoneWaba, setClientPhoneWaba] = useState(null);
  const [clientPhoneWabaError, setClientPhoneWabaError] = useState(null);
  const [code, setCode] = useState(null);
  const [codeError, setCodeError] = useState(null);

  useEffect(() => {
    const sendDataToBackEnd = async () => {
      if (clientPhoneWaba && code) {
        try {
          const payload = {
            phone_number_id: clientPhoneWaba.data.phone_number_id,
            waba_id: clientPhoneWaba.data.waba_id,
            code,
          };
          await fetchData("/storeWAData", "POST", payload);
        } catch (error) {
          console.log(error);
        }
      }
    };
    sendDataToBackEnd();
  }, [clientPhoneWaba, code]);

  useEffect(() => {
    // Wait for all.js to load and then initialize Facebook SDK
    const checkFB = () => {
      if (window.FB) {
        initializeFB();
      } else {
        console.warn("Facebook SDK not yet available. Retrying...");
        setTimeout(checkFB, 300); // Retry after 300ms if FB is not loaded
      }
    };

    const initializeFB = () => {
      FB.init({
        appId: APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: GRAPH_API_VERSION,
      });
      setIsFBReady(true); // FB is initialized
    };

    checkFB();
  }, []);

  // Session logging message event listener
  window.addEventListener("message", (event) => {
    if (
      event.origin !== "https://www.facebook.com" &&
      event.origin !== "https://web.facebook.com"
    )
      return;
    try {
      const data = JSON.parse(event.data);
      if (data.type === "WA_EMBEDDED_SIGNUP") {
        setClientPhoneWaba(data);
      }
    } catch {
      setClientPhoneWabaError("Error: Unexpected Data Structure");
    }
  });

  // Callback for Facebook Login
  const fbLoginCallback = (response) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      setCode(code);
    } else {
      setCodeError("Facebook login failed response");
    }
  };

  // Launch Facebook Login
  const launchWhatsAppSignup = () => {
    if (!isFBReady) {
      console.error("Facebook SDK is not ready yet.");
      return;
    }

    FB.login(fbLoginCallback, {
      config_id: CONFIGURATION_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: "",
        sessionInfoVersion: "3",
      },
    });
  };

  return (
    <div className="onboarding">
      <h1 className="onboard-header">Embedded Signup</h1>
      <button onClick={launchWhatsAppSignup} className="facebook-button">
        <FontAwesomeIcon
          icon={faSquareFacebook}
          size="xl"
          className="faceb-onboard"
        />
        Login with Facebook
      </button>
      <div>{clientPhoneWabaError}</div>
      <div>{codeError}</div>
    </div>
  );
};

export default WhatsAppSignup;
