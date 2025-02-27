import React from "react";
import Modal from "./Modal.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-light-svg-icons";

const SuccessModal = ({ message, className, setSuccessfulSubmission }) => {
  function handleOnClickCloseModal() {
    setSuccessfulSubmission();
  }

  return (
    <Modal className={className} open={message === "200"}>
      <div className="success-div1">
        <span className="success-btn" onClick={handleOnClickCloseModal}>
          <FontAwesomeIcon icon={faXmark} size="sm" />
        </span>

        <div className="success-div">Successfully Submitted !</div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
