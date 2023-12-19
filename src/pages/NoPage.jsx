import { useEffect, useState } from "react";
import { GetWorkHoursFromShiftSymbol } from "../helpers/Shifts";
import { Link } from "react-router-dom";
import { ROUTES } from "../helpers/flow";
import no_conexion from "../assets/icons/no_conexion.png";

export default function NoPage() {
  const [dt, setdt] = useState({});

  useEffect(() => {
    ls();

    async function ls() {
      const d = await GetWorkHoursFromShiftSymbol("N"); //LoadRoulement();

      setdt(d);
      console.log("rezz -->> ", d);
    }
  }, []);

  return (
    <div className="flex p-8 flex-col justify-center items-center gap-4">
      <img src={no_conexion} width={100} />
      <p>Page not found , 404 error!</p>
      <Link
        className="text-sky-500 hover:text-sky-600 hover:underline "
        to={ROUTES.STATS.path}
      >
        Go Home
      </Link>
    </div>
  );
}
