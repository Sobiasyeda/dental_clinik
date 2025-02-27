import Documentation from "../components/Documentation.jsx";
import { fetchData } from "../../hooks/fetchData.js";
import { useEffect, useState, useContext } from "react";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
import { DiagnosisContext } from "../components/DiagnosisContext.jsx";

const EMR = import.meta.env.VITE_EMR;
const ProceduresChart = () => {
  // useAuthorization(EMR);
  const [procedures, setProcedures] = useState([]);
  const { diagnosisMap, setPreviousDiagnosis, proceduresMap } =
    useContext(DiagnosisContext);

  useEffect(() => {
    async function getAllProcedures() {
      try {
        const resdata = await fetchData("/procedures_stored");
        setProcedures(resdata);
      } catch (error) {
        console.log(error);
      }
    }
    getAllProcedures();
  }, []);

  return (
    <>
      <Documentation
        setPreviousDiagnosis={setPreviousDiagnosis}
        diagnosisMap={diagnosisMap}
        procedures={procedures}
        isDiagnosisPage={false}
        proceduresMap={proceduresMap}
      />
    </>
  );
};

export default ProceduresChart;
