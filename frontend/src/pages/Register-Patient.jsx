import { useEffect, useState, useRef, useContext } from "react";
import options from "./FlagOptions.jsx";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
import { fetchData } from "../../hooks/fetchData.js";
import Button from "../UI/Button.jsx";
import Select from "react-select";
import Label from "../UI/Label.jsx";
import Input from "../UI/Input.jsx";
import OptionPage from "../UI/Option.jsx";
import SelectPage from "../UI/Select.jsx";
import { ModalContext } from "../components/ModalContext.jsx";

const REGISTRATION = import.meta.env.VITE_REGISTER_PATIENT;

const RegisterPatientPage = ({
  selectedNames,
  edit,
  setSelectedNames,
  upload_photo,
  update_registration,
}) => {
  const [validationMessage, setValidationMessage] = useState("");
  const [messageTimer, setMessageTimer] = useState(false);
  const [message, setMessage] = useState(false);
  const [messageContent, setMessageContent] = useState();
  const [updateValues, setUpdateValues] = useState({
    name: "",
    family: "",
    father: "",
    dob: "",
    phoneCode: "",
    phone: "",
    gender: "",
    email: "",
    allergy: "",
  });
  const { handleClearInputValues, setInputValues, inputValues } =
    useContext(ModalContext);
  // useAuthorization(REGISTRATION);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedNames && selectedNames.length > 0) {
      const formattedPhone = selectedNames[0]?.phone
        ? selectedNames[0].phone.slice(4)
        : "";
      setUpdateValues((prevValues) => ({
        ...prevValues,
        name: selectedNames[0]?.name || "",
        family: selectedNames[0]?.family || "",
        father: selectedNames[0]?.father || "",
        email: selectedNames[0]?.email || "",
        phone: formattedPhone,
        allergy: selectedNames[0]?.allergy || "",
      }));
    }
  }, [selectedNames, setUpdateValues]);

  function handleOnChangeInput(event) {
    const { name, value } = event.target;
    setInputValues((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  }
  function handleUpdateRegistration(event) {
    const { name, value } = event.target;
    setUpdateValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function handleSelectChange(selectedOption) {
    setInputValues((prevInput) => ({
      ...prevInput,
      code: selectedOption,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const resdata = await fetchData("/register-patient", "POST", data);
      setMessageTimer(true);
      setValidationMessage(resdata.message);
      setTimeout(() => {
        setMessageTimer(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
    // if we are in the update registration page, clear the input fields else clear the fields of the registration page
    update_registration
      ? setUpdateValues({
          name: "",
          family: "",
          father: "",
          dob: "",
          phoneCode: "",
          phone: "",
          gender: "",
          email: "",
          allergy: "",
        })
      : handleClearInputValues();
    // there is no selected names in registration form so it is giving error when clearing it unless i add the following
    update_registration ? setSelectedNames([]) : "";
    event.target.reset();
  }

  const handleSelectPatientName = () => {
    if (!selectedNames.length) {
      alert("Select Patient Name!");
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = sessionStorage.getItem("token");
      const patientId = selectedNames[0]?.id;
      const formdata = new FormData();
      formdata.append("patientId", patientId);
      formdata.append("upload_photo", upload_photo);
      formdata.append("file", file);
      const config = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formdata,
      };

      try {
        const response = await fetch(`${baseUrl}/upload_documents`, config);
        const resdata = await response.json();
        setMessageContent(resdata.message);
        setMessage(true);
        setTimeout(() => {
          setMessage(false);
        }, 3000);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div
      className={
        update_registration
          ? "common-background update-background"
          : "common-background register-background"
      }
    >
      <div className={update_registration ? "reg-first-update" : "reg-first"}>
        <div
          className={
            update_registration
              ? "registration-main-update"
              : "registration-main"
          }
        >
          <form method="POST" onSubmit={handleSubmit} className="form-reg">
            <div className="register-title">Registration Form</div>

            {message && messageContent}
            <div className="register1">
              <div>
                <Label label="Name" className="name-lab" />
                <Input
                  autocapitalize="on"
                  autocomplete="off"
                  id="name"
                  name="name"
                  required={true}
                  onChange={
                    update_registration
                      ? handleUpdateRegistration
                      : handleOnChangeInput
                  }
                  value={
                    update_registration ? updateValues.name : inputValues.name
                  }
                  className="reg-name"
                />
              </div>
              <div>
                <Label label="Family" className="name-lab" />
                <Input
                  autocapitalize="on"
                  autocomplete="off"
                  id="family"
                  name="family"
                  required={true}
                  onChange={
                    update_registration
                      ? handleUpdateRegistration
                      : handleOnChangeInput
                  }
                  value={
                    update_registration
                      ? updateValues.family
                      : inputValues.family
                  }
                  className="reg-family"
                />
              </div>
            </div>

            <div className="register2">
              <div>
                <Label label="Father" className="name-lab" />
                <Input
                  autocomplete="off"
                  id="father"
                  name="father"
                  onChange={
                    update_registration
                      ? handleUpdateRegistration
                      : handleOnChangeInput
                  }
                  value={
                    update_registration
                      ? updateValues.father
                      : inputValues.father
                  }
                  className="reg-father"
                />
              </div>
              <div>
                <Label label="Date of Birth" className="name-lab" />
                <Input
                  autocomplete="off"
                  type="date"
                  id="dob"
                  required={true}
                  name="dob"
                  onChange={
                    update_registration
                      ? handleUpdateRegistration
                      : handleOnChangeInput
                  }
                  value={
                    update_registration ? updateValues.dob : inputValues.dob
                  }
                  className="reg-dob"
                />
              </div>
              <Input type="hidden" name="edit" value={edit ? "edit" : ""} />
            </div>

            <div className="register3">
              <div>
                <Label label="Phone" className="name-lab" />
                <div className="phone-pt">
                  <Select
                    options={options}
                    value={inputValues.code}
                    name="code"
                    required={true}
                    isSearchable={false}
                    styles={{
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: "transparent",
                        width: "50px",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }),

                      indicatorsContainer: (baseStyles) => ({
                        ...baseStyles,
                        padding: "0",
                        width: "0px",
                      }),
                      dropdownIndicator: (baseStyles) => ({
                        ...baseStyles,
                        padding: "0",
                        width: "7px",
                      }),
                    }}
                    onChange={handleSelectChange}
                    // isDisabled={true}
                  />
                  <Input
                    autocomplete="off"
                    id="phone"
                    name="phone"
                    required={true}
                    onChange={
                      update_registration
                        ? handleUpdateRegistration
                        : handleOnChangeInput
                    }
                    value={
                      update_registration
                        ? updateValues.phone
                        : inputValues.phone
                    }
                    className="phone-input"
                    type="number"
                  />
                </div>
              </div>

              <div>
                <Label label="Gender" className="name-lab" />
                <SelectPage
                  name="gender"
                  id="gender"
                  onChange={
                    update_registration
                      ? handleUpdateRegistration
                      : handleOnChangeInput
                  }
                  value={
                    update_registration
                      ? updateValues.gender
                      : inputValues.gender
                  }
                  className="gender-reg"
                >
                  <OptionPage value="" disabled={true}>
                    Select
                  </OptionPage>
                  <OptionPage value="male">Male</OptionPage>
                  <OptionPage value="female">Female</OptionPage>
                </SelectPage>
              </div>
            </div>

            <div className="register4">
              <div>
                <Label label="Email" className="name-lab" />
                <Input
                  type="email"
                  id="email"
                  name="email"
                  onChange={
                    update_registration
                      ? handleUpdateRegistration
                      : handleOnChangeInput
                  }
                  value={
                    update_registration ? updateValues.email : inputValues.email
                  }
                  autocomplete="off"
                  className="reg-email mobile-reg"
                />
              </div>
            </div>
            <div className="register5">
              <div>
                <Label label="Allergies" className="name-allergies" />
                <Input
                  id="allergy"
                  name="allergy"
                  onChange={
                    update_registration
                      ? handleUpdateRegistration
                      : handleOnChangeInput
                  }
                  value={
                    update_registration
                      ? updateValues.allergy
                      : inputValues.allergy
                  }
                  className="allergies"
                />
              </div>
            </div>

            <div className="reg-btns">
              <Button
                className="clear-reg-button"
                onClick={handleClearInputValues}
                type="button"
              >
                Clear
              </Button>
              <Button className="common-btn-shape custom-color1">Save</Button>
            </div>

            {messageTimer && (
              <div className="validationMessage">{validationMessage}</div>
            )}
          </form>
          {upload_photo && (
            <div className="upload-photo">
              <Button
                className="common-btn-shape custom-color2"
                onClick={handleSelectPatientName}
              >
                Upload Photo
              </Button>
              <input
                type="file"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {/*<Input type="hidden" name="patientId" value={patientId} />*/}
              {/*<Input type="hidden" name="upload_photo" value={upload_photo} />*/}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPatientPage;
