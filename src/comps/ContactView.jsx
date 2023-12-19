import React, { useEffect, useState } from "react";
import del from "../assets/icons/del.png";
import save from "../assets/icons/save.png";
import update from "../assets/icons/update.png";
import rhyf from "../assets/rhyf.jpg";
import { clInput } from "../helpers/flow";
import FormAddNewAgent from "./FormAddNewAgent";
import sad from "../assets/sad.png";
import IconButton from "./IconButton";

export function ContactView({
  contact,
  onDeleteAgent,
  onNewAgentSaved,
  toggleLoadingView,
  onCancelSaveNewAgent,
}) {
  //const propSize = Object.keys(contact).length;

  const [currentContact, setCurrentAgent] = useState(undefined);
  const [updateEnable, setUpdateEnable] = useState(false);

  useEffect(() => {
    setCurrentAgent(contact);
    console.log(contact);
  }, []);

  return (
    <>
      {JSON.stringify(contact) !== JSON.stringify({}) && (
        <>
          {updateEnable && (
            <FormAddNewAgent
              onNewAgentSaved={onNewAgentSaved}
              toggleLoadingView={toggleLoadingView}
              onCancelSaveNewAgent={onCancelSaveNewAgent}
              dataToUpdate={contact}
            />
          )}
          {!updateEnable && currentContact !== undefined && (
            <div>
              <div className="text-xxl font-bold border-b py-2">
                {currentContact.prenom || ""}, {currentContact.nom || ""}{" "}
                {currentContact.postnom || ""} - {currentContact.contrat || ""}{" "}
                {currentContact.matricule || ""}
              </div>
              <div>
                <img className="my-4 rounded-lg " src={rhyf} width={100} />
              </div>
              {Object.entries(currentContact).map((p, i) => (
                <div key={i}>
                  <span className="text-sky-500">{p[0]} : </span>
                  <span>{p[1]}</span>
                </div>
              ))}
            </div>
          )}
          <input
            type="checkbox"
            checked={updateEnable}
            onChange={(e) => setUpdateEnable(!updateEnable)}
          />{" "}
          UPDATE
          <div className="flex">
            <IconButton
              outline
              colorName="red"
              title={"REMOVE"}
              onClick={(e) => onDeleteAgent(currentContact)}
              icon={del}
            />
          </div>
        </>
      )}

      {JSON.stringify(contact) === JSON.stringify({}) && (
        <div className="flex flex-col justify-center items-center gap-4">
          <img src={sad} width={80} />
          <p>Veuillez selectionner un contact pour voir tous details!</p>
        </div>
      )}
    </>
  );
}
