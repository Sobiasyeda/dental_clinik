import RegisterPatientPage from "./Register-Patient.jsx";
import Input from "../UI/Input.jsx";
import Button from "../UI/Button.jsx";
import PatientSearchModal from "../components/PatientSearchModal.jsx";
import { useContext, useState } from "react";
import { fetchData } from "../../hooks/fetchData.js";
import { ModalContext } from "../components/ModalContext.jsx";
import { faHandDots } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const EDIT = "edit";
const UPDATE_REGISTRATION = import.meta.env.VITE_UPDATE_REGISTRATION;
const UpdateRegistration = () => {
  const [receivedInfo, setReceivedInfo] = useState([]);
  console.log("received info",receivedInfo)
  const [validation, setValidation] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedNames, setSelectedNames] = useState([]);
  const [eventSearch, setEventSearch] = useState("");
  const upload_photo = import.meta.env.VITE_UPLOAD_PHOTO;

  const {
    handleOpenSearchPatientModal,
    handleCloseSearchPatientModal,
    handleClearInputValues,
  } = useContext(ModalContext);

  function handleOnChangeSearch(event) {
    setEventSearch(event.target.value);
  }
  function handleOnClickName(item) {
    handleCloseSearchPatientModal();
    setSelectedNames(() => [
      {
        name: item.name,
        father: item.father,
        dob: item.dob,
        family: item.family,
        id: item.id,
        allergy: item.allergy,
        procedures: item.procedures,
        email: item.email,
        phone: item.phone,
      },
    ]);
  }

  async function handleOnSubmitSearch(event) {
    event.preventDefault();
    setSelectedNames([
      {
        name: "",
        father: "",
        dob: "",
        family: "",
        id: "",
        allergy: "",
        procedures: "",
        email: "",
        phone: "",
      },
    ]);

    setEventSearch("");
    const form = new FormData(event.target);
    const formData = Object.fromEntries(form.entries());
    try {
      const resdata = await fetchData("/search-patient", "POST", formData);
      if (Array.isArray(resdata)) {
        handleOpenSearchPatientModal();
        setReceivedInfo(resdata);
      } else {
        setValidation(true);
        setMessage(resdata.message);
        setTimeout(() => {
          setValidation(false);
        }, 2000);
      }
      handleClearInputValues();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="updateReg-container">
      <div className="hide-print">
        <form method="POST" onSubmit={handleOnSubmitSearch}>
          <div className="update-nav-bar">
            {validation && <div className="validation-emr">{message}</div>}
            <div>
              {selectedNames.length > 0 && (
                <div className="search-result">
                  <div className="patientInfo">
                    <div>
                      <Input
                        value={`${selectedNames[0]?.name} ${selectedNames[0]?.father} ${selectedNames[0]?.family}`}
                        readonly={true}
                        className="patient-info"
                        name="patient-info"
                      />
                    </div>
                    <div>
                      <Input
                        value={selectedNames[0]?.dob}
                        className="dobUpdate"
                        readonly={true}
                        name="dob"
                      />
                    </div>
                  </div>
                  {selectedNames[0]?.allergy && (
                    <div>
                      <FontAwesomeIcon
                        className="allerg-icon"
                        icon={faHandDots}
                      />
                      <Input
                        value={selectedNames[0]?.allergy}
                        readonly={true}
                        name="allergy"
                        className="allergy"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="emr-dental">
              <Input
                onChange={handleOnChangeSearch}
                value={eventSearch}
                placeholder="Search"
                autocomplete="off"
                name="search"
                className="emr-search-input"
                required={true}
              />
              <Button className="emr-search-btn">Search</Button>
            </div>
          </div>
        </form>
        <PatientSearchModal
          receivedInfo={receivedInfo}
          handleOnClickName={handleOnClickName}
          validation={validation}
        />
      </div>
      <RegisterPatientPage
        selectedNames={selectedNames}
        edit={EDIT}
        setSelectedNames={setSelectedNames}
        upload_photo={upload_photo}
        update_registration={UPDATE_REGISTRATION}
      />
    </div>
  );
};

export default UpdateRegistration;
