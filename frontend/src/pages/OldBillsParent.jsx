import { lazy, Suspense } from "react";
const BillOldBills = lazy(() => import("./BillOldBills.jsx"));
const OldBillsParent = () => {
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <BillOldBills />
    </Suspense>
  );
};

export default OldBillsParent;
