import { createContext, useState, useContext } from "react";
import options from "../pages/FlagOptions.jsx";
import { SearchInputContext } from "./SearchInputContext.jsx";

export const ModalContext = createContext({
  status: "",
  handleOpenBookModal: () => {},
  handleCloseBookModal: () => {},
  handleOpenSearchPatientModal: () => {},
  handleCloseSearchPatientModal: () => {},
  handleOpenDocumentViewModal: () => {},
  handleCloseDocumentViewModal: () => {},
  handleClearInputValues: () => {},
  handleOpenToothChartModal: () => {},
  handleCloseToothChartModal: () => {},
  setInputValues: (values) => {},
  documentViewModal: false,
  bookingModal: false,
  toothChartStatus: false,
  patientSearchModal: false,
  inputValues: {
    name: "",
    family: "",
    father: "",
    dob: "",
    gender: "",
    email: "",
    allergy: "",
    phone: "",
    code: "",
  },
});

export default function ModalContextProvider({ children }) {
  const [toothChartStatus, setToothChartStatus] = useState(false);
  const [bookingModal, setBookingModal] = useState(false);
  const [documentViewModal, setDocumentViewModal] = useState(false);
  const [patientSearchModal, setPatientSearchModal] = useState(false);
  const [inputValues, setInputValues] = useState({
    name: "",
    family: "",
    father: "",
    dob: "",
    gender: "",
    email: "",
    allergy: "",
    phone: "",
    code: options[0],
  });

  function handleClearInputValues() {
    setInputValues({
      name: "",
      family: "",
      father: "",
      dob: "",
      phoneCode: "",
      gender: "",
      allergy: "",
      phone: "",
      email: "",
    });
  }

  function handleOpenToothChartModal() {
    setToothChartStatus(true);
  }
  function handleCloseToothChartModal() {
    setToothChartStatus(false);
  }

  function handleOpenBookModal() {
    setBookingModal(true);
  }

  function handleCloseBookModal() {
    setBookingModal(false);
  }

  function handleOpenSearchPatientModal() {
    setPatientSearchModal(true);
  }

  function handleCloseSearchPatientModal() {
    setPatientSearchModal(false);
  }

  function handleOpenDocumentViewModal() {
    setDocumentViewModal(true);
  }

  function handleCloseDocumentViewModal() {
    setDocumentViewModal(false);
  }

  const modalCtx = {
    handleOpenBookModal,
    handleCloseBookModal,
    handleOpenSearchPatientModal,
    handleCloseSearchPatientModal,
    handleOpenDocumentViewModal,
    handleCloseDocumentViewModal,
    handleClearInputValues,
    setInputValues,
    inputValues,
    handleOpenToothChartModal,
    handleCloseToothChartModal,
    toothChartStatus,
    bookingModal,
    documentViewModal,
    patientSearchModal,
  };

  return (
    <ModalContext.Provider value={modalCtx}>{children}</ModalContext.Provider>
  );
}
