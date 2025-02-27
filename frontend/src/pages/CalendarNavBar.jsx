import { Outlet } from "react-router-dom";
import VerticalNavBar from "./VerticalNavBar.jsx";
import React from "react";

const calendarNavBar = () => {
  return (
    <div className="vertic-nav-comp-emr">
      <VerticalNavBar className="vertical-nav-bar" />
      <div className="full-width-calendar">
        <Outlet />
      </div>
    </div>
  );
};

export default calendarNavBar;
