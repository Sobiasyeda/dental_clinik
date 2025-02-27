import { Link } from "react-router-dom";
import { useContext } from "react";
import { BillContext } from "./BillContext.jsx";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
const CURRENT_PATIENTS = import.meta.env.VITE_CURRENT_PATIENTS;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/pro-light-svg-icons";
import { faPeopleLine } from "@fortawesome/pro-solid-svg-icons";
const Production = import.meta.env.VITE_PRODUCTION;
const isProduction = import.meta.env.MODE === Production;
const domain = isProduction ? "" : "/";

const billsPending = () => {
  const { patientBill } = useContext(BillContext);
  // useAuthorization(CURRENT_PATIENTS);
  console.log("patient Bill", patientBill);

  return (
    <div className="bill-backg">
      <div className="button-container">
        <div className="icon-text">
          <div className="clock">
            <FontAwesomeIcon icon={faPeopleLine} className="tooth-spacing" />
          </div>
          <span className="text">Patients Checkout</span>
        </div>
        <div className="decorative-shapes"></div>
      </div>

      <div className="billing-names">
        {Array.from(
          new Set(
            patientBill.map(
              (item) =>
                `${item.name}-${item.father}-${item.family}-${item.patientId}-${item.photo}
                -${item.total_remaining_balance > 0 ? item.total_remaining_balance : ""}`,
            ),
          ),
        ).map((uniqueKey) => {
          const [
            name,
            father,
            family,
            clickedPatientId,
            photo,
            remaining_balance,
          ] = uniqueKey.split("-");
          return (
            <div key={uniqueKey} className="patient-bill">
              {photo && photo.trim().toLowerCase() !== "null" ? (
                <img src={`${domain}${photo}`} className="photo-at-reception" />
              ) : (
                <FontAwesomeIcon
                  icon={faUser}
                  className="user-at-reception"
                  color="#264580"
                />
              )}

              <Link
                to={`bill-details/${clickedPatientId}`}
                className="patient-name-bill"
              >
                {`${name} ${father} ${family} `}
                {remaining_balance > 0 && (
                  <span
                    style={{ color: "red" }}
                  >{`(previous outstanding balance:$${remaining_balance})`}</span>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default billsPending;
