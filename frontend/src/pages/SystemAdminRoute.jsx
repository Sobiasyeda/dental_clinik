import { Outlet } from "react-router-dom";
import AdminSystemPage from "./AdminSystemPage.jsx";
// import useSystemAdminAuthorization from "../../hooks/useSystemAdminAuthorization.js";
const MAIN_SYSTEM_ADMIN = import.meta.env.VITE_MAIN_SYSTEM_ADMIN;
const SystemAdminRoutePage = () => {
  // useSystemAdminAuthorization(MAIN_SYSTEM_ADMIN);

  return (
    <div className="system-admin">
      <AdminSystemPage />
      <main className="center-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SystemAdminRoutePage;
