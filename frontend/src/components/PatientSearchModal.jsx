import { useContext } from "react";
import Modal from "./Modal.jsx";
import Button from "../UI/Button.jsx";
import { ModalContext } from "./ModalContext.jsx";

export default function PatientSearchModal({
  receivedInfo,
  handleOnClickName,
}) {
  const modalCtx = useContext(ModalContext);

  return (
    <div>
      {receivedInfo.length >= 1 && (
        <Modal
          open={modalCtx.patientSearchModal}
          className={`search-patients ${modalCtx.patientSearchModal ? "open" : "close"}`}
        >
          <div className="exam-div">
            {receivedInfo.map((item) => (
              <li className="emr-search" key={item.id}>
                <Button
                  className="searchNames"
                  onClick={() => handleOnClickName(item)}
                >
                  {item.name} {item.father} {item.family} ({item.dob})
                </Button>
              </li>
            ))}
          </div>
          <div className="close-button">
            <Button
              className="button-color"
              onClick={modalCtx.handleCloseSearchPatientModal}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
