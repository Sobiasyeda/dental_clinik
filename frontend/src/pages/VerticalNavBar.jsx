import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../UI/Button.jsx";

import {
  faAddressCard,
  faCalendar,
  faNotesMedical,
  faFile,
  faMoneyBillWave,
  faPen,
  faBell,
  faChartLine,
  faGearComplex,
  faRightFromBracket,
  faTruckRampCouch,
  faCoins,
  faHexagonPlus,
  faCircleDollar,
  faScrollOld,
  faFileInvoiceDollar,
  faCartShopping,
  faUser,
  faPersonArrowDownToLine,
  faUniversalAccess,
  faMoneyCheckPen,
  faGaugeHigh,
  faRectangleHistory,
  faUserDoctor,
} from "@fortawesome/pro-light-svg-icons";
import React, { useContext, useState, useEffect } from "react";
import { SearchInputContext } from "../components/SearchInputContext.jsx";
import {
  faSquareFacebook,
  faWhatsapp,
} from "@awesome.me/kit-507fd02030/icons/classic/brands";

const VerticalNavBar = ({ className }) => {
  const [openEMR, setOpenEMR] = useState(false);
  const [openBilling, setOpenBilling] = useState(false);
  const navigate = useNavigate();
  const [openAdmin, setOpenAdmin] = useState(false);
  const [openLogOut, setOpenLogOut] = useState(false);
  const [openFinance, setOpenFinance] = useState(false);
  const userRole = sessionStorage.getItem("role");
  const { setSelectedNames, setValidation } = useContext(SearchInputContext);
  const name = sessionStorage.getItem("user");
  const location = useLocation();
  const Production = import.meta.env.VITE_PRODUCTION;
  const isProduction = import.meta.env.MODE === Production;
  const baseUrl = isProduction ? "/static" : "";

  useEffect(() => {
    setValidation("");
  }, [location, setValidation]);

  const getInitials = (fullName) => {
    if (!fullName) return "";
    const names = fullName.split(" ");
    const initials = names.map((name) => name.charAt(0)).join("");
    return initials.toUpperCase();
  };
  const initials = getInitials(name);

  const handleClickOnFinance = () => {
    setOpenFinance((prevState) => !prevState);
  };
  function handleClickOnBilling() {
    setOpenBilling((prevState) => !prevState);
  }

  function handleOpenAdmin() {
    setOpenAdmin((prevState) => !prevState);
  }

  // in case you wee in old bills and you clicked on current patients, clear old bills
  function handleClearSelectedPatients() {
    setSelectedNames([]);
  }

  function handleSignOut() {
    setValidation("");
    setSelectedNames([]);
    sessionStorage.clear();
    navigate("/");
  }

  function handleOnClickEMR() {
    setOpenEMR((event) => !event);
  }

  function handleClickOnInitials() {
    setOpenLogOut((prevState) => !prevState);
  }

  return (
    //className is a prop that is passed to the calendarNavBar
    <nav className={className}>
      <div className="logo-container-nav">
        <img
          src={`${baseUrl}/Signin_images/logo_resize.webp`}
          className="vertical-logo"
        />
      </div>
      <div onClick={handleClickOnInitials} className="signin-circle">
        <div className="user-logo">
          <FontAwesomeIcon icon={faUserDoctor} className="logo-img" />
          <span className="init-name">{initials}</span>
        </div>

        <div>
          {openLogOut && (
            <div onClick={handleSignOut} className="logout-window">
              <span className="initials">Logout</span>
            </div>
          )}
        </div>
      </div>
      <div className="services-nav-bar">
        <div className="registration">
          <div className="nav-bar-icon-register">
            <FontAwesomeIcon
              icon={faAddressCard}
              style={{ color: "#264580" }}
              className="icons"
            />
          </div>

          <Link to="register-patient" className="registration-div">
            Register
          </Link>
        </div>

        <div className="calendar">
          <div className="nav-bar-icon-calendar">
            <FontAwesomeIcon
              icon={faCalendar}
              className="icons"
              style={{ color: "#264580" }}
              to=""
            />
          </div>
          <Link to="" className="calendar-div">
            Calendar
          </Link>
        </div>

        {userRole === "doctor" && (
          <div className="emr-mobile-screen">
            <div>
              <div className="medical-note">
                <div onClick={handleOnClickEMR} className="nav-bar-icon-emr">
                  <FontAwesomeIcon
                    icon={faNotesMedical}
                    className="icons"
                    style={{ color: "#264580" }}
                  />
                </div>
                <Button onClick={handleOnClickEMR} className="emr-btn">
                  EMR
                </Button>
              </div>

              {openEMR && (
                <div className="emr-mob-screen">
                  <div className="examination">
                    <div className="nav-bar-icon-exam">
                      <FontAwesomeIcon
                        icon={faHexagonPlus}
                        className="icons"
                        style={{ color: "#c7f4fc" }}
                      />
                    </div>
                    <Link to="emr" className="examination-div">
                      Examination
                    </Link>
                  </div>

                  <div className="past-history">
                    <div className="medical-history">
                      <FontAwesomeIcon
                        icon={faRectangleHistory}
                        className="icons"
                        style={{ color: "#c7f4fc" }}
                      />
                    </div>
                    <Link to="emr/past-history" className="past-med-history">
                      Past History
                    </Link>
                  </div>
                  <div className="treatment-plan">
                    <div className="treating-plan">
                      <FontAwesomeIcon
                        icon={faScrollOld}
                        className="icons"
                        style={{ color: "#c7f4fc" }}
                      />
                    </div>
                    <Link to="emr/treatment-plan" className="treat-plan-link">
                      Treatment Plan
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="medical-reports">
              <div className="nav-bar-icon-rep">
                <FontAwesomeIcon
                  icon={faFile}
                  className="icons"
                  style={{ color: "#264580" }}
                />
              </div>
              <Link to="reports" className="med-report-div">
                Reports
              </Link>
            </div>
          </div>
        )}
        <div className="billing-mobile">
          <div className="billing">
            <div className="nav-bar-icon-billing">
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                className="icons"
                style={{ color: "#264580" }}
              />
            </div>

            <Button onClick={handleClickOnBilling} className="billing-btn">
              Billing
            </Button>
          </div>

          {openBilling && (
            <div className="billing-mobile-screen">
              <div className="emr-bill">
                <div className="nav-bar-bill">
                  <FontAwesomeIcon
                    icon={faFileInvoiceDollar}
                    className="icons"
                    style={{ color: "#c7f4fc" }}
                  />
                </div>
                <Link
                  onClick={handleClearSelectedPatients}
                  to="bill"
                  className="nav-bill-div"
                >
                  Current Patients
                </Link>
              </div>
              <div className="emr-old-bill">
                <div className="nav-bar-old-bill">
                  <FontAwesomeIcon
                    icon={faScrollOld}
                    className="icons"
                    style={{ color: "#c7f4fc" }}
                  />
                </div>
                <Link to="bill/old-bill" className="nav-old-bill">
                  Unpaid Bill
                </Link>
              </div>
              <div className="pending-balances">
                <div className="nav-bar-pending-bills">
                  <FontAwesomeIcon
                    icon={faMoneyCheckPen}
                    className="icons"
                    style={{ color: "#c7f4fc" }}
                  />
                </div>
                <Link to="bill/old-bills" className="nav-old-report">
                  Old Balances
                </Link>
              </div>
            </div>
          )}
        </div>

        {(userRole === "doctor" || userRole === "admin") && (
          <div className="finance-mobile-screen">
            <div className="admin-mobile">
              <div className="settings">
                <div className="nav-bar-icon-set">
                  <FontAwesomeIcon
                    icon={faGearComplex}
                    className="icons"
                    style={{ color: "#264580" }}
                  />
                </div>
                <Button onClick={handleOpenAdmin} className="settings-div">
                  Admin
                </Button>
              </div>
              {openAdmin && (
                <div>
                  <div className="facebook-login">
                    <div className="nav-bar-facebook">
                      <FontAwesomeIcon
                        className="facebook-icon"
                        icon={faSquareFacebook}
                      />
                    </div>
                    <Link
                      to="mainadmin/facebook"
                      className="facebook-btn facebookFont"
                    >
                      Embedded Signup
                    </Link>
                  </div>
                  <div className="facebook-login">
                    <div className="nav-bar-facebook">
                      <FontAwesomeIcon
                        className="whatsapp-icon"
                        icon={faWhatsapp}
                      />
                    </div>
                    <Link
                      to="mainadmin/whatsapp"
                      className="facebook-btn whatsAppFont"
                    >
                      WhatsApp
                    </Link>
                  </div>
                  <div className="adding-user">
                    <div className="nav-bar-add-user">
                      <FontAwesomeIcon
                        className="icons"
                        style={{ color: "#c7f4fc" }}
                        icon={faPen}
                      />
                    </div>
                    <Link
                      to="mainadmin/update-reg"
                      className="update-registration"
                    >
                      Upd Reg & Photo
                    </Link>
                  </div>
                  <div className="add-reminders">
                    <div className="nav-bar-add-reminder">
                      <FontAwesomeIcon
                        className="icons"
                        style={{ color: "#c7f4fc" }}
                        icon={faBell}
                      />
                    </div>
                    <Link to="mainadmin/reminders" className="reminders-link">
                      Reminders
                    </Link>
                  </div>

                  <div className="adding-user">
                    <div className="nav-bar-add-user">
                      <FontAwesomeIcon
                        className="icons"
                        style={{ color: "#c7f4fc" }}
                        icon={faUser}
                      />
                    </div>
                    <Link to="mainadmin/add-user" className="admin-add-user">
                      Add User
                    </Link>
                  </div>
                  <div className="activate-user">
                    <div className="nav-bar-act-user">
                      <FontAwesomeIcon
                        className="icons"
                        style={{ color: "#c7f4fc" }}
                        icon={faPersonArrowDownToLine}
                      />
                    </div>
                    <Link to="mainadmin/act-deact" className="activ-user">
                      Change Status
                    </Link>
                  </div>

                  <div className="add-prices">
                    <div className="nav-bar-add-price">
                      <FontAwesomeIcon
                        className="icons"
                        style={{ color: "#c7f4fc" }}
                        icon={faCircleDollar}
                      />
                    </div>
                    <Link to="mainadmin/price-list" className="add-pric">
                      Add Prices
                    </Link>
                  </div>

                  <div className="add-roles">
                    <div className="nav-bar-add-roles">
                      <FontAwesomeIcon
                        className="icons"
                        style={{ color: "#c7f4fc" }}
                        icon={faUniversalAccess}
                      />
                    </div>
                    <Link
                      to="mainadmin/access-roles"
                      className="add-clinic-roles"
                    >
                      Access Roles
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="signout-calendar">
          <div className="nav-bar-icon-signout">
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="icons"
              style={{ color: "white" }}
              onClick={handleSignOut}
            />
          </div>
          <Button onClick={handleSignOut} className="signout-btn">
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default VerticalNavBar;
