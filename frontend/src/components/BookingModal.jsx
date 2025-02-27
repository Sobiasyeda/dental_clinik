import { useContext, useEffect, useState } from "react";
import { ModalContext } from "./ModalContext.jsx";
import { Link } from "react-router-dom";
import Input from "../UI/Input.jsx";
import Button from "../UI/Button.jsx";
import Label from "../UI/Label.jsx";
import { BookingModalContext } from "./BookingModalContext.jsx";
import Modal from "./Modal.jsx";

export default function BookingModal({
  submitForm,
  handleOnChangeSchedule,
  data,
  deleteEvent,
  isDeleteButtonVisible,
  revertToOldEventWhenResizeOrDrag,
  isCLoseButtonClickedWithResizeDrag,
}) {
  const [isPatientNameVisible, setIsPatientNameVisible] = useState(false);
  const modalCtx = useContext(ModalContext);

  const {
    handleOnSubmitSearch,
    handleOnChangeSearch,
    search,
    setStoredItems,
    storedItems,
    handleOnClickFoundPatient,
    handleOnChange,
    inputValues,
    validationSearch,
    handleBookingStatus,
    bookingStatus,
  } = useContext(BookingModalContext);

  function handleFoundPatient(item) {
    handleOnClickFoundPatient(item);
    setIsPatientNameVisible(false);
  }

  useEffect(() => {
    if (storedItems.length > 0) {
      setIsPatientNameVisible(true);
    }
  }, [storedItems]);

  function handleCloseNameSearch() {
    setStoredItems([]);
    setIsPatientNameVisible(false);
  }

  function handleCloseBookingModalForResizeDrag() {
    setIsPatientNameVisible(false);
    setStoredItems([]);
    modalCtx.handleCloseBookModal();
    revertToOldEventWhenResizeOrDrag();
  }

  function handleCloseBookingModal() {
    setIsPatientNameVisible(false);
    setStoredItems([]);
    modalCtx.handleCloseBookModal();
  }

  return (
    <Modal
      open={modalCtx.bookingModal}
      cancel=".interactive"
      // className="bookingModal"
    >
      <div className="previous-balance">
        <div className="outstanding-message">
          {inputValues.balance > 0 &&
            `Patient has Outstanding balance of $ ${inputValues.balance}`}
        </div>
      </div>
      <div>
        {validationSearch && (
          <div className="validation-error">{validationSearch}</div>
        )}
      </div>
      <div className="modal-section1">
        <div>
          {/*adding interactive will remove normal behavior of a modal which is
            draggable and allow interactivity*/}
          <Link
            onClick={handleCloseBookingModal}
            className="interactive new-patient-link"
            to="register-patient"
          >
            + New Patient
          </Link>
        </div>

        <form method="POST" onSubmit={handleOnSubmitSearch}>
          <div className="search-input">
            <Input
              name="search"
              className="interactive modal-search"
              onChange={handleOnChangeSearch}
              value={search}
              autocomplete="off"
              required
            />

            <Button className="interactive btn-search margin-left">
              Search
            </Button>
          </div>
        </form>
      </div>

      {isPatientNameVisible && (
        <div className="search-div">
          <ul className="unord-list">
            {storedItems.map((item) => (
              <li className="align-btn" key={item.id}>
                <Button
                  onClick={() => handleFoundPatient(item)}
                  className="interactive search-btn"
                >
                  <span className="search-dob">
                    {item.name} {item.father} {item.family}({item.dob})
                  </span>
                </Button>
              </li>
            ))}
          </ul>
          <Button className="btn-patient" onClick={handleCloseNameSearch}>
            Cancel
          </Button>
        </div>
      )}

      <form method="POST" onSubmit={submitForm}>
        <div className="modal-section2-0">
          <Input
            hidden={true}
            name="phone"
            id="phone"
            value={inputValues.phone || ""}
            readonly={true}
          />

          <div className="modal-name">
            <Label className="modal-label-font" label="First Name" />
            <Input
              value={inputValues.name || ""}
              name="name"
              id="name"
              readonly={true}
              required
              className="modal-input-booking"
            />
          </div>
          <div className="modal-family">
            <Label className="modal-label-font" label="Family Name" />
            <Input
              value={inputValues.family}
              name="family"
              id="family"
              readonly={true}
              required={true}
              className="modal-input-booking"
            />
          </div>
        </div>
        <div className="modal-section2-1">
          <div className="modal-dob">
            <Label className="modal-label-font" label="Date of Birth" />
            <Input
              name="dob"
              id="dob"
              type="date"
              readonly={true}
              required={true}
              className="interactive modal-input-booking"
              value={inputValues.dob || ""}
            />
          </div>

          <div>
            <Input
              hidden={true}
              name="eventId"
              id="eventId"
              readonly={true}
              value={data.eventId || ""}
            />
          </div>
          <div className="modal-visit">
            <Label className="modal-label-font" label="Visit Date" />
            <Input
              name="date"
              id="date"
              type="date"
              required={true}
              className="interactive modal-input-booking"
              onChange={handleOnChangeSchedule}
              value={data.date || ""}
            />
          </div>
        </div>
        <div className="modalHalfDown">
          <div className="modal-section2-2">
            <div className="modal-start">
              <Label className="modal-label-half" label="Start Time" />
              <Input
                name="start"
                id="start"
                type="time"
                required={true}
                className="interactive modal-input-booking"
                onChange={handleOnChangeSchedule}
                value={data.start || ""}
              />
            </div>
            <div className="modal-end">
              <Label className="modal-label-half" label="End Time" />
              <Input
                name="end"
                id="end"
                className="interactive modal-input-booking"
                type="time"
                required={true}
                onChange={handleOnChangeSchedule}
                value={data.end || ""}
              />
            </div>
          </div>

          <div className="modal-section2-3">
            <div className="modal-procedure">
              <Label className="modal-label-half" label="Procedure" />
              <Input
                className="interactive modal-input-booking"
                name="proc"
                onChange={handleOnChange}
                value={inputValues.proc || ""}
                autocomplete="off"
                maxLength={20}
              />
            </div>

            <div className="modal-doctor">
              <Label className="modal-label-half" label="Doctor" />
              <Input
                name="doctor"
                id="doctor"
                readonly={true}
                value={data.doctor_name || ""}
                className="booking-modal-doctor"
              />
            </div>
          </div>

          {/*this is the doctor id*/}
          <Input
            type="hidden"
            id="resourceId"
            name="resourceId"
            value={data.resourceId || ""}
            readonly={true}
          />

          <div className="modal-section2-4">
            <div>
              <Label
                className="booking-font"
                label="Appointment Reminder"
                htmlFor="booking-reminder"
              />
            </div>
            <div>
              <Input
                name="booking-reminder"
                id="booking-reminder"
                type="checkbox"
                checked={bookingStatus}
                onChange={handleBookingStatus}
                className="interactive booking-check"
                value={bookingStatus}
              />
            </div>
          </div>

          <div className="booking-modal-btns">
            <div>
              {isDeleteButtonVisible && (
                <Button
                  type="button"
                  className="interactive booking-modal-btn-delete"
                  onClick={deleteEvent}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="booking-modal-buttons1">
              <div>
                <Button
                  type="button"
                  onClick={
                    isCLoseButtonClickedWithResizeDrag
                      ? handleCloseBookingModalForResizeDrag
                      : handleCloseBookingModal
                  }
                  className="interactive booking-modal-btn-close"
                >
                  Close
                </Button>
              </div>
              <div>
                <Button
                  type="submit"
                  className="interactive booking-modal-btn-save"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
