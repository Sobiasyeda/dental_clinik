import { useState } from "react";

import Input from "../UI/Input.jsx";
import SelectPage from "../UI/Select.jsx";
import OptionPage from "../UI/Option.jsx";
import Label from "../UI/Label.jsx";
import options from "./FlagOptions.jsx";
import Select from "react-select";
import Button from "../UI/Button.jsx";

import { useEffect } from "react";

// import { useAuthorization } from "../../hooks/useAuthorization.js";
import { fetchData } from "../../hooks/fetchData.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsersMedical } from "@fortawesome/pro-duotone-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import useSystemAdminAuthorization from "../../hooks/useSystemAdminAuthorization.js";

const ADD_USER = import.meta.env.VITE_ADD_USER;
const SYSTEM_ADMIN = "systemadmin";
const AddUserPage = ({ add_admin }) => {
  const defaultOption = options[0];
  const [clinicName, setClinicName] = useState("");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  console.log("roles", roles);
  const filteredRoles = roles.filter((item) => item.role === SYSTEM_ADMIN);
  const [message, setMessage] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [passwordIsVisible, setPasswordIsVisiable] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    family: "",
    father: "",
    phone: "",
    email: "",
    password: "",
    role: "",
    clinicName: "",
    code: "",
    mapping_nurse: "",
  });

  // add_admin ? useSystemAdminAuthorization(add_admin) : useAuthorization(ADD_USER);

  useEffect(() => {
    async function getClinicDoctors() {
      const data = { clinic: formData.clinicName };
      try {
        const resdata = await fetchData("/get_doctors", "POST", data);
        setDoctors([resdata]);
      } catch (error) {
        console.log(error);
      }
    }
    getClinicDoctors();
  }, [formData.clinicName]);

  useEffect(() => {
    async function get_roles() {
      try {
        const resdata = await fetchData("/getRoles");
        setRoles(resdata);
      } catch (error) {
        console.log(error);
      }
    }
    get_roles();
  }, []);

  useEffect(() => {
    async function getClinicNames() {
      try {
        const resdata = await fetchData("/getClinics");
        setClinicName(resdata);
      } catch (error) {
        console.log(error);
      }
    }
    getClinicNames();
  }, []);

  function handleOnChange(e) {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  function handleSelectChange(selectOption) {
    setFormData((prevState) => ({
      ...prevState,
      code: selectOption.value,
    }));
  }

  const handleClickOnPassword = () => {
    setPasswordIsVisiable((prevState) => !prevState);
  };

  async function handleOnSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const resdata = await fetchData("/add-user", "POST", data);
      setMessage(resdata.message);
    } catch (error) {
      console.log(error);
    }

    setFormData({
      name: "",
      family: "",
      father: "",
      phone: "",
      email: "",
      password: "",
      role: "",
      clinicName: "",
      code: "",
      doctor_name: "",
    });
    setLoading(false);
  }

  return (
    <div className="user-top">
      <div className="button-container">
        <div className="icon-text">
          <div className="clock">
            <FontAwesomeIcon icon={faUsersMedical} className="tooth-spacing" />
          </div>
          <span className="text">Add Clinic Users</span>
        </div>
        <div className="decorative-shapes"></div>
      </div>

      <div className="add-user-page">
        <form onSubmit={handleOnSubmit} method="POST" className="user-box">
          <div className="name-reg">
            <div className="name-user">
              <Label label="Name" htmlFor="name" className="generic-color" />
              <Input
                name="name"
                id="name"
                required={true}
                onChange={handleOnChange}
                value={formData.name}
                className="clinic-add-name"
                autocomplete="off"
              />
            </div>
            <div className="family-user">
              <Label
                label="Family"
                htmlFor="family"
                className="generic-color"
              />
              <Input
                name="family"
                id="family"
                required={true}
                onChange={handleOnChange}
                value={formData.family}
                className="clinic-add-family"
                autocomplete="off"
              />
            </div>
          </div>
          <div className="phone-reg">
            <div className="father-user">
              <Label
                label="Father"
                htmlFor="father"
                className="generic-color"
              />

              <Input
                name="father"
                id="father"
                required={true}
                onChange={handleOnChange}
                value={formData.father}
                className="clinic-add-father"
              />
            </div>
            <div className="phony">
              <Label
                label="Phone"
                htmlFor="phoneCode"
                className="generic-color"
              />

              <div className="phone-user">
                <Select
                  defaultValue={defaultOption}
                  name="code"
                  id="phoneCode"
                  required={true}
                  isSearchable={false}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      backgroundColor: "#f8f8f8",
                      width: "4rem",
                      border: "none",
                      borderRadius: "10px 0 0 10px",
                      fontSize: "13px",
                    }),
                    indicatorsContainer: (baseStyles) => ({
                      ...baseStyles,
                      width: "10px",
                    }),
                    dropdownIndicator: (baseStyles) => ({
                      ...baseStyles,
                      padding: "0",
                      width: "10px",
                    }),
                  }}
                  options={options}
                  onChange={handleSelectChange}
                />
                <Input
                  name="phone"
                  id="phone"
                  required={true}
                  onChange={handleOnChange}
                  value={formData.phone}
                  className="modal-phone"
                  autocomplete="off"
                  type="number"
                />
              </div>
            </div>
          </div>
          <div className="email-reg">
            <div className="email-user">
              <Label label="Email" htmlFor="email" className="generic-color" />

              <Input
                name="email"
                id="email"
                type="email"
                required={true}
                onChange={handleOnChange}
                value={formData.email}
                className="clinic-add-email"
                autocomplete="off"
              />
            </div>
            <div className="pass-user">
              <Label
                label="Password"
                htmlFor="password"
                className="generic-color"
              />

              <div className="passwordPosit">
                <Input
                  name="password"
                  id="password"
                  type={passwordIsVisible ? "text" : "password"}
                  minlength="8"
                  required={true}
                  onChange={handleOnChange}
                  value={formData.password}
                  className="clinic-add-pass"
                  autocomplete="off"
                />
                <FontAwesomeIcon
                  icon={passwordIsVisible ? faEye : faEyeSlash}
                  onClick={handleClickOnPassword}
                  className="passwordIcon"
                />
              </div>
            </div>
          </div>
          <div className="clinic-select">
            <div className="clinic-user">
              <Label
                label="Clinic Name"
                htmlFor="clinicName"
                className="generic-color"
              />
              <Input
                id="clinicName"
                name="clinicName"
                value={clinicName}
                className="clinic-add-list"
                autocomplete="off"
                readonly={true}
              />
            </div>
            <div className="role-user">
              <Label label="Role" htmlFor="type" className="generic-color" />

              <SelectPage
                className="clinic-add-role"
                name="role"
                id="type"
                onChange={handleOnChange}
                value={formData.role}
                required={true}
              >
                <OptionPage value="">Select</OptionPage>
                {add_admin
                  ? filteredRoles.map((item) => (
                      <OptionPage key={item.role}>{item.role}</OptionPage>
                    ))
                  : roles.map((it) => (
                      <OptionPage key={it.role}>{it.role}</OptionPage>
                    ))}
              </SelectPage>
            </div>
          </div>
          <div>
            {formData.role === "nurse" && (
              <div className="user-doctor-select">
                <Label
                  label="Select Doctor"
                  htmlFor="doctorSelect"
                  className="generic-color"
                />
                <SelectPage
                  id="doctorSelect"
                  name="mapping_nurse"
                  className="doctors-select"
                  onChange={handleOnChange}
                  value={formData.mapping_nurse}
                >
                  {doctors.map((item) => (
                    <OptionPage key={item.id} value={item.id}>
                      {item.name} {item.family}
                    </OptionPage>
                  ))}
                </SelectPage>
              </div>
            )}
          </div>

          <div className="add-user-button">
            <Button className="booking-modal-btn">Add User</Button>
          </div>
          <div className="add-message">
            {loading && <div className="loading-circle"></div>}
            <span className="clinic-message">{message}</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserPage;
