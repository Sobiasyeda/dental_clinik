import { createContext, useEffect, useState } from "react";
import { fetchData } from "../../hooks/fetchData.js";
export const BillContext = createContext({
  setPatientBill: () => {},
  patientBill: [],
});

export default function BillContextProvider({ children }) {
  const [patientBill, setPatientBill] = useState([]);
  console.log("patient bill",patientBill)

  useEffect(() => {
    async function getAllPendingBills() {
      try {
        const resData = await fetchData("/getCurrentBills");
        setPatientBill(resData);
      } catch (error) {
        console.log(error);
      }
    }
    getAllPendingBills();
  }, []);

  const billCtx = {
    setPatientBill,
    patientBill,
  };

  return (
    <BillContext.Provider value={billCtx}>{children}</BillContext.Provider>
  );
}
