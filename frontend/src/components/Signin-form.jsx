import { Link, useNavigate } from "react-router-dom";
import Input from "../UI/Input.jsx";
import Button from "../UI/Button.jsx";
import { useState } from "react";
import Label from "../UI/Label.jsx";
import InputPassword from "../UI/InputPassword.jsx";
import sendHttpRequest from "../../hooks/useHttp.js";
const production = import.meta.env.VITE_PRODUCTION;
const isProduction = import.meta.env.MODE === production;
const basePath = isProduction ? "/static" : "";
const SigninForm = () => {
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { sendRequest, validation } = sendHttpRequest(
    "/login",
    config,
    [],
    navigate,
  );

  function handleOnChange(event) {
    const { name, value } = event.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }

  async function handleOnSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    sendRequest(JSON.stringify(data));
    setForm({
      email: "",
      password: "",
    });
  }
  return (
    <div className="background-image">
      <div>
        <form onSubmit={handleOnSubmit} className="signin-bak">
          <div className="logo-container">
            <img
              className="logo-signin"
              src={`${basePath}/Signin_images/logo.png`}
            />
          </div>

          <div className="signin-form">
            <div className="signin_title">Sign in</div>
            <div>
              <Label
                label="Email"
                className="email-label-signin"
                htmlFor="email"
              />
              <Input
                id="email"
                name="email"
                label="Email"
                onChange={handleOnChange}
                value={form.email}
                className="input-email-signin"
              />
            </div>
            <div>
              <Label
                label="Password"
                className="pass-label-signin"
                htmlFor="password"
              />
              <InputPassword
                type="password"
                id="password"
                name="password"
                label="Password"
                onChange={handleOnChange}
                value={form.password}
                className="input-pass-signin"
              />
              <div className="pass-link-container">
                <Link className="pass-link-login" to="pass-token">
                  Forgot Password ?
                </Link>
              </div>
            </div>
          </div>
          <div className="signin-login">
            <Button className="login-btn">Login</Button>
          </div>
        </form>
      </div>

      <div className="validation-signin">{validation}</div>
    </div>
  );
};

export default SigninForm;
