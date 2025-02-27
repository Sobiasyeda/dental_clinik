import React, { useEffect, useState, useContext } from "react";
import { fetchData } from "../../hooks/fetchData.js";
import Documentation from "../components/Documentation.jsx";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
import { DiagnosisContext } from "../components/DiagnosisContext.jsx";
const DIAGNOSIS = import.meta.env.VITE_DIAGNOSIS;
const DiagnosisChart = () => {
  // useAuthorization(DIAGNOSIS);
  const { diagnosisMap, setPreviousDiagnosis, setDiagnosisMap } =
    useContext(DiagnosisContext);
  const [diagnosis, setDiagnosis] = useState([]);

  useEffect(() => {
    const get_diagnosis = async () => {
      try {
        const resdata = await fetchData("/get_diagnosis");
        setDiagnosis(resdata);
      } catch (error) {
        console.log(error);
      }
    };
    get_diagnosis();
  }, []);

  return (
    <>
      <Documentation
        diagnosis={diagnosis}
        diagnosisMap={diagnosisMap}
        setPreviousDiagnosis={setPreviousDiagnosis}
        isDiagnosisPage={true}
        setDiagnosisMap={setDiagnosisMap}
      />
    </>
  );
};

export default DiagnosisChart;
