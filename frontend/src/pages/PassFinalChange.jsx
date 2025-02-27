import { useState } from "react";
import InputPassword from "../UI/InputPassword.jsx";
import Label from "../UI/Label.jsx";
import Button from "../UI/Button.jsx";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { faKey } from "@fortawesome/pro-duotone-svg-icons";
import { faHouseUser } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchData } from "../../hooks/fetchData.js";

const PassFinalChange = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [password, setPassword] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordValidationMessage, setPasswordValidationMessage] =
    useState("");

  const newPasswordIsValid = /[!@#$%^&*]/.test(password.newPassword);
  const confirmPasswordIsValid = /[!@#$%^&*]/.test(password.confirmPassword);

  const navigate = useNavigate();

  function handleClearSessionStorage() {
    sessionStorage.clear();
    navigate("/");
  }

  function handleChangePassword(event) {
    const { name, value } = event.target;
    setPassword((prevPass) => ({
      ...prevPass,
      [name]: value,
    }));
  }

  async function handleSubmitPasswordChange(event) {
    setValidationError("");
    setSuccessMessage("");
    setPasswordValidationMessage("");

    event.preventDefault();
    const data = {
      newPass: password.newPassword,
      confirmPass: password.confirmPassword,
      email: email,
    };

    if (password.newPassword !== password.confirmPassword) {
      setValidationError("Passwords do not match!");
      return;
    } else if (password.newPassword === "" || password.confirmPassword === "") {
      return;
    } else if (!newPasswordIsValid || !confirmPasswordIsValid) {
      setPasswordValidationMessage("Use special characters such as !@#$%^&*");
      setPassword({
        newPassword: "",
        confirmPassword: "",
      });
      return;
    }

    try {
      const resdata = await fetchData("/final-password", "POST", data);
      setSuccessMessage(resdata.message);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
    setPassword({
      newPassword: "",
      confirmPassword: "",
    });
  }

  return (
    <>
      <div className="passCont">
        <div className="change-pass-title">
          <FontAwesomeIcon icon={faKey} className="keyPass" />
          <h2 className="change-title">Please Enter your new password</h2>
        </div>

        <div className="change-form-pass-container">
          <div className="password-box">
            <form onSubmit={handleSubmitPasswordChange}>
              <div className="password-change">
                <div className="password-label">
                  <Label label="New Password" />
                </div>
                <InputPassword
                  type="password"
                  name="newPassword"
                  onChange={handleChangePassword}
                  className="new-password"
                  value={password.newPassword}
                  minlength="8"
                />
              </div>
              <div>
                <div className="confirm-pass">
                  <Label label="Confirm Password" />
                </div>
                <InputPassword
                  type="password"
                  name="confirmPassword"
                  className="confirm-password"
                  onChange={handleChangePassword}
                  value={password.confirmPassword}
                  minlength="8"
                />
              </div>
              <div className="btn-pass">
                <Button className="save-change-pass-btn">Save</Button>
              </div>
              <div className="home-link">
                <Link
                  className="home-page-link"
                  onClick={handleClearSessionStorage}
                >
                  <FontAwesomeIcon icon={faHouseUser} size="xl" />
                </Link>
              </div>
            </form>
            <div className="change-pass-messages">
              <div className="validation-pass-error">{validationError}</div>
              <div className="success-change">{successMessage}</div>
              <div className="missing-special">{passwordValidationMessage}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PassFinalChange;
