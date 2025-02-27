import { createContext, useEffect, useState } from "react";
import sendHttpRequest from "../../hooks/useHttp.js";

export const BookingModalContext = createContext({
  validationSearch: "",
  itemsSearch: [],
  sendRequestSearch: () => {},
  itemsForm: [],
  inputValues: {},
  setInputValues: () => {},
  handleBookingStatus: () => {},
  search: "",
  setSearch: () => {},
  storedItems: [],
  setStoredItems: () => {},
  handleOnChangeSearch: () => {},
  handleOnClickFoundPatient: () => {},
  handleOnChange: () => {},
  handleOnSubmitSearch: () => {},
  clearFormData: () => {},
  setValidation: () => {},
  bookingStatus: false,
  setBookingStatus: () => {},
});

export default function BookingModalContextProvider({ children }) {
  const token = sessionStorage.getItem("token");
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const {
    sendRequest: sendRequestSearch,
    validation: validationSearch,
    items: itemsSearch,
    setValidation,
  } = sendHttpRequest("/search-patient", config, []);

  const [bookingStatus, setBookingStatus] = useState(false);

  const [inputValues, setInputValues] = useState({
    name: "",
    family: "",
    phone: "",
    dob: "",
    balance: "",
    proc: "",
  });

  const [search, setSearch] = useState("");
  const [storedItems, setStoredItems] = useState([]);

  useEffect(() => {
    setStoredItems(itemsSearch);
  }, [itemsSearch]);

  function handleBookingStatus(event) {
    const { name, checked } = event.target;
    if (name === "booking-reminder") {
      setBookingStatus(checked);
    }
  }

  function handleOnChangeSearch(event) {
    setSearch(event.target.value);
  }

  function handleOnSubmitSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    let data = Object.fromEntries(formData.entries());
    sendRequestSearch(JSON.stringify(data));
    setSearch("");
  }

  function handleOnClickFoundPatient(item) {
    const pending_balance = item.procedures.filter(
      (balance) => balance.remaining_balance > 0,
    );
    const remaining_balance = pending_balance.reduce(
      (acc, value) => acc + parseFloat(value.remaining_balance),
      0,
    );

    const dateObject = new Date(item.dob);
    const year = dateObject.getFullYear();
    // Add 1 to month because JavaScript months are zero-based
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    setInputValues({
      name: item.name,
      family: item.family,
      phone: item.phone,
      dob: formattedDate,
      balance: remaining_balance,
    });
  }

  function handleOnChange(event) {
    const { name, value } = event.target;
    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }

  function clearFormData() {
    setInputValues({
      name: "",
      family: "",
      phone: "",
      dob: "",
      proc: "",
    });
    setValidation("");
  }

  const bookingCtx = {
    validationSearch,
    itemsSearch,
    sendRequestSearch,
    inputValues,
    setInputValues,
    search,
    setSearch,
    storedItems,
    setStoredItems,
    handleOnChangeSearch,
    handleOnClickFoundPatient,
    handleOnChange,
    handleOnSubmitSearch,
    clearFormData,
    setValidation,
    handleBookingStatus,
    bookingStatus,
    setBookingStatus,
  };
  return (
    <BookingModalContext.Provider value={bookingCtx}>
      {children}
    </BookingModalContext.Provider>
  );
}
