import React, { useContext, useEffect, useState } from "react";
import { SearchInputContext } from "./SearchInputContext.jsx";
import Input from "../UI/Input.jsx";
import ToothChartModal from "./ToothChartModal.jsx";
import SelectPage from "../UI/Select.jsx";
import OptionPage from "../UI/Option.jsx";
import Button from "../UI/Button.jsx";
import { Link } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { draggableIconsMap } from "../../utils/event-utils.js";
import {
  faTrash as faTrashSolid,
  faDiamondTurnRight,
} from "@fortawesome/free-solid-svg-icons";
import { DiagnosisContext } from "./DiagnosisContext.jsx";
import { isToothWithOneRoot } from "../../utils/event-utils.js";
import { isToothWithTwoRoots } from "../../utils/event-utils.js";
import {
  svgPathsAbscessUp,
  svgPathsAbscessDown,
  svgPathsLeft,
  svgPathsLowerLeft,
  svgPathsMiddle,
  svgPathsLowerMiddle,
  svgPathsRight,
  svgPathsLowerRight,
  MolarUpperTeethNumbers,
  MolarLowerTeethNumbers,
  OtherUpperTeethNumbers,
  OtherLowerTeethNumbers,
  AllUpperTeethNumbers,
  AllLowerTeethNumbers,
  tableHeaders,
} from "../../utils/event-utils.js";
import { createEventId } from "../../utils/event-utils.js";
import { fetchData } from "../../hooks/fetchData.js";
import Label from "../UI/Label.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashXmark } from "@fortawesome/pro-light-svg-icons";
import {ModalContext} from "./ModalContext.jsx";

const Documentation = ({
  procedures,
  diagnosis,
  diagnosisMap,
  setPreviousDiagnosis,
  isDiagnosisPage,
  proceduresMap,
  setDiagnosisMap,
}) => {
  const ABSCESS = import.meta.env.VITE_ABSCESS;
  const EXTRACTION = import.meta.env.VITE_EXTRACTION;
  const IMPLANT_TOP = import.meta.env.VITE_IMPLANT_TOP;
  const PONTIC = import.meta.env.VITE_PONTIC;
  const ROOT = import.meta.env.VITE_ROOT;
  const CROWN = import.meta.env.VITE_CROWN;
  const IMPLANT_FIXTURE = import.meta.env.VITE_IMPLANT_FIXTURE;
  const LINGUAL = import.meta.env.VITE_LINGUAL;
  const BUCCAL = import.meta.env.VITE_BUCCAL;
  const OCCLUSAL = import.meta.env.VITE_OCCLUSAL;
  const MESIAL = import.meta.env.VITE_MESIAL;
  const DISTAL = import.meta.env.VITE_DISTAL;
  const ROOT_FAILED = import.meta.env.VITE_ROOT_FAILED;
  const ROOT_SUCCESS = import.meta.env.VITE_ROOT_SUCCESS;
  const ROOT_FAILED_LABEL = import.meta.env.VITE_ROOT_FAILED_LABEL;
  const Production = import.meta.env.VITE_PRODUCTION;
  const isProduction = import.meta.env.MODE === Production;
  const basePath = isProduction ? "/static" : "";


  const [receivedImages, setReceivedImages] = useState([]);
  const [isTeethLoading, setIsTeethLoading] = useState(true);
  const [defaultUpperToothImages, setDefaultUpperToothImages] = useState([]);
  const [defaultLowerToothImages, setDefaultLowerToothImages] = useState([]);
  const [upperToothImages, setUpperToothImages] = useState([]);
  console.log("upper tooth images", upperToothImages);
  const [lowerToothImages, setLowerToothImages] = useState([]);
  const [diagnosisDataManually, setDiagnosisDataManually] = useState([]);
  const [procedureDataManually, setProcedureDataManually] = useState([]);
  const [diagnosisOnChange, setDiagnosisOnChange] = useState({});
  const [procedureOnChange, setProcedureOnChange] = useState({});
  const [toothNumber, setToothNumber] = useState({});
  const [abscessOnTooth, setAbscessOnTooth] = useState({});
  const [rootLeftOnTooth, setRootLeftOnTooth] = useState({});
  const [rootMiddleOnTooth, setRootMiddleOnTooth] = useState({});
  const [topImplantOnTooth, setTopImplantOnTooth] = useState({});
  const [rootRightOnTooth, setRootRightOnTooth] = useState({});
  const [crownOnTooth, setCrownOnTooth] = useState({});
  const [implantOnTooth, setImplantOnTooth] = useState({});
  const [ponticOnTooth, setPonticOnTooth] = useState({});
  const [occlusalCompositeOnTooth, setOcclucalCompositeOnTooth] = useState({});
  const [lingualCompositeOnTooth, setLingualCompositeOnTooth] = useState({});
  const [mesialCompositeOnTooth, setMesialCompositeOnTooth] = useState({});
  const [buccalCompositeOnTooth, setBuccalCompositeOnTooth] = useState({});
  const [distalCompositeOnTooth, setDistalCompositeOnTooth] = useState({});
  const [currentDate, setCurrentDate] = useState("");
  const [inputValues, setInputValues] = useState({});
  const [diagnosisCopy, setDiagnosisCopy] = useState({});

  const [patientDiagnosisInTable, setPatientDiagnosisInTable] = useState([]);
  const [interventionMessage, setInterventionMessage] = useState("");
  const [messageTimer, setMessageTimer] = useState(false);

  const formId = createEventId();

  const { selectedNames, setSelectedNames } = useContext(SearchInputContext);
  const {handleOpenToothChartModal,handleCloseToothChartModal} = useContext(ModalContext)
  const { storedDiagnosis, setStoredDiagnosis, setProceduresMap } =
    useContext(DiagnosisContext);
  const userName = sessionStorage.getItem("user");

  // Update diagnosisCopy whenever diagnosisMap or storedDiagnosis changes
  // create a shallow copy for diagnosis map so you can use it in procedure page
  useEffect(() => {
    if (diagnosisMap) {
      // Create a new object and copy each tooth's array into a new array to avoid reference issues
      const deepDiagnosisCopy = Object.fromEntries(
        Object.entries(diagnosisMap).map(([tooth, interventions]) => [
          tooth,
          [...interventions], // Spread to create a new array for each tooth's interventions
        ]),
      );
      setDiagnosisCopy(deepDiagnosisCopy);
    }
  }, [diagnosisMap]);

  // // // Merge StoredDiagnosis with diagnosisCopy to reflect any changes in the procedure page
  // // // this is only when changing the diagnosis done by other physicians in the procedures page
  // // // it has nothing to do with the procedures performed by the dentist
  useEffect(() => {
    if (Object.keys(storedDiagnosis).length > 0) {
      const updatedDiagnosisCopy = { ...storedDiagnosis };
      // check if diagnosis map has a new icon that is not available in diagnosis copy and added to diagnosis copy
      Object.entries(diagnosisMap).forEach(([tooth, interventions]) => {
        if (!updatedDiagnosisCopy[tooth]) {
          updatedDiagnosisCopy[tooth] = [...interventions];
        }
      });
      setDiagnosisCopy(updatedDiagnosisCopy);
    }
  }, [storedDiagnosis, diagnosisMap]);

  // get the prices from the procedures page so you can display it in the table for procedures
  const returnProcedurePrice = (desc) => {
    const procedure = procedures.find((item) => item.description === desc);
    return procedure ? procedure.price : 0;
  };

  // get procedures fees only if not on diagnosis page.
  const fees = isDiagnosisPage
    ? {}
    : {
        abscess: returnProcedurePrice(ABSCESS),
        extraction: returnProcedurePrice(EXTRACTION),
        implantTop: returnProcedurePrice(IMPLANT_TOP),
        pontic: returnProcedurePrice(PONTIC),
        root: returnProcedurePrice(ROOT),
        crown: returnProcedurePrice(CROWN),
        implantFixture: returnProcedurePrice(IMPLANT_FIXTURE),
        lingual: returnProcedurePrice(LINGUAL),
        buccal: returnProcedurePrice(BUCCAL),
        occlusal: returnProcedurePrice(OCCLUSAL),
        mesial: returnProcedurePrice(MESIAL),
        distal: returnProcedurePrice(DISTAL),
      };

  const areas = [
    {
      name: "lingual",
      failedId: "Composite_Lingual_Failed",
      successId: "Composite_Lingual_Successful",
      fee: isDiagnosisPage ? "" : fees.lingual,
    },
    {
      name: "occlusal",
      failedId: "Composite_Occlusal_Failed",
      successId: "Composite_Occlusal_Successful",
      fee: isDiagnosisPage ? "" : fees.occlusal,
    },
    {
      name: "distal",
      failedId: "Composite_Distal_Failed",
      successId: "Composite_Distal_Successful",
      fee: isDiagnosisPage ? "" : fees.distal,
    },
    {
      name: "buccal",
      failedId: "Composite_Buccal_Failed",
      successId: "Composite_Buccal_Successful",
      fee: isDiagnosisPage ? "" : fees.buccal,
    },
    {
      name: "mesial",
      failedId: "Composite_Mesial_Failed",
      successId: "Composite_Mesial_Successful",
      fee: isDiagnosisPage ? "" : fees.mesial,
    },
  ];

  const icons = [
    {
      name: "abscess",
      successId: "abscess",
      label: isDiagnosisPage ? "Abscess" : "",
      fee: isDiagnosisPage ? "" : fees.abscess,
    },
    {
      name: "extracted",
      successId: "extracted",
      label: "Extraction",
      fee: isDiagnosisPage ? "" : fees.extraction,
    },
    {
      name: "crown",
      failedId: "crown-failed",
      successId: "crown-successful",
      label: "Crown",
      fee: isDiagnosisPage ? "" : fees.crown,
    },

    {
      name: "pontic",
      failedId: "pontic-failed",
      successId: "pontic-successful",
      label: "Pontic",
      fee: isDiagnosisPage ? "" : fees.pontic,
    },

    {
      name: ROOT_FAILED,
      roots: [
        {
          id: "root-failed-left",
          name: "left",
          fee: isDiagnosisPage ? "" : fees.root,
        },
        {
          id: "root-failed-middle",
          name: "middle",
          fee: isDiagnosisPage ? "" : fees.root,
        },
        {
          id: "root-failed-right",
          name: "right",
          fee: isDiagnosisPage ? "" : fees.root,
        },
      ],
      label: ROOT_FAILED_LABEL,
    },
    {
      name: ROOT_SUCCESS,
      roots: [
        {
          id: "root-success-left",
          name: "left",
          fee: isDiagnosisPage ? "" : fees.root,
        },
        {
          id: "root-success-middle",
          name: "middle",
          fee: isDiagnosisPage ? "" : fees.root,
        },
        {
          id: "root-success-right",
          name: "right",
          fee: isDiagnosisPage ? "" : fees.root,
        },
      ],
      label: "Proper Root",
    },

    {
      name: "implant-top",
      successId: "implant-top",
      label: "Implant Top",
      fee: isDiagnosisPage ? "" : fees.implantTop,
    },
    {
      name: "implant",
      failedId: "implant-failed",
      successId: "implant-successful",
      label: "Implant",
      fee: isDiagnosisPage ? "" : fees.implantFixture,
    },
  ];
  // get current date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-CA");
    setCurrentDate(formattedDate);
  }, []);

  // change select fields in procedure page
  const handleOnChangeProcedureData = (event) => {
    const { name, value } = event.target;
    setInputValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // get All teeth and sort them
  useEffect(() => {
    async function get_all_teeth() {
      try {
        const resdata = await fetchData("/get_all_teeth");
        setReceivedImages(resdata);
      } catch (error) {
        console.log(error);
      }
    }
    get_all_teeth();
  }, []);

  useEffect(() => {
    const preloadImages = (images) => {
      return Promise.all(
        images.map(
          (image) =>
            new Promise((resolve) => {
              const img = new Image();
              img.src = image.tooth_path;
              img.onload = resolve;
              img.onerror = resolve; // Handle errors or resolve anyway
            }),
        ),
      );
    };

    const loadImages = async () => {
      if (receivedImages.length === 0) return;
      setIsTeethLoading(true);

      const upperTooth = receivedImages.filter(
        (item) =>
          (item.tooth_number >= 11 && item.tooth_number <= 18) ||
          (item.tooth_number >= 21 && item.tooth_number <= 28),
      );
      const sortedUpperTooth = upperTooth.sort((a, b) => {
        if (a.tooth_number >= 21 && b.tooth_number >= 21) {
          return a.tooth_number - b.tooth_number;
        } else if (a.tooth_number <= 18 && b.tooth_number <= 18) {
          return b.tooth_number - a.tooth_number;
        } else {
          return 0;
        }
      });

      const lowerTooth = receivedImages.filter(
        (item) =>
          (item.tooth_number >= 31 && item.tooth_number <= 38) ||
          (item.tooth_number >= 41 && item.tooth_number <= 48),
      );

      const sortedLowerTooth = lowerTooth.sort((a, b) => {
        if (
          a.tooth_number >= 31 &&
          a.tooth_number <= 38 &&
          b.tooth_number >= 31 &&
          b.tooth_number <= 38
        ) {
          return a.tooth_number - b.tooth_number;
        } else if (
          a.tooth_number >= 41 &&
          a.tooth_number <= 48 &&
          b.tooth_number >= 41 &&
          b.tooth_number <= 48
        ) {
          return b.tooth_number - a.tooth_number;
        } else if (a.tooth_number >= 41 && a.tooth_number <= 48) {
          return -1;
        } else if (b.tooth_number >= 41 && b.tooth_number <= 48) {
          return 1;
        } else {
          return 0;
        }
      });

      await preloadImages([...sortedUpperTooth, ...sortedLowerTooth]);

      //set the default images so when submitting the form you can return images as they were
      setDefaultUpperToothImages(sortedUpperTooth);
      setDefaultLowerToothImages(sortedLowerTooth);

      // set the current state of teeth images
      setUpperToothImages(sortedUpperTooth);
      setLowerToothImages(sortedLowerTooth);
      setIsTeethLoading(false);
    };
    loadImages();
  }, [receivedImages]);
  // finish getting all teeth and sorting

  function handleOnDeleteIconsOnChart(event) {
    event.preventDefault();
    // do not allow to proceed if the patient name is not selected
    if (selectedNames.length === 0) {
      alert("Please select a patient");
      return;
    }
    // do not allow to delete if the tooth number is not selected
    if (Object.keys(toothNumber).length === 0) {
      alert("Select tooth number");
      event.target.reset();
      setToothNumber({});
      return;
    }
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const tooth_number = data["tooth-delete"].toString();
    // remove the icon from diagnosis copy but keep the tooth number in case of delete
    const updated_diagnosis_copy = { ...diagnosisCopy };
    // const updated_procedures_copy = { ...proceduresMap };
    if (updated_diagnosis_copy[tooth_number]) {
      updated_diagnosis_copy[tooth_number] = [];
    }
    // if (updated_procedures_copy[tooth_number]) {
    //   updated_procedures_copy[tooth_number] = [];
    //   setProceduresMap(updated_procedures_copy);
    // }
    setDiagnosisCopy(updated_diagnosis_copy);
    event.target.reset();
  }

  function handleAddIntervention(event) {
    event.preventDefault();
    if (selectedNames.length === 0) {
      alert("Please select a patient");
      return;
    }
    // cannot add a diagnosis or procedure if it is not selected
    const isDiagnosisEmpty = Object.keys(diagnosisOnChange).length === 0;
    const isProcedureEmpty = Object.keys(procedureOnChange).length === 0;
    const isToothEmpty = Object.keys(toothNumber).length === 0;

    if (isDiagnosisPage) {
      if (isDiagnosisEmpty || isToothEmpty) {
        alert("Select Diagnosis!");
        event.target.reset();
        setToothNumber({});
        setDiagnosisOnChange({});
        return;
      }
    } else {
      if (isProcedureEmpty || isToothEmpty) {
        alert("Select Procedure!");
        event.target.reset();
        setToothNumber({});
        setProcedureOnChange({});
        return;
      }
    }

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (isDiagnosisPage) {
      const diagnosisDataEntry = {
        diagnosisDescription: data.diagnosis,
        diagnosedTooth: data.tooth,
        unique_id: formId,
      };

      setDiagnosisDataManually((prevState) => [
        ...prevState,
        diagnosisDataEntry,
      ]);
      setDiagnosisOnChange({});
    } else {
      const procedureValue = JSON.parse(data.procedure);
      const procedureDataEntry = {
        procedureDescription: procedureValue.proc,
        procedureFee: procedureValue.price,
        unique_id: formId,
        ...data,
      };
      setProcedureDataManually((prevState) => [
        ...prevState,
        procedureDataEntry,
      ]);
      setProcedureOnChange({});
    }

    event.target.reset();
    setToothNumber({});
  }

  // start Dragging icons to tooth
  const handleDragStart = (e, iconType, procFee) => {
    if (selectedNames.length === 0) {
      alert("Select a patient first");
      // we use e.prevent default so we detach the icon and prevent the dragstart from continuing.
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text", iconType);
    e.dataTransfer.setData("procFee", procFee);
  };

  function handleOnChangeIntervention(event) {
    const { name, value } = event.target;
    if (isDiagnosisPage) {
      setDiagnosisOnChange(() => ({
        [name]: value,
      }));
    } else {
      setProcedureOnChange(() => ({
        [name]: value,
      }));
    }
  }

  function handleOnChangeToothNumber(event) {
    const { name, value } = event.target;
    setToothNumber(() => ({
      [name]: value,
    }));
  }

  // delete diagnosis from table
  function handleDeleteInterventionFromTable(uniqueId) {
    if (isDiagnosisPage) {
      const remaining_diagnosis = diagnosisDataManually.filter(
        (item) => item.unique_id !== uniqueId,
      );
      setDiagnosisDataManually(remaining_diagnosis);
    } else {
      const remaining_procedures = procedureDataManually.filter(
        (item) => item.unique_id !== uniqueId,
      );
      setProcedureDataManually(remaining_procedures);
    }
  }

  const handleDrop = (e, toothNumber) => {
    // THE MOST IMPORTANT PAR TO UNDERSTAND HERE:
    // 1 - DIAGNOSED ICONS STORED IN BACKEND AND DISPLAYED IN DIAGNOSIS PAGE CAN BE MODIFIED THROUGH DIAGNOSIS MAP
    // 2 - DIAGNOSED ICONS STORED IN BACKEND AND DISLAYED IN PROCEDURES PAGE CAN BE MODIFIED THROUGH DIAGNOSIS COPY
    e.preventDefault();
    const droppedDot = e.dataTransfer.getData("text");
    const procedureFee = e.dataTransfer.getData("procFee");

    const newStateEntry = {
      draggable_icon: droppedDot,
      tooth_number: toothNumber,
      uniqueId: formId,
    };

    const newStateImplant = (implantDescription) => ({
      draggable_icon: implantDescription,
      tooth_number: toothNumber,
      uniqueId: formId,
    });

    const tableInterventions = {
      draggable_icon: droppedDot,
      tooth_number: toothNumber,
      uniqueId: formId,
      proc_fee: procedureFee,
    };

    // HERLPER FUNCTION: allow to drop icons that will change the upper and lower tooth array such as extraction
    // implant , implant top and pontic
    const updateTeethImages = (teethArray, newAttributes) => {
      return teethArray.map((item) => {
        if (item.tooth_number === toothNumber) {
          return { ...item, ...newAttributes };
        }
        return item;
      });
    };

    // HELPER FUNCTION : do not allow to drop the icon when you are dragging first an extraction
    // then right after you drag an abscess, do not allow this
    const cannotDropTheseIcons = (
      teethArray,
      toothNumber,
      conditions,
      allowOnly = false,
    ) => {
      return teethArray.some((item) => {
        if (item.tooth_number !== toothNumber) return false;
        const matchesCondition = conditions.some(
          (condition) => item.tooth_path === condition.tooth_path,
        );
        return allowOnly ? !matchesCondition : matchesCondition;
      });
    };

    // if the tooth is previously extracted and you come after months to add an implant or a top implant
    // enable this or if the tooth has no icons also enable this only
    const addImplantAfterExtraction = (toothNumber) => {
      const updatedProcedures = { ...proceduresMap };
      const findTooth = updatedProcedures[toothNumber];
      if (findTooth && findTooth.includes(draggableIconsMap.Extraction)) {
        updatedProcedures[toothNumber] = [];
        setProceduresMap(updatedProcedures);
        return true;
      }
      if (!findTooth) {
        return true;
      }
      return false;
    };

    // the below function is addressed to diagnosis page and diagnosis copy only . it disallow dropping of icons
    // on other icons that are already stored in database
    const doNotAllowToDropIcon = (toothNumber, diagnosisPage) => {
      const existingTooth = diagnosisPage[toothNumber.toString()] || [];

      // Common exclusions for all scenarios
      let commonExclusions = [
        draggableIconsMap.Extraction,
        draggableIconsMap.Pontic_Failed,
        draggableIconsMap.Pontic_Successful,
        draggableIconsMap.Failed_Implant,
        draggableIconsMap.Successful_Implant,
        draggableIconsMap.Failed_Root_Middle,
        draggableIconsMap.Successful_Root_Middle,
        draggableIconsMap.Abscess,
        draggableIconsMap.Failed_Crown,
        draggableIconsMap.Successful_Crown,
        draggableIconsMap.Failed_Root_Left,
        draggableIconsMap.Successful_Root_Left,
        draggableIconsMap.Failed_Root_Right,
        draggableIconsMap.Successful_Root_Right,
      ];

      // allow dragging left root if there is already right root available on tooth
      if (
        droppedDot === draggableIconsMap.Failed_Root_Left ||
        droppedDot === draggableIconsMap.Successful_Root_Left
      ) {
        commonExclusions = commonExclusions.filter((item) => {
          return (
            item !== draggableIconsMap.Failed_Root_Right &&
            item !== draggableIconsMap.Successful_Root_Right
          );
        });
        // allow dragging right root if there is already left root available on tooth
      } else if (
        droppedDot === draggableIconsMap.Failed_Root_Right ||
        droppedDot === draggableIconsMap.Successful_Root_Right
      ) {
        commonExclusions = commonExclusions.filter(
          (item) =>
            item !== draggableIconsMap.Failed_Root_Left &&
            item !== draggableIconsMap.Successful_Root_Left,
        );
      }

      return commonExclusions.some((icon) => existingTooth.includes(icon));
    };

    // Add Charges to the table
    const addChargesToTable = () => {
      setPatientDiagnosisInTable((prevState) => [
        ...prevState,
        tableInterventions,
      ]);
    };

    // display icon on tooth
    const displayIconOnTooth = (setIconOnTooth) => {
      setIconOnTooth((prevState) => ({
        ...prevState,
        [toothNumber]: newStateEntry,
      }));
    };

    // add top implant after implant have been done and stored in database. for diagnosis page and diagnosis copy in procedure page.
    const addImplantTopToStoredImplant = (
      interventionPage,
      toothNumber,
      setImplantOnTooth,
    ) => {
      const findProcedure = interventionPage[toothNumber].find(
        (item) =>
          item === draggableIconsMap.Failed_Implant ||
          item === draggableIconsMap.Successful_Implant,
      );
      if (findProcedure) {
        interventionPage[toothNumber] = [];
        setImplantOnTooth((prevState) => ({
          ...prevState,
          [toothNumber]: newStateImplant(findProcedure),
        }));
      }
      const updatedTooth = {
        tooth_path: "implant",
        composite_circle: "topImplant",
      };
      const updatedUpperTeeth = updateTeethImages(
        upperToothImages,
        updatedTooth,
      );
      const updatedLowerTeeth = updateTeethImages(
        lowerToothImages,
        updatedTooth,
      );

      setUpperToothImages(updatedUpperTeeth);
      setLowerToothImages(updatedLowerTeeth);

      addChargesToTable();
      displayIconOnTooth(setTopImplantOnTooth);
    };

    // check if there is an implant before adding the top implant
    const checkForImplant = (pageArray) => {
      const implantItem = pageArray[toothNumber]?.find(
        (item) =>
          item === draggableIconsMap.Successful_Implant ||
          item === draggableIconsMap.Failed_Implant,
      );
      return implantItem;
    };

    // do not allow to drop these icons right after drag and drop
    const iconsNotAllowedToDrop = (iconsNotAllowed, toothNumber) => {
      const toothData = {
        root_middle: rootMiddleOnTooth[toothNumber]?.draggable_icon || "",
        root_left: rootLeftOnTooth[toothNumber]?.draggable_icon || "",
        root_right: rootRightOnTooth[toothNumber]?.draggable_icon || "",
        crown: crownOnTooth[toothNumber]?.draggable_icon || "",
        abscess: abscessOnTooth[toothNumber]?.draggable_icon || "",
      };
      for (let position in toothData) {
        if (iconsNotAllowed.includes(toothData[position])) {
          return true;
        }
      }
      return false;
    };

    const restrictedIcons = [
      draggableIconsMap.Failed_Root_Middle,
      draggableIconsMap.Failed_Root_Right,
      draggableIconsMap.Failed_Root_Left,
      draggableIconsMap.Successful_Root_Left,
      draggableIconsMap.Successful_Root_Middle,
      draggableIconsMap.Successful_Root_Right,
      draggableIconsMap.Successful_Crown,
      draggableIconsMap.Failed_Crown,
      draggableIconsMap.Abscess,
    ];
    const activeDiagnosisPage = isDiagnosisPage ? diagnosisMap : diagnosisCopy;

    const itemsRestricted = [
      draggableIconsMap.Successful_Crown,
      draggableIconsMap.Failed_Crown,
      draggableIconsMap.Abscess,
    ];

    // start HERE
    if (droppedDot === draggableIconsMap.Abscess) {
      // DO not allow to drop abscess right after having a root canal  on the tooth
      if (iconsNotAllowedToDrop(restrictedIcons, toothNumber)) {
        return;
      }
      // do not allow drag and drop abscess right after dragging and dropping extraction,pontic or implant
      const conditions = [
        { tooth_path: draggableIconsMap.Extraction },
        { tooth_path: "pontic" },
        { tooth_path: "implant" },
      ];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }
      // abscess is only available in diagnosis page, do not allow to drag an abscess to
      // a tooth with extracted icon, pontic, root canal, implant that is previously stored in database

      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }
      // set the Abscess on the tooth chart
      displayIconOnTooth(setAbscessOnTooth);
      // charge the Abscess in the table
      addChargesToTable();
    } else if (
      droppedDot === draggableIconsMap.Pontic_Failed ||
      droppedDot === draggableIconsMap.Pontic_Successful
    ) {
      // do not allow to drag and drop pontic right after having a tooth with root canal, crown, abscess
      if (iconsNotAllowedToDrop(restrictedIcons, toothNumber)) {
        return;
      }
      // do not allow to drag and drop pontic right after you drag extracted tooth or implant
      const conditions = [
        { tooth_path: "extracted" },
        { tooth_path: "implant" },
      ];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }

      // do not allow to drag and drop pontic to icons that are stored in database
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }

      // update the chart by changing tooth_path to pontic so i can display the pontic later on
      const updatedUpperTooth = updateTeethImages(upperToothImages, {
        tooth_path: "pontic",
      });
      const updatedLowerTeeth = updateTeethImages(lowerToothImages, {
        tooth_path: "pontic",
      });
      setUpperToothImages(updatedUpperTooth);
      setLowerToothImages(updatedLowerTeeth);

      addChargesToTable();
      displayIconOnTooth(setPonticOnTooth);
    } else if (droppedDot === draggableIconsMap.Implant_Top) {
      // the below code is when you drag and drop the implant top on a stored implant / implant already available
      if (isDiagnosisPage) {
        // dropping to diagnosis page
        if (checkForImplant(diagnosisMap)) {
          addImplantTopToStoredImplant(
            diagnosisMap,
            toothNumber,
            setImplantOnTooth,
          );
        }
      } else {
        // dropping to procedures
        // (for diagnosis copy, we need to delete first before dragging)
        if (checkForImplant(proceduresMap)) {
          addImplantTopToStoredImplant(
            proceduresMap,
            toothNumber,
            setImplantOnTooth,
          );
        }
      }
      // the below code is only applicable if i am trying to drag and drop a top implant first time to
      // a tooth that has no tooth_path ="implant"
      // do not allow to drag and drop implant top on chart and in table unless the tooth path is implant only
      const conditions = [{ tooth_path: "implant" }];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions, true) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions, true)
      ) {
        return;
      }
      //  the below is only applicable when you have an implant on the tooth but not yet stored / form not submitted
      // and you need to add the top implant right away
      const updatedUpperTeeth = updateTeethImages(upperToothImages, {
        composite_circle: "topImplant",
      });
      const updatedLowerTeeth = updateTeethImages(lowerToothImages, {
        composite_circle: "topImplant",
      });
      setUpperToothImages(updatedUpperTeeth);
      setLowerToothImages(updatedLowerTeeth);

      // show the top implant diagnosis or pocedure in the charging table
      addChargesToTable();
      // display top implant on tooth
      displayIconOnTooth(setTopImplantOnTooth);
    } else if (
      droppedDot === draggableIconsMap.Successful_Root_Left ||
      droppedDot === draggableIconsMap.Failed_Root_Left
    ) {
      // do not allow to drag root left right after having a crown or abscess for a non submitted form
      if (iconsNotAllowedToDrop(itemsRestricted, toothNumber)) {
        return;
      }

      // do not allow to drag and drop a root left canal if the tooth extracted, pontic or implant
      // and dragging is happening now before submitting the form
      const conditions = [
        { tooth_path: "extracted" },
        { tooth_path: "pontic" },
        { tooth_path: "implant" },
      ];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }
      // do not allow to drag a root left to an icon that is already stored on a tooth in our database
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }

      // do not allow to add left root canal on tooth that are not Molar tooth
      if (isToothWithOneRoot(toothNumber)) {
        // display root left on tooth
        displayIconOnTooth(setRootLeftOnTooth);
        // display root left diagnosis or procedure in table
        addChargesToTable();
      }
    } else if (
      droppedDot === draggableIconsMap.Successful_Root_Middle ||
      droppedDot === draggableIconsMap.Failed_Root_Middle
    ) {
      // do not allow to drag and drop a root middle canal if the tooth extracted, pontic or implant
      const conditions = [
        { tooth_path: "extracted" },
        { tooth_path: "pontic" },
        { tooth_path: "implant" },
      ];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }

      // do not allow to drag a root middle to an icon that is already stored on a tooth in our database
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }

      // do not allow middle root to be added in Molar tooth
      if (isToothWithTwoRoots(toothNumber)) {
        // display on tooth
        displayIconOnTooth(setRootMiddleOnTooth);
        // charge in table
        addChargesToTable();
      }
    } else if (
      droppedDot === draggableIconsMap.Successful_Root_Right ||
      droppedDot === draggableIconsMap.Failed_Root_Right
    ) {
      // do not allow to drag and drop a root right canal if the tooth extracted, pontic or implant
      const conditions = [
        { tooth_path: "extracted" },
        { tooth_path: "pontic" },
        { tooth_path: "implant" },
      ];
      // during drag and drop , if you changed a tooth to extracted , you cannot drag root canal to it
      // this happend before submission of the form
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }
      // do not allow to drag a root right to an icon that is already stored on a tooth in our database
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }

      // do not allow right root canal to be placed on below tooth numbers
      if (isToothWithOneRoot(toothNumber)) {
        // display in tooth chart
        displayIconOnTooth(setRootRightOnTooth);
        // add in table
        addChargesToTable();
      }
    } else if (droppedDot === draggableIconsMap.Extraction) {
      // do not allow to drag and drop extraction to icons that are stored in database
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }
      // update tooth path and composite circle to extracted
      const updatedUpperTeeth = updateTeethImages(upperToothImages, {
        tooth_path: "extracted",
        composite_circle: "extracted",
      });
      const updatedLowerTeeth = updateTeethImages(lowerToothImages, {
        tooth_path: "extracted",
        composite_circle: "extracted",
      });

      setUpperToothImages(updatedUpperTeeth);
      setLowerToothImages(updatedLowerTeeth);

      // add in table
      addChargesToTable();
    } else if (
      droppedDot === draggableIconsMap.Successful_Crown ||
      droppedDot === draggableIconsMap.Failed_Crown
    ) {
      // the following conditions applies in case of : if you drag an extracted icon to a tooth
      // the tooth path will become extracted so in case you are then dragging a crown to the extracted tooth
      // you won't be able to drag nor to charge the crown it will return - this all happen in one session before submitting
      // anything to backend
      const conditions = [
        { tooth_path: "extracted" },
        { tooth_path: "implant" },
        { tooth_path: "pontic" },
      ];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }

      // do not allow to drag a crown to an icon that is already stored on a tooth in our database
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }

      displayIconOnTooth(setCrownOnTooth);
      addChargesToTable();
    } else if (
      droppedDot === draggableIconsMap.Successful_Implant ||
      droppedDot === draggableIconsMap.Failed_Implant
    ) {
      // only allow to drag an implant to an extracted tooth that is previously stored or to an empty tooth
      if (!addImplantAfterExtraction(toothNumber)) {
        return;
      }

      const updatedUpperTeeth = updateTeethImages(upperToothImages, {
        tooth_path: "implant",
        composite_circle: "implant",
      });
      const updatedLowerTeeth = updateTeethImages(lowerToothImages, {
        tooth_path: "implant",
        composite_circle: "implant",
      });
      setUpperToothImages(updatedUpperTeeth);
      setLowerToothImages(updatedLowerTeeth);

      // display on tooth chart
      displayIconOnTooth(setImplantOnTooth);
      // add to table
      addChargesToTable();
    } else if (
      droppedDot === draggableIconsMap.Composite_Buccal_Failed ||
      droppedDot === draggableIconsMap.Composite_Buccal_Successful
    ) {
      const conditions = [
        { tooth_path: "extracted" },
        { tooth_path: "implant" },
        { tooth_path: "pontic" },
      ];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }
      // do not allow to drop a buccal composite on a previously stored icon tooth
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }
      displayIconOnTooth(setBuccalCompositeOnTooth);
      addChargesToTable();
    } else if (
      droppedDot === draggableIconsMap.Composite_Mesial_Failed ||
      droppedDot === draggableIconsMap.Composite_Mesial_Successful
    ) {
      const conditions = [
        { tooth_path: "extracted" },
        { tooth_path: "implant" },
        { tooth_path: "pontic" },
      ];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }

      // do not allow to drop a buccal composite on a tooth with previously stored icon
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }
      displayIconOnTooth(setMesialCompositeOnTooth);
      addChargesToTable();
    } else if (
      droppedDot === draggableIconsMap.Composite_Distal_Successful ||
      droppedDot === draggableIconsMap.Composite_Distal_Failed
    ) {
      const conditions = [
        { tooth_path: "extracted" },
        { tooth_path: "implant" },
        { tooth_path: "pontic" },
      ];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }

      // do not allow to drop a buccal composite on an extracted tooth or pontic tooth
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }
      displayIconOnTooth(setDistalCompositeOnTooth);
      addChargesToTable();
    } else if (
      droppedDot === draggableIconsMap.Composite_Lingual_Failed ||
      droppedDot === draggableIconsMap.Composite_Lingual_Successful
    ) {
      const conditions = [
        { tooth_path: "extracted" },
        { tooth_path: "implant" },
        { tooth_path: "pontic" },
      ];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }
      // do not allow to drop a buccal composite on an extracted tooth or pontic tooth
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }
      displayIconOnTooth(setLingualCompositeOnTooth);
      addChargesToTable();
    } else if (
      droppedDot === draggableIconsMap.Composite_Occlusal_Successful ||
      droppedDot === draggableIconsMap.Composite_Occlusal_Failed
    ) {
      const conditions = [
        { tooth_path: "extracted" },
        { tooth_path: "implant" },
        { tooth_path: "pontic" },
      ];
      if (
        cannotDropTheseIcons(upperToothImages, toothNumber, conditions) ||
        cannotDropTheseIcons(lowerToothImages, toothNumber, conditions)
      ) {
        return;
      }

      // do not allow to drop a buccal composite on an extracted tooth or pontic tooth
      if (doNotAllowToDropIcon(toothNumber, activeDiagnosisPage)) {
        return;
      }
      displayIconOnTooth(setOcclucalCompositeOnTooth);
      addChargesToTable();
    } else {
      return;
    }
  };

  // delete icon on tooth
  const handleDeleteIconOnTooth = (description, tooth_number, uniqueId) => {
    // HELPER function to remove icons from tooth chart
    const removeIconOnTooth = (iconObject, uniqueId, updateState) => {
      const updatedIconObject = { ...iconObject };
      for (let key in updatedIconObject) {
        if (updatedIconObject[key].uniqueId === uniqueId) {
          delete updatedIconObject[key];
          break;
        }
      }
      updateState(updatedIconObject);
    };
    // reset tooth chart image to previous status when click delete from the table
    const remove_diagnosed_items_when_table_delete = (
      iconObject,
      updateState,
      toothNumber,
    ) => {
      const remaining_icons = Object.keys(iconObject)
        .filter((key) => key !== toothNumber)
        .reduce((acc, key) => {
          acc[key] = iconObject[key];
          return acc;
        }, {});
      updateState(remaining_icons);
    };

    const diagnosesToRemove = [
      "Implant_Top",
      "Failed_Implant",
      "Successful_Implant",
    ];
    // remove diagnosis from the table
    const remaining_diagnosis = patientDiagnosisInTable.filter((item) => {
      if (item.uniqueId === uniqueId) {
        return false;
      }
      if (description === "Extraction" && item.tooth_number === tooth_number) {
        return false;
      }
      if (
        diagnosesToRemove.includes(description) &&
        item.tooth_number === tooth_number
      ) {
        return false;
      }
      return true;
    });
    setPatientDiagnosisInTable(remaining_diagnosis);

    // remove diagnosis icon from the chart
    if (description === draggableIconsMap.Abscess) {
      removeIconOnTooth(abscessOnTooth, uniqueId, setAbscessOnTooth);
    } else if (
      description === draggableIconsMap.Failed_Root_Left ||
      description === draggableIconsMap.Successful_Root_Left
    ) {
      removeIconOnTooth(rootLeftOnTooth, uniqueId, setRootLeftOnTooth);
    } else if (
      description === draggableIconsMap.Failed_Root_Middle ||
      description === draggableIconsMap.Successful_Root_Middle
    ) {
      removeIconOnTooth(rootMiddleOnTooth, uniqueId, setRootMiddleOnTooth);
    } else if (
      description === draggableIconsMap.Failed_Root_Right ||
      description === draggableIconsMap.Successful_Root_Right
    ) {
      removeIconOnTooth(rootRightOnTooth, uniqueId, setRootRightOnTooth);
    } else if (
      description === draggableIconsMap.Failed_Crown ||
      description === draggableIconsMap.Successful_Crown
    ) {
      removeIconOnTooth(crownOnTooth, uniqueId, setCrownOnTooth);
    } else if (
      description === draggableIconsMap.Composite_Lingual_Failed ||
      description === draggableIconsMap.Composite_Lingual_Successful
    ) {
      removeIconOnTooth(
        lingualCompositeOnTooth,
        uniqueId,
        setLingualCompositeOnTooth,
      );
    } else if (
      description === draggableIconsMap.Composite_Occlusal_Failed ||
      description === draggableIconsMap.Composite_Occlusal_Successful
    ) {
      removeIconOnTooth(
        occlusalCompositeOnTooth,
        uniqueId,
        setOcclucalCompositeOnTooth,
      );
    } else if (
      description === draggableIconsMap.Composite_Distal_Failed ||
      description === draggableIconsMap.Composite_Distal_Successful
    ) {
      removeIconOnTooth(
        distalCompositeOnTooth,
        uniqueId,
        setDistalCompositeOnTooth,
      );
    } else if (
      description === draggableIconsMap.Composite_Buccal_Failed ||
      description === draggableIconsMap.Composite_Buccal_Successful
    ) {
      removeIconOnTooth(
        buccalCompositeOnTooth,
        uniqueId,
        setBuccalCompositeOnTooth,
      );
    } else if (
      description === draggableIconsMap.Composite_Mesial_Failed ||
      description === draggableIconsMap.Composite_Mesial_Successful
    ) {
      removeIconOnTooth(
        mesialCompositeOnTooth,
        uniqueId,
        setMesialCompositeOnTooth,
      );
    }
    // reset tooth which are extracted, pontic, implant to original tooth in chart when click delete from table
    // this is only happens when i drag and drop the icon before submitting the form
    const newAttributes = {
      composite_circle: `${basePath}/tooth_images/circle.png`,
      tooth_path: `${basePath}/tooth_images/${tooth_number}-min.svg`,
    };

    // this is happening in the procedure page
    // remove the icons that are coming from the diagnosis page and are in the procedure page
    remove_diagnosed_items_when_table_delete(
      diagnosisCopy,
      setDiagnosisCopy,
      tooth_number,
    );

    // this is happening in the diagnosis page , remove old diagnosed icons and replace with extraction
    if (isDiagnosisPage) {
      remove_diagnosed_items_when_table_delete(
        diagnosisMap,
        setDiagnosisMap,
        tooth_number,
      );
    }

    // this is changing the upper and lower tooth the time i drag and drop and not previously stored icons
    const updateToothImages = (toothImages, tooth_number, newAttributes) => {
      return toothImages.map((item) => {
        const isMatchingTooth = item.tooth_number === tooth_number;

        if (!isMatchingTooth) {
          return item; // Return unchanged if tooth_number doesn't match
        }

        // Define conditions to update based on tooth_path and composite_circle
        const conditionsToUpdate = [
          { path: "extracted" },
          { path: "pontic" },
          { path: "implant", composite: "topImplant" },
          { path: "implant", composite: "implant" },
        ];

        // Check if the item matches any of the conditions
        const shouldUpdate = conditionsToUpdate.some((condition) => {
          return (
            item.tooth_path === condition.path &&
            (!condition.composite ||
              item.composite_circle === condition.composite)
          );
        });

        // If the item matches, update it with the new attributes
        if (shouldUpdate) {
          return {
            ...item,
            ...newAttributes,
          };
        }
        return item; // Return unchanged if no match
      });
    };

    // Update both upper and lower tooth images
    const updatedUpperImages = updateToothImages(
      upperToothImages,
      tooth_number,
      newAttributes,
    );
    setUpperToothImages(updatedUpperImages);

    const updatedLowerImages = updateToothImages(
      lowerToothImages,
      tooth_number,
      newAttributes,
    );
    setLowerToothImages(updatedLowerImages);
  };

  // drag over
  const handleDragOverIconTooth = (e) => {
    e.preventDefault();
  };

  // clear tooth chart and table after submitting diangosis form or procedure form
  const clearToothChartAndTable = () => {
    // clear the table after submission
    setPatientDiagnosisInTable([]);

    // clear the chart after submission
    setAbscessOnTooth({});
    setRootLeftOnTooth({});
    setRootMiddleOnTooth({});
    setRootRightOnTooth({});
    setBuccalCompositeOnTooth({});
    setOcclucalCompositeOnTooth({});
    setMesialCompositeOnTooth({});
    setLingualCompositeOnTooth({});
    setDistalCompositeOnTooth({});
    setCrownOnTooth({});
    // reset tooth after extraction or pontic or implant
    setUpperToothImages(defaultUpperToothImages);
    setLowerToothImages(defaultLowerToothImages);
  };

  // submit form
  const handleSubmitDiagnosisForm = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const resdata = await fetchData("/store_diagnosis", "POST", data);
      setInterventionMessage(resdata.message);
      setMessageTimer(true);
      setTimeout(() => {
        setMessageTimer(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
    // clear the table after submission and the chart
    clearToothChartAndTable();
    setDiagnosisDataManually([]);
    setPreviousDiagnosis([]);
    setSelectedNames([]);
    handleCloseToothChartModal()
  };

  // submit procedure form
  const handleSubmitProcedureForm = async (event) => {
    event.preventDefault();
    handleCloseToothChartModal()
    if (selectedNames.length === 0) return;

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const fields = [
      "procDescription",
      "procTooth",
      "procFee",
      "procDiscount",
      "procStatus",
      "procNotes",
      "procDate",
    ];

    const payload = fields.reduce(
      (acc, key) => {
        const array = Object.keys(data)
          .filter(
            (dataKey) =>
              dataKey.startsWith(key) || dataKey.startsWith(`${key}Manual`),
          )
          .map((dataKey) => data[dataKey]);

        acc[getPayloadKey(key)] = array;
        return acc;
      },
      { hiddenId: data["patient_id"] },
    );

    try {
      const resdata = await fetchData("/treatment-plan", "POST", payload);
      handleSuccessMessage(resdata.message);

      await fetchData("/store_copy_diagnosis", "POST", {
        patient_id: data["patient_id"],
        diagnosis: diagnosisCopy,
      });
    } catch (error) {
      console.error("Error submitting procedure form:", error);
    }

    resetFormState();

  };

  // Helper function to determine the payload key for a field
  const getPayloadKey = (key) => {
    const mapping = {
      procDescription: "procedureDescription",
      procTooth: "toothNumber",
      procFee: "procedureFee",
      procDiscount: "discount",
      procStatus: "status",
      procNotes: "notes",
      procDate: "date",
    };
    return mapping[key];
  };

  // Helper function to handle success message display
  const handleSuccessMessage = (message) => {
    setInterventionMessage(message);
    setMessageTimer(true);
    setTimeout(() => setMessageTimer(false), 3000);
  };

  // Helper function to reset form state
  const resetFormState = () => {
    setProcedureDataManually([]);
    clearToothChartAndTable();
    setSelectedNames([]);
    setDiagnosisDataManually([]);
    setPreviousDiagnosis([]);
    setDiagnosisCopy({});
    setStoredDiagnosis({});
  };

  // the below function purpose is to check the previously stored diagnosis and get them to display on chart
  // in procedure page, we will see the diagnosis that were done and the related changes of those diagnosis icons
  const GetStoredDiagnosis = (toothNumber) => {
    const interventionForTooth = isDiagnosisPage
      ? diagnosisMap[toothNumber] || []
      : diagnosisCopy[toothNumber] || [];

    return {
      previouslyExtracted: interventionForTooth.includes(
        draggableIconsMap.Extraction,
      ),
      previouslyPonticFailed: interventionForTooth.includes(
        draggableIconsMap.Pontic_Failed,
      ),
      previouslyPonticSuccess: interventionForTooth.includes(
        draggableIconsMap.Pontic_Successful,
      ),
      previouslyAbscess: interventionForTooth.includes(
        draggableIconsMap.Abscess,
      ),

      previousImplantFailed: interventionForTooth.includes(
        draggableIconsMap.Failed_Implant,
      ),
      previousImplantSuccess: interventionForTooth.includes(
        draggableIconsMap.Successful_Implant,
      ),
      previousTopImplant: interventionForTooth.includes(
        draggableIconsMap.Implant_Top,
      ),
      previouslySuccessRootLeft: interventionForTooth.includes(
        draggableIconsMap.Successful_Root_Left,
      ),
      previouslyFailedRootLeft: interventionForTooth.includes(
        draggableIconsMap.Failed_Root_Left,
      ),
      previouslySuccessRootMiddle: interventionForTooth.includes(
        draggableIconsMap.Successful_Root_Middle,
      ),
      previouslyFailedRootMiddle: interventionForTooth.includes(
        draggableIconsMap.Failed_Root_Middle,
      ),
      previouslySuccessRootRight: interventionForTooth.includes(
        draggableIconsMap.Successful_Root_Right,
      ),
      previouslyFailedRootRight: interventionForTooth.includes(
        draggableIconsMap.Failed_Root_Right,
      ),
      previouslyFailedCrown: interventionForTooth.includes(
        draggableIconsMap.Failed_Crown,
      ),
      previouslySuccessCrown: interventionForTooth.includes(
        draggableIconsMap.Successful_Crown,
      ),
      previouslyFailedDistal: interventionForTooth.includes(
        draggableIconsMap.Composite_Distal_Failed,
      ),
      previouslySuccessDistal: interventionForTooth.includes(
        draggableIconsMap.Composite_Distal_Successful,
      ),
      previouslyFailedMesial: interventionForTooth.includes(
        draggableIconsMap.Composite_Mesial_Failed,
      ),
      previouslySuccessMesial: interventionForTooth.includes(
        draggableIconsMap.Composite_Mesial_Successful,
      ),
      previouslyFailedLingual: interventionForTooth.includes(
        draggableIconsMap.Composite_Lingual_Failed,
      ),
      previouslySuccessLingual: interventionForTooth.includes(
        draggableIconsMap.Composite_Lingual_Successful,
      ),
      previouslyFailedBuccal: interventionForTooth.includes(
        draggableIconsMap.Composite_Buccal_Failed,
      ),
      previouslySuccessBuccal: interventionForTooth.includes(
        draggableIconsMap.Composite_Buccal_Successful,
      ),
      previouslyFailedOcclusal: interventionForTooth.includes(
        draggableIconsMap.Composite_Occlusal_Failed,
      ),
      previouslySuccessOcclusal: interventionForTooth.includes(
        draggableIconsMap.Composite_Occlusal_Successful,
      ),
    };
  };

  const GetStoredProcedures = (toothNumber) => {
    const proceduresOnTooth = proceduresMap?.[toothNumber] || [];

    return {
      previousExtractedProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Extraction,
      ),
      previousPonticSuccessProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Pontic_Successful,
      ),
      previousImplantSuccessProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Successful_Implant,
      ),
      previousTopImplantProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Implant_Top,
      ),
      previousSuccessRootLeftProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Successful_Root_Left,
      ),
      previousSuccessRootMiddleProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Successful_Root_Middle,
      ),
      previousSuccessRootRightProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Successful_Root_Right,
      ),
      previousSuccessCrownProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Successful_Crown,
      ),
      previousSuccessDistalProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Composite_Distal_Successful,
      ),
      previousSuccessMesialProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Composite_Mesial_Successful,
      ),
      previousSuccessLingualProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Composite_Lingual_Successful,
      ),
      previousSuccessBuccalProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Composite_Buccal_Successful,
      ),
      previousSuccessOcclusalProcedures: proceduresOnTooth.includes(
        draggableIconsMap.Composite_Occlusal_Successful,
      ),
    };
  };
  const displayIconsOnChart = (toothNumber) => {
    return {
      draggableIconOcclusal:
        occlusalCompositeOnTooth[toothNumber]?.draggable_icon,

      draggableIconLingual:
        lingualCompositeOnTooth[toothNumber]?.draggable_icon,

      draggableIconMesial: mesialCompositeOnTooth[toothNumber]?.draggable_icon,

      draggableIconBuccal: buccalCompositeOnTooth[toothNumber]?.draggable_icon,

      draggableIconDistal: distalCompositeOnTooth[toothNumber]?.draggable_icon,

      draggableIconRootLeft: rootLeftOnTooth[toothNumber]?.draggable_icon,
      toothNumberRootLeft: rootLeftOnTooth[toothNumber]?.tooth_number,

      draggableIconRootMiddle: rootMiddleOnTooth[toothNumber]?.draggable_icon,
      toothNumberRootMiddle: rootMiddleOnTooth[toothNumber]?.tooth_number,

      draggableIconRootRight: rootRightOnTooth[toothNumber]?.draggable_icon,
      toothNumberRootRight: rootRightOnTooth[toothNumber]?.tooth_number,

      draggableIconAbscess: abscessOnTooth[toothNumber]?.draggable_icon,
      toothNumberAbscess: abscessOnTooth[toothNumber]?.tooth_number,

      draggableIconTopImplant: topImplantOnTooth[toothNumber]?.draggable_icon,

      draggableIconImplant: implantOnTooth[toothNumber]?.draggable_icon,

      draggableIconCrown: crownOnTooth[toothNumber]?.draggable_icon,

      draggableIconPontic: ponticOnTooth[toothNumber]?.draggable_icon,
    };
  };

  // display composites & crowns on tooth on spot and get stored ones and display them
  const renderCrownComposites = (
    toothNumber,
    toothImagesToothNumber,
    draggableIcon,
    FailedIcon,
    SuccessIcon,
    previousSuccessIcon,
    previousFailedIcon,
    svgClass,
    successClass,
    failedClass,
    procClass,
    x,
    y,
    viewbox,
    previousCrownProcedures,
    r,
    svgShape,
  ) => {
    const shouldRender =
      draggableIcon === FailedIcon ||
      draggableIcon === SuccessIcon ||
      (toothImagesToothNumber === toothNumber &&
        (previousFailedIcon || previousSuccessIcon)) ||
      (toothImagesToothNumber === toothNumber && previousCrownProcedures);
    if (!shouldRender) {
      return;
    }
    const className = isDiagnosisPage
      ? // when is diagnosis page is true , check if draggable icon === failed icon or previouslystored icons then
        // give me failed classs or display success class
        draggableIcon === FailedIcon || previousFailedIcon
        ? failedClass
        : successClass
      : // if diagnosis page is false,
        previousFailedIcon
        ? failedClass
        : // if previuosly failed icon is false we check
          draggableIcon === SuccessIcon || previousCrownProcedures
          ? procClass
          : successClass;

    return (
      <svg className={svgClass} viewBox={viewbox}>
        {svgShape === "circle" ? (
          <circle cx={x} cy={y} r={r} className={className} />
        ) : (
          <rect x={x} y={y} className={className} />
        )}
      </svg>
    );
  };

  const renderComposites = (
    AllTeeth,
    toothNumber,
    tooth_number,
    draggableIconCrown,
    draggableIconFailed,
    draggableIconSuccess,
    previouslySuccessCrown,
    previouslyFailedCrown,
    crownSVG,
    successCrown,
    failedCrown,
    procCrown,
    xAxis,
    y,
    viewBox,
    previousCrownProcedures,
    rad,
    svgShape,
  ) =>
    AllTeeth.map((toothNumber) => (
      <React.Fragment key={toothNumber}>
        {renderCrownComposites(
          toothNumber,
          tooth_number,
          draggableIconCrown,
          draggableIconFailed,
          draggableIconSuccess,
          previouslySuccessCrown,
          previouslyFailedCrown,
          crownSVG,
          successCrown,
          failedCrown,
          procCrown,
          xAxis,
          y,
          viewBox,
          previousCrownProcedures,
          rad,
          svgShape,
        )}
      </React.Fragment>
    ));

  // display Abscess on tooth and get stored ones to display them
  // this is only done in diagnosis , procedure does not have abscess coz treatment is through root canal
  const renderAbscess = (
    toothNumberAbscess,
    toothNumber,
    toothImagesToothNumber,
    draggableIconAbscess,
    draggableIconAbscessDescription,
    previousAbscess,
    svgClass,
    pathClass,
  ) => {
    const shouldRender =
      (toothNumberAbscess === toothNumber &&
        draggableIconAbscess === draggableIconAbscessDescription) ||
      (previousAbscess && toothImagesToothNumber === toothNumber);
    if (!shouldRender) {
      return;
    }
    const className_svg = `${svgClass}-${toothNumber}`;

    const className_path =
      // since we do not have abscess in red for procedures , the red abscess is treated
      // by a root canal treatment.
      previousAbscess ||
      draggableIconAbscess === draggableIconAbscessDescription
        ? pathClass
        : "";

    const svgPath =
      svgPathsAbscessUp[toothNumber] || svgPathsAbscessDown[toothNumber];
    return (
      <svg className={className_svg} viewBox="0 0 100 60">
        <path d={svgPath} className={className_path} />
      </svg>
    );
  };

  // display root canals and get root canal stored and display them
  const renderRootSvg = (
    toothNumberPosition,
    toothNumber,
    ToothImagesToothNumber,
    draggableIconPosition,
    draggableIconPositionFailed,
    draggableIconPositionSuccess,
    previouslySuccessRoot,
    previouslyFailedRoot,
    failedClass,
    successClass,
    procClass,
    svgClass,
    svgSide,
    previousSuccessRootProcedures,
  ) => {
    const shouldRender =
      (toothNumberPosition === toothNumber &&
        (draggableIconPosition === draggableIconPositionFailed ||
          draggableIconPosition === draggableIconPositionSuccess)) ||
      (ToothImagesToothNumber === toothNumber &&
        (previouslyFailedRoot || previouslySuccessRoot)) ||
      (ToothImagesToothNumber === toothNumber && previousSuccessRootProcedures);

    if (!shouldRender) return null;
    const className = isDiagnosisPage
      ? // we check if we are in diagnosis page, if we are dragging an icon or we are getting the icon
        // from the stored icons in database so it is red for failed and green for success
        draggableIconPosition === draggableIconPositionFailed ||
        previouslyFailedRoot
        ? failedClass
        : successClass
      : // if we are not in the diagnosis page, we check if we have stored roots in databases , add them
        // either as red for failed or green for success and if we are dragging right now in procedure
        // just add the procClass
        previouslyFailedRoot
        ? failedClass
        : draggableIconPosition === draggableIconPositionSuccess ||
            previousSuccessRootProcedures
          ? procClass
          : successClass;

    const svgPath =
      svgSide === "leftUp"
        ? svgPathsLeft[toothNumber]
        : svgSide === "rightUp"
          ? svgPathsRight[toothNumber]
          : svgSide === "middleUp"
            ? svgPathsMiddle[toothNumber]
            : svgSide === "leftDown"
              ? svgPathsLowerLeft[toothNumber]
              : svgSide === "rightDown"
                ? svgPathsLowerRight[toothNumber]
                : svgSide === "middleDown"
                  ? svgPathsLowerMiddle[toothNumber]
                  : null;

    return (
      <svg
        className={`${svgClass}-${toothNumber}`}
        viewBox={
          svgSide === "leftUp" ||
          svgSide === "rightUp" ||
          svgSide === "leftDown" ||
          svgSide === "rightDown"
            ? "0 0 20 88"
            : "0 0 20 235"
        }
      >
        <path d={svgPath} className={className} />
      </svg>
    );
  };

  const renderTeeth = (
    teethNumbers,
    toothNumberRoot,
    toothNumber,
    tooth_number,
    draggableIconRoot,
    failedIcon,
    successIcon,
    previouslySuccessRoot,
    previouslyFailedRoot,
    failedClass,
    successClass,
    procClass,
    svgClass,
    svgSide,
    previousSuccessRootProcedures,
  ) =>
    teethNumbers.map((toothNumber) => (
      <React.Fragment key={toothNumber}>
        {renderRootSvg(
          toothNumberRoot,
          toothNumber,
          tooth_number,
          draggableIconRoot,
          failedIcon,
          successIcon,
          previouslySuccessRoot,
          previouslyFailedRoot,
          failedClass,
          successClass,
          procClass,
          svgClass,
          svgSide,
          previousSuccessRootProcedures,
        )}
      </React.Fragment>
    ));

  return (
    <>
      <div className="diag-box">
        <form onSubmit={handleAddIntervention} className="icons-form">
          <div className="draggable-items">
            <p className="draggable-color">Draggable Elements</p>
            <Accordion className="custom-accordion">
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
                className="elements-font"
              >
                Tooth Drag
              </AccordionSummary>
              <AccordionDetails className="accord-details1">
                {icons.map((icon) => (
                  <div key={icon.name} className={icon.name}>
                    {/* Check if the icon has roots */}
                    {icon.roots ? (
                      <div className={`${icon.name}-container`}>
                        {/* Show failed roots if it's the diagnosis page */}
                        {isDiagnosisPage &&
                          icon.name === ROOT_FAILED &&
                          icon.roots.map((root) => (
                            <div
                              key={root.id}
                              draggable="true"
                              id={root.id}
                              className={`root-failed-${root.name}`}
                              onDragStart={(e) => handleDragStart(e, root.id)}
                            />
                          ))}

                        {/* Show success roots based on page type */}
                        {/*fees are only added to procedure page */}
                        {icon.name === ROOT_SUCCESS &&
                          icon.roots.map((root) => (
                            <div
                              key={root.id}
                              draggable="true"
                              id={root.id}
                              className={
                                isDiagnosisPage
                                  ? `root-success-${root.name} ${root.name}-success`
                                  : `root-success-${root.name} ${root.name}-proc`
                              }
                              onDragStart={(e) =>
                                handleDragStart(e, root.id, root.fee)
                              }
                            />
                          ))}
                      </div>
                    ) : (
                      // Render regular icon failed
                      <div
                        className={
                          isDiagnosisPage
                            ? `${icon.name}-container`
                            : `${icon.name}-container-proc`
                        }
                      >
                        <div
                          draggable="true"
                          id={isDiagnosisPage && icon.failedId}
                          className={isDiagnosisPage && icon.failedId}
                          onDragStart={(e) => handleDragStart(e, icon.failedId)}
                        />
                        {/*Render regular icon success or proc page */}
                        {/*show fees for successful icons on procedure page */}
                        <div
                          draggable="true"
                          id={icon.successId}
                          className={
                            isDiagnosisPage
                              ? `${icon.name}-icon`
                              : `${icon.name}-proc`
                          }
                          onDragStart={(e) =>
                            handleDragStart(e, icon.successId, icon.fee)
                          }
                        />
                      </div>
                    )}

                    <div className="icons-font-size">
                      {isDiagnosisPage || icon.label !== ROOT_FAILED_LABEL
                        ? icon.label
                        : ""}
                    </div>
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>

            <Accordion
              slotProps={{ heading: { component: "h4" } }}
              className="custom-accordion-composite"
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                className="elements-font"
              >
                Composite Drag
              </AccordionSummary>

              <AccordionDetails className="accord-details2">
                {areas.map((area) => (
                  <div key={area.name} className={area.name}>
                    {isDiagnosisPage && (
                      <div className={`${area.name}-icon-red`}>
                        <div
                          draggable="true"
                          id={area.failedId}
                          className={`draggable-${area.name}-red common-filling`}
                          onDragStart={(e) => handleDragStart(e, area.failedId)}
                        />
                      </div>
                    )}
                    <div
                      className={
                        isDiagnosisPage
                          ? `${area.name}-icon-green`
                          : `${area.name}-icon-proc`
                      }
                    >
                      <div
                        draggable="true"
                        id={area.successId}
                        className={`draggable-${area.name}-${isDiagnosisPage ? "green" : "proc"} common-filling`}
                        onDragStart={(e) =>
                          handleDragStart(e, area.successId, area.fee)
                        }
                      />
                    </div>
                    <div>{area.name}</div>
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>
          </div>

          <div className="manual-charging">
            <p className="manual-charging-color">Manual Charging</p>
            <SelectPage
              name={isDiagnosisPage ? "diagnosis" : "procedure"}
              className={
                isDiagnosisPage ? "select-diag-icons" : "select-proc-icons"
              }
              onChange={handleOnChangeIntervention}
              value={
                isDiagnosisPage
                  ? diagnosisOnChange[name]
                  : procedureOnChange[name]
              }
              id="diagnosisSelect"
            >
              <OptionPage selected={true} value="">
                Procedures
              </OptionPage>
              {isDiagnosisPage
                ? diagnosis.map((item) => (
                    // here i am using the value of the option from the select field
                    // because it is only one value i am sending which is the diagnosis description
                    <OptionPage key={item.id}>{item.diag}</OptionPage>
                  ))
                : procedures.map((item) => (
                    <OptionPage
                      // i used JSON.stringify here because i want to send two values , the description
                      // and the price to the handleAddIntervention function
                      value={JSON.stringify({
                        proc: item.description,
                        price: item.price,
                      })}
                      key={item.id}
                      className="select-procedures"
                    >
                      {item.description}
                    </OptionPage>
                  ))}
            </SelectPage>
            <SelectPage
              className="select-tooth"
              onChange={handleOnChangeToothNumber}
              name="tooth"
              value={toothNumber[name]}
              id="selectTooth"
            >
              <OptionPage selected={true} value="">
                Tooth Number
              </OptionPage>
              {receivedImages.map((item) => (
                <OptionPage value={item.tooth_number} key={item.tooth_number}>
                  {item.tooth_number}
                </OptionPage>
              ))}
            </SelectPage>

            <div className="btns-diag">
              <Button name="add-proc" className="add-diag">
                Add
              </Button>
            </div>
          </div>
        </form>

        {!isDiagnosisPage ? (
          <div className="remove-icons">
            <p className="manual-charging-color">Remove Icon</p>
            <form onSubmit={handleOnDeleteIconsOnChart} className="tooth-form">
              <SelectPage
                className="select-tooth"
                onChange={handleOnChangeToothNumber}
                name="tooth-delete"
                value={toothNumber[name]}
                id="selectToothDiag"
              >
                <OptionPage selected={true} value="">
                  Tooth Number
                </OptionPage>
                {receivedImages.map((item) => (
                  <OptionPage
                    value={item.tooth_number}
                    key={item.tooth_number}
                    className="tooth-select"
                  >
                    {item.tooth_number}
                  </OptionPage>
                ))}
              </SelectPage>
              <div className="delete-procedure">
                <Button name="delete-icon" className="delete-btn">
                  Delete
                </Button>
              </div>
            </form>
          </div>
        ) : (
          ""
        )}

        <div className="go-to-proc">
          <FontAwesomeIcon icon={faDiamondTurnRight} className="go-icon" />
          <Link className="link-proc" to={isDiagnosisPage ? ".." : "diagnosis"}>
            {isDiagnosisPage ? "Procedures" : "Diagnosis"}
          </Link>
        </div>
      </div>
      <div className="diagnosis-head">
        <div className="teeth-img">
          {isTeethLoading ? (
            <>
              <div className="exam-loading-circle"></div>
              <div>Loading ...</div>
            </>
          ) : (
            <div>
              <div className="all-teeth">
                <div className="tooth-layout-up">
                  {upperToothImages.map((tooth) => {
                    // display diagnosis previously stored in my database
                    // check if there are any diagnoses for this tooth
                    const {
                      previouslyExtracted,
                      previouslyPonticFailed,
                      previouslyPonticSuccess,
                      previouslyAbscess,
                      previousImplantFailed,
                      previousImplantSuccess,
                      previousTopImplant,
                      previouslySuccessRootLeft,
                      previouslyFailedRootLeft,
                      previouslySuccessRootMiddle,
                      previouslyFailedRootMiddle,
                      previouslySuccessRootRight,
                      previouslyFailedRootRight,
                      previouslyFailedCrown,
                      previouslySuccessCrown,
                      previouslyFailedDistal,
                      previouslySuccessDistal,
                      previouslyFailedMesial,
                      previouslySuccessMesial,
                      previouslyFailedLingual,
                      previouslySuccessLingual,
                      previouslyFailedBuccal,
                      previouslySuccessBuccal,
                      previouslyFailedOcclusal,
                      previouslySuccessOcclusal,
                    } = GetStoredDiagnosis(tooth.tooth_number);

                    // check if there is any procedure done for this specific tooth in procedures page
                    const {
                      previousExtractedProcedures,
                      previousPonticSuccessProcedures,
                      previousImplantSuccessProcedures,
                      previousTopImplantProcedures,
                      previousSuccessRootLeftProcedures,
                      previousSuccessRootRightProcedures,
                      previousSuccessRootMiddleProcedures,
                      previousSuccessCrownProcedures,
                      previousSuccessDistalProcedures,
                      previousSuccessMesialProcedures,
                      previousSuccessLingualProcedures,
                      previousSuccessBuccalProcedures,
                      previousSuccessOcclusalProcedures,
                    } = GetStoredProcedures(tooth.tooth_number);

                    // display the diagnosis/procedures on chart for the first time
                    const {
                      draggableIconOcclusal,
                      draggableIconLingual,
                      draggableIconMesial,
                      draggableIconBuccal,
                      draggableIconDistal,
                      draggableIconRootLeft,
                      toothNumberRootLeft,
                      draggableIconRootMiddle,
                      toothNumberRootMiddle,
                      draggableIconRootRight,
                      toothNumberRootRight,
                      draggableIconAbscess,
                      toothNumberAbscess,
                      draggableIconTopImplant,
                      draggableIconImplant,
                      draggableIconCrown,
                      draggableIconPontic,
                    } = displayIconsOnChart(tooth.tooth_number);

                    MolarUpperTeethNumbers;
                    OtherUpperTeethNumbers;
                    AllUpperTeethNumbers;

                    return (
                      <div key={tooth.tooth_number}>
                        <div>{tooth.tooth_number}</div>
                        <div className="upper-tooth-container">
                          {/*the below icons (extraction, implant, pontic, top ) will replace tooth so they will show */}
                          {/*in way that either this or the tooth will show */}
                          {/*this will only get previously stored extraction (diagnosis page and diagnosis copy only)*/}
                          {previouslyExtracted &&
                          tooth.tooth_path !== "extracted" &&
                          !previousExtractedProcedures &&
                          !previousImplantSuccess &&
                          !previousImplantFailed ? (
                            <div className="empty-tooth-placeholder" />
                          ) : // this will get previously stored extraction in procedure page only
                          previousExtractedProcedures &&
                            !previousImplantSuccessProcedures ? (
                            <div
                              className="empty-tooth-extracted"
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                            />
                          ) : // this will only get the extracted tooth when i am dragging and dropping
                          tooth.tooth_path === "extracted" ? (
                            <div
                              className={
                                isDiagnosisPage
                                  ? "empty-tooth-placeholder"
                                  : "empty-tooth-proc"
                              }
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                            ></div>
                          ) : // this block of code will only execute if that specific tooth includes pontic , for
                          // other tooth , the remaining block of code will evaluate ...
                          // images of tooths will display
                          previouslyPonticFailed ||
                            previouslyPonticSuccess ||
                            previousPonticSuccessProcedures ? (
                            <div className="empty-tooth-pontic">
                              <div
                                className={
                                  isDiagnosisPage
                                    ? previouslyPonticSuccess
                                      ? "pontic-image pontic-upper-top pontic-upper-succ"
                                      : "pontic-image pontic-upper-top pontic-upper-fail"
                                    : previouslyPonticSuccess
                                      ? "pontic-image pontic-upper-top pontic-upper-succ"
                                      : previousPonticSuccessProcedures
                                        ? "pontic-image pontic-upper-top pontic-upper-proc"
                                        : "pontic-image pontic-upper-top pontic-upper-fail"
                                }
                              />
                            </div>
                          ) : tooth.tooth_path === "pontic" ? (
                            <div
                              className="empty-tooth-pontic"
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                            >
                              <div
                                className={
                                  isDiagnosisPage
                                    ? draggableIconPontic ===
                                      draggableIconsMap.Pontic_Successful
                                      ? "pontic-image pontic-upper-top pontic-upper-succ"
                                      : "pontic-image pontic-upper-top pontic-upper-fail"
                                    : "pontic-image pontic-upper-top pontic-upper-proc"
                                }
                              />
                            </div>
                          ) : ((previousImplantSuccess ||
                              previousImplantFailed) &&
                              !previousTopImplant &&
                              tooth.composite !== "topImplant") ||
                            (previousImplantSuccessProcedures &&
                              !previousTopImplantProcedures &&
                              tooth.composite !== "topImplant") ? (
                            <div
                              className="implant-box"
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                            >
                              <div
                                className={
                                  isDiagnosisPage
                                    ? previousImplantSuccess
                                      ? "success-implant-body-upper"
                                      : "failed-implant-body-upper"
                                    : previousImplantSuccess
                                      ? "success-implant-body-upper"
                                      : previousImplantSuccessProcedures
                                        ? "implant-body-proc"
                                        : "failed-implant-body-upper"
                                }
                              />
                            </div>
                          ) : tooth.tooth_path === "implant" &&
                            tooth.composite_circle === "implant" ? (
                            <div
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                              className="implant-box"
                            >
                              {isDiagnosisPage ? (
                                draggableIconImplant ===
                                draggableIconsMap.Successful_Implant ? (
                                  <div className="success-implant-body-upper" />
                                ) : (
                                  <div className="failed-implant-body-upper" />
                                )
                              ) : (
                                <div className="implant-body-proc"></div>
                              )}
                            </div>
                          ) : ((previousImplantSuccess ||
                              previousImplantFailed) &&
                              previousTopImplant) ||
                            (previousExtractedProcedures &&
                              previousImplantSuccessProcedures &&
                              previousTopImplantProcedures) ||
                            (previousImplantSuccessProcedures &&
                              previousTopImplantProcedures) ? (
                            <div className="implant-box">
                              {isDiagnosisPage ? (
                                previousImplantSuccess && previousTopImplant ? (
                                  <>
                                    <div className="success-implant-body-upper" />
                                    <div className="implant-added-top-upper" />
                                  </>
                                ) : (
                                  <>
                                    <div className="failed-implant-body-upper" />
                                    <div className="implant-added-top-upper" />
                                  </>
                                )
                              ) : previousImplantSuccess &&
                                previousTopImplant ? (
                                <>
                                  <div className="success-implant-body-upper" />
                                  <div className="implant-added-top-upper" />
                                </>
                              ) : previousImplantSuccessProcedures &&
                                previousTopImplantProcedures ? (
                                <>
                                  <div className="implant-body-proc" />
                                  <div className="implant-added-top-upper" />
                                </>
                              ) : (
                                <>
                                  <div className="failed-implant-body-upper" />
                                  <div className="implant-added-top-upper" />
                                </>
                              )}
                            </div>
                          ) : tooth.tooth_path === "implant" &&
                            tooth.composite_circle === "topImplant" ? (
                            <div
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                              className="implant-box"
                            >
                              {isDiagnosisPage ? (
                                draggableIconImplant ===
                                  draggableIconsMap.Successful_Implant &&
                                draggableIconTopImplant ===
                                  draggableIconsMap.Implant_Top ? (
                                  <>
                                    <div className="success-implant-body-upper" />
                                    <div className="implant-added-top-upper" />
                                  </>
                                ) : (
                                  <>
                                    <div className="failed-implant-body-upper" />
                                    <div className="implant-added-top-upper" />
                                  </>
                                )
                              ) : (
                                <>
                                  <div className="implant-body-proc" />
                                  <div className="implant-added-top-upper" />
                                </>
                              )}
                            </div>
                          ) : (
                            <>
                              <img
                                src={tooth.tooth_path}
                                className="upper-tooth-img"
                                onDragOver={handleDragOverIconTooth}
                                onDrop={(e) =>
                                  handleDrop(e, tooth.tooth_number)
                                }
                              />
                              <img
                                className="composite_upper"
                                src={tooth.composite_circle}
                                onDrop={(e) =>
                                  handleDrop(e, tooth.tooth_number)
                                }
                                onDragOver={handleDragOverIconTooth}
                              />
                            </>
                          )}

                          {/*below will allow drag and drop of the icons as well as getting the icons from backend*/}
                          {renderTeeth(
                            MolarUpperTeethNumbers,
                            toothNumberRootLeft,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconRootLeft,
                            draggableIconsMap.Failed_Root_Left,
                            draggableIconsMap.Successful_Root_Left,
                            previouslySuccessRootLeft,
                            previouslyFailedRootLeft,
                            "failed-left-root",
                            "success-left-root",
                            "proc-left-root",
                            "left-root-svg",
                            "leftUp",
                            previousSuccessRootLeftProcedures,
                          )}

                          {renderTeeth(
                            MolarUpperTeethNumbers,
                            toothNumberRootRight,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconRootRight,
                            draggableIconsMap.Failed_Root_Right,
                            draggableIconsMap.Successful_Root_Right,
                            previouslySuccessRootRight,
                            previouslyFailedRootRight,
                            "failed-right-root",
                            "success-right-root",
                            "proc-right-root",
                            "right-root-svg",
                            "rightUp",
                            previousSuccessRootRightProcedures,
                          )}
                          {renderTeeth(
                            OtherUpperTeethNumbers,
                            toothNumberRootMiddle,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconRootMiddle,
                            draggableIconsMap.Failed_Root_Middle,
                            draggableIconsMap.Successful_Root_Middle,
                            previouslySuccessRootMiddle,
                            previouslyFailedRootMiddle,
                            "failed-middle-root",
                            "success-middle-root",
                            "proc-middle-root",
                            "middle-root-svg",
                            "middleUp",
                            previousSuccessRootMiddleProcedures,
                          )}

                          {AllUpperTeethNumbers.map((toothNumber) => (
                            <React.Fragment key={toothNumber}>
                              {renderAbscess(
                                toothNumberAbscess,
                                toothNumber,
                                tooth.tooth_number,
                                draggableIconAbscess,
                                draggableIconsMap.Abscess,
                                previouslyAbscess,
                                "abscess-svg",
                                "abscess-on-tooth",
                              )}
                            </React.Fragment>
                          ))}
                          {renderComposites(
                            AllUpperTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconCrown,
                            draggableIconsMap.Failed_Crown,
                            draggableIconsMap.Successful_Crown,
                            previouslySuccessCrown,
                            previouslyFailedCrown,
                            "crown-svg",
                            "success-crown",
                            "failed-crown",
                            "proc-crown",
                            "0",
                            "10",
                            "0 0 90 70",
                            previousSuccessCrownProcedures,
                          )}
                          {renderComposites(
                            AllUpperTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconDistal,
                            draggableIconsMap.Composite_Distal_Failed,
                            draggableIconsMap.Composite_Distal_Successful,
                            previouslySuccessDistal,
                            previouslyFailedDistal,
                            "distal-svg",
                            "green-distal",
                            "red-distal-beige",
                            "blue-distal",
                            "5",
                            "5",
                            "0 0 32 70",
                            previousSuccessDistalProcedures,
                          )}
                          {renderComposites(
                            AllUpperTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconMesial,
                            draggableIconsMap.Composite_Mesial_Failed,
                            draggableIconsMap.Composite_Mesial_Successful,
                            previouslySuccessMesial,
                            previouslyFailedMesial,
                            "mesial-svg",
                            "mesial-green",
                            "mesial-red",
                            "mesial-blue",
                            "5",
                            "5",
                            "0 0 32 70",
                            previousSuccessMesialProcedures,
                          )}
                          {renderComposites(
                            AllUpperTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconLingual,
                            draggableIconsMap.Composite_Lingual_Failed,
                            draggableIconsMap.Composite_Lingual_Successful,
                            previouslySuccessLingual,
                            previouslyFailedLingual,
                            "lingual-svg",
                            "lingual-green",
                            "lingual-red",
                            "lingual-blue",
                            "10",
                            "15",
                            "0 0 100 70",
                            previousSuccessLingualProcedures,
                          )}
                          {renderComposites(
                            AllUpperTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconBuccal,
                            draggableIconsMap.Composite_Buccal_Failed,
                            draggableIconsMap.Composite_Buccal_Successful,
                            previouslySuccessBuccal,
                            previouslyFailedBuccal,
                            "buccal-svg",
                            "green-buccal",
                            "red-buccal",
                            "blue-buccal",
                            "10",
                            "20",
                            "0 0 100 70",
                            previousSuccessBuccalProcedures,
                          )}
                          {renderComposites(
                            AllUpperTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconOcclusal,
                            draggableIconsMap.Composite_Occlusal_Failed,
                            draggableIconsMap.Composite_Occlusal_Successful,
                            previouslySuccessOcclusal,
                            previouslyFailedOcclusal,
                            "occlusal-svg",
                            "occlusal-green",
                            "occlusal-red",
                            "occlusal-blue",
                            "50",
                            "50",
                            "0 0 100 100",
                            previousSuccessOcclusalProcedures,
                            "40",
                            "circle",
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/*NOW DISPLAY LOWER TOOTH ON CHART */}
                <div className="tooth-layout-down">
                  {lowerToothImages.map((tooth) => {
                    // get lower teeth numbers
                    AllLowerTeethNumbers;
                    MolarLowerTeethNumbers;
                    OtherLowerTeethNumbers;

                    // display diagnosis previously stored in my database
                    // check if there are any diagnoses for this tooth
                    const {
                      previouslyExtracted,
                      previouslyPonticFailed,
                      previouslyPonticSuccess,
                      previouslyAbscess,
                      previousImplantFailed,
                      previousImplantSuccess,
                      previousTopImplant,
                      previouslySuccessRootLeft,
                      previouslyFailedRootLeft,
                      previouslySuccessRootMiddle,
                      previouslyFailedRootMiddle,
                      previouslySuccessRootRight,
                      previouslyFailedRootRight,
                      previouslyFailedCrown,
                      previouslySuccessCrown,
                      previouslyFailedDistal,
                      previouslySuccessDistal,
                      previouslyFailedMesial,
                      previouslySuccessMesial,
                      previouslyFailedLingual,
                      previouslySuccessLingual,
                      previouslyFailedBuccal,
                      previouslySuccessBuccal,
                      previouslyFailedOcclusal,
                      previouslySuccessOcclusal,
                    } = GetStoredDiagnosis(tooth.tooth_number);

                    // get procedures that are stored in database,
                    const {
                      previousExtractedProcedures,
                      previousPonticSuccessProcedures,
                      previousImplantSuccessProcedures,
                      previousTopImplantProcedures,
                      previousSuccessRootLeftProcedures,
                      previousSuccessRootRightProcedures,
                      previousSuccessRootMiddleProcedures,
                      previousSuccessCrownProcedures,
                      previousSuccessDistalProcedures,
                      previousSuccessMesialProcedures,
                      previousSuccessLingualProcedures,
                      previousSuccessBuccalProcedures,
                      previousSuccessOcclusalProcedures,
                    } = GetStoredProcedures(tooth.tooth_number);

                    // display the diagnosis/procedures on chart for the first time - when you drag and drop
                    const {
                      draggableIconOcclusal,
                      draggableIconLingual,
                      draggableIconMesial,
                      draggableIconBuccal,
                      draggableIconDistal,
                      draggableIconRootLeft,
                      toothNumberRootLeft,
                      draggableIconRootMiddle,
                      toothNumberRootMiddle,
                      draggableIconRootRight,
                      toothNumberRootRight,
                      draggableIconAbscess,
                      toothNumberAbscess,
                      draggableIconTopImplant,
                      draggableIconImplant,
                      draggableIconCrown,
                      draggableIconPontic,
                    } = displayIconsOnChart(tooth.tooth_number);

                    return (
                      <div key={tooth.tooth_number}>
                        <div className="lower-tooth-container">
                          {previouslyExtracted &&
                          tooth.tooth_path !== "extracted" &&
                          !previousExtractedProcedures &&
                          !previousImplantSuccess &&
                          !previousImplantFailed ? (
                            <div className="empty-tooth-placeholder" />
                          ) : previousExtractedProcedures &&
                            !previousImplantSuccessProcedures ? (
                            <div
                              className="empty-tooth-proc-low"
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                            />
                          ) : tooth.tooth_path === "extracted" ? (
                            <div
                              className={
                                isDiagnosisPage
                                  ? "empty-tooth-placeholder"
                                  : "empty-tooth-proc-low"
                              }
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                            ></div>
                          ) : previouslyPonticFailed ||
                            previouslyPonticSuccess ||
                            previousPonticSuccessProcedures ? (
                            <>
                              <div className="empty-tooth-pontic">
                                <div
                                  className={
                                    isDiagnosisPage
                                      ? previouslyPonticSuccess
                                        ? "pontic-image pontic-lower-top pontic-lower-succ"
                                        : "pontic-image pontic-lower-top pontic-lower-fail"
                                      : previouslyPonticSuccess
                                        ? "pontic-image pontic-lower-top pontic-lower-succ"
                                        : previousPonticSuccessProcedures
                                          ? "pontic-image pontic-lower-top pontic-lower-proc"
                                          : "pontic-image pontic-lower-top pontic-lower-fail"
                                  }
                                />
                              </div>
                            </>
                          ) : tooth.tooth_path === "pontic" ? (
                            <div
                              className="empty-tooth-pontic"
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                            >
                              <div
                                className={
                                  isDiagnosisPage
                                    ? draggableIconPontic ===
                                      draggableIconsMap.Pontic_Successful
                                      ? "pontic-image pontic-lower-top pontic-lower-succ"
                                      : "pontic-image pontic-lower-top pontic-lower-fail"
                                    : "pontic-image pontic-lower-top pontic-lower-proc"
                                }
                              />
                            </div>
                          ) : ((previousImplantSuccess ||
                              previousImplantFailed) &&
                              !previousTopImplant &&
                              tooth.composite !== "topImplant") ||
                            (previousImplantSuccessProcedures &&
                              !previousTopImplantProcedures &&
                              tooth.composite !== "topImplant") ? (
                            <div
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                              className="implant-box"
                            >
                              <div
                                className={
                                  isDiagnosisPage
                                    ? previousImplantSuccess
                                      ? "success-implant-body-lower"
                                      : "failed-implant-body-lower"
                                    : // if it's not the diagnosis page
                                      previousImplantSuccess
                                      ? "success-implant-body-lower"
                                      : previousImplantSuccessProcedures
                                        ? "implant-body-lower-proc"
                                        : "failed-implant-body-lower"
                                }
                              />
                            </div>
                          ) : tooth.tooth_path === "implant" &&
                            tooth.composite_circle === "implant" ? (
                            <div
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                              className="implant-box"
                            >
                              {isDiagnosisPage ? (
                                draggableIconImplant ===
                                draggableIconsMap.Successful_Implant ? (
                                  <div className="success-implant-body-lower" />
                                ) : (
                                  <div className="failed-implant-body-lower" />
                                )
                              ) : (
                                <div className="implant-body-lower-proc"></div>
                              )}
                            </div>
                          ) : ((previousImplantSuccess ||
                              previousImplantFailed) &&
                              previousTopImplant) ||
                            // getting previous implant and top done by the existing dentist in procedures page
                            (previousExtractedProcedures &&
                              previousImplantSuccessProcedures &&
                              previousTopImplantProcedures) ||
                            (previousImplantSuccessProcedures &&
                              previousTopImplantProcedures) ? (
                            <div className="implant-box">
                              {isDiagnosisPage ? (
                                // diagnosis page is true check if previous success and top implant
                                // add success or failure
                                previousImplantSuccess && previousTopImplant ? (
                                  <>
                                    <div className="success-implant-body-lower" />
                                    <div className="implant-added-top-lower" />
                                  </>
                                ) : (
                                  <>
                                    <div className="failed-implant-body-lower" />
                                    <div className="implant-added-top-lower" />
                                  </>
                                )
                              ) : // if not diagnosis page, meaning procedures page , check if previous implant success
                              // then add success and top implant in procedure page
                              previousImplantSuccess && previousTopImplant ? (
                                <>
                                  <div className="success-implant-body-lower" />
                                  <div className="implant-added-top-lower" />
                                </>
                              ) : // if it is procedure page but the existing dentist stored previous implant
                              // and top implant, get me in blue
                              previousImplantSuccessProcedures &&
                                previousTopImplantProcedures ? (
                                <>
                                  <div className="implant-body-lower-proc" />
                                  <div className="implant-added-top-lower" />
                                </>
                              ) : (
                                // if procedure page but the implant done by other dentist is failure
                                // add failure body and top
                                <>
                                  <div className="failed-implant-body-lower" />
                                  <div className="implant-added-top-lower" />
                                </>
                              )}
                            </div>
                          ) : tooth.tooth_path === "implant" &&
                            tooth.composite_circle === "topImplant" ? (
                            <div
                              onDragOver={handleDragOverIconTooth}
                              onDrop={(e) => handleDrop(e, tooth.tooth_number)}
                              className="implant-box"
                            >
                              {isDiagnosisPage ? (
                                draggableIconImplant ===
                                  draggableIconsMap.Successful_Implant &&
                                draggableIconTopImplant ===
                                  draggableIconsMap.Implant_Top ? (
                                  <>
                                    <div className="success-implant-body-lower" />
                                    <div className="implant-added-top-lower" />
                                  </>
                                ) : (
                                  <>
                                    <div className="failed-implant-body-lower" />
                                    <div className="implant-added-top-lower" />
                                  </>
                                )
                              ) : (
                                <>
                                  <div className="implant-body-lower-proc" />
                                  <div className="implant-added-top-lower" />
                                </>
                              )}
                            </div>
                          ) : (
                            <>
                              <img
                                src={tooth.composite_circle}
                                className="composite_upper"
                                onDrop={(e) =>
                                  handleDrop(e, tooth.tooth_number)
                                }
                                onDragOver={handleDragOverIconTooth}
                              />

                              <img
                                className="upper-tooth-img"
                                src={tooth.tooth_path}
                                onDragOver={handleDragOverIconTooth}
                                onDrop={(e) =>
                                  handleDrop(e, tooth.tooth_number)
                                }
                              />
                            </>
                          )}

                          {/*Display Composites for Lower teeth*/}
                          {renderComposites(
                            AllLowerTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconOcclusal,
                            draggableIconsMap.Composite_Occlusal_Failed,
                            draggableIconsMap.Composite_Occlusal_Successful,
                            previouslySuccessOcclusal,
                            previouslyFailedOcclusal,
                            "occlusal-svg-lower",
                            "occlusal-green",
                            "occlusal-red",
                            "occlusal-blue",
                            "50",
                            "50",
                            "0 0 100 100",
                            previousSuccessOcclusalProcedures,
                            "40",
                            "circle",
                          )}
                          {renderComposites(
                            AllLowerTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconDistal,
                            draggableIconsMap.Composite_Distal_Failed,
                            draggableIconsMap.Composite_Distal_Successful,
                            previouslySuccessDistal,
                            previouslyFailedDistal,
                            "distal-svg-lower",
                            "green-distal",
                            "red-distal-beige",
                            "blue-distal",
                            "5",
                            "5",
                            "0 0 32 70",
                            previousSuccessDistalProcedures,
                          )}
                          {renderComposites(
                            AllLowerTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconBuccal,
                            draggableIconsMap.Composite_Buccal_Failed,
                            draggableIconsMap.Composite_Buccal_Successful,
                            previouslySuccessBuccal,
                            previouslyFailedBuccal,
                            "buccal-svg-lower",
                            "green-buccal",
                            "red-buccal",
                            "blue-buccal",
                            "10",
                            "20",
                            "0 0 100 70",
                            previousSuccessBuccalProcedures,
                          )}
                          {renderComposites(
                            AllLowerTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconMesial,
                            draggableIconsMap.Composite_Mesial_Failed,
                            draggableIconsMap.Composite_Mesial_Successful,
                            previouslySuccessMesial,
                            previouslyFailedMesial,
                            "mesial-svg-lower",
                            "mesial-green",
                            "mesial-red",
                            "mesial-blue",
                            "5",
                            "5",
                            "0 0 32 70",
                            previousSuccessMesialProcedures,
                          )}
                          {renderComposites(
                            AllLowerTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconLingual,
                            draggableIconsMap.Composite_Lingual_Failed,
                            draggableIconsMap.Composite_Lingual_Successful,
                            previouslySuccessLingual,
                            previouslyFailedLingual,
                            "lingual-svg-lower",
                            "lingual-green",
                            "lingual-red",
                            "lingual-blue",
                            "10",
                            "15",
                            "0 0 100 70",
                            previousSuccessLingualProcedures,
                          )}

                          {renderComposites(
                            AllLowerTeethNumbers,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconCrown,
                            draggableIconsMap.Failed_Crown,
                            draggableIconsMap.Successful_Crown,
                            previouslySuccessCrown,
                            previouslyFailedCrown,
                            "crown-svg-lower",
                            "success-crown-lower",
                            "failed-crown-lower",
                            "proc-crown",
                            "0",
                            "10",
                            "0 0 90 70",
                            previousSuccessCrownProcedures,
                          )}

                          {AllLowerTeethNumbers.map((toothNumber) => (
                            <React.Fragment key={toothNumber}>
                              {renderAbscess(
                                toothNumberAbscess,
                                toothNumber,
                                tooth.tooth_number,
                                draggableIconAbscess,
                                draggableIconsMap.Abscess,
                                previouslyAbscess,
                                "abscess-svg",
                                "abscess-on-tooth",
                              )}
                            </React.Fragment>
                          ))}
                          {/*Render root canal for lower teeth*/}
                          {renderTeeth(
                            MolarLowerTeethNumbers,
                            toothNumberRootLeft,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconRootLeft,
                            draggableIconsMap.Failed_Root_Left,
                            draggableIconsMap.Successful_Root_Left,
                            previouslySuccessRootLeft,
                            previouslyFailedRootLeft,
                            "failed-left-root",
                            "success-left-root",
                            "proc-left-root",
                            "left-root-svg",
                            "leftDown",
                            previousSuccessRootLeftProcedures,
                          )}
                          {renderTeeth(
                            MolarLowerTeethNumbers,
                            toothNumberRootRight,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconRootRight,
                            draggableIconsMap.Failed_Root_Right,
                            draggableIconsMap.Successful_Root_Right,
                            previouslySuccessRootRight,
                            previouslyFailedRootRight,
                            "failed-right-root",
                            "success-right-root",
                            "proc-right-root",
                            "right-root-svg",
                            "rightDown",
                            previousSuccessRootRightProcedures,
                          )}
                          {renderTeeth(
                            OtherLowerTeethNumbers,
                            toothNumberRootMiddle,
                            toothNumber,
                            tooth.tooth_number,
                            draggableIconRootMiddle,
                            draggableIconsMap.Failed_Root_Middle,
                            draggableIconsMap.Successful_Root_Middle,
                            previouslySuccessRootMiddle,
                            previouslyFailedRootMiddle,
                            "failed-middle-root",
                            "success-middle-root",
                            "proc-middle-root",
                            "middle-root-svg",
                            "middleDown",
                            previousSuccessRootMiddleProcedures,
                          )}
                        </div>

                        <div
                          className={
                            (tooth.tooth_number >= 31 &&
                              tooth.tooth_number <= 35) ||
                            (tooth.tooth_number >= 46 &&
                              tooth.tooth_number <= 48) ||
                            (tooth.tooth_number >= 41 &&
                              tooth.tooth_number <= 45)
                              ? ""
                              : "tooth-number-bottom"
                          }
                        >
                          {tooth.tooth_number}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="buttonChart">
          <Button className="emr-charges" onClick={handleOpenToothChartModal}>Click to See All Charges</Button>
        </div>


        <ToothChartModal
          isDiagnosisPage={isDiagnosisPage}
          selectedNames={selectedNames}
          handleSubmitDiagnosisForm={handleSubmitDiagnosisForm}
          handleSubmitProcedureForm={handleSubmitProcedureForm}
          patientDiagnosisInTable={patientDiagnosisInTable}
          handleDeleteIconOnTooth={handleDeleteIconOnTooth}
          handleOnChangeProcedureData={handleOnChangeProcedureData}
          inputValues={inputValues}
          userName={userName}
          currentDate={currentDate}
          diagnosisDataManually={diagnosisDataManually}
          handleDeleteInterventionFromTable={handleDeleteInterventionFromTable}
          procedureDataManually={procedureDataManually}
          interventionMessage={interventionMessage}
          messageTimer={messageTimer}
          handleCloseToothChartModal={handleCloseToothChartModal}
        />
      </div>
    </>
  );
};

export default Documentation;
