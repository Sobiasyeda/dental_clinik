import { lazy, Suspense } from "react";
const AdminActDeactPage = lazy(() => import("./AdminActDeact.jsx"));
const ACT_DEACT = import.meta.env.VITE_ACT_DEACT;
const AdminSystemActDeact = () => {
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <AdminActDeactPage statusMessage={ACT_DEACT} />
    </Suspense>
  );
};

export default AdminSystemActDeact;
