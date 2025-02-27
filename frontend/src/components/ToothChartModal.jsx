import Modal from "./Modal.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash as faTrashSolid } from "@fortawesome/free-solid-svg-icons";
import Input from "../UI/Input.jsx";
import { faTrashXmark } from "@fortawesome/pro-light-svg-icons";
import SelectPage from "../UI/Select.jsx";
import OptionPage from "../UI/Option.jsx";
import Button from "../UI/Button.jsx";
import { completedHeaders } from "../../utils/event-utils.js";
import { inProcessHeaders } from "../../utils/event-utils.js";
import { tableHeaders } from "../../utils/event-utils.js";
import { ModalContext } from "./ModalContext.jsx";
import { dateConversion } from "../../utils/event-utils.js";
import { useContext, useEffect, useState } from "react";
const ToothChartModal = ({
  isDiagnosisPage,
  selectedNames,
  handleSubmitDiagnosisForm,
  handleSubmitProcedureForm,
  patientDiagnosisInTable,
  handleDeleteIconOnTooth,
  handleOnChangeProcedureData,
  inputValues,
  userName,
  currentDate,
  diagnosisDataManually,
  handleDeleteInterventionFromTable,
  procedureDataManually,
  interventionMessage,
  messageTimer,
  handleCloseToothChartModal,
}) => {
  console.log("SELECTED NAMES", selectedNames);
  const [changeStatus, setChangeStatus] = useState({});
  const [procInProcess, setProcInProcess] = useState([]);
  console.log("proce in process", procInProcess);
  const modalCtx = useContext(ModalContext);
  const headers = isDiagnosisPage
    ? tableHeaders.diagnosis
    : tableHeaders.procedure;

  useEffect(() => {
    const result = selectedNames.reduce((acc, item) => {
      item.procedures.forEach((item) => {
        if (item.status === "in_process") {
          if (!acc[item.status]) {
            acc[item.status] = [];
          }
          acc[item.status].push(item);
        }
      });
      return acc;
    }, {});
    setProcInProcess(result["in_process"] || []);
  }, [selectedNames]);

  const procedures = selectedNames.reduce((acc, item) => {
    item.procedures.forEach((procedure) => {
      if (procedure.status === "completed") {
        if (!acc[procedure.status]) {
          acc[procedure.status] = [];
        }
        acc[procedure.status].push(procedure);
      }
    });
    return acc;
  }, {});
  console.log("procedures", procedures);

  const handleChangeStatus = (event) => {
    const { name, value } = event.target;
    setChangeStatus((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDeleteInProcess=(id)=>{
    const filtered_procedures=procInProcess.filter((item)=>item.treat_encount_id!==id);
    setProcInProcess(filtered_procedures)
  }

  return (
    <Modal open={modalCtx.toothChartStatus}>
      {!isDiagnosisPage && (
        <div>
          <div>Completed procedures</div>
          <table>
            <thead>
              <tr>
                {completedHeaders.map((item) => (
                  <th key={item.key}>{item.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {procedures?.completed?.map((item) => {
                return (
                  <tr key={item.treat_encounter_id}>
                    <td>{item.procedure}</td>
                    <td>{item.toothNum}</td>
                    <td>{item.fees}</td>
                    <td>{item.discount}</td>
                    <td>{item.write_off}</td>
                    <td>{item.status}</td>
                    <td>{item.amount_paid}</td>
                    <td>{item.remaining_balance}</td>
                    <td>{dateConversion(item.encounterDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!isDiagnosisPage && (
        <div>
          <div>Procedures in process</div>
          <table>
            <thead>
              <tr>
                {inProcessHeaders.map((item) => (
                  <th key={item.key}>
                    {item.key === "delete" ? (
                      <FontAwesomeIcon
                        icon={faTrashSolid}
                        className="delete-icon"
                      />
                    ) : (
                      <div>{item.label}</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {procInProcess?.map((item) => {
                return (
                  <tr key={item.treat_encount_id}>
                    <td>
                      <Input readonly={true} value={item.procedure} />
                    </td>
                    <td>
                      <Input readonly={true} value={item.toothNum} />
                    </td>
                    <td>
                      <Input readonly={true} value={item.fees} />
                    </td>
                    <td>
                      <Input readonly={true} value={item.discount} />
                    </td>
                    <td>
                      <Input readonly={true} value={item.write_off} />
                    </td>
                    <td>
                      <SelectPage
                        name="statusChange"
                        onChange={handleChangeStatus}
                        value={changeStatus[name]}
                      >
                        <OptionPage selected={true} value={item.status}>
                          {item.status}
                        </OptionPage>
                        <OptionPage value="completed">Completed</OptionPage>
                      </SelectPage>
                    </td>
                    <td>
                      <Input readonly={true} value={item.amount_paid} />
                    </td>
                    <td>
                      <Input readonly={true} value={item.remaining_balance} />
                    </td>
                    <td>
                      <Input value={dateConversion(item.encounterDate)} />
                    </td>
                    <td>
                      <FontAwesomeIcon
                        onClick={() =>
                          handleDeleteInProcess(item.treat_encount_id)
                        }
                        icon={faTrashXmark}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <form
        className="diagnosis-form"
        onSubmit={
          isDiagnosisPage
            ? handleSubmitDiagnosisForm
            : handleSubmitProcedureForm
        }
      >
        <div className="diagnosis-table">
          <table>
            <thead>
              <tr>
                {headers.map((item) => (
                  <th key={item.key}>
                    {item.key === "delete" ? (
                      <FontAwesomeIcon
                        icon={faTrashSolid}
                        className="delete-icon"
                      />
                    ) : (
                      <div className={item.key}>{item.label}</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <Input
                type="hidden"
                name="patient_id"
                value={selectedNames.length > 0 ? selectedNames[0].id : ""}
              />
              {isDiagnosisPage
                ? patientDiagnosisInTable.map((item) => {
                    return (
                      <tr key={item.uniqueId}>
                        <td className="diag-input">
                          <Input
                            readonly={true}
                            className="diag-desc diag-width"
                            value={item.draggable_icon}
                            name={`diagnosis-${item.uniqueId}`}
                          />
                        </td>
                        <td className="tooth-input">
                          <Input
                            readonly={true}
                            className="diag-tooth"
                            value={item.tooth_number}
                            name={`number-${item.uniqueId}`}
                          />
                        </td>
                        <td>
                          <FontAwesomeIcon
                            onClick={() =>
                              handleDeleteIconOnTooth(
                                item.draggable_icon,
                                item.tooth_number,
                                item.uniqueId,
                              )
                            }
                            icon={faTrashXmark}
                            className="trash-diagnosis"
                          />
                        </td>
                      </tr>
                    );
                  })
                : patientDiagnosisInTable.map((item) => {
                    return (
                      <tr key={item.uniqueId}>
                        <td className="proc-input">
                          <Input
                            readonly={true}
                            className="proced-desc proced-width"
                            value={item.draggable_icon}
                            name={`procDescription-${item.uniqueId}`}
                          />
                        </td>
                        <td className="tooth-input">
                          <Input
                            readonly={true}
                            className="procedure-tooth"
                            value={item.tooth_number}
                            name={`procTooth-${item.uniqueId}`}
                          />
                        </td>
                        <td className="fees-input">
                          <Input
                            readonly={true}
                            className="proced-fees"
                            value={`$ ${item.proc_fee}`}
                            name={`procFee-${item.uniqueId}`}
                          />
                        </td>
                        <td className="discount-input">
                          <SelectPage
                            required={true}
                            className="select-discount"
                            name={`procDiscount-${item.uniqueId}`}
                            onChange={handleOnChangeProcedureData}
                            value={inputValues[name]}
                          >
                            <OptionPage value="0">0%</OptionPage>
                            <OptionPage value="0.1">10%</OptionPage>
                            <OptionPage value="0.25">25%</OptionPage>
                            <OptionPage value="0.5">50%</OptionPage>
                            <OptionPage value="1">100%</OptionPage>
                          </SelectPage>
                        </td>
                        <td className="status-input">
                          <SelectPage
                            required={true}
                            className="proced-status"
                            name={`procStatus-${item.uniqueId}`}
                            onChange={handleOnChangeProcedureData}
                            value={inputValues[name]}
                          >
                            <OptionPage value="">Select</OptionPage>
                            <OptionPage value="in_process">
                              In Process
                            </OptionPage>
                            <OptionPage value="completed">Completed</OptionPage>
                            <OptionPage value="treatment_plan">
                              Treat Plan
                            </OptionPage>
                          </SelectPage>
                        </td>
                        <td className="doc-notes">
                          <textarea
                            name={`procNotes-${item.uniqueId}`}
                            className="proc-notes"
                          />
                        </td>
                        <td className="provider-input">
                          <Input
                            readonly={true}
                            value={userName}
                            className="proc-provider"
                            name={`procProvider-${item.uniqueId}`}
                          />
                        </td>
                        <td className="date-input">
                          <Input
                            readonly={true}
                            value={currentDate}
                            className="date-proc"
                            name={`procDate-${item.uniqueId}`}
                          />
                        </td>
                        <td className="delete-proc">
                          <FontAwesomeIcon
                            onClick={() =>
                              handleDeleteIconOnTooth(
                                item.draggable_icon,
                                item.tooth_number,
                                item.uniqueId,
                              )
                            }
                            icon={faTrashXmark}
                            className="trash-diagnosis"
                          />
                        </td>
                      </tr>
                    );
                  })}

              {isDiagnosisPage
                ? diagnosisDataManually.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className="diag-input">
                          <Input
                            readonly={true}
                            className="diag-desc diag-width"
                            value={item.diagnosisDescription}
                            name={`diagnosis-${item.unique_id}`}
                          />
                        </td>
                        <td className="tooth-input">
                          <Input
                            readonly={true}
                            className="diag-tooth"
                            value={item.diagnosedTooth}
                            name={`number-${item.unique_id}`}
                          />
                        </td>
                        <td>
                          <FontAwesomeIcon
                            onClick={() =>
                              handleDeleteInterventionFromTable(item.unique_id)
                            }
                            icon={faTrashXmark}
                            className="trash-diagnosis"
                          />
                        </td>
                      </tr>
                    );
                  })
                : procedureDataManually.map((item) => {
                    return (
                      <tr key={item.unique_id}>
                        <td className="proc-input">
                          <Input
                            readonly={true}
                            className="proced-desc proced-width"
                            value={item.procedureDescription}
                            name={`procDescriptionManual-${item.unique_id}`}
                          />
                        </td>
                        <td className="tooth-input">
                          <Input
                            className="procedure-tooth"
                            readonly={true}
                            value={item.tooth}
                            name={`procToothManual-${item.unique_id}`}
                          />
                        </td>
                        <td className="fees-input">
                          <Input
                            readonly={true}
                            className="proced-fees"
                            name={`procFeeManual-${item.unique_id}`}
                            value={`$ ${item.procedureFee}`}
                          />
                        </td>
                        <td className="discount-input">
                          <SelectPage
                            required={true}
                            className="select-discount"
                            name={`procDiscountManual-${item.unique_id}`}
                            onChange={handleOnChangeProcedureData}
                            value={inputValues[name]}
                          >
                            <OptionPage value="0">0%</OptionPage>
                            <OptionPage value="0.1">10%</OptionPage>
                            <OptionPage value="0.25">25%</OptionPage>
                            <OptionPage value="0.5">50%</OptionPage>
                            <OptionPage value="1">100%</OptionPage>
                          </SelectPage>
                        </td>
                        <td className="status-input">
                          <SelectPage
                            required={true}
                            className="proced-status"
                            name={`procStatusManual-${item.uniqueId}`}
                            onChange={handleOnChangeProcedureData}
                            value={inputValues[name]}
                          >
                            <OptionPage value="">Select</OptionPage>
                            <OptionPage value="in_process">
                              In Process
                            </OptionPage>
                            <OptionPage value="completed">Completed</OptionPage>
                            <OptionPage value="treatment_plan">
                              Treat Plan
                            </OptionPage>
                          </SelectPage>
                        </td>
                        <td className="doc-notes">
                          <textarea
                            name={`procNotesManual-${item.unique_id}`}
                            className="proc-notes"
                          />
                        </td>
                        <td className="provider-input">
                          <Input
                            readonly={true}
                            value={userName}
                            className="proc-provider"
                            name={`procProviderManual-${item.unique_id}`}
                          />
                        </td>
                        <td className="date-input">
                          <Input
                            readonly={true}
                            value={currentDate}
                            className="date-proc"
                            name={`procDateManual-${item.unique_id}`}
                          />
                        </td>
                        <td>
                          <FontAwesomeIcon
                            onClick={() =>
                              handleDeleteInterventionFromTable(item.unique_id)
                            }
                            icon={faTrashXmark}
                            className="trash-diagnosis"
                          />
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        <div className="buttons-tooth-chart">
          <Button className="diagnosis-button">Submit</Button>
          <Button
            className="close-tooth-chart"
            type="button"
            onClick={handleCloseToothChartModal}
          >
            Close
          </Button>
        </div>
      </form>

      <div className="diag-message">
        {interventionMessage && messageTimer && (
          <div>{interventionMessage}</div>
        )}
      </div>
    </Modal>
  );
};

export default ToothChartModal;
