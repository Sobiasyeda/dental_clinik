import React, { lazy, Suspense } from "react";
const AddUserPage = lazy(() => import("./AddUserPage.jsx"));

const ADD_SYSTEM_ADMIN = import.meta.env.VITE_ADD_SYSTEM_ADMIN;
const AddSystemAdmin = () => {
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <AddUserPage add_admin={ADD_SYSTEM_ADMIN} />
    </Suspense>
  );
};
export default AddSystemAdmin;
