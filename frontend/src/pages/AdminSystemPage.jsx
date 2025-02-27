import { Link } from "react-router-dom";
import SignOut from "./SignOut.jsx";

//no need to add roles restrictions here coz it is already configured in SystemAdminRoute
const AdminSystemPage = () => {
  return (
    <div className="admin-page">
      <div className="add-user-div">
        <Link className="owner-add-system-admin" to="system-admin">
          Add System Admin
        </Link>
      </div>
      <div className="add-user-div">
        <Link className="owner-prov-access" to="system_admin-access">
          Add System Admin Access
        </Link>
      </div>
      <div className="add-user-div">
        <Link className="owner-add-proc" to="procedures">
          Add Procedures
        </Link>
      </div>
      <hr />
      <div className="add-user-div">
        <Link className="add-user" to="add-users">
          Add First Clinic User
        </Link>
      </div>
      <div className="add-user-div">
        <Link className="add-user" to="add-sub-users">
          Add Subsequent Clinic Users
        </Link>
      </div>

      <div className="add-user-div">
        <Link className="add-user" to="change-status">
          Change Clinic User Status
        </Link>
      </div>
      <div className="add-user-div">
        <Link className="add-user" to="set-prices">
          Add Clinic Prices
        </Link>
      </div>
      <div className="add-user-div">
        <Link className="add-user" to="roles">
          Clinic Access & Roles{" "}
        </Link>
      </div>
      <div className="add-user-div">
        <Link className="add-user" to="reset-password">
          Reset User Password{" "}
        </Link>
      </div>

      <SignOut className="btn-sign-out" />
    </div>
  );
};

export default AdminSystemPage;
