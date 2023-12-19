import React, { useEffect, useRef, useState } from "react";
import { LoggedInUser } from "./supabase";
import ButtonLogout from "../comps/ButtonLogout";

import { DatePicker, Localization } from "react-widgets/cjs";
import { STATS_PERDIOD, STATS_PERDIOD_NAME } from "../helpers/flow";

import { DropdownList } from "react-widgets";
import { DateLocalizer } from "react-widgets/IntlLocalizer";
import { SBLoadItems } from "../db/sb";
import { makeDateReadable } from "../helpers/funcs";

const months = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(0, i);
  return date.toLocaleString("en", { month: "long" });
});

export default function Rapp(props) {
  const [statPeriod, setStatPeriod] = useState(STATS_PERDIOD.DAY);
  const [trucks, settrucks] = useState([]);
  const [trucksfil, settrucksfil] = useState([]);
  const [date, setdate] = useState(new Date());
  const [selectedDate, setselectedDate] = useState(new Date());
  const [loading, setloading] = useState(false);
  const [daterapp, setdaterapp] = useState(["period", "date"]);
  const [selectedTeams, setselectedTeams] = useState(["A", "B", "C", "D"]);
  const refeqa = useRef();
  const refeqb = useRef();
  const refeqc = useRef();
  const refeqd = useRef();

  useEffect(() => {
    loadTrucks();
  }, []);

  async function loadTrucks() {
    setloading(true);
    const data = await SBLoadItems();
    settrucks(data);
    setloading(false);
  }

  function filterTrucks(date, newperiod) {
    const period = newperiod || statPeriod;

    //console.log("newperiod", newperiod);
    //console.log("statPeriod", statPeriod);

    let day = date.getDate();
    day = day < 10 ? "0" + day : day;
    let month = date.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    const year = date.getFullYear();

    let filterCriteria = `${year}-${month}-${day}`;

    setdaterapp([statPeriod, filterCriteria]);

    if (period === STATS_PERDIOD.MONTH) {
      filterCriteria = `${year}-${month}`;
      setdaterapp([statPeriod, `${months[month - 1]} ${year}`]);
    }

    if (period === STATS_PERDIOD.YEAR) {
      filterCriteria = `${year}-`;
      setdaterapp([statPeriod, year]);
    }

    const teams = [];
    [refeqa, refeqb, refeqc, refeqd].forEach((rf, idx) => {
      const cb = rf.current;
      cb.checked && teams.push(cb.value);
    });

    setselectedTeams(teams);

    let filtered = trucks.filter((t, i) => {
      const dateCrit = t.created_at.includes(filterCriteria);
      const [teamCode, shiftCode] = t.shift_code.split("_"); //C_N_19_8_2023
      const teamCrit = teams.includes(teamCode);

      return dateCrit && teamCrit;
    });

    settrucksfil(filtered);
  }

  function onStatTypeChange(newval) {
    setStatPeriod((value) => {
      //console.log("value", value);
      //console.log("newval", newval);

      filterTrucks(date, newval);

      return newval;
    });
  }

  const refDate = useRef();
  const refMonth = useRef();
  const refYear = useRef();
  const refYearOnly = useRef();

  function onFilter(e) {
    setloading(true);
    let date, d, m, y;

    if (STATS_PERDIOD.DAY === statPeriod) {
      date =
        refDate.current.value === ""
          ? new Date()
          : new Date(Date.parse(refDate.current.value));

      d = date.getDate();
      m = date.getMonth() + 1;
      y = date.getFullYear();
    }

    if (STATS_PERDIOD.MONTH === statPeriod) {
      m = parseInt(refMonth.current.value);
      y = parseInt(refYear.current.value);

      date = new Date(Date.parse(`${y}-${m}-01`));

      //console.log("cur date => ", date);
    }

    if (STATS_PERDIOD.YEAR === statPeriod) {
      y = parseInt(refYearOnly.current.value);

      date = new Date(Date.parse(`${y}-01-01`));

      //console.log("cur date => ", date);
    }

    setselectedDate(date);
    filterTrucks(date, statPeriod);
    setloading(false);
  }

  const [q, setq] = useState("");
  function onSearch(sq) {
    setq(sq);
    //console.log(sq);

    settrucksfil(
      trucks.filter((t, i) => t.plaque.toLowerCase().includes(sq.toLowerCase()))
    );
  }

  const [showFilter, toggleShowFilter] = useState(true);

  return (
    <div>
      <div className=" font-bold p-2 text-center">
        <div>Statistics de chargement</div>
        <div>
          <div className="form-control w-52 text-center  mx-auto">
            <label className="cursor-pointer label">
              <span className="label-text">Show/Hide Filter</span>
              <input
                type="checkbox"
                onChange={(e) => toggleShowFilter(e.target.checked)}
                className="toggle toggle-accent"
                checked={showFilter}
              />
            </label>
          </div>
        </div>
      </div>

      <div
        className={` ${
          !showFilter ? "max-h-0 overflow-hidden" : "max-h-max"
        } ease-in-out duration-1000 transition-all maxh  md:flex gap-4 justify-around `}
      >
        <div className="FILTER min-w-[40%] bg-neutral-200 p-4 rounded-md border border-neutral-400 ">
          <table className=" w-full">
            <thead>
              <tr>
                <td colSpan={2} className=" font-bold text-center py-4">
                  FILTER SETTINGS
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td align="right">Period</td>
                <td>
                  {" "}
                  <select
                    value={statPeriod}
                    onChange={(e) => onStatTypeChange(e.target.value)}
                  >
                    {Object.values(STATS_PERDIOD).map((curperiod, i) => (
                      <option>{curperiod}</option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td align="right">Date</td>
                <td>
                  {STATS_PERDIOD.DAY === statPeriod && (
                    <input ref={refDate} type="date" />
                  )}

                  {STATS_PERDIOD.MONTH === statPeriod && (
                    <div>
                      <div>
                        <select ref={refMonth}>
                          {months.map((cm, i) => (
                            <option value={i + 1}>
                              {cm} - {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        {" "}
                        <select ref={refYear}>
                          {[...Array(15)].map((it, i) => (
                            <option value={new Date().getFullYear() - i}>
                              {new Date().getFullYear() - i}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {STATS_PERDIOD.YEAR === statPeriod && (
                    <div>
                      <select ref={refYearOnly}>
                        {[...Array(15)].map((it, i) => (
                          <option value={new Date().getFullYear() - i}>
                            {new Date().getFullYear() - i}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td align="right">Equipe(s)</td>
                <td className="flex gap-2 p-2">
                  <div>
                    <input type="checkbox" checked value="A" ref={refeqa} />A
                  </div>
                  <div>
                    <input type="checkbox" checked value="B" ref={refeqb} />B
                  </div>
                  <div>
                    <input type="checkbox" checked value="C" ref={refeqc} />C
                  </div>
                  <div>
                    <input type="checkbox" checked value="D" ref={refeqd} />D
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="p-2">
                  <input
                    className="p-2 border-none outline rounded-md outline-1 hover:outline-lime-500 w-full"
                    type="search"
                    placeholder="Search by number plate ..."
                    value={q}
                    onChange={(e) => onSearch(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <button
                    className=" m-4 md:mx-auto btn btn-primary mx-auto md:w-full md:max-w-sm"
                    onClick={onFilter}
                  >
                    FILTER DATA
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="RAPPORT min-w-[40%] bg-neutral-200 p-4 rounded-md border border-neutral-400 ">
          <table className="w-full">
            <thead>
              <tr>
                {
                  //
                }
                <td colSpan={2} className=" font-bold text-center py-4">
                  <div>RAPPORT</div> <div>{STATS_PERDIOD_NAME[statPeriod]}</div>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{daterapp[0]} : </td>
                <td className="font-bold">{daterapp[1]}</td>
              </tr>
              <tr>
                <td>Equipe(s)</td>
                <td className="font-bold">
                  {selectedTeams.length > 0 &&
                    selectedTeams.map((eq, i) => (
                      <span className="p-1 rounded-md bg-black text-white mr-2">
                        {eq}
                      </span>
                    ))}
                </td>
              </tr>
              <tr>
                <td>Nomber de camions</td>
                <td className="font-bold">{trucksfil.length} Camion(s).</td>
              </tr>
              <tr>
                <td>Nomber de sacs</td>
                <td className="font-bold">
                  {trucksfil.reduce((acc, t) => acc + t.sacs, 0)} Sac(s).
                </td>
              </tr>

              <tr>
                <td>Tonnages</td>
                <td className="font-bold">
                  {trucksfil.reduce((acc, t) => acc + t.sacs, 0) / 20} T.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <div>
          {loading && <progress className="progress w-full"></progress>}
          <table className="text-sm">
            <thead>
              <tr>
                <td
                  align="center"
                  colSpan={13}
                  className="border  font-bold border-black p-4"
                >
                  RAPPORT{" "}
                  {statPeriod === STATS_PERDIOD.DAY &&
                    selectedDate.toLocaleDateString()}
                  {statPeriod === STATS_PERDIOD.MONTH &&
                    `${
                      months[selectedDate.getMonth()]
                    }-${selectedDate.getFullYear()}`}
                  {statPeriod === STATS_PERDIOD.YEAR &&
                    selectedDate.getFullYear()}
                </td>
              </tr>
              <tr>
                {[
                  "ID(卡车数据)", //0
                  "Plaque(卡车牌号)", //1
                  "HEURE D'ARRIVEE(卡车到达时间)", //2
                  "H. DEBUT CHARG.(装在开始时间)", //3
                  "H. FIN CHARG.(装在结束时间)", //4
                  "TEMPS CHARG.(装在时间)", //5
                  "QTE CHARG.(包装袋数量)", //6
                  "TYPE DE SAC(袋子性)", //8
                  "NUM. CHAUFF.(司机手机号)", //9
                  "VOIE DE CHARG.(装车间道)", //10
                  "AJOUT/RETR.(补袋)", //11
                  "SHIFT CODE (班次)", //12
                ].map((it, i) => (
                  <td className="border p-1 font-bold border-black" key={i}>
                    {it}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {trucksfil.map((currentTruck, i) => (
                <tr key={i}>
                  {[
                    currentTruck.id,
                    currentTruck.plaque,
                    makeDateReadable(
                      new Date(Date.parse(currentTruck.created_at))
                    ),
                    currentTruck.HDC &&
                      makeDateReadable(new Date(Date.parse(currentTruck.HDC))),
                    currentTruck.HFC &&
                      makeDateReadable(new Date(Date.parse(currentTruck.HFC))),
                    "",
                    currentTruck.sacs,

                    currentTruck.typesac,
                    currentTruck.numChauff,
                    currentTruck.line,
                    currentTruck.ajoutret,
                    currentTruck.shift_code,
                  ].map((currentTruckData, i) => (
                    <td className="border p-1 border-black" key={i}>
                      {currentTruckData}
                    </td>
                  ))}
                </tr>
              ))}

              <tr>
                {[
                  "",
                  "",
                  "",

                  "",
                  "",
                  "",
                  trucksfil.reduce((acc, cv) => acc + cv.sacs, 0),

                  "",
                  "",
                  "",
                  trucksfil.reduce(function (acc, cv) {
                    return cv.ajoutret < 0 ? acc : acc + cv.ajoutret;
                  }, 0),
                  "",
                ].map((d, i) => (
                  <td className="border p-1 border-black" key={i}>
                    {d}
                  </td>
                ))}
              </tr>

              {trucksfil.length === 0 && (
                <tr>
                  <td
                    className="p-4 border-black border"
                    align="center"
                    colSpan={13}
                  >
                    <div>
                      <p>No trucks!</p>
                      <p>Select time period to filter trucks!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
