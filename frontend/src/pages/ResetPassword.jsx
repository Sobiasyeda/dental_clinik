import useSystemAdminAuthorization from "../../hooks/useSystemAdminAuthorization.js";
import Input from "../UI/Input.jsx";
import InputPassword from "../UI/InputPassword.jsx";
import Label from "../UI/Label.jsx";
import Button from "../UI/Button.jsx";
import { useState } from "react";
import { fetchData } from "../../hooks/fetchData.js";
const SYSTEM_RESET_PASSWORD = import.meta.env.VITE_SYSTEM_RESET_PASSWORD;
const ResetPassword = () => {
  useSystemAdminAuthorization(SYSTEM_RESET_PASSWORD);
  const [input, setInput] = useState({
    email: "",
    newPass: "",
    confirmPass: "",
  });
  const [message, setMessage] = useState("");
  console.log("message", message);

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setInput((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const resdata = await fetchData("/final-password", "POST", data);
      setMessage(resdata.message);
    } catch (error) {
      console.log(error);
    }
    setInput({
      email: "",
      newPass: "",
      confirmPass: "",
    });
  };

  return (
    <div>
      <h1>Reset User Password</h1>
      {message && <div className="system-mess">{message}</div>}
      <form onSubmit={handleSubmitForm}>
        <div className="user-div">
          <Label label="Email" />
          <Input
            onChange={handleOnChange}
            name="email"
            required={true}
            className="user-email"
            value={input.email}
            autocomplete="off"
          />
        </div>
        <div className="pass-div">
          <Label label="Password" />
          <InputPassword
            name="newPass"
            required={true}
            className="user-pass"
            onChange={handleOnChange}
            value={input.newPass}
            type="password"
          />
        </div>

        <div className="pass-div">
          <Label label="Confirm Password" />
          <InputPassword
            name="confirmPass"
            required={true}
            className="user-pass"
            onChange={handleOnChange}
            value={input.confirmPass}
            type="password"
          />
        </div>
        <div className="reset-user-btn">
          <Button className="reset-btn">submit</Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
