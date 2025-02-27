import Input from "../UI/Input.jsx";
import DocumentsViewModal from "../components/DocumentsViewModal.jsx";
import Button from "../UI/Button.jsx";
import PatientSearchModal from "../components/PatientSearchModal.jsx";
import { useContext, useRef, useState } from "react";
import { SearchInputContext } from "../components/SearchInputContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandDots } from "@fortawesome/pro-light-svg-icons";
import Label from "../UI/Label.jsx";
import {
  faCloudArrowUp,
  faCameraViewfinder,
  faUser,
} from "@fortawesome/pro-solid-svg-icons";

const SearchInput = () => {
  const {
    handleOnSubmitSearch,
    selectedNames,
    validation,
    handleOnChangeSearch,
    eventSearch,
    receivedInfo,
    handleOnClickName,
    handleOnClickView,
    viewDocs,
    message,
  } = useContext(SearchInputContext);
  console.log("view docs", viewDocs);
  const fileInputRef = useRef(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event, patientId) => {
    const file = event.target.files[0];
    if (file) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = sessionStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", patientId);
      const config = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      };
      try {
        const response = await fetch(`${baseUrl}/upload_documents`, config);
        const resdata = await response.json();
        setUploadMessage(resdata.message);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
        }, 2000);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="hide-print">
      <DocumentsViewModal viewDocs={viewDocs} className="document-modal" />
      <div className="upload-message">{showMessage && uploadMessage}</div>
      <form method="POST" onSubmit={handleOnSubmitSearch}>
        <div className="search-nav-bar">
          {message && <div className="validation-emr">{validation}</div>}
          <div>
            {selectedNames.length > 0 && (
              <div className="search-icons">
                <div className="pt-icon">
                  <div>
                    {selectedNames[0]?.photo ? (
                      <img
                        src={selectedNames[0].photo}
                        className="patient-face"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="user-face" />
                    )}
                  </div>
                  <div className="name-dob">
                    <Input
                      value={`${selectedNames[0]?.name} ${selectedNames[0]?.father} ${selectedNames[0]?.family} `}
                      readonly={true}
                      className="patient-info"
                      name="patient-info"
                    />

                    <Input
                      value={`${selectedNames[0]?.dob}`}
                      className="dob-emr"
                      readonly={true}
                      name="dob"
                    />
                    {selectedNames[0]?.allergy ? (
                      <div className="allergy-exam">
                        <div>
                          <FontAwesomeIcon
                            className="allerg-icon"
                            icon={faHandDots}
                          />
                        </div>
                        <div>
                          <Input
                            value={selectedNames[0]?.allergy}
                            readonly={true}
                            name="allergy"
                            className="allergy"
                          />
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="vertical-line" />
                <div className="upload-icon">
                  <div className="up-icon" onClick={handleFileUploadClick}>
                    <FontAwesomeIcon
                      className="upload-doc"
                      icon={faCloudArrowUp}
                    />
                    <Input
                      value="Upload Docs"
                      readonly={true}
                      className="up-name"
                      id="up-docs"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) =>
                        handleFileChange(e, selectedNames[0]?.id)
                      }
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="viewing-docs">
                    <div>
                      <FontAwesomeIcon
                        className="view-icon"
                        icon={faCameraViewfinder}
                      />
                    </div>
                    <Button
                      onClick={() => handleOnClickView(selectedNames[0]?.id)}
                      className="view-docs"
                      type="button"
                    >
                      View Docs
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="emr-dental">
            <Input
              onChange={handleOnChangeSearch}
              value={eventSearch}
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
  );
};

export default SearchInput;
