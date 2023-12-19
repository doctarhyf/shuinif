import React, { useState } from "react";
import DropdownList from "react-widgets/DropdownList";
import { TRUCK_LOADING_STATE, clInput } from "../helpers/flow";
import { GenLabelFromShiftCode } from "../helpers/Shifts";

export default function FormNewTruckData({
  onSaveNewTruckData,
  onToggleFormNewCharg,
  curShiftLoad,
}) {
  const [newTruckData, setNewTruckData] = useState({
    plaque: "",
    HA: new Date().toISOString().toLocaleString("fr-FR"),
    HDC: null,
    HFC: null,
    code_chargement: "",
    line: 1,
    sacs: 0,
    nameChauff: "",
    numChauff: "",
    state: TRUCK_LOADING_STATE.LABELS.Waiting,
    shift_code: curShiftLoad.shift_code,
  });

  function onUpdateNewTruckData(e) {
    console.log(e);

    const n = e.target.name;
    let v = e.target.value;

    setNewTruckData((old) => ({
      ...old,
      [n]: v,
      state: TRUCK_LOADING_STATE.LABELS.Waiting,
    }));
  }

  return (
    <div className="flex flex-col">
      <div className="text-sky-700 text-xl text-center">
        Ajouter les informations du bon
      </div>

      <div className=" mx-auto w-fit text-center">
        <span className="bg-black text-white rounded-full font-bold p-2 text-sm ">
          SHIFT: {GenLabelFromShiftCode(curShiftLoad.shift_code).label}
        </span>
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
          onClick={(e) => onSaveNewTruckData(newTruckData)}
        >
          SAVE
        </button>

        <button
          className="border border-red-500 text-red-500 rounded-lg px-1 hover:text-white hover:bg-red-500"
          onClick={(e) => onToggleFormNewCharg(false)}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}
