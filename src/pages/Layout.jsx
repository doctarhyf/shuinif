import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import "../App.css";
import rhyf from "../assets/rhyf.jpg";
import { FormatDate, ROUTES } from "../helpers/flow";
import signout from "../assets/icons/signout.svg";
import { Logout } from "./supabase";
import { useState } from "react";
import gck from "../assets/gck.png";
import LoadingView from "../comps/LoadingView";
import ButtonLogout from "../comps/ButtonLogout";

const Layout = ({ loading }) => {
  const location = useLocation();
  const pageName = location.pathname;
  const [showMenu, setShowMenu] = useState(false);

  const pathName = location.pathname;

  function onLogout() {
    Logout();
  }

  function onMenuClick(e) {
    //alert(e);
    setShowMenu(!showMenu);
  }

  return (
    <div>
      {loading && <LoadingView />}

      <div className="bg-gray-800   md:fixed w-[100%] backdrop-blur-sm shadow-sm h-fit gap-4 md:gap-1 md:h-[42pt] p-2 flex flex-col-reverse md:flex-row justify-between items-center ">
        <div className="text-white text-xl">{pageName}</div>

        <div className="text-white">
          Last update / 最后更新 : <b>{FormatDate()}</b>
        </div>

        <div className="rounded-full overflow-hidden  cursor-pointer hover:outline-sky-500 hover:outline  h-[32pt] bg-red-500 w-[32pt]">
          <img src={rhyf} onClick={onMenuClick} width="100%" />
        </div>
      </div>

      {showMenu && (
        <div className="bg-white border-slate-400 border  shadow-xl outline-sky-500 outline-1  rounded-md min-w-[200pt]  overflow-hidden md:right-1 top-[48pt] relative md:absolute">
          <ul>
            {[
              ...Array(5).fill({
                path: "/",
                label: "Menu item ",
                icon: rhyf,
              }),
            ].map((it, i) => (
              <Link to={it.path} onClick={(e) => setShowMenu(false)}>
                <li className="hover:bg-sky-500 p-2 hover:text-white">
                  <img
                    width={30}
                    src={it.icon}
                    className="inline rounded-full mr-1 "
                  />{" "}
                  {it.label}
                </li>
              </Link>
            ))}
            <ButtonLogout />
          </ul>
        </div>
      )}

      <div className="p-4 mb-[60pt] md:pt-[50pt] max-w-[1100px] mx-auto ">
        <Outlet />
      </div>

      {false && (
        <div className="text-transparent h-32 hidden md:block">cool</div>
      )}

      {false && (
        <nav className=" md:fixed  bottom-0 mt-[32pt] py-2 bg-black md:bg-neutral-900/90 shadow-sm backdrop-blur-lg   w-[100vw] ">
          <ul className=" md:flex  gap-4 ">
            {Object.values(ROUTES).map((route, i) => (
              <li
                key={i}
                className={` w-full ${
                  route.path === pathName ? "bg-cyan-500" : ""
                } text-center  p-2 rounded-xl hover:bg-cyan-500/25 hover:border-cyan-400 border border-transparent  `}
              >
                <NavLink to={route.path}>
                  <img src={route.icon} width={30} className="mx-auto" />
                  <span className="text-white">{route.name}</span>
                </NavLink>
              </li>
            ))}
            {false && (
              <li>
                <button onClick={onLogout}>
                  <img src={signout} width={30} />
                  <span className="label">Sign out</span>
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}

      <div className="btm-nav">
        {
          /* [
          [ROUTES.STATS, "bg-pink-200 text-pink-600", "border-pink-600"],
          [ROUTES.CHARG, "bg-blue-200 text-blue-600", "border-blue-600"],
          [ROUTES.SCHED, "bg-teal-200 text-teal-600", "border-teal-600"],
          [ROUTES.RAPP, "bg-lime-200 text-lime-600", "border-lime-600"],
        ] */ Object.values(ROUTES).map(
            (route, i) =>
              route.active && (
                <div
                  key={i}
                  className={`${route.bg}   ${
                    route.path === pathName ? " active " + route.border : ""
                  } `}
                >
                  <NavLink
                    to={route.path}
                    className=" pb-2 md:text-sm text-[.75rem] p-4 w-full h-full py-2 "
                  >
                    <div className=" text-center flex justify-center items-center flex-col">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>

                      <span className="btm-nav-label">{route.name}</span>
                    </div>
                  </NavLink>
                </div>
              )
          )
        }
      </div>
    </div>
  );
};

export default Layout;
