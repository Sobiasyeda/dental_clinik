import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { fetchData } from "../../hooks/fetchData.js";
import { SearchInputContext } from "./SearchInputContext.jsx";
const TREATMENT_PLAN = import.meta.env.VITE_TREATMENT_PLAN;
export const DiagnosisContext = createContext({
  selectedNames: [],
  setPreviousDiagnosis: () => {},
  diagnosisMap: {},
  proceduresMap: {},
  setStoredCopyDiagnosis: () => {},
  storedDiagnosis: {},
  setDiagnosisMap: () => {},
  storedCopyDiagnosis: [],
  setStoredDiagnosis: () => {},
  setProceduresMap: () => {},
});

export default function DiagnosisContextProvider({ children }) {
  const { selectedNames } = useContext(SearchInputContext);
  console.log("SELECTED NAMES", selectedNames);
  const [previousDiagnosis, setPreviousDiagnosis] = useState([]);
  const [diagnosisMap, setDiagnosisMap] = useState({});
  const [proceduresMap, setProceduresMap] = useState({});
  const [storedCopyDiagnosis, setStoredCopyDiagnosis] = useState([]);
  const [storedDiagnosis, setStoredDiagnosis] = useState({});

  useEffect(() => {
    const get_previous_diagnosis = async () => {
      if (selectedNames.length > 0) {
        const patient_id = selectedNames[0].id;
        try {
          const resdata = await fetchData("/get_previous_diagnosis", "POST", {
            patient_id: patient_id,
          });
          setPreviousDiagnosis(resdata);
        } catch (error) {
          console.log(error);
        }
      }
    };
    get_previous_diagnosis();
  }, [selectedNames]);

  useEffect(() => {
    const getStoredCopyDiagnosis = async () => {
      if (selectedNames.length > 0) {
        const patient_id = selectedNames[0].id;
        try {
          const resdata = await fetchData("/getStoredCopyDiagnosis", "POST", {
            patient_id: patient_id,
          });
          setStoredCopyDiagnosis(resdata);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getStoredCopyDiagnosis();
  }, [selectedNames]);

  // process the copied diagnosis and create a map by tooth number
  useEffect(() => {
    const copyOfDiagnosisStored = storedCopyDiagnosis.reduce((acc, copy) => {
      if (!acc[copy.tooth_number]) {
        acc[copy.tooth_number] = [];
      }
      acc[copy.tooth_number].push(copy.description);
      return acc;
    }, {});
    setStoredDiagnosis(copyOfDiagnosisStored);
  }, [storedCopyDiagnosis]);

  // process previous diagnosis and create a map by tooth number
  useEffect(() => {
    const diagnosisMap = previousDiagnosis.reduce((acc, diagnosis) => {
      if (!acc[diagnosis.tooth_number]) {
        acc[diagnosis.tooth_number] = [];
      }
      acc[diagnosis.tooth_number].push(diagnosis.description);
      return acc;
    }, {});
    setDiagnosisMap(diagnosisMap);
  }, [previousDiagnosis]);

  // creating a new array for procedures performed and stored in database for that patient
  // where it shows the tooth number and related procedures performed for that tooth number
  // exclude status of treatment plan as it should not show on the tooth chart
  useEffect(() => {
    const previousProcedures = selectedNames.reduce((acc, item) => {
      item.procedures.forEach((procedure) => {
        if (procedure.status !== TREATMENT_PLAN) {
          if (!acc[procedure.toothNum]) {
            acc[procedure.toothNum] = [];
          }
          acc[procedure.toothNum].push(procedure.procedure);
        }
      });
      return acc;
    }, {});
    setProceduresMap(previousProcedures);
  }, [selectedNames]);

  const diagnosisCtx = {
    diagnosisMap,
    selectedNames,
    setPreviousDiagnosis,
    proceduresMap,
    setStoredCopyDiagnosis,
    storedDiagnosis,
    setDiagnosisMap,
    storedCopyDiagnosis,
    setStoredDiagnosis,
    setProceduresMap,
  };
  return (
    <DiagnosisContext.Provider value={diagnosisCtx}>
      {children}
    </DiagnosisContext.Provider>
  );
}
