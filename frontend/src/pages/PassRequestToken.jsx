import { useState } from "react";
import Input from "../UI/Input.jsx";
import Button from "../UI/Button.jsx";
import Label from "../UI/Label.jsx";
import { useNavigate, Link } from "react-router-dom";
import { fetchData } from "../../hooks/fetchData.js";
import { faHouse, faLock } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PassRequestToken = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [messageTimer, setMessageTimer] = useState(false);

  const navigate = useNavigate();

  function handleOnchange(event) {
    setEmail(event.target.value);
  }

  function handleClearSessionStorage() {
    sessionStorage.clear();
    navigate("/");
  }
  async function handleOnSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    setMessage("");
    setErrorMessage("");
    try {
      const resdata = await fetchData("/pass-token", "POST", data);
      const { email, message } = resdata;
      if (resdata.status === "success") {
        sessionStorage.setItem("email", email);
        setMessageTimer(true);
        setMessage(message);
        setTimeout(() => {
          setMessageTimer(false);
        }, 3000);
      } else {
        setMessageTimer(true);
        setErrorMessage(message);
        setTimeout(() => {
          setMessageTimer(false);
        }, 3000);
      }
    } catch (error) {
      console.log(error);
    }
    setEmail("");
  }

  return (
    <div className="passwordRequest">
      <div className="passwordToken">
        <div>
          <Link
            onClick={handleClearSessionStorage}
            className="return-home-link"
          >
            <FontAwesomeIcon icon={faHouse} className="passHome" />
          </Link>
        </div>
        <div className="change-password">
          <FontAwesomeIcon icon={faLock} className="lock" />
          <span>Change Password</span>
        </div>
      </div>

      <div className="get-link">
        <div className="wrap-email">
          <h4 className="token-label">Please add your Email</h4>
          <form method="POST" onSubmit={handleOnSubmit}>
            <Label className="email-token" label="Email" />
            <Input
              type="email"
              name="email"
              onChange={handleOnchange}
              value={email}
              className="get-token-email"
            />
            <div className="submit-top">
              <Button className="submit-token-btn">Submit</Button>
            </div>
            <div className="success-message">
              <div className="email-link">{messageTimer && message}</div>
              <div className="error-message">
                {messageTimer && errorMessage}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PassRequestToken;
