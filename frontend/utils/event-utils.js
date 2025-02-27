import { v4 as uuidv4 } from "uuid";
import { redirect } from "react-router-dom";

// convert date from string to date object
export function dateConversion(stringDate) {
  const date = new Date(stringDate);
  const year = date.getFullYear();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate().toString().padStart(2, "0");
  return `${month}-${day}-${year}`;
}

export function createEventId() {
  return uuidv4();
}

export function modifyDateTime(selectInfo) {
  const startDate = new Date(selectInfo.startStr);
  const endData = new Date(selectInfo.endStr);
  const visitDate = startDate.toISOString().split("T")[0];
  const startTime = startDate.toTimeString().split(" ")[0];
  const endTime = endData.toTimeString().split(" ")[0];
  return { visitDate, startTime, endTime };
}

export function modifyEditDateTime(eventClickInfo) {
  const startDate = new Date(eventClickInfo.event.startStr);
  const endDate = new Date(eventClickInfo.event.endStr);
  const visitDate = startDate.toISOString().split("T")[0];
  const startTime = startDate.toTimeString().split(" ")[0];
  const endTime = endDate.toTimeString().split(" ")[0];
  return { visitDate, startTime, endTime };
}

export function getAuthToken() {
  const token = sessionStorage.getItem("token");
  return token;
}

export function checkTokenAvailability() {
  const token = getAuthToken();
  if (!token) {
    return redirect("/");
  }
  return null;
}

export function formatvisitDate(dateString) {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTime(dateString) {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function getUniqueYears(allEncounters) {
  const uniqueYears = [...new Set(allEncounters.map((bill) => bill.year))];
  uniqueYears.sort((a, b) => a - b);
  return uniqueYears;
}

export function getUniqueMonths(allEncounters) {
  const uniqueMonths = [...new Set(allEncounters.map((item) => item.month))];
  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  uniqueMonths.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
  return uniqueMonths;
}

export function getUniqueDoctos(all_encounters) {
  const get_unique_doctors = [
    ...new Set(all_encounters.map((item) => item.doctor)),
  ];
  get_unique_doctors.sort((a, b) => a.localCompare(b));
  return get_unique_doctors;
}

export const svgPathsAbscessUp = {
  18: " M 50, 10 C 60, 0, 65, 0,75, 15 L 75,35 L 75 ,0 L 50, 10 L 50, 35 Z",
  17: " M 40, 25 C 65, 25, 65, 25,75, 25 L 75,50 L 75 ,25 L 40, 25 L 40, 50 Z",
  16: " M 50, 20 C 60, 20, 70, 20,80, 20 L 80,45 L 80 ,20 L 50, 20 L 50, 45 Z",
  15: " M 60, 10 C 75, 10, 85, 10,95, 10 L 95,40 L 95 ,10 L 60, 10 L 60, 40 Z",
  14: " M 60, 10 C 70, 10, 80, 10,90, 10 L 90,40 L 90 ,10 L 60, 10 L 60, 40 Z",
  13: " M 60, 10 C 70, 10, 80, 10,90, 10 L 90,40 L 90 ,10 L 60, 10 L 60, 40 Z",
  12: " M 60, 10 C 70, 10, 80, 10,90, 10 L 90,40 L 90 ,10 L 60, 10 L 60, 40 Z",
  11: " M 50, 10 C 60, 0, 65, 0,75, 15 L 75,35 L 75 ,0 L 50, 10 L 50, 35 Z",
  21: " M 50, 10 C 60, 0, 65, 0,75, 15 L 75,35 L 75 ,0 L 50, 10 L 50, 35 Z",
  22: " M 60, 10 C 70, 10, 80, 10,90, 10 L 90,40 L 90 ,10 L 60, 10 L 60, 40 Z",
  23: " M 60, 10 C 70, 10, 80, 10,90, 10 L 90,40 L 90 ,10 L 60, 10 L 60, 40 Z",
  24: " M 60, 10 C 70, 10, 80, 10,85, 10 L 85,40 L 85 ,10 L 60, 10 L 60, 40 Z",
  25: " M 50, 10 C 60, 0, 65, 0,75, 15 L 75,35 L 75 ,0 L 50, 10 L 50, 35 Z",
  26: " M 50, 20 C 60,20, 65,20,75, 20 L 75,45 L 75 ,20 L 50, 20 L 50, 45 Z",
  27: " M 60, 15 C 70, 15, 78, 15,85, 15 L 85,40 L 85 ,15 L 60, 15 L 60, 40 Z",
  28: " M 55, 10 C 60, 10, 65, 10,75, 10 L 75,35 L 75 10 L 50, 10 L 50, 35 Z",
};

export const svgPathsLeft = {
  18: "M 5,0 C 23, 20 17, 40, 17, 80 ",
  17: "M 0,6 C 13,20 13,30 13,40 C 14,50 14,55 14,60",
  16: "M 0,10 C 20,40 20,60 20,64",
  26: "M 16,8 C 14,20 14,30 14,40 C 13,50 12,70 13,87",
  27: "M 20,10 C 5,30 5,50 5,88 ",
  28: "M 15,6 C 5,30 5,50 5,80 ",
};
export const svgPathsLowerLeft = {
  48: " M 10,77 C 18, 70 18, 40 17,5",
  47: " M 12,65 C 7, 40 13, 20 13,2",
  46: " M 0,70 C 10, 60 16, 40 18,20 C 18, 15 17, 13 15,0 ",
  36: " M 20, 70 C 6, 40 6, 30 6,20 C 5, 17 5, 14 5,2 ",
  37: " M 20, 70 C 6, 40 6, 30 6,20 C 6, 17 6, 14 6,2 ",
  38: " M 18, 70 C 6, 25 6, 20 6,17 C 7, 15 7, 12 7,7 ",
};

export const svgPathsRight = {
  18: "M 3,3 C 8,20 10,30 10,90",
  17: "M 1,9 C 10,20 10,30 10,90",
  16: "M 8,13 C 10,20 14,30 18,90",
  26: "M 23,5 C 3,40 3,50 2,82",
  27: "M 20,10 C 0,40 0,50 0,76",
  28: "M 12,0 C 0,40 0,50 0,80",
};

export const svgPathsLowerRight = {
  48: " M 6, 65 C 6, 40 6, 30 6,20 C 7,15 7, 10 7,0 ",
  47: " M 2, 80 C 10, 40 10, 30 10,20 C 9,15 9, 10 9,3 ",
  46: " M 3, 85 C 12, 40 12, 30 12,20 C 11,15 11, 10 9,5",
  36: " M 10, 85 C 3, 40 3, 30 3,20 C 2,15 2, 10 2,5",
  37: " M 10, 85 C 12, 60 12, 50 12,40 C 11,30 11, 20 11,10 C 10,5 9,4 8,2 ",
  38: " M 13, 85 C 9, 50 9, 30 9,20 C 8,10 8,5 8,2 ",
};

export const svgPathsMiddle = {
  15: "M 8,2 C 9,20 9,100 9,220",
  14: "M 8,2 C 9,20 9,30 9,220",
  13: "M 12,0 C 14,20 15,30 8,220 ",
  12: "M 11,0 C 12,20 12,30 12,220",
  11: "M 0,0 C 7,20 8,30 6,200",
  21: "M 12,0 C 7,20 8,30 6,200",
  22: "M 11,0 C 11,20 11,30 11,220",
  23: "M 10,0 C 10,20 11,30 11,220",
  24: "M 8,0 C 8,20 9,30 9,220",
  25: "M 15,0 C 8,20 8,30 8,220",
};

export const svgPathsLowerMiddle = {
  45: " M 12 220 C 14, 50 14, 40 14,30 C 13,20 13,10 13,7 ",
  44: " M 13 220 C 12, 45 12, 30 12,20 C 11, 15 11, 10 11,0 ",
  43: " M 8 220 C 10, 45 10, 35 10,25 C 10, 15 10, 8 10,3 ",
  42: " M 15 220 C 16, 50 16, 40 16,30 C 15, 20 15, 10 14,0 ",
  41: " M 11 220 C 12, 50 12, 40 12,30 C 12, 20 12, 10 12,1 ",
  31: " M 11 220 C 12, 50 12, 40 12,30 C 12, 20 12, 10 12,1 ",
  32: " M 11 220 C 12, 50 12, 40 12,30 C 12, 20 12, 10 12,1 ",
  33: " M 16 220 C 15, 50 15, 40 15,30 C 14, 20 14, 10 14,0 ",
  34: " M 16 220 C 15, 50 15, 40 15,30 C 14, 20 14, 10 14,0 ",
  35: " M 11 220 C 12, 50 12, 40 12,30 C 12, 20 12, 10 12,1 ",
};

export const MolarUpperTeethNumbers = ["18", "17", "16", "26", "27", "28"];
export const OtherUpperTeethNumbers = [
  "15",
  "14",
  "13",
  "12",
  "11",
  "21",
  "22",
  "23",
  "24",
  "25",
];

export const AllUpperTeethNumbers = [
  "18",
  "17",
  "16",
  "15",
  "14",
  "13",
  "12",
  "11",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
];

export const AllLowerTeethNumbers = [
  "48",
  "47",
  "46",
  "45",
  "44",
  "43",
  "42",
  "41",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
];
export const MolarLowerTeethNumbers = ["48", "47", "46", "36", "37", "38"];
export const OtherLowerTeethNumbers = [
  "45",
  "44",
  "43",
  "42",
  "41",
  "31",
  "32",
  "33",
  "34",
  "35",
];

export const unpaidBillHeaders = [
  { name: "Visit Date" },
  // { name: "Name" },
  // { name: "Doctor" },
  { name: "Procedure" },
  { name: "Status" },
  { name: "Fees" },
  { name: "Disc" },
  { name: "Net Price" },
  { name: "Paid" },
  { name: "Write Off" },
  { name: "Balance" },
];

export const treatmentHeaders = [
  { name: "Procedures", id: "1" },
  { name: "Tooth Number", id: "2" },
  { name: "Gross", id: "3" },
  { name: "Discount", id: "4" },
  { name: "Net", id: "5" },
];

export const draggableIconsMap = {
  Abscess: "abscess",
  Extraction: "extracted",

  Pontic_Failed: "pontic-failed",
  Pontic_Successful: "pontic-successful",

  Implant_Top: "implant-top",

  Failed_Root_Left: "root-failed-left",
  Failed_Root_Middle: "root-failed-middle",
  Failed_Root_Right: "root-failed-right",
  Successful_Root_Left: "root-success-left",
  Successful_Root_Middle: "root-success-middle",
  Successful_Root_Right: "root-success-right",

  Failed_Crown: "crown-failed",
  Successful_Crown: "crown-successful",

  Successful_Implant: "implant-successful",
  Failed_Implant: "implant-failed",

  Composite_Occlusal_Failed: "Composite_Occlusal_Failed",
  Composite_Occlusal_Successful: "Composite_Occlusal_Successful",
  Composite_Lingual_Failed: "Composite_Lingual_Failed",
  Composite_Lingual_Successful: "Composite_Lingual_Successful",
  Composite_Distal_Failed: "Composite_Distal_Failed",
  Composite_Distal_Successful: "Composite_Distal_Successful",
  Composite_Mesial_Failed: "Composite_Mesial_Failed",
  Composite_Mesial_Successful: "Composite_Mesial_Successful",
  Composite_Buccal_Failed: "Composite_Buccal_Failed",
  Composite_Buccal_Successful: "Composite_Buccal_Successful",
};

export const svgPathsAbscessDown = {
  48: " M 30,40 C 50,40, 55,40, 60,40 L 60, 15 L 60, 40 L 30, 40L 30, 15",
  47: " M 30,30 C 50,30, 60,30, 65,30 L 65, 10 L 65, 30 L 30, 30 L 30, 10",
  46: " M 30,30 C 50,30, 60,30, 65,30 L 65, 10 L 65, 30 L 30, 30L 30, 10",
  45: " M 30,50 C 50,50, 51,50, 52,50 L 52, 25 L 52, 50 L 30, 50 L 30, 25 Z",
  44: " M 40,50 C 50,50, 55,50, 60,50 L 60, 25 L 60, 50 L 40, 50 L 40, 25Z",
  43: " M 50,50 C 60,50, 65,50, 75,50 L 75, 25 L 75, 50 L 50, 50 L 50, 25Z",
  42: " M 40,50 C 50,50, 55,50, 65,50 L 65, 25 L 65, 50 L 40, 50 L 40, 25 Z",
  41: " M 50,50 C 60,50, 70,50, 80,50 L 80, 25 L 80, 50 L 50, 50 L 50, 25 Z",
  31: " M 50,50 C 60,50, 70,50, 80,50 L 80, 25 L 80, 50 L 50, 50 L 50, 25 Z",
  32: " M 50,50 C 60,50, 70,50, 80,50 L 80, 25 L 80, 50 L 50, 50 L 50, 25 Z",
  33: " M 60,50 C 60,50, 70,50, 80,50 L 80, 25 L 80, 50 L 60, 50 L 60, 25 Z",
  34: " M 50,50 C 60,50, 70,50, 80,50 L 80, 25 L 80, 50 L 50, 50 L 50, 25 Z",
  35: " M 50,50 C 60,50, 70,50, 80,50 L 80, 25 L 80, 50 L 50, 50 L 50, 25 Z",
  36: " M 40,35 C 50,35, 60,35, 70,35 L 70, 10 L 70, 35 L 40, 35 L 40, 10Z",
  37: " M 30,20 C 40,20, 50,20, 60,20 L 60, 0 L 60, 20 L 30, 20 L 30, 0 Z",
  38: " M 30,40 C 50,40, 51,40, 52,40 L 52, 20 L 52, 40 L 30, 40 L 30, 20 Z",
};

export const tableHeaders = {
  diagnosis: [
    { key: "description", label: "Diagnosis", width: "300px" },
    { key: "tooth", label: "Tooth", width: "100px" },
    { key: "delete", label: "delete", width: "80px" },
  ],
  procedure: [
    {
      key: "description",
      label: "Procedure",
    },
    {
      key: "tooth",
      label: "Tooth",
    },
    {
      key: "fee",
      label: "Fee",
    },
    {
      key: "discount",
      label: "Discount",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "notes",
      label: "Notes",
    },
    {
      key: "provider",
      label: "Provider",
    },
    {
      key: "date",
      label: "Visit Date",
    },
    { key: "delete", label: "delete", width: "" },
  ],
};

export const inProcessHeaders = [
  {
    key: "description",
    label: "Procedure",
  },
  {
    key: "tooth",
    label: "Tooth",
  },
  {
    key: "fee",
    label: "Fee",
  },
  {
    key: "discount",
    label: "Discount",
  },
  {
    key: "writeOff",
    label: "Write off",
  },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "paid",
    label: "Amount Paid",
  },
  {
    key: "remaining",
    label: "Remaining Balance",
  },

  {
    key: "date",
    label: "Visit Date",
  },
  {
    key: "delete",
    label: "delete",
  },
];

export const completedHeaders = [
  {
    key: "description",
    label: "Procedure",
  },
  {
    key: "tooth",
    label: "Tooth",
  },
  {
    key: "fee",
    label: "Fee",
  },
  {
    key: "discount",
    label: "Discount",
  },
  {
    key: "writeOff",
    label: "Write off",
  },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "paid",
    label: "Amount Paid",
  },
  {
    key: "remaining",
    label: "Remaining Balance",
  },

  {
    key: "date",
    label: "Visit Date",
  },
];

const teethWithOneRoot = [
  "15",
  "14",
  "13",
  "12",
  "11",
  "21",
  "22",
  "23",
  "24",
  "25",
  "45",
  "44",
  "43",
  "42",
  "41",
  "31",
  "32",
  "33",
  "34",
  "35",
];

export const isToothWithOneRoot = (toothNumber) =>
  !teethWithOneRoot.includes(toothNumber);

const toothWithTwoRoots = [
  "18",
  "17",
  "16",
  "26",
  "27",
  "28",
  "48",
  "47",
  "46",
  "36",
  "37",
  "38",
];
export const isToothWithTwoRoots = (toothNumber) =>
  !toothWithTwoRoots.includes(toothNumber);
