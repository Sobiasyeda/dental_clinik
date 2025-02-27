// import { useAuthorization } from "../../hooks/useAuthorization.js";
import SearchInput from "./SearchInput.jsx";
const MEDICAL_REPORT = import.meta.env.VITE_MEDICAL_REPORT;
const Reports = () => {
  // useAuthorization(MEDICAL_REPORT);

  return (
    <div className="reports-top">
      <SearchInput />
      <div className="reports">
        <h1>Coming Soon</h1>
      </div>
    </div>
  );
};

export default Reports;
