import { useEffect, useState, lazy, Suspense } from "react";
const Input = lazy(() => import("../UI/Input.jsx"));
const SelectPage = lazy(() => import("../UI/Select.jsx"));
const OptionPage = lazy(() => import("../UI/Option.jsx"));
const Label = lazy(() => import("../UI/Label.jsx"));
const InputPassword = lazy(() => import("../UI/InputPassword.jsx"));
const Button = lazy(() => import("../UI/Button.jsx"));

import useSystemAdminAuthorization from "../../hooks/useSystemAdminAuthorization.js";
import { fetchData } from "../../hooks/fetchData.js";

const ADD_CLINICS = import.meta.env.VITE_ADMIN_ADD_USER;
const AdminAddUser = () => {
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const [roles, setRoles] = useState([]);
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
    clinic_rooms: "",
  });
  useSystemAdminAuthorization(ADD_CLINICS);
  const number_of_rooms = ["1", "2", "3", "4", "5", "6"];

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

  function handleOnChange(e) {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  async function handleOnSubmit(event) {
    event.preventDefault();
    setLoader(true);
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
      clinic_rooms: "",
    });
    setLoader(false);
  }

  return (
    <div>
      <h1 className="add-users">Add Fist Clinic User & Clinic Name</h1>
      <Suspense fallback={<div>Loading ...</div>}>
        <form onSubmit={handleOnSubmit} method="POST">
          <div className="user-box">
            <div className="name-reg">
              <div>
                <div>
                  <Label label="Name" htmlFor="name" />
                </div>
                <Input
                  name="name"
                  id="name"
                  required={true}
                  onChange={handleOnChange}
                  value={formData.name}
                  className="add-name-user"
                  autocomplete="off"
                />
              </div>
              <div>
                <div>
                  <Label label="Family" htmlFor="family" />
                </div>
                <Input
                  name="family"
                  id="family"
                  required={true}
                  onChange={handleOnChange}
                  value={formData.family}
                  className="add-fam-user"
                  autocomplete="off"
                />
              </div>
            </div>
            <div className="phone-reg">
              <div>
                <div>
                  <Label label="Father" htmlFor="father" />
                </div>
                <Input
                  name="father"
                  id="father"
                  required={true}
                  onChange={handleOnChange}
                  value={formData.father}
                  className="add-father-user"
                />
              </div>
              <div>
                <div>
                  <Label label="Clinic Phone" htmlFor="phone" />
                </div>
                <div className="phone-user">
                  <SelectPage
                    onChange={handleOnChange}
                    className="leb-phone"
                    name="code"
                    value={formData.code}
                    id="phone_code"
                  >
                    <OptionPage selected="true" value="00961">
                      +961
                    </OptionPage>
                    <OptionPage value="+966">+966</OptionPage>
                    <OptionPage value="+971">+971</OptionPage>
                    <OptionPage value="+964">+964</OptionPage>
                    <OptionPage value="+974">+974</OptionPage>
                  </SelectPage>
                  <Input
                    name="phone"
                    id="phone"
                    required={true}
                    onChange={handleOnChange}
                    value={formData.phone}
                    className="add-phone-user"
                    autocomplete="off"
                    type="tel"
                    minLength="7"
                    maxLength="8"
                  />
                </div>
              </div>
            </div>

            <div className="email-reg">
              <div>
                <div>
                  <Label label="Email" htmlFor="email" />
                </div>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  required={true}
                  onChange={handleOnChange}
                  value={formData.email}
                  className="add-email-user"
                  autocomplete="off"
                />
              </div>
              <div>
                <div>
                  <Label label="Password" htmlFor="password" />
                </div>
                <InputPassword
                  name="password"
                  id="password"
                  type="password"
                  minlength="8"
                  required={true}
                  onChange={handleOnChange}
                  value={formData.password}
                  className="add-password-user"
                />
              </div>
            </div>
            <div className="clinic-select">
              <div>
                <div>
                  <Label label="Clinic Name" htmlFor="clinicName" />
                </div>
                <Input
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleOnChange}
                  className="add-clinic-name"
                  autocomplete="off"
                  id="clinicName"
                />
              </div>
              <div>
                <div>
                  <Label label="Role" htmlFor="type" />
                </div>

                <SelectPage
                  className="add-user-role"
                  name="role"
                  id="type"
                  onChange={handleOnChange}
                  value={formData.role}
                >
                  <OptionPage value="">Select</OptionPage>
                  {roles.map((item) => (
                    <OptionPage key={item.role}>{item.role}</OptionPage>
                  ))}
                </SelectPage>
              </div>
            </div>
            <div className="clinic-rooms">
              <Label label="Number of Clinics Rooms" htmlFor="clinic_rooms" />
              <SelectPage
                name="clinic_rooms"
                className="clinicRooms"
                onChange={handleOnChange}
                value={formData.clinic_rooms}
              >
                <OptionPage value="">Select</OptionPage>
                {number_of_rooms.map((item) => (
                  <OptionPage key={item}>{item}</OptionPage>
                ))}
              </SelectPage>
            </div>

            <div className="add-user-btn">
              <Button className="add-clinic-user">Add User</Button>
            </div>
          </div>
        </form>
      </Suspense>
      <div className="add-loading-circle">
        {loader && <div className="loading-circle"></div>}
        <div className="clinic-message">{message}</div>
      </div>
    </div>
  );
};

export default AdminAddUser;
