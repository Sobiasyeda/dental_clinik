import Button from "../UI/Button.jsx";
import { useEffect, useState } from "react";
import Input from "../UI/Input.jsx";
import SelectPage from "../UI/Select.jsx";
import OptionPage from "../UI/Option.jsx";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
import useSystemAdminAuthorization from "../../hooks/useSystemAdminAuthorization.js";
import { createEventId } from "../../utils/event-utils.js";
import { faTrash } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faCirclePlus } from "@fortawesome/pro-light-svg-icons";
import { faCircleDollar } from "@fortawesome/pro-duotone-svg-icons";
import Label from "../UI/Label.jsx";
import { fetchData } from "../../hooks/fetchData.js";
import { CSVLink } from "react-csv";

const SELECT = "Select";
const CLINIC_PRICE_LIST = import.meta.env.VITE_CLINIC_PRICE_LIST;
const SYSTEM_PRICE_LIST = import.meta.env.VITE_SYSTEM_PRICE_LIST;
const EXTRACTION = import.meta.env.VITE_EXTRACTION;
const IMPLANT_TOP = import.meta.env.VITE_IMPLANT_TOP;
const PONTIC = import.meta.env.VITE_PONTIC;
const ROOT = import.meta.env.VITE_ROOT;
const CROWN = import.meta.env.VITE_CROWN;
const IMPLANT_FIXTURE = import.meta.env.VITE_IMPLANT_FIXTURE;
const LINGUAL = import.meta.env.VITE_LINGUAL;
const BUCCAL = import.meta.env.VITE_BUCCAL;
const OCCLUSAL = import.meta.env.VITE_OCCLUSAL;
const MESIAL = import.meta.env.VITE_MESIAL;
const DISTAL = import.meta.env.VITE_DISTAL;

const AdminPriceList = ({ systemPrice, systemMessage }) => {
  const [procedures, setProcedures] = useState([]);
  const [procedureDetails, setProcedureDetails] = useState([]);
  const [addProcedure, setAddProcedure] = useState([]);
  const [price, setPrice] = useState({});
  const [backEndMessage, setBackEndMessage] = useState("");
  const [clinicNames, setClinicNames] = useState([]);
  const [specificClinic, setSpecificClinic] = useState("");
  const [changeClinic, setChangeClinic] = useState({});
  const [clinicPriceList, setClinicPriceList] = useState([]);
  console.log("clinic price list", clinicPriceList);

  // systemMessage ? useSystemAdminAuthorization(SYSTEM_PRICE_LIST) : useAuthorization(CLINIC_PRICE_LIST);

  function handleAddProcedure() {
    setAddProcedure((prevState) => [
      ...prevState,
      {
        procedureId: createEventId(),
      },
    ]);
  }

  function handleChangeClinic(event) {
    const { name, value } = event.target;
    setChangeClinic((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function handlePriceOnChange(event) {
    const { name, value } = event.target;
    setPrice((prevPrice) => ({
      ...prevPrice,
      [name]: value,
    }));
  }

  function handleChangeProcedure(event, id) {
    const selectValue = event.target.value;
    const findProcedure = procedures.find(
      (item) => item.description === selectValue,
    );

    setProcedureDetails((prevDetails) => {
      const updatedDetails = [...prevDetails];
      const index = updatedDetails.findIndex(
        (detail) => detail.procedureId === id,
      );
      if (index === -1) {
        updatedDetails.push({
          procedureId: id,
          description: findProcedure.description,
          icon: findProcedure.icon,
          category: findProcedure.category,
        });
      } else {
        updatedDetails[index] = {
          ...updatedDetails[index],
          description: findProcedure.description,
          icon: findProcedure.icon,
          category: findProcedure.category,
        };
      }
      return updatedDetails;
    });
  }

  function handleDeleteProcedure(id) {
    setProcedureDetails((prevProcedures) => {
      const updatedProc = [...prevProcedures];
      const keepRemainingProcs = updatedProc.filter(
        (item) => item.procedureId !== id,
      );
      return keepRemainingProcs;
    });

    setAddProcedure((prevState) => {
      const updatedProcedure = [...prevState];
      const keepRemainingProcedures = updatedProcedure.filter(
        (proc) => proc.procedureId !== id,
      );
      return keepRemainingProcedures;
    });
  }

  useEffect(() => {
    async function getSpecificClinic() {
      try {
        const resdata = await fetchData("/specific-clinic");
        setSpecificClinic(resdata);
      } catch (error) {
        console.log(error);
      }
    }
    getSpecificClinic();
  }, []);

  useEffect(() => {
    async function getClinicNames() {
      try {
        const resdata = await fetchData("/clinic-names");
        setClinicNames(resdata);
      } catch (error) {
        console.log(error);
      }
    }
    getClinicNames();
  }, []);

  useEffect(() => {
    async function getProcedures() {
      try {
        const resdata = await fetchData("/getProcedures");
        setProcedures(resdata);
      } catch (error) {
        console.log(error);
      }
    }
    getProcedures();
  }, []);

  useEffect(() => {
    const handleExportToCSV = async () => {
      const resdata = await fetchData("/getClinicPriceList");
      setClinicPriceList(resdata);
    };
    handleExportToCSV();
  }, []);

  const headers = [
    { label: "Procedure", key: "Procedure" },
    { label: "Price", key: "Price" },
    { label: "Clinic_Name", key: "Clinic_Name" },
    { label: "User_Name", key: "User_Name" },
  ];

  async function handleSubmitForm(event) {
    event.preventDefault();
    const formdata = new FormData(event.target);
    const data = Object.fromEntries(formdata.entries());
    for (const key in data) {
      if (key.startsWith("procedure-desc") && data[key] === SELECT) {
        setBackEndMessage("Please Select Procedure");
        return;
      }
    }
    if (addProcedure.length > 0) {
      try {
        const resdata = await fetchData("/pricelist", "POST", data);
        setBackEndMessage(resdata.message);
      } catch (error) {
        console.log(error);
      }
    } else {
      return;
    }

    setProcedureDetails([]);
    setAddProcedure([]);
  }

  return (
    <div className="add-price-top">
      <div className="button-container">
        <div className="icon-text">
          <div className="addPriceList">
            <FontAwesomeIcon icon={faCircleDollar} className="priceIcon" />
            <FontAwesomeIcon icon={faCirclePlus} className="plusSign" />
          </div>
          <span className="text">Add Price List</span>
        </div>
        <div className="decorative-shapes"></div>
      </div>
      <div className="prices-table">
        <form onSubmit={handleSubmitForm}>
          <div className="t-table">
            <table className="tableWidth">
              <thead>
                <tr>
                  <th className="description-pricing">
                    <span className="centered">Procedure Description</span>
                  </th>
                  <th className="price-pricing">
                    <span className="centered">Price</span>
                  </th>
                  <th className="clinic-pricing">
                    <span className="centered">Clinic Name</span>
                  </th>
                  <th className="trash-binning">
                    <FontAwesomeIcon icon={faTrash} size="lg" />
                  </th>
                </tr>
              </thead>
              {addProcedure.length > 0 &&
                addProcedure.map((item) => {
                  const procDetails =
                    procedureDetails.find(
                      (proc) => proc.procedureId === item.procedureId,
                    ) || {};

                  const sortedProcedures = [...procedures].sort((a, b) => {
                    if (a.description < b.description) return -1;
                    if (a.description > b.description) return 1;
                    return 0;
                  });

                  return (
                    <tbody key={item.procedureId}>
                      <tr>
                        <td className="td-select">
                          <SelectPage
                            name={`procedure-desc${item.procedureId}`}
                            className="desc-input"
                            required={true}
                            onChange={(event) =>
                              handleChangeProcedure(event, item.procedureId)
                            }
                            value={procDetails.description || "Select"}
                          >
                            <OptionPage disabled={true}>{SELECT}</OptionPage>
                            {sortedProcedures.map((proc, index) => {
                              const customStyle =
                                proc.description === EXTRACTION ||
                                proc.description === IMPLANT_TOP ||
                                proc.description === PONTIC ||
                                proc.description === ROOT ||
                                proc.description === CROWN ||
                                proc.description === IMPLANT_FIXTURE ||
                                proc.description === LINGUAL ||
                                proc.description === BUCCAL ||
                                proc.description === OCCLUSAL ||
                                proc.description === MESIAL ||
                                proc.description === DISTAL
                                  ? { color: "red" }
                                  : {};
                              return (
                                <OptionPage
                                  value={proc.description}
                                  key={index}
                                  style={customStyle}
                                >
                                  {proc.description}
                                </OptionPage>
                              );
                            })}
                          </SelectPage>
                        </td>
                        <td className="td-price">
                          <div className="price-div">
                            <Label
                              className="price-label"
                              label="$"
                              htmlFor="procPricing"
                            />
                            <Input
                              id="procPricing"
                              name={`procedure-price${item.procedureId}`}
                              className="price-input"
                              onChange={handlePriceOnChange}
                              value={
                                price[`procedure-price${item.procedureId}`] ||
                                ""
                              }
                              type="number"
                              required={true}
                            />
                          </div>
                        </td>
                        <td className="td-clinic">
                          <SelectPage
                            name={`clinic-name${item.procedureId}`}
                            className="clinic-select-names"
                            onChange={handleChangeClinic}
                            value={
                              systemPrice
                                ? changeClinic["clinic-name"]
                                : specificClinic
                            }
                          >
                            {systemPrice && (
                              <OptionPage selected="true" value="">
                                Select
                              </OptionPage>
                            )}
                            {systemPrice
                              ? clinicNames.map((item) => (
                                  <OptionPage key={item} value={item}>
                                    {item}
                                  </OptionPage>
                                ))
                              : specificClinic && (
                                  <OptionPage
                                    value={specificClinic}
                                    key={specificClinic}
                                  >
                                    {specificClinic}
                                  </OptionPage>
                                )}
                          </SelectPage>
                        </td>
                        <td className="td-trash">
                          <FontAwesomeIcon
                            onClick={() =>
                              handleDeleteProcedure(item.procedureId)
                            }
                            icon={faTrashCan}
                          />
                        </td>
                      </tr>
                    </tbody>
                  );
                })}
            </table>
          </div>

          <div className="submit-btn">
            <Button className="btn-shape">Submit</Button>
            <Button
              type="button"
              onClick={handleAddProcedure}
              className="add-proc-price"
            >
              Add
            </Button>
            <CSVLink
              data={clinicPriceList}
              headers={headers}
              filename="clinic_price_list.csv"
              className="clinic-price-list"
            >
              Export
            </CSVLink>
          </div>
        </form>
        <div className="back-end-message">{backEndMessage}</div>
      </div>
    </div>
  );
};

export default AdminPriceList;
