import { GetDateParts } from "../helpers/funcs";
import * as SB from "../db/sb";
import { TABLE_NAMES } from "./flow";

export const MONTHS_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
  "Jul",
  "Aou",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

//must be loaded from server
export const TEAMS = [
  {
    code: "A",
    sup: {
      name: { fr: "Albert Kankobwe", ch: "刚果贝" },
      phone: "",
    },
    deq: {
      name: { fr: "Nkomba", ch: "空吧" },
      phone: "",
    },
    wokers: [{ fr: "", ch: "", phone: "" }],
    teamIndex: 0,
  },
  {
    code: "B",
    sup: {
      name: { fr: "Kayembe Bertin", ch: "编带" },
      phone: "",
    },
    deq: {
      name: { fr: "Mpanga Chance", ch: "上色" },
      phone: "",
    },
    wokers: [{ fr: "", ch: "", phone: "" }],
    teamIndex: 1,
  },
  {
    code: "C",
    sup: {
      name: { fr: "Kazali Serge", ch: "赛润池" },
      phone: "",
    },
    deq: {
      name: { fr: "Nkulu Christian", ch: "库鲁" },
      phone: "",
    },
    wokers: [{ fr: "", ch: "", phone: "" }],
    teamIndex: 2,
  },
  {
    code: "D",
    sup: {
      name: { fr: "Katanga Amaidee", ch: "噶当噶" },
      phone: "",
    },
    deq: {
      name: { fr: "Mwenz Mbay", ch: "帕特里克" },
      phone: "",
    },
    wokers: [{ fr: "", ch: "", phone: "" }],
    teamIndex: 3,
  },
];

export const GLFSC = GenLabelFromShiftCode;

export function GenLabelFromShiftCode(shiftCode) {
  const shiftsNames = { M: "Matin", P: "Aprem", N: "Nuit" };
  const [teamCode, shiftSymbol, day, month, year] = shiftCode.split("_");

  const shiftName = shiftsNames[shiftSymbol];
  const monthName = MONTHS_NAMES[month];
  const fullDate = `Le ${day} ${monthName}, ${year}`;

  return {
    fullDate: fullDate,
    teamCode: teamCode,
    shiftSymbol: shiftSymbol,
    shiftName: shiftName,
    day: day,
    month: month,
    monthsName: monthName,
    year: year,
    label: `Equipe ${teamCode}, ${shiftName} du ${day} ${monthName}, ${year}`,
  }; // `Equipe ${teamCode}, ${shiftsNames[shiftSymbol]} du ${day} ${monthsNames[month]}, ${year}`;
}

export function Get4TeamsShiftForDate(scheduleMatrix, date) {
  const h = new Date().getHours();

  let shiftObject = {
    A: CleanTeamSched(scheduleMatrix[0])[date],
    B: CleanTeamSched(scheduleMatrix[1])[date],
    C: CleanTeamSched(scheduleMatrix[2])[date],
    D: CleanTeamSched(scheduleMatrix[3])[date],
  };

  return shiftObject;
}

export async function GetWorkingTeamInfo(date, hour) {
  let roulement = await LoadRoulementAndSchedMatrix();

  const matrix = roulement.schedMatrix;

  date = date === undefined ? new Date().getDate() : date;
  hour = hour === undefined ? new Date().getHours() : hour;

  return GetTeamWorkingOnDayAndTime(matrix, date, hour);
}

export function GetTeamWorkingOnDayAndTime(scheduleMatrix, date, hours) {
  hours = hours === undefined ? GetDateParts("hours") : hours;

  date = hours < 7 ? date - 1 : date;

  let currentShifInfo = GetShiftSymboleByHourOfTheDay(hours);

  let all4teamsShift = Get4TeamsShiftForDate(scheduleMatrix, date);

  // console.log(date, all4teamsShift);

  let teamCode = "N/A";

  const shifts = ["M", "P", "N"];
  const teams = ["A", "B", "C", "D"];
  const teamIndex = Object.values(all4teamsShift).indexOf(
    currentShifInfo.shiftSymbol
  );

  teamCode = teams[teamIndex];

  const { year, month } = GetDateParts("all");

  let workingTeamInfo = {
    ...currentShifInfo,
    date: date,
    teamCode: teamCode,
    teamIndex: teamIndex,
    teamData: TEAMS[teamIndex],
    shift_code: `${teamCode}_${currentShifInfo.shiftSymbol}_${date}_${month}_${year}`, // 0 -> A, 1 -> B, 2 -> C, 3 -> D
  };

  /////console.log(workingTeamInfo);

  return workingTeamInfo;
}

export function GetWorkingTeamFromShiftCode(shift_code) {
  let [teamCode, shiftSymbol, date, month, year] = shift_code.split("_"); //D_M_12_10_2023
  const teamsIdx = ["A", "B", "C", "D"];
  const teamIndex = teamsIdx.findIndex((it) => it === teamCode);

  const { from, to } = GetWorkHoursFromShiftSymbol(shiftSymbol);

  let data = {
    y: year,
    m: parseInt(month) + 1,
    d: date,
    shiftSymbol: shiftSymbol,
    from: from,
    to: to,
    curh: new Date().getHours(),
    date: date,
    teamCode: teamCode,
    teamIndex: teamIndex,
    teamData: TEAMS[teamIndex],
    shift_code: shift_code,
  };

  /*

{
    "shiftSymbol": "M",
    "from": 7,
    "to": 15,
    "curh": 7,
    "date": "12",
    "teamCode": "D",
    "teamIndex": 3,
    "teamData": {
        "code": "D",
        "sup": {
            "name": {
                "fr": "Katanga Amaidee",
                "ch": ""
            },
            "phone": ""
        },
        "deq": {
            "name": {
                "fr": "Mwenz Mbay",
                "ch": ""
            },
            "phone": ""
        },
        "wokers": [
            {
                "fr": "",
                "ch": "",
                "phone": ""
            }
        ]
    },
    "shift_code": "D_M_12_10_2023"
}

  */
  return data;
}

export function CleanTeamSched(teamSched) {
  return teamSched.replaceAll(",", "");
}

export function GetShiftSymboleByHourOfTheDay(h) {
  //let ts = GetDateParts("all");
  let curh = h === undefined ? new Date().getHours() : h;

  let shiftSymbol = "-";
  let from = 7;
  let to = -1;

  if (curh >= 7 && curh < 15) {
    from = 7;
    to = 15;
    shiftSymbol = "M";
  }

  if (curh >= 15 && curh < 23) {
    from = 15;
    to = 23;
    shiftSymbol = "P";
  }

  if (curh >= 23 || (curh >= 0 && curh < 7)) {
    from = 23;
    to = 7;
    shiftSymbol = "N";
  }

  return {
    shiftSymbol: shiftSymbol,
    from: from,
    to: to,
    curh: curh,
  };
}

export function GetWorkHoursFromShiftSymbol(symbol = "M") {
  const data = {
    M: { from: 7, to: 15 },
    P: { from: 15, to: 23 },
    N: { from: 23, to: 7 },
    R: { from: -1, to: -1 },
  };

  return data[symbol];
}

export function ParseSchedMatrixFromSched(sched) {
  return sched[0].data.split(":");
}

export async function LoadSchedMatrix() {
  let rl = await LoadRoulementAndSchedMatrix();
  return rl.schedMatrix;
}

export async function LoadRoulementAndSchedMatrix(teamSymbol) {
  const loadingRoulementGen = teamSymbol === undefined;

  let res = await SB.SBLoadItems(TABLE_NAMES.SCHEDULE);
  let roulement = new Array();

  let schedMatrix = ParseSchedMatrixFromSched(res);

  roulement = res[0].data.replaceAll(",", "").split(":");

  let daysColumn = Array.from(roulement[0]).fill("J");
  daysColumn = daysColumn.map((d, i) => (i > 0 ? "-" : "J"));

  daysColumn = daysColumn.join("");

  roulement.unshift(daysColumn);

  let data = {
    schedMatrix: schedMatrix,
    roulement: roulement,
  };

  ////////console.log("data => \n ", data);

  return data;
}

export async function LoadInfos() {
  const infos = await SB.SBLoadItems(TABLE_NAMES.INFOS);
  return infos;
}

export async function GetLoadShift(shiftCode) {
  let data = await SB.SBLoadItemWhereColEqVal(
    TABLE_NAMES.LOAD_SHIFTS,
    "shift_code",
    shiftCode
  );
  return data;
}

export const LOAD_SHIFTS_STATE = {
  IDLE: "idle",
  STARTED: "started",
  DONE: "done",
};

export async function CreateLoadShift(shiftCode) {
  let loadShiftData = {
    status: LOAD_SHIFTS_STATE.IDLE,
    shift_code: shiftCode,
  };

  const { data, error } = await SB.SBInsertItem(
    loadShiftData,
    TABLE_NAMES.LOAD_SHIFTS
  );

  return error ? error : data;
}

export const SHIFT_NAMES = {
  M: ["MATIN", "白"],
  P: ["APREM", "中"],
  N: ["NUIT", "夜"],
};

export function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

export function GetNumDaysInCurrentMonth() {
  let date = new Date();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  const c = daysInMonth(month, year);

  /* console.log(
    "Number of days in " + month + "th month of the year " + year + " is " + c
  ); */

  return c;
}

export function GetNumWorkDaysInMonth(month = -1, year = -1) {
  let count = 30;

  return count;
}
