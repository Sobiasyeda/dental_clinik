import { useContext, useState } from "react";
import { SearchInputContext } from "../components/SearchInputContext.jsx";
import Label from "../UI/Label.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTooth, faCheck } from "@fortawesome/pro-solid-svg-icons";

const TREATMENT_PLAN = import.meta.env.VITE_TREATMENT_PLAN;
import Button from "../UI/Button.jsx";
import Input from "../UI/Input.jsx";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
import { treatmentHeaders } from "../../utils/event-utils.js";
import { fetchData } from "../../hooks/fetchData.js";

const TreatmentPlan = () => {
  const { selectedNames, setSelectedNames } = useContext(SearchInputContext); // in our case here, we need the procedures with treatment_plan status meaning not chargeable
  const [successMessage, setSuccessMessage] = useState("");
  const [messageTimer, setMessageTimer] = useState(false);
  // useAuthorization(TREATMENT_PLAN);
  console.log("selected names", selectedNames);
  const defaultName = selectedNames[0] || {
    name: "",
    father: "",
    family: "",
    dob: "",
    id: "",
  };

  const filteredSelectedNames = selectedNames.reduce((acc, item) => {
    acc.push({
      ...item,
      procedures: item.procedures.filter(
        (proc) => proc.status === TREATMENT_PLAN,
      ),
    });
    return acc;
  }, []);

  const doctor_name = filteredSelectedNames
    .flatMap((item) => item.procedures)
    .find((procedure) => procedure.provider)?.provider;

  const visit_date = filteredSelectedNames
    .flatMap((item) => item.procedures)
    .find((procedure) => procedure.status_date)?.status_date;
  const formatted_visit_date = new Date(visit_date).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );

  const { total_gross_amount, total_net_amount } = filteredSelectedNames.reduce(
    (acc, item) => {
      const gross = item.procedures.reduce(
        (sum, proc) => sum + parseFloat(proc.fees || 0),
        0,
      );
      const net = item.procedures.reduce(
        (sum, proc) => sum + parseFloat(proc.net_price || 0),
        0,
      );

      acc.total_gross_amount.push(gross);
      acc.total_net_amount.push(net);

      return acc;
    },
    { total_gross_amount: [], total_net_amount: [] },
  );

  const total_discount =
    total_gross_amount.reduce((acc, val) => acc + val, 0) -
    total_net_amount.reduce((acc, val) => acc + val, 0);

  function handlePrint() {
    window.print();
    setSelectedNames([]);
  }

  const handleSubmitForm = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const fields = [
      { key: "proc-content", array: [] },
      { key: "tooth-content", array: [] },
      { key: "fees-content", array: [] },
      { key: "disc-content", array: [] },
      { key: "price-content", array: [] },
    ];
    fields.forEach(({ key, array }) => {
      Object.keys(data).forEach((dataKey) => {
        if (dataKey.startsWith(key)) {
          array.push(data[dataKey]);
        }
      });
    });

    const payload = {
      name: data["name-label"],
      patient_id: data["patient_id"],
      dob: data["dob-label"],
      doctor: doctor_name,
      encounter_date: formatted_visit_date,
      net_amount: data["net-treatment"],
      proc_content: fields[0].array,
      tooth_content: fields[1].array,
      fees_content: fields[2].array,
      discount_perc: fields[3].array,
      price_content: fields[4].array,
    };

    try {
      const resdata = await fetchData("/treatmentEmail", "POST", payload);
      setSelectedNames([]);
      setSuccessMessage(resdata.message);
      setMessageTimer(true);
      setTimeout(() => {
        setMessageTimer(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="treat-box">
      <div className="button-container">
        <div className="icon-text">
          <div className="clock">
            <FontAwesomeIcon icon={faTooth} className="tooth-spacing" />
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <span className="text">Treatment Plan</span>
        </div>
        <div className="decorative-shapes"></div>
      </div>

      <form onSubmit={handleSubmitForm}>
        <div className="patient-demog">
          <div>
            <Label
              className="label-name "
              label="Patient Name :&nbsp;"
              htmlFor="name-label"
            />
          </div>
          <div className="name-label">
            <Input
              name="name-label"
              value={`${defaultName.name} ${defaultName.father} ${defaultName.family}`}
              className="nameLabel"
            />
          </div>
          <Input
            type="hidden"
            value={defaultName.id}
            readonly={true}
            name="patient_id"
          />
        </div>
        <div className="patient-dob">
          <div>
            <Label
              className="dob-label"
              label="Date of Birth :&nbsp;"
              htmlFor="dob-label"
            />
          </div>
          <div>
            <Input
              name="dob-label"
              value={defaultName.dob}
              className="dobLabel"
            />
          </div>
        </div>

        <div className="treatment-table">
          <table className="t-table">
            <thead>
              <tr>
                {treatmentHeaders.map((item) => (
                  <th key={item.id}>
                    <div className="tableHeads">{item.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSelectedNames.map((item) =>
                item.procedures.map((proc) => {
                  return (
                    <tr key={proc.treat_encount_id} className="td-row">
                      <td>
                        <Input
                          name={`proc-content-${proc.treat_encount_id}`}
                          value={proc.procedure}
                          className="procContent"
                        />
                      </td>
                      <td>
                        <Input
                          name={`tooth-content-${proc.treat_encount_id}`}
                          value={proc.toothNum}
                          className="toothContent"
                        />
                      </td>
                      <td>
                        <Input
                          name={`fees-content-${proc.treat_encount_id}`}
                          value={`$ ${proc.fees}`}
                          className="procFees"
                        />
                      </td>
                      <td>
                        <Input
                          name={`disc-content-${proc.treat_encount_id}`}
                          value={`${proc.discount * 100} %`}
                          className="discContent"
                        />
                      </td>
                      <td>
                        <Input
                          name={`price-content-${proc.treat_encount_id}`}
                          value={`$ ${proc.net_price}`}
                          className="priceContent"
                        />
                      </td>
                    </tr>
                  );
                }),
              )}
              <tr>
                <td colSpan="1" className="no-border"></td>
                <td>
                  <div className="treatment-bold">Total</div>
                </td>
                <td>
                  <Input
                    name="treatment-bold"
                    value={`$ ${total_gross_amount}`}
                    className="treatmentBold"
                  />
                </td>
                <td>
                  <Input
                    name="treatment-discnt"
                    value={`$ ${total_discount}`}
                    className="treatmentDiscount"
                  />
                </td>
                <td>
                  <Input
                    name="net-treatment"
                    value={`$ ${total_net_amount}`}
                    className="netTreatment"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="print-treat">
          <Button
            className="print-treatment"
            onClick={handlePrint}
            type="button"
          >
            Print
          </Button>
          <Button className="treatment-email">Send by Email</Button>
        </div>
      </form>

      {messageTimer && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default TreatmentPlan;
