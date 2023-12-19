import React, { useEffect, useState } from "react";
import rhyf from "../assets/rhyf.jpg";
import { GetWorkingTeamInfo } from "../helpers/Shifts";

export default function CardTeam({ teamCode }) {
  const [teamData, seTeamData] = useState({});

  useEffect(() => {
    loadTeamData();

    async function loadTeamData() {
      const teamData = await GetWorkingTeamInfo();
      seTeamData(teamData);
      console.log("td -->>:: ", teamData);
    }
  }, []);

  return (
    <>
      {Object.values(teamData).length !== 0 && (
        <div className="bg-[#84E0CA] p-4 shadow-lg rounded-lg mb-8">
          <div>CURRENT TEAM</div>
          <div className="flex justify-between px-4 divide-x-2 divide-slate-500">
            <div className="text-[60pt] h-[120px] text-white bg-black px-4">
              {teamCode}
            </div>
            <div>
              <div>Superviseur</div>
              <div className="text-3xl">
                <img className=" rounded-full mr-2 " width={42} src={rhyf} />
                {teamData?.sup?.name?.fr} - {teamData?.sup?.name?.ch}
              </div>
              <div>Chef d'Equipe</div>
              <div className="text-3xl">
                <img className=" rounded-full mr-2 " width={42} src={rhyf} />
                {teamData?.deq?.name?.fr} - {teamData?.deq?.name?.ch}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
