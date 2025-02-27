import Input from "../UI/Input.jsx";
import Label from "../UI/Label.jsx";
import Button from "../UI/Button.jsx";
import { useState } from "react";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
import useSystemAdminAuthorization from "../../hooks/useSystemAdminAuthorization.js";
import { fetchData } from "../../hooks/fetchData.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBlockQuestion } from "@fortawesome/pro-solid-svg-icons";
import { faUserCheck } from "@fortawesome/pro-light-svg-icons";
import { faUserXmark } from "@fortawesome/pro-duotone-svg-icons";

const CLINIC_CHANGE_USER_STATUS = import.meta.env.VITE_CHANGE_USER_STATUS;
const SYSTEM_CHANGE_USER_STATUS = import.meta.env
  .VITE_SYSTEM_CHANGE_USER_STATUS;

const AdminActDeactPage = ({ statusMessage }) => {
  const [inputData, setInputData] = useState({
    email: "",
    confirmEmail: "",
  });
  const [status, setStatus] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  // statusMessage ? useSystemAdminAuthorization(SYSTEM_CHANGE_USER_STATUS) : useAuthorization(CLINIC_CHANGE_USER_STATUS);

  function handleStatusClick(activationStatus) {
    setStatus(activationStatus);
  }

  function handleOnChange(e) {
    const { name, value } = e.target;
    setInputData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  async function handleSubmitForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const resdata = await fetchData(`/${status}`, "POST", data);
      setValidationMessage(resdata.message);
    } catch (error) {
      console.log(error);
    }
    setInputData({
      email: "",
      confirmEmail: "",
    });
    setStatus("");
  }

  return (
    <div className="coverUp">
      <div className="button-container">
        <div className="icon-text">
          <div className="clock">
            <FontAwesomeIcon icon={faBlockQuestion} className="tooth-spacing" />
          </div>
          <span className="text">Change User Status</span>
        </div>
        <div className="decorative-shapes"></div>
      </div>
      <div className="dash1" />
      <div className="dash2" />
      <div className="dash3" />
      <FontAwesomeIcon icon={faUserXmark} className="userMark" />

      <div className="change-status-top">
        <form
          onSubmit={handleSubmitForm}
          method="POST"
          className="activ-deact-user"
        >
          <div>
            <Label label="Email" className="emaiLabel" />
          </div>
          <Input
            name="email"
            required={true}
            id="email"
            onChange={handleOnChange}
            value={inputData.email}
            className="change-status-email"
          />

          <div>
            <Label label="Confirm Email" className="passLabel passMargin" />
          </div>
          <Input
            name="confirmEmail"
            required={true}
            id="confirm"
            onChange={handleOnChange}
            value={inputData.confirmEmail}
            className="change-status-password"
          />

          <div className="react-deact-bts">
            <FontAwesomeIcon icon={faUserCheck} className="userCheck" />
            <Button
              className="deactivate-btn"
              onClick={() => handleStatusClick("deact")}
            >
              De-Act
            </Button>
            <Button
              className="reactivateButton"
              onClick={() => handleStatusClick("react")}
            >
              Re-Act
            </Button>
          </div>
        </form>
      </div>
      <div className="dash4" />
      <div className="activate-deact">
        {validationMessage && validationMessage}
      </div>
    </div>
  );
};

export default AdminActDeactPage;
