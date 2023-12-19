import { useState } from "react";

import rhyf from "../assets/rhyf.jpg";
import { SBInsertItem, SBUpdateItem } from "../db/sb";
import { TABLE_NAMES } from "../helpers/flow";
import IconButton from "./IconButton";
import save from "../assets/icons/save.png";
import remove from "../assets/icons/remove.png";
const clBtn = `p-2 mx-2 border border-transparent hover:border hover:border-sky-500 
rounded-t-lg text-sky-500`;

export default function FormAddNewAgent({
  onNewAgentSaved,
  toggleLoadingView,
  onCancelSaveNewAgent,
  dataToUpdate,
}) {
  const [data, setData] = useState({
    contrat: "",
    equipe: "",
    matricule: "",
    mingzi: "",
    nom: "",
    phone: "",
    poste: "",
    postnom: "",
    prenom: "",
    section: "",
    nationalite: "",
  });
  const [photo, setPhoto] = useState("");

  useState(() => {
    if (dataToUpdate !== undefined) setData(dataToUpdate);
  }, []);

  function onChange(e) {
    const n = e.target.name;
    const v = e.target.value.toUpperCase();

    setData((old) => ({ ...old, [n]: v }));

    console.log(data);
  }

  async function onSaveNewAgent(e) {
    try {
      toggleLoadingView(true);

      const res = await SBInsertItem(data, TABLE_NAMES.AGENTS);

      onNewAgentSaved(res);
      console.log(res);
      toggleLoadingView(false);
    } catch (e) {
      toggleLoadingView(false);
      alert("Error: " + e);
    } finally {
      toggleLoadingView(false);
    }
  }

  async function onUpdateAgent(e) {
    try {
      toggleLoadingView(true);

      const res = await SBUpdateItem(
        data,
        TABLE_NAMES.AGENTS,
        undefined,
        undefined,
        "id",
        true
      );

      onNewAgentSaved(res);
      console.log(res);
      toggleLoadingView(false);
    } catch (e) {
      toggleLoadingView(false);
      alert("Error: " + e);
    } finally {
      toggleLoadingView(false);
    }
  }

  async function uplodPicture(fileName, file) {
    const res = await SB.SBUploadFile(BUCKET_NAMES, fileName, file);
    return res;
  }

  function onPhotoSelected(e) {
    let file = e.target.files[0];
    let fileURL = URL.createObjectURL(file);
    let formData = new FormData();
    const ext = "." + file.name.split(".")[1];
    setPhoto(fileURL);

    const newfilename =
      "photo_" + Math.random().toString().replace(".", "") + ext;
    console.log(newfilename);

    const res = uplodPicture(newfilename, file);
    alert(res);
  }

  return (
    <div className="form-new-agent">
      <div className="text-sky-500">AJOUTER NOUVEAU AGENT</div>
      <div className="flex flex-col">
        <div>Photo</div>
        <div>
          <img className="my-4 rounded-lg " src={photo || rhyf} width={100} />
        </div>
        <div>
          <input type="file" onChange={onPhotoSelected} />
        </div>

        <input
          value={data.nom || ""}
          type="text"
          placeholder="Nom"
          name="nom"
          onChange={onChange}
        />
        <input
          value={data.postnom || ""}
          type="text"
          placeholder="Postnom"
          name="postnom"
          onChange={onChange}
        />
        <input
          value={data.prenom || ""}
          type="text"
          placeholder="Prenom"
          name="prenom"
          onChange={onChange}
        />
        <input
          value={data.mingzi || ""}
          type="text"
          placeholder="Nom chinois"
          name="mingzi"
          onChange={onChange}
        />
        <input
          value={data.phone || ""}
          maxLength={10}
          type="tel"
          placeholder="Phone"
          name="phone"
          onChange={onChange}
        />

        <div>Natinalite</div>
        <select
          value={data.nationalite || ""}
          name="nationalite"
          onChange={onChange}
        >
          <option value={"-"}>-</option>
          <option value={"CD"}>CONGOLAISE</option>
          <option value={"CN"}>CHINOISE</option>
        </select>

        <div>Contrat</div>
        <select value={data.contrat || ""} name="contrat" onChange={onChange}>
          <option value={"-"}>-</option>
          <option value={"GCK"}>GCK</option>
          <option value={"BNC"}>BINIC</option>
          <option value={"KAY"}>KAY-TRADING</option>
        </select>
        <input
          value={data.matricule || ""}
          type="text"
          placeholder="Matricule"
          name="matricule"
          onChange={onChange}
        />

        <div>Section</div>
        <select value={data.section || ""} name="section" onChange={onChange}>
          <option value={"-"}>-</option>
          <option value={"N/A"}>N/A</option>
          <option value={"BROYAGE"}>BROYAGE</option>
          <option value={"ENSACHAGE"}>ENSACHAGE</option>
        </select>
        <div>Poste</div>
        <select value={data.poste || ""} name="poste" onChange={onChange}>
          <option value={"-"}>-</option>
          <option value={"SUP"}>SUPERVISEUR</option>
          <option value={"INT"}>INTERPRETE</option>
          <option value={"DEQ"}>CHEF D'EQUIPE</option>
          <option value={"OPE"}>OPERATEUR ENSACHAGE</option>
          <option value={"EXP"}>EXPLOITANT BROYAGE</option>
          <option value={"MEC"}>MECANICIEN</option>
          <option value={"CHA"}>CHARGEUR</option>
          <option value={"NET"}>NETOYEUR</option>
        </select>
        <div>Equipe</div>
        <select value={data.equipe || ""} name="equipe" onChange={onChange}>
          <option value={"-"}>-</option>
          <option value={"N/A"}>N/A</option>
          <option value={"JR"}>JOUR</option>
          <option value={"A"}>A</option>
          <option value={"B"}>B</option>
          <option value={"C"}>C</option>
          <option value={"D"}>D</option>
        </select>

        {dataToUpdate === undefined && (
          <IconButton
            colorName={"green"}
            title={"ENREGISTRER"}
            onClick={onSaveNewAgent}
            icon={save}
          />
        )}

        {dataToUpdate !== undefined && (
          <IconButton
            colorName={"green"}
            title={"UPDATE"}
            onClick={onUpdateAgent}
            icon={save}
          />
        )}

        <IconButton
          colorName={"red"}
          title={"ANNULER"}
          onClick={onCancelSaveNewAgent}
          icon={remove}
        />
      </div>
    </div>
  );
}
