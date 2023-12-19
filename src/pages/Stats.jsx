import React, { useEffect, useState } from "react";
import LogoShuiNiCheJian from "../comps/LogoShuiNiCheJian";
import rhyf from "../assets/rhyf.jpg";
import { Link } from "react-router-dom";
import {
  GetDateParts,
  ShowTodaysDate,
  GetMonthNumDays,
} from "../helpers/funcs";
import {
  GetTeamWorkingOnDayAndTime,
  LoadInfos,
  LoadRoulementAndSchedMatrix,
} from "../helpers/Shifts";
import { SBInsertItem, SBLoadItemWhereColEqVal, SBLoadItems } from "../db/sb";
import { TABLE_NAMES, clInput } from "../helpers/flow";
const colors = [
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-rose-500",
];

function StatsCard({ bgColor, children }) {
  bgColor = bgColor === undefined ? "bg-sky-500" : bgColor;

  return (
    <div
      className={`${bgColor} hover:shadow-md hover:shadow-slate-400 text-white p-4 flex-grow rounded-lg`}
    >
      {children}
    </div>
  );
}

function Footer({}) {
  return (
    <div className="text-xs text-neutral-700 py-8 text-center">
      <div>Code and Design by</div>
      <div className="font-bold text-blue-500">
        <span className=" hover:underline">
          <Link to="">Ir. Franvale M.K</Link>
        </span>
        {"  -  "}
        <span className=" hover:underline">
          <Link to="https://github.com/doctarhyf"> @DoctaRhyf </Link>
          <Link to="https://github.com/doctarhyf"> (drrhyf@gmail.com) </Link>
        </span>
      </div>
      <div className="text-black font-bold">©2023 FRSoftware LTD.</div>
    </div>
  );
}

export default function Home({ toggleLoadingView }) {
  const [workingTeamInfo, setWorkingTeamInfo] = useState(undefined);
  const [infos, setInfos] = useState([]);
  const [infotxt, setInfotxt] = useState("");
  const [curShiftTrucksData, setCurShiftTrucksData] = useState([]);
  const [curMonthTrucksData, setCurMonthTrucksData] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [currentMonthLoad, setCurrentMonthLoad] = useState();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    let { schedMatrix } = await LoadRoulementAndSchedMatrix();

    let workingTeamInfo = GetTeamWorkingOnDayAndTime(
      schedMatrix,
      new Date().getDate()
    );

    setWorkingTeamInfo(workingTeamInfo);

    //loadInfos

    let infos = await LoadInfos();

    setInfos(infos);
    //  console.log("infos", infos);

    const trucks = await SBLoadItems(TABLE_NAMES.TRUCKS);

    let curTrucksData = trucks.filter(
      (t, i) => t.shift_code === workingTeamInfo?.shift_code
    );

    setCurShiftTrucksData(curTrucksData);

    let [teamCode, shiftSymbol, date, month, year] =
      workingTeamInfo.shift_code.split("_");

    month = parseInt(month) + 1;
    month = month < 10 ? "0" + month : month;

    let currentYearMonth = `${year}-${month}`;

    const monthTrucksData = trucks.filter((t, i) =>
      t.created_at.includes(currentYearMonth)
    );

    setCurMonthTrucksData(monthTrucksData);
    //loadCurrentMonthLoadedData();
    console.log(currentMonthLoad);
  }

  async function addInfotx() {
    if (infos.length === 5) {
      alert("Sorry max daily info limit is 5!");
      return;
    }
    const newinfo = {
      text: infotxt,
      expired: false,
    };
    setInfos((old) => [...old, newinfo]);

    try {
      toggleLoadingView(true);
      const res = await SBInsertItem(newinfo, TABLE_NAMES.INFOS);
      console.log("add info res ==>> ", res);
    } catch (e) {
      alert(`Error: \n${e}`);
      toggleLoadingView(false);
    } finally {
      toggleLoadingView(false);
    }
  }

  return (
    <div>
      <LogoShuiNiCheJian />
      <p className="text-center italic p-4">
        <div>Bienvenue sur le portal de management de la Cimenterie.</div>
        <div>欢迎访问水泥厂的管理门户。</div>
      </p>

      {workingTeamInfo === undefined && (
        <div className="text-center p-4 text-white bg-green-500 rounded-full">
          Loading stats ...
        </div>
      )}

      {workingTeamInfo && (
        <div className="flex flex-wrap gap-4">
          <StatsCard bgColor={colors[0]}>
            <div>Info du jour ( {ShowTodaysDate()} )</div>

            <ul>
              {infos.length === 0 && (
                <div className="text-black">No Info for now!</div>
              )}

              {infos.map((inf, i) => (
                <li key={i}>
                  <p>
                    <span className=" rounded-full bg-black w-[4pt] h-[4pt] inline-block  justify-center items-center p-1 gap-2 mx-2 "></span>
                    {inf.text}
                  </p>
                </li>
              ))}

              <li>
                <input
                  type="text"
                  value={infotxt}
                  onChange={(e) => setInfotxt(e.target.value)}
                  placeholder="add info ..."
                  className={`${clInput} w-full  text-black `}
                  onKeyUp={(e) => e.code === "Enter" && addInfotx()}
                />
              </li>
            </ul>
          </StatsCard>

          <StatsCard bgColor={colors[1]}>
            {workingTeamInfo !== undefined && (
              <div>
                CHARGEMENT DE L'EQUIPE COURANTE / 当前团队的装载 (Eq.{" "}
                {workingTeamInfo.teamCode}, de {workingTeamInfo.from}H a{" "}
                {workingTeamInfo.to}H)
              </div>
            )}
            <div className="flex justify-around">
              <div className="flex justify-center items-center flex-col">
                <div className="text-xs uppercase font-bold">CAMIONS/车数</div>
                <div className="text-[32pt]">{curShiftTrucksData.length}</div>
              </div>
              <div className="flex justify-center items-center  min-w-[30%] border-l border-r flex-col">
                <div className="text-xs uppercase font-bold">SACS/袋数</div>
                <div className="text-[32pt]">
                  {curShiftTrucksData.reduce((acc, cv) => acc + cv.sacs, 0)}
                </div>
              </div>
              <div className="flex justify-center items-center flex-col">
                <div className="text-xs uppercase font-bold">TON./吨数</div>
                <div className="text-[32pt]">
                  {curShiftTrucksData.reduce((acc, cv) => acc + cv.sacs, 0) /
                    20}
                </div>
              </div>
            </div>
            <div className="bg-black mx-auto mt-4 text-white p-1 px-2 w-fit rounded-full">
              {" "}
              {workingTeamInfo.shift_code}{" "}
            </div>
          </StatsCard>

          <StatsCard bgColor={colors[2]}>
            <div>PROGR. TONNAGE MENSUEL/月度吨位</div>

            <div className="p-1 bg-black w-fit text-white rounded-full px-2 ">
              TARGET: 60000T
            </div>

            <progress
              className="progress progress-success w-full "
              value={
                curMonthTrucksData.reduce((acc, cv) => acc + cv.sacs, 0) / 20
              }
              max={60000}
            ></progress>
            <div className="text-[42pt]">
              {
                curMonthTrucksData.reduce((acc, cv) => acc + cv.sacs, 0) / 20
                //currentMonthLoad
              }{" "}
              T
            </div>
          </StatsCard>

          <StatsCard bgColor={colors[3]}>
            <div>JOURS RESTANT DU MOIS / 本月剩余天数</div>
            <div className="p-1 bg-black w-max text-white rounded-full px-2 ">
              {JSON.stringify(GetDateParts().day)}th / {GetMonthNumDays().count}
              {GetMonthNumDays().ext}
            </div>
            <progress
              className="progress progress-success w-full "
              value={GetDateParts().day}
              max={GetMonthNumDays().count}
            ></progress>
            <div className="text-[42pt]">
              {GetMonthNumDays().remaining} J/天
            </div>
          </StatsCard>

          <StatsCard bgColor={colors[4]}>
            <div>CURRENT TEAM/当前团队</div>
            <div className="flex justify-around px-4 divide-x-2 divide-slate-500">
              {workingTeamInfo === undefined && <div className="">Loading</div>}

              {workingTeamInfo && (
                <div className="data flex flex-col md:flex-row">
                  <div className=" text-[36pt] md:text-[60pt]  h-[120px] text-white px-4">
                    <div className=" bg-black text-center min-w-[1ex] mx-auto px-1 h-min ">
                      {" "}
                      {workingTeamInfo && workingTeamInfo.teamCode}
                    </div>
                    <div className="text-sm">Chargement du mois: 45670 T</div>
                    <div className="text-sm">Prime du mois: 2,345,000.00Fc</div>
                  </div>

                  <div className="px-4">
                    <div className="text-3xl  border-t py-2 border-neutral-300/40">
                      <img
                        className=" rounded-full mr-2 "
                        width={42}
                        src={rhyf}
                      />
                      {workingTeamInfo &&
                        workingTeamInfo.teamData?.sup?.name?.fr}
                      ({" "}
                      {workingTeamInfo &&
                        workingTeamInfo.teamData?.sup?.name?.ch}
                      )
                    </div>

                    <div>Superviseur/班长</div>
                    <div className="text-3xl border-t py-2 border-neutral-300/40">
                      <img
                        className=" rounded-full mr-2  "
                        width={42}
                        src={rhyf}
                      />
                      {workingTeamInfo &&
                        workingTeamInfo.teamData?.deq?.name?.fr}{" "}
                      ({" "}
                      {workingTeamInfo &&
                        workingTeamInfo.teamData?.deq?.name?.ch}
                      )
                    </div>
                    <div>Chef d'Equipe/小班长</div>
                  </div>
                </div>
              )}
            </div>
          </StatsCard>
        </div>
      )}

      <Footer />
    </div>
  );
}
