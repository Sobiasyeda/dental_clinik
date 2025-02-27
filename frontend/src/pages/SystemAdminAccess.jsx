import { useEffect, useState, lazy, Suspense } from "react";
const SelectPage = lazy(() => import("../UI/Select.jsx"));
const Label = lazy(() => import("../UI/Label.jsx"));
const OptionPage = lazy(() => import("../UI/Option.jsx"));
const Input = lazy(() => import("../UI/Input.jsx"));
const Button = lazy(() => import("../UI/Button.jsx"));
import { createEventId } from "../../utils/event-utils.js";
import useSystemAdminAuthorization from "../../hooks/useSystemAdminAuthorization.js";
import { fetchData } from "../../hooks/fetchData.js";
const ACCESS_SYSTEM_ADMIN = import.meta.env.VITE_ACCESS_SYSTEM_ADMIN;
const SystemAdminAccess = () => {
  const [systemAdmins, setSystemAdmins] = useState([]);
  const [systemAdminPages, setSystemAdminPages] = useState([]);
  console.log("system admin pages", systemAdminPages);
  const [adminName, setAdminName] = useState({});
  const [message, setMessage] = useState("");

  useSystemAdminAuthorization(ACCESS_SYSTEM_ADMIN);

  function handleOnChangeName(event) {
    const { name, value } = event.target;
    setAdminName((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  useEffect(() => {
    async function getSystemAdmins() {
      try {
        const resdata = await fetchData("/getSystemAdmins");
        setSystemAdmins(resdata);
      } catch (error) {
        console.log(error);
      }
    }

    getSystemAdmins();
  }, []);

  useEffect(() => {
    async function getPages() {
      try {
        const resdata = await fetchData("/Systempages");
        setSystemAdminPages(resdata);
      } catch (error) {
        console.log(error);
      }
    }
    getPages();
  }, []);

  async function handleSubmitForm(event) {
    event.preventDefault();
    const formdata = new FormData(event.target);
    const data = Object.fromEntries(formdata.entries());
    try {
      const resdata = await fetchData("/handleSystemAdminAccess", "POST", data);
      setMessage(resdata.message);
      event.target.reset();
      setAdminName({});
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <h1 className="system-title">System Admin Access Roles</h1>
      <Suspense fallback={<div>Loading ...</div>}>
        <form method="Post" onSubmit={handleSubmitForm}>
          <div>
            <div className="system-admin-options">
              <Label label="Select Admin" className="select-name" />
              <SelectPage
                className="select-admin"
                name="select-admin-name"
                onChange={handleOnChangeName}
                value={adminName["select-admin-name"] || ""}
                required={true}
              >
                <OptionPage value="">Select</OptionPage>
                {systemAdmins.map((item) => (
                  <OptionPage key={item} value={item}>
                    {item}
                  </OptionPage>
                ))}
              </SelectPage>
            </div>
            <div className="add-system-roles">
              <table>
                <thead>
                  <tr>
                    {systemAdminPages.map((item) => (
                      <th key={item}>{item}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {systemAdminPages.map((item) => {
                      const uniqueId = createEventId();
                      return (
                        <td key={item} className="layout-check">
                          <Input
                            type="checkbox"
                            className="system-check"
                            name={`system-check-${uniqueId}`}
                            value={item}
                          />
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="submit-access">
            <Button className="submit-axess">Submit</Button>
          </div>
          <div className="system-admin-added">{message}</div>
        </form>
      </Suspense>
    </div>
  );
};

export default SystemAdminAccess;
