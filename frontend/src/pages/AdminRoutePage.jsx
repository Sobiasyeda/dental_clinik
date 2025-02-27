import { Outlet } from "react-router-dom";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
const MAIN_ADMIN = import.meta.env.VITE_MAIN_ADMIN;

const AdminRoutePage = () => {
  // useAuthorization(MAIN_ADMIN);
  return (
    <div className="main-admin-layout">
      <Outlet />
    </div>
  );
};

export default AdminRoutePage;
