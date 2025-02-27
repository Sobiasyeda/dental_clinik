import FullCalendar from "@fullcalendar/react";
import { useContext, useEffect, useState, useRef, useMemo } from "react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import adaptivePlugin from "@fullcalendar/adaptive";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import { ModalContext } from "./ModalContext.jsx";
import { createEventId } from "../../utils/event-utils.js";
import BookingModal from "./BookingModal.jsx";
import { BookingModalContext } from "./BookingModalContext.jsx";
import { modifyDateTime } from "../../utils/event-utils.js";
import { modifyEditDateTime } from "../../utils/event-utils.js";
import { formatvisitDate } from "../../utils/event-utils.js";
import { formatTime } from "../../utils/event-utils.js";
// import { useAuthorization } from "../../hooks/useAuthorization.js";
// import { getAuthToken } from "../../utils/event-utils.js";
import { fetchData } from "../../hooks/fetchData.js";

const CALENDAR = import.meta.env.VITE_CALENDAR;

export default function Calendar() {
  // useAuthorization(CALENDAR);
  const calendarRef = useRef(null);

  const [getAllEventsInDataBase, setGetAllEventsInDataBase] = useState([]);
  console.log("get all events in database", getAllEventsInDataBase);
  const [clickedEventID, setClickedEventID] = useState({});
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [eventBookingDateTime, setEventBookingDateTime] = useState({
    start: "",
    end: "",
    date: "",
    eventId: "",
    resourceId: "",
    doctor_name: "",
  });

  const [
    isCLoseButtonClickedWithResizeDrag,
    setIsCLoseButtonClickedWithResizeDrag,
  ] = useState(false);
  const [oldEventWhenResize, setOldEventWhenResize] = useState({});

  const modalCtx = useContext(ModalContext);
  const {
    clearFormData,
    setStoredItems,
    setInputValues,
    setValidation,
    setBookingStatus,
  } = useContext(BookingModalContext);

  const colors = ["purple", "red", "#939DB0FF", "blue", "#E76F51"];

  function handleOnChangeApptSchedule(event) {
    const { name, value } = event.target;
    setEventBookingDateTime((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }

  const resources = useMemo(() => {
    if (!doctors || doctors.length === 0) return [];
    return doctors.map((item, index) => ({
      id: item.id,
      title: `Dr ${item.name} ${item.family}`,
      eventColor: colors[index % colors.length],
    }));
  }, [doctors, colors]);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const data = await fetchData("/get_doctors");
        setDoctors(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.log(error);
      }
    }
    fetchDoctors();
  }, []);

  // get all events in bookingEncounter database table
  useEffect(() => {
    async function getAllEvents() {
      try {
        const data = await fetchData("/getAllEvents");
        setGetAllEventsInDataBase(data);
      } catch (error) {
        console.log(error);
      }
    }
    getAllEvents();
  }, []);

  function handleSelectSlot(selectInfo) {
    const resourceIdStr = String(selectInfo.resource.id);
    setIsCLoseButtonClickedWithResizeDrag(false);
    setBookingStatus(false);
    const encounterId = createEventId();
    clearFormData();
    setEventBookingDateTime({
      start: "",
      end: "",
      date: "",
      eventId: "",
      resourceId: "",
      doctor_name: "",
    });
    modalCtx.handleOpenBookModal();
    setIsDeleteButtonVisible(false);
    const { visitDate, startTime, endTime } = modifyDateTime(selectInfo);
    const find_doctor_id = doctors.find(
      (item) => String(item.id) === resourceIdStr,
    );
    const find_doctor_name = find_doctor_id.name + " " + find_doctor_id.family;

    setEventBookingDateTime({
      start: startTime,
      end: endTime,
      date: visitDate,
      eventId: encounterId,
      resourceId: selectInfo.resource.id,
      doctor_name: find_doctor_name,
    });
  }

  function handleClickOnEvent(eventClickInfo) {
    setIsCLoseButtonClickedWithResizeDrag(false);
    setBookingStatus(false);
    setValidation("");
    const findEvent = getAllEventsInDataBase.find(
      (event) => event.id === eventClickInfo.event.id,
    );
    console.log("find event", findEvent);
    if (findEvent) {
      setInputValues({
        name: findEvent.name,
        family: findEvent.family,
        dob: findEvent.dob,
        phone: findEvent.phone,
        proc: findEvent.proc,
      });
    }

    const { visitDate, startTime, endTime } =
      modifyEditDateTime(eventClickInfo);
    setEventBookingDateTime({
      start: startTime,
      end: endTime,
      date: visitDate,
      eventId: eventClickInfo.event.id,
      resourceId: findEvent.resourceId,
      doctor_name: findEvent.doctor,
    });
    const calendar = eventClickInfo.view.calendar;
    const clickedEve = calendar.getEventById(eventClickInfo.event.id);
    setClickedEventID(clickedEve);
    setIsDeleteButtonVisible(true);
    modalCtx.handleOpenBookModal();
  }

  function resizeAndDrop(eventInfo) {
    modalCtx.handleOpenBookModal();
    const findEventId = getAllEventsInDataBase.find(
      (item) => item.id === eventInfo.event.id,
    );
    setInputValues({
      name: findEventId.name,
      family: findEventId.family,
      dob: findEventId.dob,
      phone: findEventId.phone,
    });
    const { visitDate, startTime, endTime } = modifyEditDateTime(eventInfo);
    setEventBookingDateTime({
      start: startTime,
      end: endTime,
      date: visitDate,
      eventId: eventInfo.event.id,
      doctor_name: findEventId.doctor,
      resourceId: findEventId.resourceId,
    });
    setOldEventWhenResize(eventInfo);
  }

  function handleEventResize(eventResizeInfo) {
    setIsCLoseButtonClickedWithResizeDrag(true);
    resizeAndDrop(eventResizeInfo);
  }

  function handleEventDrop(eventDropInfo) {
    setIsCLoseButtonClickedWithResizeDrag(true);
    resizeAndDrop(eventDropInfo);
  }

  function handleEventResizeOrDropWhenClickClose() {
    if (oldEventWhenResize && typeof oldEventWhenResize.revert === "function") {
      oldEventWhenResize.revert();
    }
  }

  async function handleDeleteEvent(event) {
    event.preventDefault();
    modalCtx.handleCloseBookModal();
    const eventClickedID = clickedEventID;
    eventClickedID.remove(); //check if this necessary
    const eventId = eventClickedID.id;
    const keepUndeletedEventsList = getAllEventsInDataBase.filter(
      (eventItem) => eventItem.id !== eventClickedID.id,
    );
    setGetAllEventsInDataBase(keepUndeletedEventsList);

    try {
      await fetchData("/encounter", "POST", {
        eventIdAtDelete: eventId,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSubmitForm(event) {
    event.preventDefault();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const formData = new FormData(event.target);
    let data = Object.fromEntries(formData.entries());
    data = {
      ...data,
    };
    // const token = getAuthToken();
    const event_id = formData.get("eventId");
    const patient_name = formData.get("name");
    const family_name = formData.get("family");
    const dob = formData.get("dob");
    const start = formData.get("start");
    const end = formData.get("end");
    const visit_date = formData.get("date");
    const doctor = formData.get("doctor");
    let bookingReminder = formData.get("booking-reminder") ?? false;

    if (!patient_name) {
      return;
    }
    const findEvent = getAllEventsInDataBase.find(
      (event) => event.id === event_id,
    );
    if (findEvent) {
      const findEventStart = formatTime(findEvent.start);
      const findEventEnd = formatTime(findEvent.end);
      const findEventVisitDate = formatvisitDate(findEvent.visit_date);
      const findEventBookingReminder = String(
        findEvent.extendedProps.isBookingWhatsappSent,
      );
      if (
        findEvent.dob === dob &&
        findEventStart === start &&
        findEventVisitDate === visit_date &&
        findEventEnd === end &&
        findEvent.name === patient_name &&
        findEvent.family === family_name &&
        findEvent.doctor === doctor &&
        findEventBookingReminder === bookingReminder
      ) {
        alert("No Changes in Booking Appointment!");
        return;
      }
    }

    try {
      const response = await fetch(`${baseUrl}/encounter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      const existingEventIndex = getAllEventsInDataBase.findIndex(
        (event) => event.id === resData.id,
      );
      //The findIndex function returns the index of the first element in the
      // array that satisfies the provided testing function. If no element is found, it returns -1
      if (existingEventIndex !== -1) {
        const existingEvent = getAllEventsInDataBase[existingEventIndex];

        const isSameEvent =
          existingEvent.start === resData.start &&
          existingEvent.end === resData.end &&
          existingEvent.name === resData.name &&
          existingEvent.family === resData.family &&
          existingEvent.dob === resData.dob &&
          existingEvent.visit_date === resData.visit_date &&
          existingEvent.extendedProps.isBookingWhatsappSent ===
            resData.extendedProps.isBookingWhatsappSent;
        if (!isSameEvent) {
          const updatedEvents = [...getAllEventsInDataBase];
          updatedEvents.splice(existingEventIndex, 1, resData);
          setGetAllEventsInDataBase(updatedEvents);
        }
      } else {
        setGetAllEventsInDataBase((prevState) => [...prevState, resData]);
      }
      if (!response.ok) {
        throw new Error("error");
      }

      // clear out fields when submitting the form
      setBookingStatus(false);
      setStoredItems([]);

      modalCtx.handleCloseBookModal();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <BookingModal
        submitForm={handleSubmitForm}
        handleOnChangeSchedule={handleOnChangeApptSchedule}
        data={eventBookingDateTime}
        deleteEvent={handleDeleteEvent}
        isDeleteButtonVisible={isDeleteButtonVisible}
        revertToOldEventWhenResizeOrDrag={handleEventResizeOrDropWhenClickClose}
        isCLoseButtonClickedWithResizeDrag={isCLoseButtonClickedWithResizeDrag}
      />

      <FullCalendar
        ref={calendarRef}
        plugins={[
          resourceTimeGridPlugin,
          scrollGridPlugin,
          interactionPlugin,
          adaptivePlugin,
          bootstrapPlugin,
        ]}
        themeSystem="bootstrap"
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        initialView="resourceTimeGridDay"
        resources={resources}
        eventClassNames={(arg) => {
          const isBookingWhatsappSent =
            arg.event.extendedProps.isBookingWhatsappSent;
          if (isBookingWhatsappSent) {
            return "WA_sent";
          }
        }}
        selectable={true}
        editable={true}
        droppable={true}
        selectMirror={true}
        dayMaxEvents={true}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:15:00"
        headerToolbar={{
          left: " myCustomButton",
          center: "prev title next,today",
          right: "dailyGrid,weeklyGrid",
        }}
        customButtons={{
          myCustomButton: {
            bootstrapFontAwesome: "fa-brands fa-whatsapp",
          },
          prev: {
            bootstrapFontAwesome: "fa-regular fa-chevron-left",
            click: function () {
              const calendarApi = calendarRef.current.getApi();
              calendarApi.prev();
            },
          },
          next: {
            bootstrapFontAwesome: "fa-regular fa-chevron-right",
            click: function () {
              const calendarApi = calendarRef.current.getApi();
              calendarApi.next();
            },
          },
          dailyGrid: {
            bootstrapFontAwesome: "fa-light fa-calendar-day",
            click: function () {
              const calendarApi = calendarRef.current.getApi();
              calendarApi.changeView("resourceTimeGridDay");
            },
          },
          weeklyGrid: {
            bootstrapFontAwesome: "fa-light fa-calendar-week",
            click: function () {
              const calendarApi = calendarRef.current.getApi();
              calendarApi.changeView("resourceTimeGridWeek");
            },
          },
        }}
        titleFormat={{ year: "numeric", month: "long", day: "2-digit" }}
        select={handleSelectSlot}
        expandRows={true}
        eventMinHeight={35}
        contentHeight="auto"
        allDaySlot={false}
        dayMinWidth={200}
        eventClick={handleClickOnEvent}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        events={getAllEventsInDataBase}
        eventContent={(arg) => {
          const start = arg.event.start
            ? arg.event.start.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A";
          const end = arg.event.end
            ? arg.event.end.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A";
          const { name, family } = arg.event.extendedProps;
          const procedure = arg.event.extendedProps.procedure || "";
          const isAppointmentWhatsAppSent =
            arg.event.extendedProps.isAppointmentWhatsappSent;

          return (
            <div>
              <b className="start-time">
                {start} - {end}
              </b>
              <br />
              <b>
                {name} {family}
              </b>
              <i className="procedure-calendar"> {procedure.toLowerCase()}</i>
              {/*adding to calendar that whatsapp for appointment automatic reminder is sent */}
              <span>{isAppointmentWhatsAppSent ? "(WA-2 ✔)" : ""}</span>
            </div>
          );
        }}
      />
    </div>
  );
}
