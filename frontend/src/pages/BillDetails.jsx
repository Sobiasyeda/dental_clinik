import { useContext, useEffect, useState } from "react";
import Input from "../UI/Input.jsx";
import Button from "../UI/Button.jsx";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BillContext } from "./BillContext.jsx";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
import { fetchData } from "../../hooks/fetchData.js";
import { faBackward } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BILL_DETAILS = import.meta.env.VITE_BILL_DETAILS;
const BillDetails = () => {
  const [billDetails, setBillDetails] = useState([]);
  console.log("bill details", billDetails);
  const [amountPaid, setAmountPaid] = useState();
  const [showMessage, setShowMessage] = useState("");
  const [printOnly, setPrintOnly] = useState("");
  const params = useParams();
  const navigate = useNavigate();
  const { setPatientBill } = useContext(BillContext);
  const patId = params.pId;

  // useAuthorization(BILL_DETAILS);

  // get doctor name
  const doctor_name = billDetails.length > 0 ? billDetails[0].doctor : null;

  const totalPrevPayment = billDetails.reduce(
    (acc, bill) => acc + bill.previousPayment,
    0,
  );
  const totalRemainingBalance = billDetails.reduce(
    (acc, bill) => acc + bill.remainingBalance,
    0,
  );

  const totalBill = billDetails.reduce((acc, bill) => {
    return acc + bill.fees * (1 - bill.discount);
  }, 0);

  function handleOnChangeAmountPaid(event) {
    setAmountPaid(event.target.value);
  }

  useEffect(() => {
    async function getBill() {
      const patientId = { patientId: params.pId };
      if (!patientId) return;

      try {
        const resData = await fetchData("/get-bill", "POST", patientId);
        setBillDetails(resData);
      } catch (error) {
        console.log(error);
      }
    }

    getBill();
  }, [params]);

  function handlePrint(item) {
    setPrintOnly(item);
    window.print();
  }

  async function handleSavePaidBill(event) {
    if (billDetails.length > 0) {
      event.preventDefault();
      const dataForm = new FormData(event.target);
      const data = Object.fromEntries(dataForm.entries());
      const amountPaid = event.target.elements["paid-amount"].value;
      const billId = [];
      const disposition = []; // patient disposition should be there on every row of that encounter
      const patient_id = params.pId;

      for (const key in data) {
        if (key.startsWith("encounter")) {
          billId.push(data[key]);
          disposition.push("discharged");
        }
      }
      const payload = {
        billID: billId,
        doctor: doctor_name,
        amountPaid: amountPaid,
        disposition: disposition,
        patient_id: patient_id,
        print_only: printOnly, // IN CASE YOU WANT TO PRINT, SEND TO BACKEND SO WE DO NOT SEND RECEIPT BY EMAIL --- ONLY PRINT
      };
      try {
        const resdata = await fetchData("/treatment-plan", "POST", payload);
        if (resdata) {
          setShowMessage("Sent Successfully!");
          setPatientBill((prevItems) => {
            const patientId = Number(params.pId);
            const updatedItems = [...prevItems];
            const keepUnbilledPatients = updatedItems.filter(
              (patient) => patient.patientId !== patientId,
            );
            return keepUnbilledPatients;
          });
          setTimeout(() => {
            navigate("../");
          }, 1000);
        }
      } catch (error) {
        console.log(error);
      }
    }
    setBillDetails([]);
    setAmountPaid();
  }

  // display unique bill number on receipt
  const latestBillNumbers = {};
  billDetails.forEach((bill) => {
    latestBillNumbers[bill.billNumber] = bill.date;
  });
  const uniqueBillNumbers = Object.keys(latestBillNumbers);
  const latestBillNumber = Math.max(...uniqueBillNumbers.map(Number));

  // display unique date on receipt
  const latestBillDate = new Date(
    Math.max(...billDetails.map((bill) => new Date(bill.date))),
  );

  // display unique patient name on receipt
  function getUniquePatients(billDetails) {
    const uniquePatients = [];
    const seen = new Set();
    billDetails.forEach((patient) => {
      const key = `${patient.name}-${patient.father}-${patient.family}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePatients.push(patient);
      }
    });
    return uniquePatients;
  }

  const uniquePatients = getUniquePatients(billDetails);

  return (
    <div className="detail-posit">
      <div className="show-message">{showMessage}</div>
      <div className="title-head">
        {patId && (
          <div className="receipt-title">
            <div className="back-det-btn">
              <Link to="../">
                <FontAwesomeIcon icon={faBackward} className="backIcon" />
              </Link>
            </div>
            <div className="receipt-det">Receipt</div>
          </div>
        )}

        {billDetails.length > 0 && (
          <div className="receipt-container">
            <form onSubmit={handleSavePaidBill} className="all-tables">
              <div className="receipt-info">
                <div>
                  <span className="rec-num">Receipt Number : </span>{" "}
                  {latestBillNumber}
                </div>

                <div>
                  <span className="rec-dat">Receipt Date : </span>
                  <span className="receipt-d">
                    {latestBillDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="receipt-patient">
                  <span className="pat-nam">Patient Name : </span>
                  <span>
                    {`${uniquePatients[0]?.name} ${uniquePatients[0]?.father} ${uniquePatients[0]?.family}`}
                  </span>
                </div>
                <div className="dr-name-receipt">
                  <span className="dr-font">Doctor: </span>
                  {doctor_name}
                </div>
              </div>

              {billDetails.map((item, index) => (
                <Input
                  type="hidden"
                  name={`encounter-${index}`}
                  key={item.id}
                  value={item.id}
                  readonly={true}
                />
              ))}

              <div className="table-top">
                <table className="table-payment">
                  <thead>
                    <tr>
                      <th>Procedure</th>
                      <th scope="col">Tooth Number</th>
                      <th scope="col">Price</th>
                      <th scope="col">Discount</th>
                      <th scope="col">Net Price</th>
                      <th scope="col">Previous Payment</th>
                      <th scope="col">Remaining Balance</th>
                      {/*<th className="notes-rec" scope="col">*/}
                      {/*  Notes*/}
                      {/*</th>*/}
                    </tr>
                  </thead>
                  <tbody>
                    {billDetails.map((bill) => (
                      <tr key={bill.id}>
                        <td className="bill-proc">{bill.procedure}</td>
                        <td className="bill-tooth">{bill.toothNumber}</td>
                        <td className="fees-for-print">$ {bill.fees}</td>
                        <td className="bill-d">{bill.discount * 100} %</td>
                        <td className="net-for-print">$ {bill.netPrice}</td>
                        <td className="bill-prev">
                          {bill.previousPayment === null
                            ? "$0"
                            : `$ ${bill.previousPayment}`}
                        </td>
                        <td className="remaining-balance">
                          {bill.remainingBalance === null
                            ? "$ 0"
                            : `$ ${bill.remainingBalance}`}
                        </td>
                        {/*<td className="bill-notes">{bill.notes}</td>*/}
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="3" />
                      <td className="billing-total-label">
                        <strong>Total</strong>
                      </td>
                      <td>
                        <strong> $ {totalBill}</strong>
                      </td>
                      <td className="prev-pay">$ {totalPrevPayment}</td>
                      <td className="rem-bal">$ {totalRemainingBalance}</td>
                    </tr>
                    <tr>
                      <td colSpan="5" />
                      <td className="amount-paid">
                        <strong>Amount Paid</strong>
                      </td>
                      <td>
                        <strong className="currency-icon">
                          <span className="span">$ </span>
                        </strong>
                        <Input
                          name="paid-amount"
                          onChange={handleOnChangeAmountPaid}
                          type="number"
                          className="payment-input"
                          value={amountPaid}
                          required={true}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td colSpan="5" />
                      <td className="amount-paid">
                        <strong>Net Balance</strong>
                      </td>
                      <td className="netPaidBorder">
                        ${" "}
                        {amountPaid == null
                          ? totalRemainingBalance
                          : totalRemainingBalance - amountPaid}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="payment-btns">
                <Button className="payment-save-btn">Send by Email</Button>
                <Button
                  onClick={() => handlePrint("print")}
                  className="payment-print-btn"
                >
                  Print
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
export default BillDetails;
