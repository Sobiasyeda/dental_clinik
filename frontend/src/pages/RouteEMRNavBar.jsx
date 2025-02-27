import { Outlet } from "react-router-dom";
import SearchInput from "./SearchInput.jsx";
import React from "react";
const RouteEMRNavBar = () => {
  return (
    <div className="all-emr">
      <SearchInput />
      <div className="emr-div">
        <Outlet />
      </div>
    </div>
  );
};

export default RouteEMRNavBar;
