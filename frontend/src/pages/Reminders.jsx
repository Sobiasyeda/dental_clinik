import { useEffect, useState } from "react";
import { fetchData } from "../../hooks/fetchData.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash as faTrashLight,
  faTrashXmark,
} from "@fortawesome/pro-light-svg-icons";
import { createEventId } from "../../utils/event-utils.js";
import Input from "../UI/Input.jsx";
import Button from "../UI/Button.jsx";
import { faBell } from "@fortawesome/pro-duotone-svg-icons";
const REMINDER1 = import.meta.env.VITE_REMINDER_1;
const REMINDER2 = import.meta.env.VITE_REMINDER_2;
const DEACTIVATE_REMINDER = import.meta.env.VITE_DEACTIVATE_REMINDER;

const Reminders = () => {
  const [patientNames, setPatientNames] = useState([]);
  console.log("patient names", patientNames);
  const [message, setMessage] = useState("");
  const [noAvailableReminderMessage, setNoAvailableReminderMessage] =
    useState(false);
  const [reminderSent, setReminderSent] = useState("");
  const [showReminderSent, setShowReminderSent] = useState(false);
  const [reminderOneFirstMessage, setReminderOneFirstMessage] = useState("");
  const [reminderOneFirst, setReminderOneFirst] = useState(false);

  const [
    cannotSubmitReminderOneTwiceMessage,
    setCannotSubmitReminderOneTwiceMessage,
  ] = useState("");
  const [cannotSubmitReminderOneTwice, setCannotSubmitReminderOneTwice] =
    useState(false);
  const [
    cannotSubmitReminderTwoTwiceMessage,
    setCannotSubmitReminderTwoTwiceMessage,
  ] = useState("");
  const [cannotSubmitReminderTwoTwice, setCannotSubmitReminderTwoTwice] =
    useState(false);
  const [deactivateReminderMessage, setDeactivateReminderMessage] =
    useState("");
  const [deactivateReminder, setDeactivateReminder] = useState(false);

  useEffect(() => {
    async function getPatientsWithReminders() {
      try {
        const resdata = await fetchData("/get_reminders");
        if (Array.isArray(resdata)) {
          const updatedPatients = resdata.map((patient) => ({
            ...patient,
            uniqueId: createEventId(),
          }));
          setPatientNames(updatedPatients);
        } else {
          setNoAvailableReminderMessage(true);
          setMessage(resdata.message);
          setTimeout(() => {
            setNoAvailableReminderMessage(false);
          }, 2000);
        }
      } catch (error) {
        console.log(error);
      }
    }
    getPatientsWithReminders();
  }, []);

  const handleSendReminder = async (event, uniqueId, reminder) => {
    event.preventDefault();
    const row = event.target.closest("tr");
    const formData = new FormData();

    row.querySelectorAll("input").forEach((input) => {
      formData.append(input.name, input.value);
    });

    // if you submitted already reminder 1 , do not allow to submit it another time
    if (reminder === REMINDER1) {
      const check_reminder1 = patientNames
        .filter((item) => item.uniqueId === uniqueId)
        .find((reminder) => reminder.reminder_one_date);
      if (check_reminder1) {
        setCannotSubmitReminderOneTwiceMessage("Reminder 1 already submitted!");
        setCannotSubmitReminderOneTwice(true);
        setTimeout(() => {
          setCannotSubmitReminderOneTwice(false);
        }, 2000);
        return;
      }
    }
    // if you click on reminder 2 and it is already submitted previously, do not submit it again
    if (reminder === REMINDER2) {
      const check_reminder2 = patientNames
        .filter((item) => item.uniqueId === uniqueId)
        .find((reminder) => reminder.reminder_two_date);
      if (check_reminder2) {
        setCannotSubmitReminderTwoTwiceMessage("Reminder 2 already submitted!");
        setCannotSubmitReminderTwoTwice(true);
        setTimeout(() => {
          setCannotSubmitReminderTwoTwice(false);
        }, 2000);
        return;
      }
    }

    // in case you click on reminder 2 and reminder 1 is not submitted yet, do not allow submission of reminder 2
    if (reminder === REMINDER2) {
      const check_reminder1 = patientNames
        .filter((item) => item.uniqueId === uniqueId)
        .find((event) => event.reminder_one_date);
      if (!check_reminder1) {
        setReminderOneFirst(true);
        setReminderOneFirstMessage("Please send reminder 1 first!");
        setTimeout(() => {
          setReminderOneFirst(false);
        }, 2000);
        return;
      }
    }

    try {
      const data = Object.fromEntries(formData.entries());

      data.reminder = reminder;
      const resdata = await fetchData("/store_reminders", "POST", data);
      if (resdata) {
        setShowReminderSent(true);
        setReminderSent(resdata.message);
        setTimeout(() => {
          setShowReminderSent(false);
        }, 2000);
      }
      const remaining_reminders = patientNames.filter(
        (item) => item.uniqueId !== uniqueId,
      );
      setPatientNames(remaining_reminders);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeactivateReminder = async (event, deactivate, eventId) => {
    event.preventDefault();
    // remove row which is deactivated
    const removeReminderRow = patientNames.filter(
      (item) => item.uniqueId !== eventId,
    );

    const row = event.target.closest("tr");
    const formData = new FormData();
    row.querySelectorAll("input").forEach((input) => {
      formData.append(input.name, input.value);
    });

    try {
      const data = Object.fromEntries(formData.entries());
      data.deactivate = deactivate;
      const resdata = await fetchData("/store_reminders", "POST", data);
      if (resdata) {
        setPatientNames(removeReminderRow);
        setDeactivateReminder(true);
        setDeactivateReminderMessage(resdata.message);
        setTimeout(() => {
          setDeactivateReminder(false);
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="remindersContainer">
      <div className="button-container">
        <div className="icon-text">
          <div className="clock">
            <FontAwesomeIcon icon={faBell} className="tooth-spacing" />
          </div>
          <span className="text">Reminders</span>
        </div>
        <div className="decorative-shapes"></div>
      </div>

      <div className="treatment-table">
        <table className="t-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Doctor</th>
              <th>Phone Number</th>
              <th>Procedure</th>
              <th>Reminder 1</th>
              <th>Reminder 2</th>
              <th>
                <FontAwesomeIcon icon={faTrashLight} size="lg" />
              </th>
            </tr>
          </thead>
          <tbody>
            {patientNames.map((item) => (
              <tr key={item.uniqueId} data-unique-id={item.uniqueId}>
                <td>
                  <Input
                    value={`${item.name} ${item.father} ${item.family}`}
                    className="name-input-remind"
                    name={`name-${item.uniqueId}`}
                  />
                  <Input
                    type="hidden"
                    value={item.uniqueId}
                    name={`hidden-${item.uniqueId}`}
                  />
                  <Input
                    type="hidden"
                    value={item.patientId}
                    name={`patient-${item.uniqueId}`}
                  />
                </td>
                <td>
                  <Input
                    className="doctor-input-remind"
                    name={`doctor-${item.uniqueId}`}
                    value={item.doctor}
                  />
                </td>
                <td>
                  <Input
                    name={`phone-${item.uniqueId}`}
                    value={item.phone}
                    className="phone-input-remind"
                  />
                </td>
                <td>
                  <Input
                    name={`proc-${item.uniqueId}`}
                    value={item.procedure}
                    className="proc-input-remind"
                  />
                </td>
                <td>
                  <Button
                    onClick={(event) =>
                      handleSendReminder(event, item.uniqueId, REMINDER1)
                    }
                    className="click-send"
                  >
                    {(() => {
                      const patient = patientNames.find(
                        (patient) => patient.uniqueId === item.uniqueId,
                      );
                      return patient && patient.reminder_one_date
                        ? patient.reminder_one_date
                        : "Click to send";
                    })()}
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={(event) =>
                      handleSendReminder(event, item.uniqueId, REMINDER2)
                    }
                    className="click-send"
                  >
                    {(() => {
                      const patient = patientNames.find(
                        (patient) => patient.uniqueId === item.uniqueId,
                      );
                      return patient && patient.reminder_two_date
                        ? patient.reminder_two_date
                        : "Click to send";
                    })()}
                  </Button>
                </td>
                <td>
                  <FontAwesomeIcon
                    onClick={(event) =>
                      handleDeactivateReminder(
                        event,
                        DEACTIVATE_REMINDER,
                        item.uniqueId,
                      )
                    }
                    className="minus-icon"
                    icon={faTrashXmark}
                    size="lg"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="remind-first">
          {reminderOneFirst && reminderOneFirstMessage}
        </div>
        <div className="no-reminders">
          {noAvailableReminderMessage && message}
        </div>
        <div className="success-remind">{showReminderSent && reminderSent}</div>
        <div className="no-send-one-remind">
          {cannotSubmitReminderOneTwice && cannotSubmitReminderOneTwiceMessage}
        </div>
        <div className="no-send-two-remind">
          {cannotSubmitReminderTwoTwice && cannotSubmitReminderTwoTwiceMessage}
        </div>
        <div className="deactivate-reminder">
          {deactivateReminder && deactivateReminderMessage}
        </div>
      </div>
    </div>
  );
};

export default Reminders;
