import { lazy, Suspense } from "react";
const AdminPriceList = lazy(() => import("./AdminPriceList.jsx"));

const PRICE_LIST = "system_price_list";
const SYSTEM_PRICE = "price";
const AdminSystemPriceList = () => {
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <AdminPriceList systemPrice={SYSTEM_PRICE} systemMessage={PRICE_LIST} />
    </Suspense>
  );
};
export default AdminSystemPriceList;
