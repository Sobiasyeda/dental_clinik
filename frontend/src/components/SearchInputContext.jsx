import { useState } from "react";
import { createContext, useContext } from "react";
import { ModalContext } from "./ModalContext.jsx";
import { fetchData } from "../../hooks/fetchData.js";

export const SearchInputContext = createContext({
  receivedInfo: [],
  setReceivedInfo: () => {},
  validation: "",
  setValidation: () => {},
  eventSearch: "",
  setEventSearch: () => {},
  selectedNames: [],
  setSelectedNames: () => {},
  handleOnChangeSearch: () => {},
  handleOnSubmitSearch: () => {},
  handleOnClickName: () => {},
  handleOnClickView: () => {},
  viewDocs: [],
  message: false,
});

export default function SearchInputContextProvider({ children }) {
  const [receivedInfo, setReceivedInfo] = useState([]);
  const [validation, setValidation] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [selectedNames, setSelectedNames] = useState([]);
  const [viewDocs, setViewDocs] = useState([]);
  const [message, setMessage] = useState(false);
  const {
    handleOpenSearchPatientModal,
    handleCloseSearchPatientModal,
    handleOpenDocumentViewModal,
  } = useContext(ModalContext);

  function handleOnChangeSearch(event) {
    setEventSearch(event.target.value);
  }

  async function handleOnSubmitSearch(event) {
    event.preventDefault();
    setReceivedInfo([]);
    setEventSearch("");
    setValidation("");
    setSelectedNames([]);

    const data = new FormData(event.target);
    const formData = Object.fromEntries(data.entries());

    const resdata = await fetchData("/search-patient", "POST", formData);
    if (Array.isArray(resdata)) {
      handleOpenSearchPatientModal();
      setReceivedInfo(resdata);
    } else {
      setMessage(true);
      setValidation(resdata.message);
      setTimeout(() => {
        setMessage(false);
      }, 3000);
    }
  }

  function handleOnClickName(item) {
    handleCloseSearchPatientModal();
    setSelectedNames(() => [
      {
        name: item.name,
        father: item.father,
        family: item.family,
        dob: item.dob,
        id: item.id,
        allergy: item.allergy,
        procedures: item.procedures,
        email: item.email,
        phone: item.phone,
        photo: item.photo,
      },
    ]);
  }

  const handleOnClickView = async (item) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const token = sessionStorage.getItem("token");
    handleOpenDocumentViewModal();
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ patient_id: item }),
    };
    try {
      const response = await fetch(`${baseUrl}/view_docs`, config);
      const resdata = await response.json();
      setViewDocs(resdata);
    } catch (error) {
      console.log(error);
    }
  };

  const searchInputCtx = {
    receivedInfo,
    setReceivedInfo,
    validation,
    setValidation,
    eventSearch,
    setEventSearch,
    selectedNames,
    setSelectedNames,
    handleOnChangeSearch,
    handleOnSubmitSearch,
    handleOnClickName,
    handleOnClickView,
    viewDocs,
    message,
  };
  return (
    <SearchInputContext.Provider value={searchInputCtx}>
      {children}
    </SearchInputContext.Provider>
  );
}
