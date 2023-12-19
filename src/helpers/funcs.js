import { GetShiftSymboleByHourOfTheDay } from "./Shifts";

export function ShowTodaysDate() {
  const date = new Date();

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "Africa/Maputo",
  }).format(date);
}

export function GetDateParts(part = "all", date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  const h = date.getHours();
  const i = date.getMinutes();
  const s = date.getSeconds();

  const parts = {
    year: y,
    month: m,
    day: d,
    hours: h,
    minutes: i,
    seconds: s,
  };

  return part === "all" ? parts : parts[part];
}

export function getMonthsForLocale(locale = "fr") {
  var format = new Intl.DateTimeFormat(locale, { month: "long" });
  var months = [];
  for (var month = 0; month < 12; month++) {
    var testDate = new Date(Date.UTC(2000, month, 1, 0, 0, 0));
    months.push(format.format(testDate));
  }
  return months;
}

export function getMonthName(month = -1, locale = "fr") {
  month = month === -1 ? new Date().getMonth() : month;

  return getMonthsForLocale(locale)[month];
}

export function cumulBagsInLoadingStates(trucksList, state, showInTons) {
  let trucks = trucksList.filter((t) => t.state === state);
  // //console.log(trucksList, trucks, state, showInTons);

  let bags = 0;

  trucks.forEach((it, i) => {
    bags += Number.parseInt(it.sacs);
  });

  if (showInTons) return Number(bags) / 20;

  return bags;
}

export function GenLoadingShiftCodeFromTruck(workingTeamInfo, truck) {
  //ex: M_25_08_23 ( shift du matin 25 Aout 2023)

  let shyftSymbol = wti.shiftSymbol;
  let [teamCode, year, month, date] = t.HA.split("T")[0].split("-");
  const code = `${teamCode}_${shyftSymbol.shiftSymbol}_${date}_${month}_${year}`;

  //console.log("code", code);

  return code;
}
export function GenLoadingShiftCodeForCurrentInstant(workingTeamInfo) {
  let { year, month, day } = GetDateParts();

  const h = new Date().getHours();

  day = h < 7 ? day - 1 : day;

  let shiftSymbol = GetShiftSymboleByHourOfTheDay();

  const code = `${workingTeamInfo.teamCode}_${shiftSymbol.shiftSymbol}_${day}_${month}_${year}`;

  //console.log("da workingTeamInfo ==>> \n", workingTeamInfo, code);
  return code;
}

export default function GetNumDaysInMonth(year, month) {
  return GetMonthNumDays(year, month);
}

export function GetMonthNumDays(year, month) {
  const date = new Date();
  const today = date.getDate();
  year = year === undefined ? date.getFullYear() : year;
  month = month === undefined ? date.getMonth() : month;

  const count = new Date(year, month + 1, 0).getDate();
  const ext = count === 31 ? "st" : "th";
  const remaining = count - today;

  return {
    count: count,
    ext: ext,
    remaining: remaining,
  };
}

const options = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZoneName: "short",
};
export const makeDateReadable = (inputDate) => {
  /* if (
    inputDate !== null &&
    inputDate !== undefined &&
    inputDate.trim() !== "" &&
    inputDate.getDate
  ) { */
  return inputDate.toLocaleDateString("en-US", options);
};

export function GetRandomHexColor() {
  // Generate random values for red, green, and blue components
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  // Convert decimal values to hexadecimal and concatenate them
  const hexColor = `#${decimalToHex(red)}${decimalToHex(green)}${decimalToHex(
    blue
  )}`;

  console.log("GetRandomHexColor()", hexColor);

  return hexColor;
}

// Helper function to convert decimal to hexadecimal
function decimalToHex(decimalValue) {
  let hex = decimalValue.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function isDefinedAndNotEmpty(word) {
  return typeof word !== "undefined" && word !== null && word.trim() !== "";
}

export const __ = isDefinedAndNotEmpty;

export function GetRandomTailwindClasses() {
  // Tailwind CSS color classes
  const borderColors = [
    "border-red-500",
    "border-blue-500",
    "border-green-500",
    "border-yellow-500",
  ];
  const textColors = [
    "text-red-500",
    "text-blue-500",
    "text-green-500",
    "text-yellow-500",
  ];
  const backgroundColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
  ];

  const rand = Math.random();

  const randomBorderColor =
    borderColors[Math.floor(rand * borderColors.length)];
  const randomTextColor = textColors[Math.floor(rand * textColors.length)];
  const randomBackgroundColor =
    backgroundColors[Math.floor(rand * backgroundColors.length)];

  // Return an object with the selected classes
  return {
    borderColor: randomBorderColor,
    textColor: randomTextColor,
    backgroundColor: randomBackgroundColor,
  };
}
