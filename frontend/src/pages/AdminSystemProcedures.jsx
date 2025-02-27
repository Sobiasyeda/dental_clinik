import { useState, lazy, Suspense } from "react";
const Button = lazy(() => import("../UI/Button.jsx"));
const Input = lazy(() => import("../UI/Input.jsx"));
const SelectPage = lazy(() => import("../UI/Select.jsx"));
const OptionPage = lazy(() => import("../UI/Option.jsx"));

import { createEventId } from "../../utils/event-utils.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleMinus } from "@fortawesome/pro-light-svg-icons";
import { fetchData } from "../../hooks/fetchData.js";
import useSystemAdminAuthorization from "../../hooks/useSystemAdminAuthorization.js";
const SYSTEM_ADD_PROCEDURES = import.meta.env.VITE_SYSTEM_ADD_PROCEDURES;
const AddProcedures = () => {
  const [addNewRow, setAddNewRow] = useState([]);
  const [message, setMessage] = useState("");

  useSystemAdminAuthorization(SYSTEM_ADD_PROCEDURES);
  function handleAddProcedure() {
    setAddNewRow((prevRow) => [
      ...prevRow,
      {
        procedureId: createEventId(),
      },
    ]);
  }

  function handleRemoveProcedure(rowId) {
    const filteredProceduresList = addNewRow.filter(
      (item) => item.procedureId !== rowId,
    );
    setAddNewRow(filteredProceduresList);
  }

  async function handleSubmitForm(event) {
    event.preventDefault();
    const formaData = new FormData(event.target);
    const data = Object.fromEntries(formaData.entries());
    if (addNewRow.length > 0) {
      try {
        const resdata = await fetchData("/addProcedures", "POST", data);
        setMessage(resdata.message);
      } catch (error) {
        console.log(error);
      }
    }

    setAddNewRow([]);
  }

  return (
    <div>
      <h1 className="proc-title">Add Procedures</h1>
      <div className="proc-table">
        <Suspense fallback={<div>Loading ...</div>}>
          <form onSubmit={handleSubmitForm}>
            <table>
              <thead>
                <tr>
                  <th className="proc-description" scope="col">
                    Description
                  </th>
                  <th className="proc-delete" scope="col">
                    <FontAwesomeIcon
                      icon={faCircleMinus}
                      size="lg"
                      style={{ color: "red" }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {addNewRow.length > 0 &&
                  addNewRow.map((item) => (
                    <tr key={item.procedureId}>
                      <td className="td-desc">
                        <Input
                          className="proc-desc-input"
                          name={`description-proc-${item.procedureId}`}
                          required={true}
                        />
                      </td>
                      <td className="td-delete">
                        <FontAwesomeIcon
                          className="proc-delete-input"
                          onClick={() =>
                            handleRemoveProcedure(item.procedureId)
                          }
                          name={`delete-icon-${item.procedureId}`}
                          icon={faCircleMinus}
                          size="lg"
                          style={{ color: "red" }}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="add-procedure">
              <div>
                <Button
                  type="button"
                  onClick={handleAddProcedure}
                  className="add-button"
                >
                  Add
                </Button>
              </div>
              <div className="submit-button">
                <Button className="submit-proc">Submit</Button>
              </div>
            </div>
          </form>
        </Suspense>
      </div>
      <div className="proc-message">{message && message}</div>
    </div>
  );
};

export default AddProcedures;
