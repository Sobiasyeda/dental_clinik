import { useEffect, useState } from "react";
import Input from "../UI/Input.jsx";
import Label from "../UI/Label.jsx";

import SelectPage from "../UI/Select.jsx";
import OptionPage from "../UI/Option.jsx";
import Button from "../UI/Button.jsx";

import { createEventId } from "../../utils/event-utils.js";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
import useSystemAdminAuthorization from "../../hooks/useSystemAdminAuthorization.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchData } from "../../hooks/fetchData.js";
import { faUniversalAccess } from "@fortawesome/pro-duotone-svg-icons";
const CLINIC_ACCESS_ROLES = import.meta.env.VITE_CLINIC_ACCESS_ROLES;
const SYSTEM_ACCESS_ROLES = import.meta.env.VITE_SYSTEM_CLINIC_ACCESS_ROLES;

const AdminAccessRoles = ({ access }) => {
  const [message, setMessage] = useState("");
  const [clinics, setClinics] = useState([]);
  console.log("clinics", clinics);
  const [pages, setPages] = useState([]);
  const [clinicName, setClinicName] = useState({});
  
  // access ? useAuthorization(CLINIC_ACCESS_ROLES) : useSystemAdminAuthorization(SYSTEM_ACCESS_ROLES);

  const roles = ["Doctor", "Admin", "Nurse", "Assistant"];
  function changeClinicName(event) {
    const { name, value } = event.target;
    setClinicName((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  useEffect(() => {
    async function get_Clinics() {
      try {
        const resdata = await fetchData("/getAllClinics");
        setClinics(Array.isArray(resdata) ? resdata : [resdata]);
      } catch (error) {
        console.log(error);
      }
    }
    get_Clinics();
  }, []);

  useEffect(() => {
    async function get_pages() {
      try {
        const resdata = await fetchData("/pages");
        setPages(resdata);
      } catch (error) {
        console.log(error);
      }
    }
    get_pages();
  }, []);

  async function handleSubmitForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const userConfirmed = window.confirm("Are you sure you want to proceed ?");
    if (!userConfirmed) {
      return;
    }

    try {
      const resdata = await fetchData("/storeRoles", "POST", data);
      setMessage(resdata.message);
      event.target.reset();
      setClinicName({});
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="roles-div">
      <div className="button-container">
        <div className="icon-text">
          <div className="addPriceList">
            <FontAwesomeIcon icon={faUniversalAccess} className="priceIcon" />
          </div>
          <span className="text">Access & Roles</span>
        </div>
        <div className="decorative-shapes"></div>
      </div>
      <div className="table-roles">
        <form method="POST" onSubmit={handleSubmitForm}>
          {clinics.length > 1 ? (
            <div className="select-clinics">
              <Label label="Select Clinic" htmlFor="clinicRoles" />
              <SelectPage
                id="clinicRoles"
                className="clinics-roles"
                name="clinicName"
                onChange={changeClinicName}
                value={clinicName["clinicName"] || ""}
                required={true}
              >
                <OptionPage value="">Select</OptionPage>
                {clinics.map((item) => (
                  <OptionPage value={item} key={item} className="option-roles">
                    {item}
                  </OptionPage>
                ))}
              </SelectPage>
            </div>
          ) : (
            <Input
              type="text"
              readonly={true}
              value={clinics[0]}
              name="clinicName"
              className="clinic-access"
            />
          )}
          {pages.length > 0 && (
            <table className="access-table">
              <thead>
                <tr>
                  {pages.map((page, index) => (
                    <th key={index}>{page}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role, roleIndex) => (
                  <tr key={roleIndex}>
                    <td>
                      <Label
                        label={role}
                        htmlFor={`${role.toLowerCase()}Role`}
                      />
                    </td>
                    {pages.slice(1, pages.length).map((page, pageIndex) => {
                      const uniqueId = createEventId();
                      return (
                        <td key={pageIndex}>
                          <Input
                            id={`${role.toLowerCase()}Role-${uniqueId}`}
                            name={`${role.toLowerCase()}-${page}`}
                            type="checkbox"
                            className={`${role.toLowerCase()}-check`}
                            value={page}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="role-btn">
            <Button className="submit-role">Submit</Button>
          </div>
          <div className="message-roles">{message}</div>
        </form>
      </div>
    </div>
  );
};

export default AdminAccessRoles;
