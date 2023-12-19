import { useRef, useState } from "react";
import IconButton from "../comps/IconButton";
import list from "../assets/icons/list.png";
import truck from "../assets/icons/truck.png";
import DropdownList from "react-widgets/DropdownList";
import cement from "../assets/icons/cement.png";
import {
  SBCheckNoLoadError,
  SBInsertItem,
  SBLoadItems,
  SBRemoveItem,
  SBUpdateItem,
  SBUpdateItemWithID,
} from "../db/sb";
import {
  FormatDate,
  TABLE_NAMES,
  TRUCK_LOADING_STATE,
  clInput,
} from "../helpers/flow";
import {
  GLFSC,
  GetNumDaysInCurrentMonth,
  GetTeamWorkingOnDayAndTime,
  GetWorkHoursFromShiftSymbol,
  GetWorkingTeamFromShiftCode,
  LOAD_SHIFTS_STATE,
  LoadSchedMatrix,
  SHIFT_NAMES,
} from "../helpers/Shifts";

const SECTIONS = {
  SHIFTS: { path: "ls_shifts", title: "Liste Shifts" },
  TRUCKS: {
    path: "ls_trucks",
    title: "Liste Camions",
  },
};

import loading from "../assets/icons/loading.png";
import check from "../assets/icons/check.svg";
import play from "../assets/icons/play.png";
import checked from "../assets/icons/checked.png";
import pdf from "../assets/icons/pdf.png";
import rapp from "../assets/icons/rapp.png";
import arrow from "../assets/icons/arrow.png";
import del from "../assets/icons/del.png";
import stop from "../assets/icons/stop.png";
import ProgressView from "../comps/ProgressView";
import { GetDateParts } from "../helpers/funcs";

const ICONS_LOAD_STATS = {
  idle: loading,
  loading: loading,
  done: check,
};

const SUBSECTIONS = {
  FORM_NEW_TRUCK: "form_add_new_truck",
  TRUCKS_LIST: "trucks_list",
  REPPORT: "repport",
};

export default function Charg({ toggleLoadingView }) {
  const [curSectionData, setCurSectionData] = useState(SECTIONS.SHIFTS);
  const [curSubsection, setCurSubsection] = useState(SUBSECTIONS.TRUCKS_LIST);
  const [shifts, setShifts] = useState([]);
  const [shiftsFiltered, setShiftsFiltered] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trucksCurShift, setTrucksCurShift] = useState([]);
  const [trucksCurShiftFiltered, setTrucksCurShiftfiltered] = useState([]);
  const [curWorkingTeamData, setCurWorkingTeamData] = useState({});
  const [data, setCurShiftRappData] = useState({});
  const [loadingStateFilter, setLoadingStateFilter] = useState("");
  const [dayFilter, setDayFilter] = useState(-1);
  const [showingNbrDechires, setShowingNbrDechires] = useState(false);
  const [loadingrepp, setloadingrepp] = useState(false);

  const [selectedShiftData, setSelectedShiftData] = useState({
    trucks: [],
    num_trucks: {
      all: 0,
      waiting: 0,
      done: 0,
    },
    sacs: { all: 0, waiting: 0, done: 0 },
    t: {
      all: 0,
      waiting: 0,
      done: 0,
    },
  });
  const [selectedTruckID, setSelectedTruckID] = useState();
  const [loading, setLoading] = useState(false);

  const [newTruckData, setNewTruckData] = useState({
    plaque: "AP0232905",
    HA: new Date().toISOString().toLocaleString("fr-FR"),
    HDC: null,
    HFC: null,
    code_chargement: "C026",
    line: 1,
    sacs: 300,
    nameChauff: "Driver",
    numChauff: "0000000000",
    state: TRUCK_LOADING_STATE.LABELS.Waiting,
    shift_code: "",
  });

  useState(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);

    //console.log("loading data ...");

    const trucks = await SBLoadItems(TABLE_NAMES.TRUCKS);
    const shifts = await SBLoadItems(TABLE_NAMES.LOAD_SHIFTS);

    setShiftsFiltered([...shifts]);

    const schedMatrix = await LoadSchedMatrix();
    let workingTeamData = GetTeamWorkingOnDayAndTime(
      schedMatrix,
      new Date().getDate()
    );

    //console.log("trucks", trucks);
    //console.log("shifts", shifts);
    //console.log("workingTeamData", workingTeamData);

    setTrucks(trucks);
    setShifts(shifts);
    setCurWorkingTeamData(workingTeamData);

    let trucksCurShift = trucks.filter(
      (t, i) => t.shift_code === selectedShiftData.shift_code
    );

    //console.log(workingTeamData.shift_code);
    //console.log(trucksCurShift);

    setTrucksCurShift(trucksCurShift);
    setTrucksCurShiftfiltered(trucksCurShift);

    //calculateCurShiftRepport(selectedShiftData);
    setLoading(false);
  }

  function onChangeSection(sectionData) {
    setCurSectionData(sectionData);
    if (sectionData.path === SECTIONS.TRUCKS) {
      setCurSubsection(SUBSECTIONS.TRUCKS_LIST);
    }
  }

  async function onStartNewShift() {
    const csc = curWorkingTeamData.shift_code;
    const shift = shifts.find((el) => el.shift_code === csc);

    let msg;

    if (shift !== undefined) {
      setSelectedShiftData(shift);

      msg = `"shift " ${csc} " already exists! status : " ${shift.status} " `;
      alert(msg);
    } else {
      try {
        toggleLoadingView(true);

        let loadShiftData = {
          status: LOAD_SHIFTS_STATE.IDLE,
          shift_code: csc,
        };

        const res = await SBInsertItem(loadShiftData, TABLE_NAMES.LOAD_SHIFTS);
        setSelectedShiftData(res[0]);
        alert("New load shift created");

        loadAllData();
        toggleLoadingView(false);
      } catch (e) {
        alert(e);
        toggleLoadingView(false);
      } finally {
        toggleLoadingView(false);
      }
    }
  }

  async function calculateCurShiftRepport(shiftData) {
    setloadingrepp(true);
    console.log("calculating repport ...");

    const { shift_code } = shiftData;

    if (shift_code === undefined) {
      console.log("shift_code is currently undefined! cant calculate repport!");
      return;
    }

    let workingTeam = GetWorkingTeamFromShiftCode(shift_code);

    const selectedShiftTrucks = trucks.filter(
      (t, i) =>
        t.shift_code === shift_code &&
        t.state === TRUCK_LOADING_STATE.Done.label
    );
    const { month, day } = GetDateParts();

    let rapData = {
      y: workingTeam.y,
      m: workingTeam.m,
      d: workingTeam.d,
      sup: workingTeam.teamData.sup.name.fr,
      teamCode: workingTeam.teamCode,
      shiftSymbolZH: SHIFT_NAMES[workingTeam.shiftSymbol][1],
      shiftName: SHIFT_NAMES[workingTeam.shiftSymbol][0],
      from: workingTeam.from,
      to: workingTeam.to,
      trucksCount: selectedShiftTrucks.length,
      sacs: selectedShiftTrucks.reduce((acc, cv) => acc + cv.sacs, 0),
      t: selectedShiftTrucks.reduce((acc, cv) => acc + cv.sacs, 0) / 20,
      dechires: selectedShiftData.dechires,
    };

    setCurShiftRappData((old) => rapData);

    console.log("repport calculation done!!!");
    console.log("rapData", rapData);
    setloadingrepp(false);
  }

  function onShiftRowClicked(shiftData) {
    console.log("onShiftRowClicked ...");

    setSelectedShiftData(shiftData);
    setCurSectionData(SECTIONS.TRUCKS);

    let nd = trucks.filter((t, i) => t.shift_code === shiftData.shift_code);
    setTrucksCurShiftfiltered([...nd]);

    calculateCurShiftRepport(shiftData);
  }

  async function onRemoveTruck(truckToRemove) {
    ////////console.log("removing truck ...", truckToRemove);

    const rep = confirm("Are you sure you wanna remove this truck?");

    if (rep) {
      toggleLoadingView(true);
      await SBRemoveItem(truckToRemove, TABLE_NAMES.TRUCKS, "id", (r) => {
        if (r) alert("Truck removed!");

        loadAllData();
      });

      toggleLoadingView(false);
    }
  }

  const refAjoutRet = useRef();

  async function onChangeChargStat(data, newState) {
    setLoading(true);

    const ajoutret = refAjoutRet.current.value;
    //console.log(ajoutret);

    //return;

    data.state = newState;

    if (newState === TRUCK_LOADING_STATE.Loading.label) {
      data.HDC = new Date().toISOString();
    }

    if (newState === TRUCK_LOADING_STATE.Done.label) {
      data.HFC = new Date().toISOString();
    }

    data.ajoutret = ajoutret;

    await SBUpdateItemWithID(
      data,
      TABLE_NAMES.TRUCKS,
      (res) => {
        ////console.log(res);
        //setTruckState(newState);
        const selectedTruckIndex = trucks.findIndex(
          (t, i) => t.id === selectedTruckID
        );
        const selectedTruckData = trucks[selectedTruckIndex];
        setTrucks((old) => ({
          ...old,
          selectedTruckIndex: { ...selectedTruckData, state: newState },
        }));
        setLoading(false);
        loadAllData();
      },
      (e) => {
        ////console.log(e);
        alert(e);
        setLoading(false);
      }
    );
  }

  function onChangeSubsection(subsection) {
    setCurSubsection(subsection);
    loadAllData();

    console.log("subsection", subsection);
    calculateCurShiftRepport(selectedShiftData);
  }

  function onUpdateNewTruckData(e) {
    ////console.log(e);

    const n = e.target.name;
    let v = e.target.value;

    setNewTruckData((old) => ({
      ...old,
      [n]: v,
      state: TRUCK_LOADING_STATE.LABELS.Waiting,
    }));
  }

  const refSacSinoma = useRef();
  const refSacNormal = useRef();

  function onSaveNewTruckData() {
    // toggleLoadingView(true);

    setLoading(true);

    let updTruckData = newTruckData;
    updTruckData.shift_code = curWorkingTeamData.shift_code;
    updTruckData.typesac =
      refSacNormal.current.checked === true ? "42.5" : "32.5";

    setNewTruckData(updTruckData);

    SBInsertItem(
      updTruckData,
      TABLE_NAMES.TRUCKS,
      (ntd) => {
        alert("New truck inserted successdfully");

        loadAllData();
        onChangeSubsection(SUBSECTIONS.TRUCKS_LIST);
        setLoading(false);
      },
      (e) => {
        alert("Error inserting new truck!\n" + e);

        setLoading(false);
      }
    );

    // toggleLoadingView(false);
  }

  const [qtruck, setqtruck] = useState("");
  function onSearchTruck(e) {
    let q = e.target.value.toLowerCase().replaceAll(" ", "");
    setqtruck(q);

    let nd = trucksCurShift.filter(
      (t, i) => t.plaque.toLowerCase().includes(q) || t.sacs === parseInt(q)
    );
    if (q === "") {
      nd = [...trucksCurShift];
    }

    //console.log(trucksCurShift[0].sacs);

    setTrucksCurShiftfiltered([...nd]);
  }

  function onSelectLoadingFilter(filter) {
    setLoadingStateFilter(filter);

    let nd = trucksCurShift.filter((t, i) => t.state === filter);

    if (filter === "all") nd = [...trucksCurShift];

    setTrucksCurShiftfiltered([...nd]);
  }

  function onSelectDayFilter(filter) {
    const day = filter - 1;

    setDayFilter(day);

    let nd = shifts.filter(
      (s, i) => parseInt(s.shift_code.split("_")[2]) === day
    );

    if (day === 0) nd = [...shifts];

    setShiftsFiltered([...nd]);
  }

  const refDechires = useRef();
  function onFinChargement(shift_code) {
    let upd = selectedShiftData;
    selectedShiftData.HF = new Date().toISOString();
    selectedShiftData.status = TRUCK_LOADING_STATE.Done.label;

    let dechires = parseInt(refDechires.current.value);

    if (isNaN(dechires)) {
      alert(
        "Veuillez entrer un nombre valide de sacs dechires  pour continuer!"
      );
    }

    selectedShiftData.dechires = dechires;

    if (confirm("Are you sure the shift is done?")) {
      SBUpdateItemWithID(
        upd,
        TABLE_NAMES.LOAD_SHIFTS,
        (r) => {
          loadAllData();

          alert(`Shift " ${shift_code} " Done!`);
          setShowingNbrDechires(false);
          setCurSectionData(SECTIONS.SHIFTS);
        },
        (e) => {
          alert(e);
          console.log(e);
        }
      );
    }
  }

  return (
    <div className="">
      <div className="text-center text-xl ">{curSectionData.title}</div>
      <div className="gap-4 md:flex justify-between flex-row py-4 border-b mb-4">
        <IconButton
          title={SECTIONS.SHIFTS.title}
          icon={list}
          onClick={(e) => onChangeSection(SECTIONS.SHIFTS)}
          colorName="blue"
          outline={true}
        />
      </div>

      <div className="text-green-700 font-bold text-center ">
        {curSectionData.path} / {curSubsection}
      </div>

      {curSectionData.path === SECTIONS.SHIFTS.path && (
        <div>
          <div className="mx-auto bg-black my-4 text-sm text-white font-bold py-1 px-2 w-fit rounded-full ">
            SELECTED SHIFT CODE : {selectedShiftData.shift_code} -{" "}
            {selectedShiftData.status}
          </div>

          <div> {"--here--"} </div>

          <div className="my-4">
            <IconButton
              outline
              colorName={"green"}
              title={"LANCER LES OPERATIONS"}
              icon={play}
              onClick={(e) => onStartNewShift()}
            />
          </div>

          <div>
            Date :{" "}
            <select
              value={dayFilter}
              onChange={(e) => onSelectDayFilter(parseInt(e.target.value) + 1)}
            >
              <option value={0}>Tout le mois</option>
              {Array(GetNumDaysInCurrentMonth())
                .fill(0)
                .map((d, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
            </select>
          </div>

          <table className="w-full">
            <tbody>
              <tr>
                {["No.", "Equipe", "Shift Name", "Date", "Status"].map(
                  (it, i) => (
                    <td
                      key={i}
                      className=" p-1 font-bold border-neutral-400
                      border"
                    >
                      {it}
                    </td>
                  )
                )}
              </tr>

              {shiftsFiltered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-1 border " align="center">
                    {loading ? (
                      <ProgressView loading={loading} />
                    ) : (
                      "No Shifts yet!"
                    )}
                  </td>
                </tr>
              )}

              {shiftsFiltered.length > 0 &&
                shiftsFiltered.map((shift, i) => (
                  <tr
                    key={i}
                    onClick={(e) => onShiftRowClicked(shift)}
                    className="
                  
                  hover:text-white
                  hover:bg-sky-500
                  hover:cursor-pointer
                  
                  "
                  >
                    {[
                      i + 1,
                      GLFSC(shift.shift_code).teamCode,
                      GLFSC(shift.shift_code).shiftName,
                      GLFSC(shift.shift_code).fullDate,
                      shift.status,
                    ].map((colData, i) => (
                      <td
                        key={i}
                        className={`
                      border-neutral-400
                      border p-1
                      md:min-w-[100px]
                      ${
                        shift.shift_code === curWorkingTeamData.shift_code
                          ? " bg-green-700 text-white "
                          : ""
                      }
                      `}
                      >
                        {i === 4 ? (
                          <img
                            src={ICONS_LOAD_STATS[shift.status]}
                            width={30}
                            className={` z-0 relative ${
                              shift.status === "idle" ? "animate-spin" : ""
                            } `}
                          />
                        ) : (
                          colData
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {curSectionData.path === SECTIONS.TRUCKS.path && (
        <div>
          <div className="mx-auto bg-black my-4 text-sm text-white font-bold py-1 px-2 w-fit rounded-full ">
            SELECTED SHIFT CODE : {selectedShiftData.shift_code} -{" "}
            {selectedShiftData.status}
          </div>

          <div className="border-b mb-4 pb-4 md:flex justify-around">
            {(curSubsection === SUBSECTIONS.FORM_NEW_TRUCK ||
              curSubsection === SUBSECTIONS.REPPORT) && (
              <IconButton
                colorName={"blue"}
                title={"TRUCKS LISTE"}
                onClick={(e) => onChangeSubsection(SUBSECTIONS.TRUCKS_LIST)}
                icon={list}
              />
            )}

            {curSubsection !== SUBSECTIONS.FORM_NEW_TRUCK && (
              <>
                {selectedShiftData.shift_code ===
                  curWorkingTeamData.shift_code &&
                  selectedShiftData.status !==
                    TRUCK_LOADING_STATE.Done.label && (
                    <IconButton
                      colorName={"blue"}
                      title={"+ NOUVEAU CHARG"}
                      onClick={(e) =>
                        onChangeSubsection(SUBSECTIONS.FORM_NEW_TRUCK)
                      }
                      icon={truck}
                    />
                  )}

                <IconButton
                  colorName={"blue"}
                  title={"GEN PDF FICHES CHARGEMENT JOURN."}
                  onClick={(e) => onGenPDFDailyLoading()}
                  icon={pdf}
                />

                <IconButton
                  colorName={"blue"}
                  title={
                    selectedShiftData.status === TRUCK_LOADING_STATE.Done.label
                      ? "SHIFT ALREADY DONE!"
                      : "FIN CHARGEMENT"
                  }
                  onClick={(e) => {
                    if (
                      selectedShiftData.status ===
                      TRUCK_LOADING_STATE.Done.label
                    ) {
                      alert("SHIFT ALREADY DONE!");
                      return;
                    }
                    setShowingNbrDechires(true);
                  }}
                  icon={checked}
                />

                {curSubsection !== SUBSECTIONS.REPPORT && (
                  <IconButton
                    colorName={"blue"}
                    title={"RAPPORT"}
                    onClick={(e) => onChangeSubsection(SUBSECTIONS.REPPORT)}
                    icon={rapp}
                  />
                )}
              </>
            )}
          </div>

          {showingNbrDechires && (
            <div className="bg-slate-800 text-white items-center justify-between gap-2 min-h-[30pt] flex flex-col md:flex-row rounded-md p-4">
              <div>
                <img src={cement} width={40} height={40} />{" "}
              </div>
              <div>
                <div className="text-white">Nombre de sac dechires?</div>
                <input
                  className="p-2 text-black "
                  placeholder="Nombre de sacs dechires"
                  type="number"
                  ref={refDechires}
                  min={0}
                />
              </div>
              <div>
                <IconButton
                  colorName={"blue"}
                  title={"OK"}
                  onClick={(e) => onFinChargement(selectedShiftData.shift_code)}
                  icon={checked}
                />
                <IconButton
                  colorName={"blue"}
                  title={"CANCEL"}
                  onClick={(e) => setShowingNbrDechires(false)}
                  icon={stop}
                />
              </div>
            </div>
          )}

          {curSubsection === SUBSECTIONS.TRUCKS_LIST && (
            <div>
              {trucks.length === 0 && (
                <div>
                  {loading ? (
                    <ProgressView loading={loading} />
                  ) : (
                    <span>No trucks available</span>
                  )}{" "}
                </div>
              )}

              <>
                <div className=" loading-filters text-lg font-mono font-bold text-purple-500">
                  {trucksCurShiftFiltered.length} Camion(s) Total.
                </div>

                <div className=" md:flex justify-between gap-4 items-center border border-neutral-200 bg-neutral-100 rounded-md my-4 p-4 ">
                  <input
                    onChange={onSearchTruck}
                    value={qtruck}
                    type="search"
                    placeholder="Search trucks"
                    className="p-2 outline-0 md:grow w-full border-neutral-100 border focus:border-blue-500  rounded-md "
                  />

                  <div
                    className={`gap-4 flex items-center border-b-4 py-2
                     ${loadingStateFilter === "all" && "neutral-green-500"}
                      
                     ${
                       loadingStateFilter === TRUCK_LOADING_STATE.Done.label &&
                       "border-green-500"
                     }
                      

                     ${
                       loadingStateFilter ===
                         TRUCK_LOADING_STATE.Waiting.label &&
                       "border-yellow-500"
                     }
                      

                     ${
                       loadingStateFilter ===
                         TRUCK_LOADING_STATE.Loading.label && "border-blue-500"
                     }
                      
                        
                         `}
                  >
                    <span>Show:</span>
                    <select
                      value={loadingStateFilter}
                      onChange={(e) => onSelectLoadingFilter(e.target.value)}
                    >
                      <option value={"all"}>ALL</option>
                      <option value={TRUCK_LOADING_STATE.Done.label}>
                        {TRUCK_LOADING_STATE.Done.label}
                      </option>
                      <option value={TRUCK_LOADING_STATE.Loading.label}>
                        {TRUCK_LOADING_STATE.Loading.label}
                      </option>
                      <option value={TRUCK_LOADING_STATE.Waiting.label}>
                        {TRUCK_LOADING_STATE.Waiting.label}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="lg:flex flex-wrap justify-between gap-4 ">
                  {Array.isArray(trucks) &&
                    trucksCurShiftFiltered.length > 0 &&
                    trucksCurShiftFiltered.map((truck, i) => (
                      <div
                        key={i}
                        className={`border  ${
                          selectedTruckID === truck.id ? "" : "h-fit"
                        } lg:w-[48%]  hover:border-teal-400 rounded-md mb-2 p-2  border-slate-500 `}
                      >
                        <div className=" title-c  flex justify-between mb-2">
                          <span className="font-bold ">
                            <span className="min-w-[8rem] inline-block ">
                              {i + 1}
                              {"). "}
                              {truck.plaque}{" "}
                              <span className="hidden md:inline-block">- </span>
                            </span>

                            <span className="bg-black hidden md:inline-block text-sm p-1 rounded-lg text-white">
                              {truck.sacs} Sac(s)
                            </span>
                          </span>

                          <div className="flex justify-between  w-fit items-center ">
                            <span className=" hidden md:inline-block ">
                              Statut:{" "}
                            </span>
                            <span
                              className={`p-1 text-white text-sm px-2 rounded-lg ${
                                TRUCK_LOADING_STATE[truck.state].class
                              }`}
                            >
                              {TRUCK_LOADING_STATE[truck.state].label}
                            </span>
                            <ProgressView
                              loading={loading && selectedTruckID === truck.id}
                            />
                          </div>

                          <img
                            onClick={(e) => {
                              setSelectedTruckID(
                                selectedTruckID === truck.id ? -1 : truck.id
                              );
                            }}
                            src={arrow}
                            width={30}
                            className={` cursor-pointer  ${
                              selectedTruckID === truck.id
                                ? "rotate-0"
                                : "rotate-180"
                            }  transition-all ease-in-out duration-200    `}
                          />
                        </div>

                        <div
                          className={` details   ${
                            selectedTruckID === truck.id ? "" : "hidden"
                          } `}
                        >
                          <div className="flex-wrap gap-2 flex justify-between">
                            {[
                              {
                                label: "Sacs",
                                data: truck.sacs,
                              },
                              {
                                label: "H.A",
                                data: FormatDate(
                                  new Date(truck.HA),
                                  false,
                                  false
                                ),
                              },
                              {
                                label: "H.D.C.",
                                data: FormatDate(truck.HDC, false, false),
                              },
                              {
                                label: "H.F.C.",
                                data: FormatDate(truck.HFC, false, false),
                              },
                              {
                                label: "Chauff.",
                                data: `${truck.nameChauff} - ${truck.numChauff}`,
                              },
                              { label: "Ligne", data: truck.line },
                              { label: "Ajout/Retrait", data: truck.ajoutret },
                              { label: "Type sacs", data: truck.typesac },
                            ].map((it, i) => (
                              <div
                                key={i}
                                className="border-l p-2 border-black"
                              >
                                <div className="text-sm font-bold">
                                  {it.label}{" "}
                                  {it.label === "Sacs" ? (
                                    <span className="text-[9pt] bg-black  text-white p-[.25ex] rounded-xl px-[1ex]">
                                      {it.data}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </div>
                                <div className="text-lg">
                                  {it.label === "Sacs"
                                    ? Number.parseInt(it.data) / 20 + " T."
                                    : it.data}
                                </div>
                              </div>
                            ))}
                          </div>
                          {false && (
                            <div className="text-center">
                              <span>Satuts Chargement : </span>{" "}
                              <LoadingStateChanger
                                data={data}
                                updateLoadingState={updateLoadingState}
                              />
                            </div>
                          )}

                          <div className="w-full text-center px-1    mx-auto ">
                            {TRUCK_LOADING_STATE[truck.state].label !==
                              TRUCK_LOADING_STATE.Done.label && (
                              <div>
                                <div>Ajout/retrait de sacs</div>
                                <input
                                  defaultValue={0}
                                  ref={refAjoutRet}
                                  type="number"
                                  className="w-24 border-neutral-400 border outline-none rounded-md p-1 hover:border-purple-500 "
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex justify-around border-t my-2 py-2">
                            {(truck.state ===
                              TRUCK_LOADING_STATE.Waiting.label ||
                              truck.state ===
                                TRUCK_LOADING_STATE.Loading.label ||
                              truck.state ===
                                TRUCK_LOADING_STATE.Done.label) && (
                              <IconButton
                                title={"REMOVE"}
                                icon={del}
                                onClick={(e) => onRemoveTruck(truck)}
                                colorName={"red"}
                                outline={true}
                              />
                            )}

                            {truck.state ===
                              TRUCK_LOADING_STATE.Waiting.label && (
                              <IconButton
                                title="Demarrer Charg."
                                icon={play}
                                onClick={(e) =>
                                  onChangeChargStat(
                                    truck,
                                    TRUCK_LOADING_STATE.Loading.label
                                  )
                                }
                                colorName="green"
                                outline={true}
                              />
                            )}

                            {truck.state ===
                              TRUCK_LOADING_STATE.Loading.label && (
                              <IconButton
                                title="Fin Charg."
                                icon={stop}
                                onClick={(e) =>
                                  onChangeChargStat(
                                    truck,
                                    TRUCK_LOADING_STATE.Done.label
                                  )
                                }
                                colorName="red"
                                outline={false}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            </div>
          )}

          {curSubsection === SUBSECTIONS.FORM_NEW_TRUCK && (
            <div className="flex flex-col">
              <ProgressView loading={loading} />

              <div className="text-sky-700 text-xl text-center">
                Ajouter les informations du bon
              </div>

              <input
                name="plaque"
                className={clInput}
                value={newTruckData.plaque || ""}
                onChange={(e) => onUpdateNewTruckData(e)}
                type="text"
                placeholder="plaque"
              />

              <input
                name="code_chargement"
                className={clInput}
                value={newTruckData.code_chargement || ""}
                onChange={(e) => onUpdateNewTruckData(e)}
                type="text"
                placeholder="Code chargement"
              />

              <div>
                <div>Type de sac</div>
                <div className="flex items-center justify-around gap-4">
                  {[
                    [refSacSinoma, "32.5 (SINOMA)"],
                    [refSacNormal, "42.5 (NORMAL)"],
                  ].map((it, i) => (
                    <div>
                      <input ref={it[0]} type="radio" name="typesac" checked />
                      {it[1]}
                    </div>
                  ))}
                </div>
              </div>

              <input
                value={newTruckData.sacs || ""}
                className={clInput}
                name="sacs"
                onChange={(e) => onUpdateNewTruckData(e)}
                type="number"
                min={1}
                max={3}
                placeholder="Nombre des sacs"
              />
              <div className="flex flex-col justify-between">
                <span>Num. Machine</span>
                <DropdownList
                  data={[1, 2, 3]}
                  value={newTruckData.line || 1}
                  onChange={(value) =>
                    setNewTruckData((old) => ({ ...old, line: value }))
                  }
                />
              </div>
              <input
                value={newTruckData.HA || ""}
                className={clInput}
                placeholder="HA"
                type="datetime-local"
                name="HA"
                onChange={(e) => onUpdateNewTruckData(e)}
              />
              <input
                value={newTruckData.nameChauff || ""}
                className={clInput}
                type="text"
                placeholder="Nom chauffeur"
                name="nameChauff"
                onChange={(e) => onUpdateNewTruckData(e)}
              />
              <input
                value={newTruckData.numChauff || ""}
                name="numChauff"
                onChange={(e) => onUpdateNewTruckData(e)}
                className={clInput}
                type="number"
                placeholder="Telephone chauffeur"
              />
              <div className="border-b gap-4 text-center flex justify-center pb-2 border-slate-200 my-2">
                <button
                  className="border border-green-500 text-green-500 rounded-lg px-1 hover:text-white hover:bg-green-500"
                  onClick={(e) => onSaveNewTruckData()}
                >
                  CONFIRMER
                </button>

                <button
                  className="border border-red-500 text-red-500 rounded-lg px-1 hover:text-white hover:bg-red-500"
                  onClick={(e) => onChangeSubsection(SUBSECTIONS.TRUCKS_LIST)}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {curSubsection === SUBSECTIONS.REPPORT && (
            <>
              {loadingrepp && (
                <div className="text-green-500">Loading repport ...</div>
              )}
              {!loadingrepp && (
                <div>
                  <div>
                    <b>{data.m}</b> 月<b>{data.d}</b>日
                  </div>
                  <div>水泥包装</div>
                  <div>班/Superviseur:</div>
                  <div>
                    @<b>{data.sup}</b> Équipe <b>{data.teamCode}</b>(
                    <b>{data.teamCode}</b>班）
                  </div>
                  <div>
                    •<b>{data.shiftSymbolZH}</b>班• <b>{data.shiftName}</b>
                  </div>
                  <div>
                    从/de<b>{data.from}</b>:00到/à<b>{data.to}</b>:00
                  </div>
                  <div>
                    装车<b>{data.trucksCount}</b>辆/Camions Chargés
                  </div>
                  <div>
                    带子用个<b>{data.sacs}</b>/Sacs Utilisés
                  </div>
                  <div>
                    共计<b>{data.t}</b>吨/Tonne
                  </div>
                  <div>
                    撕裂袋子 <b>{data.dechires}</b>sacs déchirés
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
