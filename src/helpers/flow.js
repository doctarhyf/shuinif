import stats from "../assets/icons/stats.svg";
import charg from "../assets/icons/charg.svg";
import sched from "../assets/icons/sched.svg";
import rapp from "../assets/icons/rapp.svg";
import dict from "../assets/icons/dict.svg";
import Dict from "../pages/Dict";
import Stats from "../pages/Stats";
import Rapp from "../pages/Rapp";
import Sched from "../pages/Sched";
import SchedNew from "../pages/SchedNew";
import Charg from "../pages/Charg";

export const clLoadingStateWaiting = " bg-yellow-500 ";
export const clLoadingStateLoading = " bg-blue-500 ";
export const clLoadingStateDone = " bg-green-500 ";
export const clLoadingStateCancelled = " bg-red-500 ";

export const clInput = ` mt-4 px-2 py-1 outline-0 border hover:border-sky-500 rounded-md  border-sky-500/40 `;
export const clBtn =
  " w-[120pt] disabled:bg-slate-200 disabled:hover:shadow-none disabled:text-slate-300 dsabled:cursor-normal shadow hover:shadow-xl text-white bg-sky-700 hover:bg-sky-500 w-min mx-auto m-4 py-1 px-2 rounded-md";

export const TABLE_NAMES = {
  TRUCKS: "trucks",
  SCHEDULE: "roulement",
  SCHEDULE_NEW: "agents_roulement",
  AGENTS: "agents",
  LOAD_SHIFTS: "load_shift",
  INFOS: "infos",
  WORDS: "words",
};

export const BUCKET_NAMES = {
  AGENTS_PHOTOS: "agents_photos",
};

export const SECTIONS_ROULEMENT = {
  ROULEMENT: {
    id: "RL",
    fr: "Roulement",
    zh: "考勤",
    showInTopBar: true,
  },
  ROULEMENT_SETTINGS: {
    id: "RLS",
    fr: "Parametres Roulement",
    zh: "",
    showInTopBar: true,
  },
  ROULEMENT_DIT: {
    id: "RLE",
    fr: "Roulement Edit",
    zh: "考勤编制",
    showInTopBar: false,
  },
  AGENTS: {
    id: "AG",
    fr: "Agents",
    zh: "工人",
    showInTopBar: true,
  },
  AGENT_CARD: {
    id: "AC",
    fr: "Agents Card",
    zh: "工人信息",
    showInTopBar: true,
  },
};

export const ROUTES = {
  STATS: {
    path: "/stats",
    name: "Statistics / 统计",
    icon: stats,
    bg: "bg-pink-200 text-pink-600",
    border: "border-pink-600",
    active: true,
    node: Stats,
  },
  CHARG: {
    path: "/charg",
    name: "Chargements / 装载",
    icon: charg,
    bg: "bg-blue-200 text-blue-600",
    border: "border-blue-600",
    active: true,
    node: Charg,
  },
  RAPP: {
    path: "/rapp",
    name: "Rapports / 报告",
    icon: rapp,
    bg: "bg-lime-200 text-lime-600",
    border: "border-lime-600",
    active: true,
    node: Rapp,
  },
  SCHED: {
    path: "/sched",
    name: "Roulement / 考勤",
    icon: sched,
    bg: "bg-teal-200 text-teal-600",
    border: "border-teal-600",
    active: true,
    node: Sched,
  },
  SCHED_NEW: {
    path: "/schednew",
    name: "Roulement (New) / 考勤 (新的)",
    icon: sched,
    bg: "bg-purple-200 text-purple-600",
    border: "border-purple-600",
    active: true,
    node: SchedNew,
  },
  DICT: {
    path: "/dict",
    name: "Dictionary / 词典",
    icon: dict,
    bg: "bg-lime-200 text-lime-600",
    border: "border-lime-600",
    active: true,
    node: Dict,
  },
};

export const DUMMY_WORDS = (_) => {
  let a = [];
  for (let i = 0; i < 15; i++) {
    const w = {
      id: i,
      zh: `词语${i}`,
      py: `ciyu${i}`,
      def: `Definition ${i}`,
      label: `Label ${i}`,
      tags: `tech${i},office${i},cement${i}`,
    };
    a.push(w);
  }

  return a;
};

export const TRUCK_LOADING_STATE = {
  LABELS: {
    Waiting: "Waiting",
    Loading: "Loading",
    Done: "Done",
    Cancelled: "Cancelled",
    All: "All",
  },
  Waiting: {
    label: "Waiting",
    class: clLoadingStateWaiting,
  },
  Loading: {
    label: "Loading",
    class: clLoadingStateLoading,
  },
  Done: {
    label: "Done",
    class: clLoadingStateDone,
  },
  Cancelled: {
    label: "Cancelled",
    class: clLoadingStateCancelled,
  },
};

export function GetDateComp(date, comp = "time") {
  let res = date;

  if (comp === "time") return date.toISOString().split("T")[1].split(".")[0];
}

export const STATS_PERDIOD = {
  DAY: "DAY",
  MONTH: "MONTH",
  YEAR: "YEAR",
};

export const STATS_PERDIOD_NAME = {
  DAY: "DAILY/每日报告",
  MONTH: "MONTH/每月报告",
  YEAR: "YEAR/每年报告",
};

export function FormatDate(date = new Date(), parts = false, long = true) {
  if (Object.prototype.toString.call(date) !== "[object Date]") {
    return date;
  }

  let options = {
    weekday: "short",
    year: "2-digit",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Africa/Maputo",
    timeZoneName: "short",
  };

  if (long)
    options = {
      ...options,
      weekday: "long",
      year: "numeric",
      month: "long",
    };

  const full = new Intl.DateTimeFormat("fr-FR", options).format(date);
  let dateSplits = full.split(" ");
  let dateParts;

  if (long) {
    dateParts = {
      y: dateSplits[3],
      m: dateSplits[2],
      d: dateSplits[0],
      time: dateSplits[5],
    };
  } else {
    dateParts = {
      y: dateSplits[3].substring(0, 2),
      m: dateSplits[2],
      d: dateSplits[0],
      time: dateSplits[4],
    };
  }

  return parts ? dateSplits : full;
}

export function FilterArrayByPropEqVal(array, objProp, val) {
  return array.filter((it, i) => it[objProp] === val);
}
