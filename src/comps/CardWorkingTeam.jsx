import { getMonthName } from "../helpers/funcs";

export default function CardWorkingTeam({ workingTeam }) {
  const SHIFTS = {
    M: "Matin",
    P: "Aprem",
    N: "Nuit",
  };

  return (
    <div>
      {!workingTeam && <div>Please set valid " workingTeam " prop</div>}
      {workingTeam && (
        <div className="bg-gray-200 shadow-black/20 p-2 mb-4  rounded-md shadow-lg border border-gray-300    ">
          <div>
            Le {workingTeam.date} {getMonthName()} {new Date().getFullYear()}
          </div>
          <div>
            Equipe: {workingTeam.teamCode}, {SHIFTS[workingTeam.shiftSymbol]}
          </div>
          <div>
            Heure: de {workingTeam.from}h a {workingTeam.to}h
          </div>

          <div>Sup.: {workingTeam.teamData?.sup?.name?.fr}</div>
          <div>Chef D'Eq.: {workingTeam.teamData?.deq?.name?.fr}</div>
          {/*   <div>{JSON.stringify(workingTeam)}</div> */}
        </div>
      )}
    </div>
  );
}
