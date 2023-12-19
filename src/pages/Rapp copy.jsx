import React, { useEffect, useState } from "react";
import { LoggedInUser } from "./supabase";
import ButtonLogout from "../comps/ButtonLogout";

import { DatePicker, Localization } from "react-widgets/cjs";
import { STATS_PERDIOD } from "../helpers/flow";

import { DropdownList } from "react-widgets";
import { DateLocalizer } from "react-widgets/IntlLocalizer";
import { SBLoadItems } from "../db/sb";

export default function Rapp(props) {
  const [statPeriod, setStatPeriod] = useState(STATS_PERDIOD.DAY);
  const [trucks, settrucks] = useState([]);
  const [trucksfil, settrucksfil] = useState([]);
  const [date, setdate] = useState(new Date());

  useEffect(() => {
    loadTrucks();
  }, []);

  async function loadTrucks() {
    const data = await SBLoadItems();
    settrucks(data);
    settrucksfil(data);
  }

  function onStateDateChanges(selectedDate) {
    setdate((old) => {
      const nd = new Date(Date.parse(selectedDate));
      filterTrucks(nd);

      console.log(nd);

      return nd;
    });
  }

  function onStatTypeChange(newval) {
    setStatPeriod((value) => {
      console.log("value", value);
      console.log("newval", newval);

      filterTrucks(date, newval);

      return newval;
    });
  }

  function filterTrucks(date, newperiod) {
    const period = newperiod || statPeriod;

    console.log("newperiod", newperiod);
    console.log("statPeriod", statPeriod);

    let day = date.getDate();
    day = day < 10 ? "0" + day : day;
    let month = date.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    const year = date.getFullYear();

    let filterCriteria = `${year}-${month}-${day}`;

    if (period === STATS_PERDIOD.MONTH) {
      filterCriteria = `${year}-${month}`;
    }

    if (period === STATS_PERDIOD.YEAR) {
      filterCriteria = `${year}-`;
    }

    const filtered = trucks.filter((t, i) =>
      t.created_at.includes(filterCriteria)
    );

    console.log("includes => ", filterCriteria);
    console.log("trucks", trucks);
    console.log("filtered", filtered);

    settrucksfil(filtered);
  }

  return (
    <div>
      <div className="bg-[#84E08D] p-4 rounded-lg mb-8">
        <div>Statistics de chargement</div>
        <div className="text-sm">Show statictics for a " {statPeriod} "</div>

        <DropdownList
          data={[STATS_PERDIOD.DAY, STATS_PERDIOD.MONTH, STATS_PERDIOD.YEAR]}
          value={statPeriod}
          onChange={onStatTypeChange}
        />

        <div>
          <div>Choose a {statPeriod}</div>
          <div>
            {statPeriod === STATS_PERDIOD.DAY && (
              <div>
                <Localization
                  date={
                    new DateLocalizer({
                      label: "French",
                      culture: "fr",
                      firstOfWeek: 1,
                    })
                  }
                >
                  <DatePicker
                    max={new Date()}
                    defaultValue={new Date()}
                    valueFormat={{ dateStyle: "medium" }}
                    onChange={(e) => onStateDateChange(e)}
                  />
                </Localization>
              </div>
            )}
            {statPeriod === STATS_PERDIOD.MONTH && (
              <div>
                <DatePicker
                  max={new Date()}
                  defaultValue={new Date()}
                  valueFormat={{ month: "short", year: "numeric" }}
                  calendarProps={{ views: ["year", "decade"] }}
                />
              </div>
            )}
            {statPeriod === STATS_PERDIOD.YEAR && (
              <div>
                <DatePicker
                  max={new Date()}
                  defaultValue={new Date()}
                  valueFormat={{ year: "numeric" }}
                  calendarProps={{ views: ["year", "decade"] }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="STATS-CONT">
        {trucksfil.map((t, i) => (
          <div>{JSON.stringify(t)}</div>
        ))}
      </div>

      {/* <ButtonLogout /> */}
    </div>
  );
}
