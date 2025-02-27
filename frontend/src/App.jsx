import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/Error.jsx";
import RegisterPatientPage from "./pages/Register-Patient.jsx";
import Reports from "./pages/Reports.jsx";
import BillDetails from "./pages/BillDetails.jsx";
import StockPage from "./pages/Stock.jsx";
import UpdateRegistration from "./pages/UpdateRegistration.jsx";
import Reminders from "./pages/Reminders.jsx";
import WhatsAppSignup from "./pages/WhatsAppSignup.jsx";
import PassRequestToken from "./pages/PassRequestToken.jsx";
import PassChangeRouterPage from "./pages/PassChangeRouter.jsx";
import Calendar from "./components/Calendar.jsx";
import ModalContextProvider from "./components/ModalContext.jsx";
import AdminActDeactPage from "./pages/AdminActDeact.jsx";
import AddUserPage from "./pages/AddUserPage.jsx";
import BookingModalContextProvider from "./components/BookingModalContext.jsx";
import RouteEMRNavBar from "./pages/RouteEMRNavBar.jsx";
import SearchInputContextProvider from "./components/SearchInputContext.jsx";
import PastMedicalHistory from "./pages/PastMedicalHistory.jsx";
import SigninForm from "./components/Signin-form.jsx";
import CalendarNavBar from "./pages/CalendarNavBar.jsx";
import BillsPending from "./pages/BillsPending.jsx";
import BillingNavBar from "./pages/BillingNavBar.jsx";
import BillContextProvider from "./pages/BillContext.jsx";
import BillOldOutstandingBalance from "./pages/BillOldOutstandingBalance.jsx";
import PassFinalChange from "./pages/PassFinalChange.jsx";
import AdminPriceList from "./pages/AdminPriceList.jsx";
import SystemAdminRoutePage from "./pages/SystemAdminRoute.jsx";
import AdminAccessRoles from "./pages/AdminAccessRoles.jsx";
import { checkTokenAvailability } from "../utils/event-utils.js";
import AdminSystemActDeact from "./pages/AdminSystemActDeact.jsx";
import AdminSystemPriceList from "./pages/AdminSystemPriceList.jsx";
import AddProcedures from "./pages/AdminSystemProcedures.jsx";
import AdminSystemProcedures from "./pages/AdminSystemProcedures.jsx";
import AdminRoutePage from "./pages/AdminRoutePage.jsx";
import AdminAddUser from "./pages/AdminAddUser.jsx";
import AddSystemAdmin from "./pages/AddSystemAdmin.jsx";
import AdminAddSubUsers from "./pages/AdminAddSubUsers.jsx";
import SystemAdminAccess from "./pages/SystemAdminAccess.jsx";
import ClinicAdminRoles from "./pages/ClinicAdminRoles.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import BillOldBills from "./pages/BillOldBills.jsx";
import TreatmentPlan from "./pages/TreatmentPlan.jsx";
import OldBillsParent from "./pages/OldBillsParent.jsx";
import ProceduresChart from "./pages/ProceduresChart.jsx";
import DiagnosisChart from "./pages/DiagnosisChart.jsx";
import ExaminationNavBar from "./pages/ExaminationNavBar.jsx";
import DiagnosisContextProvider from "./components/DiagnosisContext.jsx";
import Whatsapp from "./pages/Whatsapp.jsx";
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      errorElement: <ErrorPage />,
      children: [
        {
          path: "",
          element: <SigninForm />,
        },

        {
          path: "calendar",
          element: <CalendarNavBar />,
          children: [
            {
              path: "",
              element: (
                <BookingModalContextProvider>
                  <Calendar />
                </BookingModalContextProvider>
              ),
              // loader: checkTokenAvailability
            },
            {
              path: "emr",
              element: <RouteEMRNavBar />,
              children: [
                {
                  path: "",
                  element: <ExaminationNavBar />,
                  children: [
                    {
                      path: "",
                      element: (
                        <DiagnosisContextProvider>
                          <ProceduresChart />
                        </DiagnosisContextProvider>
                      ),
                    },
                    {
                      path: "diagnosis",
                      element: (
                        <DiagnosisContextProvider>
                          <DiagnosisChart />
                        </DiagnosisContextProvider>
                      ),
                    },
                  ],
                },
                {
                  path: "past-history",
                  element: <PastMedicalHistory />,
                },
                {
                  path: "treatment-plan",
                  element: <TreatmentPlan />,
                },
              ],
            },
            {
              path: "register-patient",
              element: <RegisterPatientPage />,
            },
            {
              path: "reports",
              element: <Reports />,
            },
            {
              path: "bill",
              element: <BillingNavBar />,
              children: [
                {
                  path: "",
                  element: (
                    <BillContextProvider>
                      <BillsPending />
                    </BillContextProvider>
                  ),
                },
                {
                  path: "bill-details/:pId",
                  element: (
                    <BillContextProvider>
                      <BillDetails />
                    </BillContextProvider>
                  ),
                },
                {
                  path: "old-bill",
                  element: <BillOldOutstandingBalance />,
                },
                {
                  path: "old-bills",
                  element: <OldBillsParent />,
                },
              ],
            },
            {
              path: "stock",
              element: <StockPage />,
            },

            {
              path: "mainadmin",
              element: <AdminRoutePage />,
              children: [
                {
                  path: "facebook",
                  element: <WhatsAppSignup />,
                },
                {
                  path: "whatsapp",
                  element: <Whatsapp />,
                },
                {
                  path: "update-reg",
                  element: <UpdateRegistration />,
                },
                {
                  path: "reminders",
                  element: <Reminders />,
                },
                {
                  path: "add-user",
                  element: <AddUserPage />,
                },
                {
                  path: "act-deact",
                  element: <AdminActDeactPage />,
                },
                {
                  path: "price-list",
                  element: <AdminPriceList />,
                },
                {
                  path: "access-roles",
                  element: <ClinicAdminRoles />,
                },
              ],
            },
          ],
        },
        {
          path: "systemadmin",
          element: <SystemAdminRoutePage />,
          children: [
            {
              path: "system-admin",
              element: <AddSystemAdmin />,
            },
            {
              path: "system_admin-access",
              element: <SystemAdminAccess />,
            },

            {
              path: "procedures",
              element: <AdminSystemProcedures />,
            },

            {
              path: "add-users",
              element: <AdminAddUser />,
            },
            {
              path: "add-sub-users",
              element: <AdminAddSubUsers />,
            },
            {
              path: "change-status",
              element: <AdminSystemActDeact />,
            },
            {
              path: "set-prices",
              element: <AdminSystemPriceList />,
            },
            {
              path: "roles",
              element: <AdminAccessRoles />,
            },

            {
              path: "reset-password",
              element: <ResetPassword />,
            },
          ],
        },

        {
          path: "pass-token",
          element: <PassChangeRouterPage />,
          children: [
            {
              path: "",
              element: <PassRequestToken />,
            },
            {
              path: "change-password",
              element: <PassFinalChange />,
            },
          ],
        },
      ],
    },
  ]);

  return (
    <ModalContextProvider>
      <SearchInputContextProvider>
        <RouterProvider router={router} />
      </SearchInputContextProvider>
    </ModalContextProvider>
  );
}

export default App;
