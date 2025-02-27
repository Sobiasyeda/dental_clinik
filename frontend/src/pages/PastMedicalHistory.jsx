import { useContext } from "react";
import { SearchInputContext } from "../components/SearchInputContext.jsx";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft } from "@fortawesome/pro-solid-svg-icons";
const PAST_HISTORY = import.meta.env.VITE_PAST_HISTORY;
const TREATMENT_PLAN = import.meta.env.VITE_TREATMENT_PLAN;

const PastMedicalHistory = () => {
  const { selectedNames } = useContext(SearchInputContext);
  console.log("SELECTED NAMES", selectedNames);
  // useAuthorization(PAST_HISTORY);

  const groupedProcedures = selectedNames.reduce((acc, item) => {
    item.procedures.forEach((procedure) => {
      if (procedure.status !== TREATMENT_PLAN) {
        if (!acc[procedure.encounterDate]) {
          acc[procedure.encounterDate] = [];
        }
        acc[procedure.encounterDate].push(procedure);
      }
    });
    return acc;
  }, {});

  console.log("grouped procedures", groupedProcedures);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="past-history-div">
      <div className="button-container">
        <div className="icon-text">
          <FontAwesomeIcon icon={faClockRotateLeft} className="clock" />
          <span className="text">Previous visit</span>
        </div>
        <div className="decorative-shapes"></div>
      </div>

      <div className="timeline-container">
          {Object.entries(groupedProcedures).map(
            ([date, procedures], index) => {
              return (
                <Accordion key={index} sx={{ backgroundColor: "#f0f0f0" }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <div className="visitdates">
                      <span className="span-date">{formatDate(date)}</span>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="history-table-container">
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th scope="col">Tooth Number</th>
                            <th scope="col">Procedure</th>
                            <th scope="col">Notes</th>
                            <th scope="col">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {procedures.map((proc, idx) => (
                            <tr key={idx}>
                              <td>{proc.toothNum}</td>
                              <td className="proc-history">{proc.procedure}</td>
                              <td className="notes-history">{proc.notes}</td>
                              <td className="status-history">{proc.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AccordionDetails>
                </Accordion>
              );
            },
          )}
      </div>
    </div>
  );
};

export default PastMedicalHistory;
