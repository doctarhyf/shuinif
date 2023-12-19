import React, { useState } from "react";
import CardWorkingTeam from "../comps/CardWorkingTeam";
import { ContactView } from "../comps/ContactView";
import FormAddNewAgent from "../comps/FormAddNewAgent";
import * as SB from "../db/sb";
import add_user from "../assets/icons/add_user.png";
import {
  GetTeamWorkingOnDayAndTime,
  LoadRoulementAndSchedMatrix,
  ParseSchedMatrixFromSched,
} from "../helpers/Shifts";
import { TABLE_NAMES } from "../helpers/flow";
import { GetDateParts } from "../helpers/funcs";
import list from "../assets/icons/list.png";
import IconButton from "../comps/IconButton";

const SECTIONS = ["Roulement", "Agents", "View Contact"];

const clBtn = `p-2 mx-2 border border-transparent hover:border hover:border-sky-500 
rounded-t-lg text-sky-500`;

export default function Sched({ toggleLoadingView }) {
  const [sched, setSched] = useState([]);
  const [schedMatrix, setSchedMatrix] = useState([]);
  const [workingTeam, setWorkingTeam] = useState({});
  const [currentSection, setCurrentSection] = useState(SECTIONS[0]);
  const [showFormNewAgent, setShowFormNewAgent] = useState(false);
  const [agents, setAgents] = useState([]);
  const [agentsFiltered, setAgentsFiltered] = useState([]);
  const [searchBy, setSearchBy] = useState("");
  const [currentAgent, setCurrentAgent] = useState({});

  useState(() => {
    loadData();
  }, []);

  function onNewAgentSaved(res) {
    if (res.code) {
      alert(`Error saving new agent!
      Error message:
      ${JSON.stringify(res)}
      `);
    } else {
      alert(`New agent saved!
  RES : ${JSON.stringify(res)};
  `);
      setCurrentSection(SECTIONS[1]);
      setShowFormNewAgent(false);
      loadData();
    }
  }

  function onCancelSaveNewAgent() {
    setCurrentSection(SECTIONS[1]);
    setShowFormNewAgent(false);
  }

  async function loadData() {
    toggleLoadingView(true);

    setAgents([]);
    setAgentsFiltered([]);

    try {
      let { roulement, schedMatrix } = await LoadRoulementAndSchedMatrix();
      setSched(roulement);
      setSchedMatrix(schedMatrix);

      const a = await SB.SBLoadItems(TABLE_NAMES.AGENTS);

      setAgents(a);
      setAgentsFiltered(a);

      let workingTeamInfo = GetTeamWorkingOnDayAndTime(
        schedMatrix,
        new Date().getDate()
      );

      setWorkingTeam(workingTeamInfo);
    } catch (e) {
      let msg = "Loading error, check internet connection.\n" + e.toString();
      console.log(msg);
      alert(msg);
    } finally {
      toggleLoadingView(false);
    }
  }
  const [q, setq] = useState("");

  function CheckMatch(agent, prop, value) {
    const { nom, postnom, prenom, mingzi, phone, matricule, poste, section } =
      agent;

    switch (prop) {
      case "nom":
        return (
          (nom && nom.toLowerCase().includes(value)) ||
          (prenom && prenom.toLowerCase().includes(value)) ||
          (postnom && postnom.toLowerCase().includes(value))
        );
        break;

      case "":
        return (
          (nom && nom.toLowerCase().includes(value)) ||
          (prenom && prenom.toLowerCase().includes(value)) ||
          (postnom && postnom.toLowerCase().includes(value)) ||
          (matricule && matricule.toLowerCase().includes(value)) ||
          (phone && phone.toLowerCase().includes(value)) ||
          (equipe && equipe.toLowerCase().includes(value)) ||
          (poste && poste.toLowerCase().includes(value)) ||
          (section && section.toLowerCase().includes(value))
        );
        break;

      default:
        return agent[prop] && agent[prop].toLowerCase().includes(value);
    }
  }

  function onSearchAgent(e) {
    const v = e.target.value.toString().toLowerCase();
    setq(v);

    //  console.log(Object.entries(agents[0]));

    const filtered = agents.filter((a, i) => CheckMatch(a, searchBy, v));

    setAgentsFiltered(filtered);
    if (v.replaceAll(" ", "") === "") setAgentsFiltered(Array.from(agents));
  }

  function onSearchBy(e) {
    const v = e.target.value;
    setSearchBy(v);
    console.log(v);
  }

  async function onDeleteAgent(agent) {
    const yes = confirm(
      `Are you sure you wanna remove "${agent.prenom} ${agent.nom}"`
    );

    if (yes) {
      try {
        const res = await SB.SBRemoveItem(agent, TABLE_NAMES.AGENTS, "id");
        console.log(res);
      } catch (e) {
        alert(e);
        console.log(e);
      } finally {
        alert("Done!");
        setCurrentAgent({});
        loadData();
      }
    }
  }

  async function onUpdateAgent(agentUpdate) {
    if (confirm("Are you sure you want to update? ")) {
      alert("Updating agent \n" + JSON.stringify(agentUpdate));
    }
  }

  return (
    <div
      className={`flex flex-col   ${
        currentSection === SECTIONS[0] ? "justify-center items-center" : ""
      } `}
    >
      <div className="border-b border-sky-500 mb-4 w-[90%]">
        {SECTIONS.map((btn, i) => (
          <button
            className={`
            
            ${currentSection === btn ? "bg-sky-500 text-white" : ""}
            
            ${clBtn}`}
            onClick={(e) => setCurrentSection(SECTIONS[i])}
          >
            {btn}
          </button>
        ))}
      </div>

      {SECTIONS[0] === currentSection && (
        <div className="w-full">
          <CardWorkingTeam workingTeam={workingTeam} />
          <div className="flex ">
            {sched.map((team, idxTeam) => (
              <div
                className={` w-full p-1  border  ${
                  idxTeam === workingTeam.teamIndex + 1 ? "bg-lime-300/50" : ""
                } `}
                key={idxTeam}
              >
                {team.split("").map((day, idxDay) => (
                  <div
                    key={idxDay}
                    className={`  CELL-CONT

                  
                    ${
                      idxDay === workingTeam.date
                        ? " bg-sky-400 text-white font-bold"
                        : ""
                    } 
                  ${day === "R" ? "text-white bg-black/40" : ""}
                  p-2 border-b border-blue-300
                  

                  ${
                    idxTeam === workingTeam.teamIndex + 1 &&
                    idxDay === workingTeam.date
                      ? "bg-blue-600 font-bold"
                      : ""
                  }
                  
                  
                  
                  `}
                  >
                    {idxTeam === workingTeam.teamIndex + 1 &&
                      idxDay === workingTeam.date && (
                        <span className=" w-[8pt] outline-emerald-50 outline mr-1 h-[8pt] rounded-full inline-block bg-green-600"></span>
                      )}
                    {idxTeam === 0 ? (idxDay === 0 ? "Jour" : idxDay) : day}

                    <div>
                      <span className="text-xs text-white bg-pink-600">
                        R{idxDay}
                      </span>
                      <span className="text-xs text-white bg-lime-600">
                        C{idxTeam}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {SECTIONS[1] === currentSection && (
        <div className="min-w-[100%] mx-auto">
          {showFormNewAgent && (
            <FormAddNewAgent
              onNewAgentSaved={onNewAgentSaved}
              toggleLoadingView={toggleLoadingView}
              onCancelSaveNewAgent={onCancelSaveNewAgent}
            />
          )}

          {!showFormNewAgent && (
            <div className="list-agent flex flex-col md:flex-row ">
              <div className="left flex-1 max-w-[100%]">
                <div className=" text-sky-500 text-lg">
                  LISTE AGENT(S) ({agents.length})
                </div>
                <div>
                  {/* <button
                    className={clBtn}
                    onClick={(e) => setShowFormNewAgent(true)}
                  >
                    + AJOUT NOUVEAU AGENT
                  </button> */}
                  <IconButton
                    colorName="blue"
                    title={"AJOUT NOUVEAu AGENT"}
                    onClick={(e) => setShowFormNewAgent(true)}
                    icon={add_user}
                  />
                </div>
                <div className="search">
                  <div>
                    Rechercher par :
                    <select value={searchBy} onChange={onSearchBy}>
                      <option value={"nom"}>Noms</option>
                      <option value={"phone"}>Phone</option>
                      <option value={"section"}>Section</option>
                      <option value={"poste"}>Poste</option>
                      <option value={"matricule"}>Matricule</option>
                      <option value={"equipe"}>Equipe</option>
                      <option value={""}>Toute info</option>
                    </select>
                  </div>
                  <div>
                    {" "}
                    <input
                      className="outline-0 hover:border-purple-500 focus:border-purple-600 border rounded-lg outline-sky-300 hover:outline-sky-500 p-2"
                      type="search"
                      value={q}
                      onChange={onSearchAgent}
                      placeholder="Recherche ex: Mutunda ..."
                    />
                  </div>

                  <div>
                    <p>Filtre</p>

                    <div>
                      SECTION :
                      <select>
                        <option value={"nom"}>EMBALLAGE</option>
                        <option value={"phone"}>BROYAGE</option>
                      </select>
                    </div>

                    <div>
                      POSTE :
                      <select>
                        <option value={"nom"}>CHARGEUR</option>
                        <option value={"phone"}>MEC.</option>
                        <option value={"section"}>EXPLOITANT</option>
                        <option value={"poste"}>NET</option>
                        <option value={"poste"}>SUP</option>
                        <option value={"poste"}>DEQ</option>
                        <option value={"poste"}>INT</option>
                      </select>
                    </div>

                    <div>
                      EQUIPE :
                      <select>
                        <option value={"nom"}>A</option>
                        <option value={"phone"}>B</option>
                        <option value={"section"}>C</option>
                        <option value={"poste"}>D</option>
                        <option value={"poste"}>JOUR</option>
                      </select>
                    </div>
                  </div>
                </div>

                {agentsFiltered.length === 0 && (
                  <p className="p-4">Liste vide!</p>
                )}

                <div className=" flex-1 liste-agent">
                  {agentsFiltered.map((agent, i) => (
                    <div
                      onClick={(e) => {
                        setCurrentAgent(agent);
                        setCurrentSection(SECTIONS[2]);
                      }}
                      key={i}
                      className="m-2 group cursor-pointer p-2 hover:bg-sky-500 rounded-lg hover:text-white"
                    >
                      <div>
                        {i + 1}. {agent.nom} {agent.postnom} {agent.prenom}
                      </div>
                      <div className="text-sm text-gray-400 group-hover:text-sky-200">
                        {agent.poste} - {agent.section} - {agent.phone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="agent-view  right flex-1">
                <ContactView
                  onNewAgentSaved={onNewAgentSaved}
                  toggleLoadingView={toggleLoadingView}
                  onCancelSaveNewAgent={onCancelSaveNewAgent}
                  contact={currentAgent}
                  onDeleteAgent={onDeleteAgent}
                  onUpdateAgent={onUpdateAgent}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {SECTIONS[2] === currentSection && (
        <div>
          <IconButton
            colorName="blue"
            title={"Liste Agents"}
            onClick={(e) => setCurrentSection(SECTIONS[1])}
            icon={list}
          />

          <ContactView
            onNewAgentSaved={onNewAgentSaved}
            toggleLoadingView={toggleLoadingView}
            onCancelSaveNewAgent={onCancelSaveNewAgent}
            contact={currentAgent}
            onDeleteAgent={onDeleteAgent}
            onUpdateAgent={onUpdateAgent}
          />
        </div>
      )}
    </div>
  );
}
