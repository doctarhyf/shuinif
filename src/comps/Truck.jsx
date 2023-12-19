import React, { useEffect, useState } from "react";
import { FormatDate, TABLE_NAMES, TRUCK_LOADING_STATE } from "../helpers/flow";
import LoadingStateChanger from "./LoadingStateChanger";
import IconButton from "./IconButton";
import play from "../assets/icons/play.png";
import stop from "../assets/icons/stop.png";
import arrow from "../assets/icons/arrow.png";
import del from "../assets/icons/del.png";
import { SBUpdateItem, SBUpdateItemWithID } from "../db/sb";
import ProgressView from "./ProgressView";

export default function Truck({
  num,
  data,
  showDetails,
  onTruckClicked,
  updateLoadingState,
  autoCloseTruckStats,
  onRemoveTruck,
}) {
  let { id, plaque, HA, HDC, HFC, nameChauff, numChauff, line, sacs, state } =
    data;

  const [loading, setLoading] = useState(false);
  const [opened, setopened] = useState(false);
  const [truckState, setTruckState] = useState(state);

  async function onChangeChargStat(newState) {
    setLoading(true);

    data.state = newState;

    if (newState === TRUCK_LOADING_STATE.Loading.label) {
      data.HDC = new Date().toISOString();
    }

    if (newState === TRUCK_LOADING_STATE.Done.label) {
      data.HFC = new Date().toISOString();
    }

    SBUpdateItemWithID(
      data,
      TABLE_NAMES.TRUCKS,
      (res) => {
        console.log(res);
        setTruckState(newState);
        setLoading(false);
      },
      (e) => {
        console.log(e);
        alert(e);
        setLoading(false);
      }
    );
  }

  return (
    <div
      className={`border  hover:border-teal-400 rounded-md mb-2 p-2  border-slate-500 `}
    >
      <div className="flex justify-between mb-2">
        <span className="font-bold ">
          <span className="min-w-[8rem] inline-block ">
            {num}
            {"). "}
            {plaque} <span className="hidden md:inline-block">- </span>
          </span>
          {!showDetails && (
            <span className="bg-black hidden md:inline-block text-sm p-1 rounded-lg text-white">
              {sacs} Sac(s)
            </span>
          )}
        </span>

        <div className="flex justify-between  w-fit items-center ">
          <span className=" hidden md:inline-block ">Statut: </span>
          <span
            className={`p-1 text-white text-sm px-2 rounded-lg ${TRUCK_LOADING_STATE[truckState].class}`}
          >
            {TRUCK_LOADING_STATE[truckState].label}
          </span>
          <ProgressView loading={loading} />
        </div>

        <img
          onClick={(e) => {
            setopened(!opened);
          }}
          src={arrow}
          width={30}
          className={` cursor-pointer  ${
            opened ? "rotate-0" : "rotate-180"
          }  transition-all ease-in-out duration-200    `}
        />
      </div>

      <div className={`   ${opened ? "" : "hidden"} `}>
        <div className="flex-wrap gap-2 flex justify-between">
          {[
            {
              label: "Sacs",
              data: sacs,
            },
            {
              label: "H.A",
              data: FormatDate(new Date(HA), false, false),
            },
            {
              label: "H.D.C.",
              data: FormatDate(HDC, false, false),
            },
            {
              label: "H.F.C.",
              data: FormatDate(HFC, false, false),
            },
            { label: "Chauff.", data: `${nameChauff} - ${numChauff}` },
            { label: "Ligne", data: line },
          ].map((it, i) => (
            <div key={i} className="border-l p-2 border-black">
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

        <div className="flex justify-around border-t my-2 py-2">
          {/* <button
            onClick={(e) => onRemoveTruck(data)}
            className="p-1 border text-sm hover:bg-red-500 hover:text-white border-red-500 mt-2 rounded-lg text-red-500"
          >
            REMOVE
          </button> */}

          {(truckState === TRUCK_LOADING_STATE.Waiting.label ||
            truckState === TRUCK_LOADING_STATE.Loading.label ||
            truckState === TRUCK_LOADING_STATE.Done.label) && (
            <IconButton
              title={"REMOVE"}
              icon={del}
              onClick={(e) => onRemoveTruck(data)}
              colorName={"red"}
              outline={true}
            />
          )}

          {truckState === TRUCK_LOADING_STATE.Waiting.label && (
            <IconButton
              title="Demarrer Charg."
              icon={play}
              onClick={(e) =>
                onChangeChargStat(TRUCK_LOADING_STATE.Loading.label)
              }
              colorName="green"
              outline={true}
            />
          )}

          {truckState === TRUCK_LOADING_STATE.Loading.label && (
            <IconButton
              title="Fin Charg."
              icon={stop}
              onClick={(e) => onChangeChargStat(TRUCK_LOADING_STATE.Done.label)}
              colorName="red"
              outline={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
