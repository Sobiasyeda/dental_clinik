// import { useAuthorization } from "../../hooks/useAuthorization.js";
import Button from "../UI/Button.jsx";
import { useContext, useState } from "react";
import Input from "../UI/Input.jsx";
import { fetchData } from "../../hooks/fetchData.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { unpaidBillHeaders } from "../../utils/event-utils.js";
import Label from "../UI/Label.jsx";
import SearchInput from "./SearchInput.jsx";
import { faFileInvoiceDollar, faXmark } from "@fortawesome/pro-solid-svg-icons";
import { SearchInputContext } from "../components/SearchInputContext.jsx";

const OLD_BILL = import.meta.env.VITE_OLD_BILL;
const TREATMENT_PLAN = "treatment_plan";
const BillOldOutstandingBalance = () => {
  // useAuthorization(OLD_BILL);
  const { selectedNames, setSelectedNames } = useContext(SearchInputContext);

  const patientInfo = selectedNames.length > 0 && selectedNames[0];
  const [amountPaid, setAmountPaid] = useState("");
  const [writeOff, setWriteOff] = useState("");
  const [message, setMessage] = useState("");
  const [messageTimer, setMessageTimer] = useState(false);
  const [printOption, setPrintOption] = useState("");

  // we will omit procedures with status of treatment_plan as they are not chargeable
  // in this component, we need only the encounters that are chargeables , meaning status of in_process & completed
  const filteredSelectedNames = selectedNames.reduce((acc, item) => {
    acc.push({
      ...item,
      procedures: item.procedures.filter(
        (proc) => proc.status !== TREATMENT_PLAN,
      ),
    });
    return acc;
  }, []);

  // get the doctor name
  const doctor_name =
    filteredSelectedNames.length > 0
      ? filteredSelectedNames[0].procedures[0].provider
      : null;

  // get patient id
  const patient_id =
    filteredSelectedNames.length > 0 ? filteredSelectedNames[0].id : null;

  const total_balance = filteredSelectedNames.reduce((acc, item) => {
    const remaining_balance = item.procedures.filter(
      (bal) => bal.remaining_balance > 0,
    );
    const total_remaining_balance = remaining_balance.reduce(
      (subAcc, balance) => subAcc + parseFloat(balance.remaining_balance),
      0,
    );
    return acc + total_remaining_balance;
  }, 0);

  const handleWriteOff = (event) => {
    setWriteOff(event.target.value);
  };

  function handleOnChange(event) {
    setAmountPaid(event.target.value);
  }

  function handlePrint(item) {
    setPrintOption(item);
    window.print();
  }

  function handleCancel() {
    setSelectedNames([]);
  }

  async function handleSubmitForm(event) {
    if (filteredSelectedNames.length > 0) {
      event.preventDefault();
      const dataForm = new FormData(event.target);
      const data = Object.fromEntries(dataForm.entries());
      const amountPaid = event.target.elements["paid-amount"].value;
      const writeOff = event.target.elements["write-off"].value;

      const billId = [];
      const disposition = []; // patient disposition should be there on every row of that encounter
      for (const key in data) {
        if (key.startsWith("encounter")) {
          billId.push(data[key]);
          disposition.push("discharged");
        }
      }
      const payload = {
        billID: billId,
        amountPaid: amountPaid,
        writeoff: writeOff,
        disposition: disposition,
        doctor: doctor_name,
        print_only: printOption,
        patient_id: patient_id,
      };
      try {
        const resdata = await fetchData("/treatment-plan", "POST", payload);
        if (resdata) {
          setSelectedNames([]);
          setMessageTimer(true);
          setMessage("Saved Successfully !");
          setTimeout(() => {
            setMessageTimer(false);
          }, 2000);
        }
      } catch (error) {
        console.lor(error);
      }
      setAmountPaid("");
      setWriteOff("");
    }
  }

  return (
    <>
      <SearchInput />
      <div className="old-bill-page">
        <div className="message-old-bill">{messageTimer && message}</div>
        <div className="button-container">
          <div className="icon-text">
            <div className="iconsPosition">
              <FontAwesomeIcon
                icon={faFileInvoiceDollar}
                className="tooth-spacing"
              />
              <FontAwesomeIcon icon={faXmark} className="unpaidBillAmount" />
            </div>
            <span className="text">Unpaid Bill</span>
          </div>
          <div className="decorative-shapes"></div>
        </div>

        {filteredSelectedNames.length > 0 && (
          <form onSubmit={handleSubmitForm} className="formUnpaid">
            <div className="receipt-encout">
              <div className="cancel-button">
                <Button onClick={handleCancel} className="cancel-btn">
                  Cancel
                </Button>
              </div>

              <div className="receipt-enc-title">Receipt</div>
            </div>
            <div className="name-unpaid">
              <div className="label-name-unpaid">
                <Label className="labelName" label="Patient Name :" />
              </div>

              <div className="unpaid-bill-name">
                {patientInfo.name} {patientInfo.father} {patientInfo.family}
              </div>
            </div>
            <div className="dob-unpaid">
              <div className="label-dob-unpaid">
                <Label className="dobName" label="Date Of Birth :" />
              </div>

              <div className="unpaid-bill-dob">{patientInfo.dob}</div>
            </div>
            <div className="unpaid-doctor">
              <div className="doctor-span">
                <Label label="Doctor :" />
              </div>
              <div className="dr-unpaid">{doctor_name}</div>
            </div>
            <div className="old-table">
              <table className="unpaid-table">
                <thead>
                  <tr>
                    {unpaidBillHeaders.map((item, index) => (
                      <th key={index}>{item.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSelectedNames.map((item) => {
                    return item.procedures
                      .filter((proc) => proc.remaining_balance > 0)
                      .map((proc, index) => (
                        <tr key={proc.treat_encount_id}>
                          <td className="unpaid-date">
                            {new Date(proc.encounterDate).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                          <td className="unpaid-proc">{proc.procedure}</td>
                          <td className="unpaid-status">{proc.status}</td>
                          <td style={{ display: "none" }}>
                            <Input
                              type="hidden"
                              value={proc.treat_encount_id}
                              readonly={true}
                              name={`encounter-${index}`}
                            />
                          </td>

                          <td className="unpaid-fees">$ {proc.fees}</td>
                          <td className="unpaid-disc">
                            {proc.discount * 100} %
                          </td>
                          <td className="unpaid-net">$ {proc.net_price}</td>
                          <td className="unpaid-amt">$ {proc.amount_paid}</td>
                          <td className="unpaid-write">$ {proc.write_off}</td>
                          <td className="unpaid-rem">
                            $ {proc.remaining_balance}
                          </td>
                        </tr>
                      ));
                  })}
                  <tr className="balance-row">
                    <td className="empty-td " colSpan="7" />
                    <td className="balance-font"> Total Balance</td>
                    <td className="balance-field">$ {total_balance}</td>
                  </tr>
                  <tr className="balance-row">
                    <td className="empty-td " colSpan="7" />
                    <td className="paid-font"> Amount Paid</td>
                    <td>
                      ${" "}
                      <Input
                        type="number"
                        className="old-input"
                        name="paid-amount"
                        onChange={handleOnChange}
                        value={amountPaid}
                        required={true}
                      />
                    </td>
                  </tr>
                  <tr className="balance-row">
                    <td className="empty-td " colSpan="7" />
                    <td className="paid-font"> Write Off</td>
                    <td>
                      ${" "}
                      <Input
                        type="number"
                        className="old-input"
                        name="write-off"
                        onChange={handleWriteOff}
                        value={writeOff}
                        required={true}
                      />
                    </td>
                  </tr>
                  <tr className="balance-row">
                    <td className="empty-td " colSpan="7" />
                    <td className="paid-font"> Net Balance</td>
                    <td className="net-bal">
                      $ {total_balance - (amountPaid ?? 0) - (writeOff ?? 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="old-btns">
              <Button className="save-old">Send by Email</Button>
              <Button
                onClick={() => handlePrint("print")}
                className="print-old"
              >
                Print
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default BillOldOutstandingBalance;
