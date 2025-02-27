import { useEffect, useState, lazy, Suspense } from "react";
const Input = lazy(() => import("../UI/Input.jsx"));
const SelectPage = lazy(() => import("../UI/Select.jsx"));
const OptionPage = lazy(() => import("../UI/Option.jsx"));
const Label = lazy(() => import("../UI/Label.jsx"));
const InputPassword = lazy(() => import("../UI/InputPassword.jsx"));
const Button = lazy(() => import("../UI/Button.jsx"));

import useSystemAdminAuthorization from "../../hooks/useSystemAdminAuthorization.js";
import { fetchData } from "../../hooks/fetchData.js";
const ADD_SUB_USERS = import.meta.env.VITE_ADD_SUBUSER;
const AdminAddSubUsers = () => {
  const [clinicNames, setClinicNames] = useState([]);
  const [message, setMessage] = useState("");
  const [input, setInput] = useState({});
  const [roles, setRoles] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useSystemAdminAuthorization(ADD_SUB_USERS);

  useEffect(() => {
    async function getClinicDoctors() {
      const clinic = input.clinicName;
      try {
        const resdata = await fetchData("/get_doctors", "POST", clinic);
        setDoctors(resdata);
      } catch (error) {
        console.log(error);
      }
    }

    getClinicDoctors();
  }, [input.clinicName]);

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

  function handleOnChange(event) {
    const { name, value } = event.target;
    setInput((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  useEffect(() => {
    async function getClinicNames() {
      try {
        const resdata = await fetchData("/clinic-names");
        setClinicNames(resdata);
      } catch (error) {
        console.log(error);
      }
    }

    getClinicNames();
  }, []);

  async function handleSubmitForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const resdata = await fetchData("/add-user", "POST", data);
      setMessage(resdata.message);
    } catch (error) {
      console.log(error);
    }
    setInput({});
  }

  return (
    <div>
      <h1 className="add-sub">Add Sub Users</h1>
      <div className="add-user-box">
        <Suspense fallback={<div>Loading ...</div>}>
          <form onSubmit={handleSubmitForm}>
            <div className="add-sub-name">
              <div>
                <Label label="Name" />
                <Input
                  name="name"
                  className="name-sub"
                  onChange={handleOnChange}
                  value={input["name"] || ""}
                  required="true"
                />
              </div>
              <div>
                <Label label="Family" />
                <Input
                  name="family"
                  className="fam-sub"
                  onChange={handleOnChange}
                  value={input["family"] || ""}
                  required="true"
                />
              </div>
            </div>
            <div className="add-sub-father">
              <div>
                <Label label="Father" />
                <Input
                  name="father"
                  className="father-sub"
                  onChange={handleOnChange}
                  value={input["father"] || ""}
                  required="true"
                />
              </div>
              <div>
                <div>
                  <Label label="Phone" />
                </div>
                <div className="phone-sub">
                  <SelectPage
                    name="code"
                    className="code-sub"
                    onChange={handleOnChange}
                    value={input["code"] || ""}
                    required={true}
                  >
                    <OptionPage value="00961">+961</OptionPage>
                    <OptionPage value="00966">+966</OptionPage>
                    <OptionPage value="00971">+971</OptionPage>
                    <OptionPage value="00964">+964</OptionPage>
                    <OptionPage value="00974">+974</OptionPage>
                  </SelectPage>

                  <Input
                    name="phone"
                    className="mobile-sub"
                    onChange={handleOnChange}
                    value={input["phone"] || ""}
                    required="true"
                    type="tel"
                    minLength="7"
                    maxLength="8"
                  />
                </div>
              </div>
            </div>
            <div className="email-sub-user">
              <div>
                <Label label="Email" />
                <Input
                  name="email"
                  className="email-sub"
                  onChange={handleOnChange}
                  value={input["email"] || ""}
                  type="email"
                  required="true"
                />
              </div>
              <div>
                <Label label="Password" />
                <InputPassword
                  name="password"
                  className="pass-sub"
                  onChange={handleOnChange}
                  type="password"
                  required="true"
                  value={input["password"] || ""}
                />
              </div>
            </div>
            <div className="clinic-sub-name">
              <div>
                <div>
                  <Label label="Clinic Name" />
                </div>
                <div>
                  <SelectPage
                    name="clinicName"
                    className="select-sub"
                    onChange={handleOnChange}
                    value={input["clinicName"] || ""}
                    required="true"
                  >
                    <OptionPage value="">Select</OptionPage>
                    {clinicNames.map((item) => (
                      <OptionPage key={item}>{item}</OptionPage>
                    ))}
                  </SelectPage>
                </div>
              </div>
              <div>
                <div>
                  <Label label="Role" />
                </div>
                <div>
                  <SelectPage
                    name="role"
                    className="role-sub"
                    onChange={handleOnChange}
                    value={input["role"] || ""}
                    required="true"
                  >
                    <OptionPage value="">Select</OptionPage>
                    {roles.map((item) => (
                      <OptionPage key={item.role}>{item.role}</OptionPage>
                    ))}
                  </SelectPage>
                </div>
              </div>
            </div>
            <div>
              {input.role === "nurse" && (
                <div className="select-doctor">
                  <Label label="Select Doctor" />
                  <SelectPage
                    name="mapping_nurse"
                    className="doctors-clinic"
                    onChange={handleOnChange}
                    value={input["mapping_nurse"] || ""}
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

            <div className="add-user-btn">
              <Button className="add-clinic-user">Add User</Button>
            </div>
          </form>
        </Suspense>
      </div>
      <div className="sub-user-message">{message && message}</div>
    </div>
  );
};
export default AdminAddSubUsers;
