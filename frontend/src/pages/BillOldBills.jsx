import { useEffect, useState } from "react";
import Button from "../UI/Button.jsx";
import { CSVLink } from "react-csv";
import { fetchData } from "../../hooks/fetchData.js";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListOl } from "@fortawesome/pro-solid-svg-icons";

const OLD_BILLS = import.meta.env.VITE_OLD_BILLS;
const BillOldBills = () => {
  const [oldBills, setOldBills] = useState([]);
  const [viewBills, setViewBills] = useState(false);
  // useAuthorization(OLD_BILLS);

  useEffect(() => {
    async function handleSubmitForm() {
      try {
        const resdata = await fetchData("/getPendingBills");
        if (resdata) {
          setOldBills(resdata);
        }
      } catch (error) {
        console.log(error);
      }
    }
    handleSubmitForm();
  }, []);

  const handleViewBills = () => {
    setViewBills((prevState) => !prevState);
  };

  const headers = [
    { label: "Encounter Date", key: "encounter_date" },
    { label: "Patient Name", key: "patient_name" },
    { label: "Phone Number", key: "phone_number" },
    { label: "Outstanding Balance", key: "outstanding_balance" },
  ];

  return (
    <div className="old-balances-report">
      <div className="button-container">
        <div className="icon-text">
          <div className="clock">
            <FontAwesomeIcon icon={faListOl} className="tooth-spacing" />
          </div>
          <span className="text">Old Balance Report</span>
        </div>
        <div className="decorative-shapes"></div>
      </div>
      <form className="formOldBalance">
        <div className="tableOldReport">
          <table className="table-old-bills">
            <thead>
              <tr>
                <th className="old-bills-encouter" scope="col">
                  Encounter Date
                </th>
                <th className="old-bills-patient" scope="col">
                  Patient Name
                </th>
                <th className="old-bills-phone" scope="col">
                  Phone Number
                </th>
                <th className="old-bills-balance" scope="col">
                  Outstanding Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {viewBills &&
                oldBills.map((item) => (
                  <tr key={item.encounter_id}>
                    <th>{item.encounter_date}</th>
                    <th>{item.patient_name}</th>
                    <th>{item.phone_number}</th>
                    <th>{item.outstanding_balance}</th>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="old-bills-extract-btn">
          <Button
            onClick={handleViewBills}
            type="button"
            className="old-bills-btn"
          >
            View
          </Button>
          <CSVLink
            data={oldBills}
            headers={headers}
            filename="old_bills.csv"
            className="old-bills-excel"
          >
            Export
          </CSVLink>
        </div>
      </form>
    </div>
  );
};

export default BillOldBills;
