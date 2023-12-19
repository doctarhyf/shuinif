import React, { useRef, useState } from "react";
import CardWorkingTeam from "../comps/CardWorkingTeam";
import { ContactView } from "../comps/ContactView";
import FormAddNewAgent from "../comps/FormAddNewAgent";
import * as SB from "../db/sb";
import add_user from "../assets/icons/add_user.png";
import {
  GetNumDaysInCurrentMonth,
  GetNumWorkDaysInMonth,
  GetTeamWorkingOnDayAndTime,
  LoadRoulementAndSchedMatrix,
  MONTHS_NAMES,
  ParseSchedMatrixFromSched,
} from "../helpers/Shifts";
import { SECTIONS_ROULEMENT as SECTIONS, TABLE_NAMES } from "../helpers/flow";
import GetNumDaysInMonth, { GetDateParts } from "../helpers/funcs";
import list from "../assets/icons/list.png";
import IconButton from "../comps/IconButton";
import { supabase } from "../db/sb.config";

const cell = "p-1 border border-sky-800 text-sm text-center min-w-[22pt] ";

const FILTERS = {
  ALL: "All",
};

function SchedEditor({ data, selectedAgent, onUpdateSched }) {
  const { currentVal, dayIndex } = data;
  const [val, setval] = useState(currentVal);

  function onSchedValChange(newVal) {
    console.log(selectedAgent);

    let old_sched = selectedAgent.sched;
    let old_sched_a = old_sched.split("");
    old_sched_a[dayIndex] = newVal;
    let new_sched = old_sched_a.join("");

    selectedAgent.sched = new_sched;
    setval(newVal);

    onUpdateSched(selectedAgent);
  }

  return (
    <div>
      <select onChange={(e) => onSchedValChange(e.target.value)} value={val}>
        <option>M</option>
        <option>P</option>
        <option>N</option>
        <option>R</option>
        <option>-</option>
      </select>
    </div>
  );
}

export default function SchedNew({ toggleLoadingView }) {
  const [rl_days_count, setrl_days_count] = useState(-1);

  const refMonth = useRef();
  const refYear = useRef();
  const [selectedMonthData, setSelectedMonthData] = useState({
    month_id: 10,
    month_name: "Nov",
    next_month_id: 11,
    next_month_name: "Dec",
    year: 2023,
    rlcode: "2023_11",
    currentMonthRoulementDaysCount: 30,
    currentMonthDaysCount: 30,
    days_data: [],
    p_month: { name: "prev month name", days: [] },
    n_month: { name: "next_month_name", days: [] },
  });
  const [error, seterror] = useState(undefined);
  const [q, setq] = useState("");
  const [filter, setfilter] = useState(FILTERS.ALL);
  const [agentsScheds, setAgentsScheds] = useState([]);
  const [agentsSchedsFiltered, setAgentsSchedsFitered] = useState([]);
  const [loading, setloading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(undefined);
  const [selectedSection, setSelectedSection] = useState(SECTIONS.ROULEMENT);
  const [isEditingMode, setIsEditingMode] = useState(false);

  useState(() => {
    loadData();
  }, []);

  async function loadData() {
    setloading(true);
    seterror(null);

    try {
      const agentsData = await SB.SBLoadItems(TABLE_NAMES.AGENTS);
      const schedsData = await SB.SBLoadItems(TABLE_NAMES.SCHEDULE_NEW);

      const agentsSchedsParsedData = parseAgentsAndScheds(
        agentsData,
        schedsData
      );

      setAgentsScheds(agentsSchedsParsedData);
      setAgentsSchedsFitered(agentsSchedsParsedData);

      const date = new Date();
      onUpdateRoulementMonth(date.getFullYear(), date.getMonth());
    } catch (e) {
      console.log(e);
      seterror(e);
      setloading(false);
    } finally {
      seterror(null);
      setloading(false);
    }
  }

  function parseAgentsAndScheds(agentsData, schedsData) {
    let agentsDataObj = {};
    let schedsDataObj = {};

    schedsData.forEach((cv, i) => (schedsDataObj[cv.agent_id] = cv));
    agentsData.forEach((cv, i) => {
      let cv_upd = cv;
      //console.log(cv_upd);
      const cv_sched = schedsDataObj[cv.id] && schedsDataObj[cv.id].rl;
      cv_upd.sched =
        cv_sched === undefined
          ? [...Array(GetNumWorkDaysInMonth()).fill("-")].join("")
          : cv_sched;
      agentsDataObj[cv.id] = cv_upd;
    });

    const res = Object.values(agentsDataObj);
    console.log(res);
    return res;
  }

  function onSearch(s) {
    if (s.trim().toLowerCase() === "") {
      setAgentsSchedsFitered(agentsScheds);
      return;
    }

    let d = agentsScheds.filter(
      (it, i) =>
        it.nom.toLowerCase().includes(s.toLowerCase()) ||
        it.postnom.toLowerCase().includes(s.toLowerCase()) ||
        it.prenom.toLowerCase().includes(s.toLowerCase())
    );

    setAgentsSchedsFitered(d);
  }

  function onResetSelectedAgentSched() {
    //setSelectedAgent(undefined);

    const emptySched = [...Array(GetNumWorkDaysInMonth()).fill("-")].join("");
    let updAgent = selectedAgent;
    updAgent.sched = emptySched;

    const selectedAgentIdx = agentsScheds.findIndex(
      (cv, i) => cv.id === selectedAgent.id
    );

    agentsScheds[selectedAgentIdx] = updAgent;

    setAgentsScheds(agentsScheds);
    setAgentsSchedsFitered(agentsScheds);
    setSelectedAgent(undefined);

    console.log("selectedAgentIdx => ", selectedAgentIdx);
  }

  async function onUpdateSched(newAgentData) {
    setSelectedAgent(newAgentData);
    setloading(true);

    const { id } = newAgentData;

    const { rlcode } = selectedMonthData;
    const tableName = TABLE_NAMES.SCHEDULE_NEW;
    const col_agent_id = "agent_id";
    const agent_id = id;
    const col_rlcode = "rlcode";

    let newAgentRoulement = {
      rlcode: rlcode,
      rl: [
        ...Array(selectedMonthData.currentMonthRoulementDaysCount).fill("-"),
      ].join(""),
      agent_id: parseInt(id),
    };

    const res = await SB.SBUpdateRL(
      tableName,
      newAgentRoulement,
      selectedMonthData,
      col_agent_id,
      agent_id,
      col_rlcode,
      rlcode
    );

    console.log(`SBUpdateRL res : ${res}`);

    setloading(false);
  }

  function onSaveSched() {
    onUpdateSched(selectedAgent);
  }

  function onUpdateRoulementMonth(year, month) {
    year = parseInt(year); // parseInt(refYear.current?.value);
    month = parseInt(month); //(refMonth.current?.value);

    let next_month = month + 1;
    if (next_month > 11) {
      //month = 0;
      next_month = 0;
      year++;
    }

    const month_name = MONTHS_NAMES[month];
    const next_month_name = MONTHS_NAMES[next_month];

    const month_data = {
      month_id: month,
      month_name: month_name,
      next_month_id: next_month,
      next_month_name: next_month_name,
      year: year,
    };

    let rl_code_month = month + 1;
    rl_code_month = rl_code_month < 10 ? "0" + rl_code_month : rl_code_month;
    let rl_code_year = month === 11 ? year - 1 : year;

    const current_rl_code = `${rl_code_year}_${rl_code_month}`;
    month_data.rlcode = current_rl_code;

    console.log(month_data);

    let { count: currentMonthDaysCount } = GetNumDaysInMonth(year, month);
    let { count: nextMonthDaysCount } = GetNumDaysInMonth(year, next_month);
    const currentMonthRoulementDaysCount = currentMonthDaysCount - 20; // current month days count minus 20 days from last month plus 1 day included ( 21st )

    month_data.currentMonthRoulementDaysCount =
      currentMonthRoulementDaysCount + 20; // add 20 days from next month
    month_data.currentMonthDaysCount = currentMonthDaysCount;
    let days_data = [];
    let p_month = { name: month_name, days: [] };
    let n_month = { name: next_month_name, days: [] };

    let date = 20;
    let in_prev_month = true;
    for (let i = 1; i < month_data.currentMonthRoulementDaysCount + 1; i++) {
      date++;
      if (date == currentMonthDaysCount + 1) {
        date = 1;
        in_prev_month = false;
      }

      if (in_prev_month) {
        p_month.days.push(date);
      } else {
        n_month.days.push(date);
      }
      days_data.push(date);
      //console.log(i, " => ", date);
    }

    month_data.days_data = days_data;
    month_data.p_month = p_month;
    month_data.n_month = n_month;

    //console.log(month_data);
    setSelectedMonthData(month_data);

    /*  console.log(
      "onDateChange(): ",
      " y => ",
      rl_code_year,
      " m => ",
      rl_code_month
    ); */
  }

  function onSaveRoulement() {
    console.log("onSaveRoulement");
  }

  function onSelectCurMonth() {
    const date = new Date();
    refYear.current.value = date.getFullYear();
    refMonth.current.value = date.getMonth();
    onUpdateRoulementMonth(refYear.current.value, refMonth.current.value);
  }

  return (
    <div>
      <div
        className={`text-green-500 ${
          loading ? " opacity-100 " : "opacity-0"
        } transition-opacity ease-in-out duration-150  text-center w-full `}
      >
        Loading ...
      </div>

      {error && (
        <div className="bg-red-500 text-center rounded-md my-4  text-white p-2">
          Error: {JSON.stringify(error)}
        </div>
      )}

      <section className="p-2 md:p-0 border-b md:border-b-sky-500 md:justify-center text-center flex flex-col md:flex-row gap-4">
        {Object.values(SECTIONS).map(
          (sec, i) =>
            sec.showInTopBar && (
              <button
                onClick={(e) => setSelectedSection(sec)}
                key={sec.id}
                className={`p-2 ${
                  sec.id === selectedSection.id
                    ? "bg-sky-500 text-white"
                    : "text-sky-500"
                } md:rounded-none md:rounded-t-md md:border-b-0  rounded-md  border border-sky-500  hover:bg-sky-500 hover:text-white `}
              >
                {sec.fr}
              </button>
            )
        )}
      </section>

      <div className=" py-2 border-b">
        <div className=" text-sky-500  ">
          {selectedSection.fr} ( {selectedSection.zh} )
        </div>
      </div>

      <main>
        {selectedSection.id === SECTIONS.ROULEMENT.id && (
          <>
            {selectedAgent === undefined && (
              <div>
                <div>
                  <div>
                    Select Year:
                    <select
                      ref={refYear}
                      name="y"
                      onChange={(e) =>
                        onUpdateRoulementMonth(
                          refYear.current.value,
                          refMonth.current.value
                        )
                      }
                    >
                      {[...Array(10).fill(0)].map((y, i) => (
                        <option>{i + 2023}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    Select Month:
                    <select
                      ref={refMonth}
                      name="m"
                      onChange={(e) =>
                        onUpdateRoulementMonth(
                          refYear.current.value,
                          refMonth.current.value
                        )
                      }
                    >
                      {MONTHS_NAMES.map((m, i) => (
                        <option value={i}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={(e) => onSelectCurMonth()}
                    className="border rounded-md border-sky-500 px-2 text-sky-500 hover:bg-sky-500 hover:text-white "
                  >
                    {" "}
                    Current Month{" "}
                  </button>

                  <div>
                    Nums Days For Current Period:{" "}
                    {selectedMonthData.currentMonthRoulementDaysCount}
                  </div>
                </div>

                <div>
                  <input
                    className="p-1 px-2 hover:border-purple-500 focus:border-purple-800  rounded-md outline-none border"
                    onChange={(e) => onSearch(e.target.value)}
                    type="search"
                    placeholder="Search ..."
                  />

                  <div>
                    <div className="form-control w-52">
                      <label className="cursor-pointer label">
                        <div>
                          <span className="label-text">Edit Mode</span>
                          {isEditingMode && (
                            <span className="p-1 px-2 mx-1 bg-success text-xs font-bold text-white  rounded-md">
                              EDITING ...
                            </span>
                          )}
                        </div>
                        <input
                          checked={isEditingMode}
                          type="checkbox"
                          className="toggle toggle-success"
                          onChange={(e) => setIsEditingMode(e.target.checked)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {!loading && (
                  <table>
                    <thead>
                      <tr>
                        <td
                          className={cell}
                          colSpan={3 + selectedMonthData.days_data.length}
                          align="center"
                        >
                          <div className="text-center text-3xl my-4">
                            Roulement, {selectedMonthData.month_name} -{" "}
                            {selectedMonthData.next_month_name}{" "}
                            {selectedMonthData.year}
                          </div>
                          <div>
                            Code Roulement :{" "}
                            <span className="bg-black text-white rounded-md px-2 py-1">
                              {selectedMonthData.rlcode}
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className={cell} colSpan={3}>
                          Mois ( {selectedMonthData.currentMonthDaysCount} Jours
                          )
                        </td>
                        <td
                          className={cell}
                          colSpan={selectedMonthData.p_month.days.length}
                        >
                          {selectedMonthData.p_month.name} -{" "}
                          {selectedMonthData.p_month.days.length}Jours
                        </td>
                        <td
                          className={cell}
                          colSpan={selectedMonthData.n_month.days.length}
                        >
                          {selectedMonthData.n_month.name} -{" "}
                          {selectedMonthData.n_month.days.length}Jours
                        </td>
                      </tr>
                      <tr>
                        <td className={cell} colSpan={3}>
                          Date
                        </td>
                        {selectedMonthData.days_data.map((day, i) => (
                          <td className={cell} key={i}>
                            {day}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        {["Num", "Nom", "Agent"].map((it, i) => (
                          <td key={i} className={cell}>
                            {it}
                          </td>
                        ))}
                        {[...Array(GetNumWorkDaysInMonth())].map((date, i) => (
                          <td key={i} className={cell}>
                            {i}
                          </td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {agentsSchedsFiltered.map((ag, i) => (
                        <tr
                          key={i}
                          className={` ${
                            isEditingMode
                              ? " hover:bg-success/50 cursor-pointer"
                              : ""
                          }`}
                          onClick={(e) => {
                            if (isEditingMode) {
                              setSelectedAgent(ag);
                            } else {
                              setSelectedAgent(undefined);
                            }
                          }}
                        >
                          <td className={cell}>{ag.id}</td>
                          <td className={cell}>
                            {ag.nom} {ag.postnom}
                          </td>
                          <td className={cell}>{ag.contrat}</td>
                          {ag.sched.split("").map((d, i) => (
                            <td className={cell}>{d}</td>
                          ))}{" "}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {selectedAgent && (
              <div>
                <div>Exist: {}</div>
                <div>{selectedMonthData.rlcode}</div>
                <div className="my-2 flex gap-4">
                  {" "}
                  <button
                    className="p-1 px-2 hover:bg-red-500 hover:text-white border-red-500 text-red-500  border rounded-md"
                    onClick={(e) => setSelectedAgent(undefined)}
                  >
                    Cancel
                  </button>
                  <button
                    className="p-1 px-2 hover:text-white hover:bg-sky-500 border-sky-500 text-sky-500  border rounded-md"
                    onClick={(e) => onSaveSched()}
                  >
                    SAVE
                  </button>
                  <button
                    className="p-1 px-2 hover:text-white hover:bg-green-500 border-green-500 text-green-500  border rounded-md"
                    onClick={(e) => onResetSelectedAgentSched()}
                  >
                    RESET
                  </button>
                </div>
                <div>
                  <tr
                    className=""
                    onClick={(e) => {
                      if (isEditingMode) {
                        setSelectedAgent(selectedAgent);
                      } else {
                        setSelectedAgent(undefined);
                      }
                    }}
                  >
                    <td className={cell}>{selectedAgent.id}</td>
                    <td className={cell}>
                      {selectedAgent.nom} {selectedAgent.postnom}
                    </td>
                    <td className={cell}>{selectedAgent.contrat}</td>
                    {selectedAgent.sched.split("").map((d, i) => (
                      <td className={cell}>
                        <SchedEditor
                          data={{ dayIndex: i, currentVal: d }}
                          selectedAgent={selectedAgent}
                          onUpdateSched={onUpdateSched}
                        />
                      </td>
                    ))}{" "}
                  </tr>
                </div>
              </div>
            )}
          </>
        )}

        {/*  {selectedSection.id === SECTIONS.ROULEMENT_SETTINGS.id && (
          <>
            <div>
              <div>
                Select Year:
                <select
                  ref={refYear}
                  name="y"
                  onChange={(e) =>
                    onUpdateRoulementMonth(
                      refYear.current.value,
                      refMonth.current.value
                    )
                  }
                >
                  {[...Array(10).fill(0)].map((y, i) => (
                    <option>{i + 2023}</option>
                  ))}
                </select>
              </div>
              <div>
                Select Month:
                <select
                  ref={refMonth}
                  name="m"
                  onChange={(e) =>
                    onUpdateRoulementMonth(
                      refYear.current.value,
                      refMonth.current.value
                    )
                  }
                >
                  {MONTHS_NAMES.map((m, i) => (
                    <option value={i}>{m}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={(e) => onSelectCurMonth()}
                className="border rounded-md border-sky-500 px-2 text-sky-500 hover:bg-sky-500 hover:text-white "
              >
                {" "}
                Current Month{" "}
              </button>
              <div>Code Roulement : {selectedMonthData.rlcode}</div>
              <div>
                Nums Days For Current Period:{" "}
                {selectedMonthData.currentMonthRoulementDaysCount}
              </div>
            </div>
            <div className="text-center text-3xl my-4">
              Roulement, {selectedMonthData.month_name} -{" "}
              {selectedMonthData.next_month_name} {selectedMonthData.year}
            </div>

            <div className="  ">
              <div className="w-full text-center text-3xl">
                {selectedMonthData.month_name}
              </div>
              <div>
                {selectedMonthData.days_data.map((it, i) => (
                  <input
                    className="w-14 p-2 border rounded-md"
                    key={i}
                    type="number"
                    placeholder={it}
                  />
                ))}
              </div>
              <div className="my-4 flex justify-center gap-4">
                <button
                  onClick={(e) => onSaveRoulement()}
                  className="bg-success/80 hover:bg-success text-white px-2 py-1 rounded-md"
                >
                  SAVE
                </button>
                <button
                  onClick={(e) => setSelectedSection(SECTIONS.ROULEMENT)}
                  className="bg-error/80 hover:bg-error text-white px-2 py-1 rounded-md"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </>
        )} */}

        {selectedSection.id === SECTIONS.AGENTS.id && <div></div>}

        {selectedSection.id === SECTIONS.AGENT_CARD.id && <div></div>}
      </main>
    </div>
  );
}
