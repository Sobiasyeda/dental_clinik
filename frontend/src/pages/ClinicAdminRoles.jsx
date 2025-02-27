import AdminAccessRoles from "./AdminAccessRoles.jsx";
const CLINIC_ACCESS = "clinic_access";
const ClinicAdminRoles = () => {
  return <AdminAccessRoles access={CLINIC_ACCESS} />;
};

export default ClinicAdminRoles;
