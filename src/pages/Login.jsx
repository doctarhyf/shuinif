import React, { useState } from "react";
import gck from "../assets/gck.png";
import "../App.css";
import { clInput, clBtn } from "../helpers/flow";
import { Login as SBLogin, LoggedInUser } from "./supabase";
import load from "../assets/load.svg";
import LogoShuiNiCheJian from "../comps/LogoShuiNiCheJian";

export default function Login(props) {
  const [creds, setCreds] = useState([]);
  const [canLogin, setCanLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggingError, setLoggingError] = useState(false);

  function onChange(e) {
    let { name, value } = e.target;
    value = value.replace(" ", "");
    let newCreds = { ...creds, [name]: value };
    setCreds(newCreds);
    let enableButton =
      newCreds.phone?.length === 10 && newCreds.password?.length >= 6;
    setCanLogin(enableButton);
  }

  async function onLogin(e) {
    setLoggingError(false);
    setLoading(true);
    //console.log(creds);
    const user = await SBLogin(creds.phone, creds.password);
    console.log("the user => ", user);
    setLoading(false);

    if (user.error) {
      setLoggingError(true);
      return;
    }
    window.location.reload();
  }

  function onKeyUp(e) {
    if (e.keyCode === 13) onLogin(e);
  }

  return (
    <div className="p-8  h-[100vh]">
      {LoggedInUser()}
      <img className="mx-auto mb-8" src={gck} width={280} />

      <LogoShuiNiCheJian />

      <div className="  flex flex-col max-w-[340pt] min-w-[180pt] mx-auto ">
        <label for="phone">Phone</label>
        <p className="text-xs text-slate-500">
          Veuilez entre votre numero de telephone, ex: 0893092849.
        </p>
        <input
          placeholder="097XXXXXXX"
          maxLength={10}
          name="phone"
          value={creds.phone || ""}
          onChange={onChange}
          className={clInput}
          type="phone"
          id="phone"
          onKeyUp={onKeyUp}
        />

        <label for="phone">Password</label>
        <p className="text-xs text-slate-500">
          Veuilez entre votre mot de passe de minimun 6 characteres.
        </p>
        <input
          name="password"
          value={creds.password || ""}
          onChange={onChange}
          className={clInput}
          type="password"
          id="phone"
          onKeyUp={onKeyUp}
        />

        <div className="text-xs  my-4 text-[#000]/70">
          <p>
            Veuillez vous connecter avec votre numero de telephone et votre mot
            de passe
          </p>
          <p>
            En cas d'oublie du mot de passe contactez :{" "}
            <span className="text-white bg-sky-600 p-[0.1rem] rounded-[0.25rem]">
              +243 893 092 849
            </span>
          </p>
        </div>

        <img
          className={`mx-auto  ${!loading ? "invisible" : "visible"} `}
          src={load}
          width={30}
        />

        <div
          className={`text-xs ${
            loggingError ? "visible" : "invisible"
          } text-center text-red-500`}
        >
          Loggin error, please check your phone and password then try again..
        </div>

        <button onClick={onLogin} disabled={!canLogin} className={clBtn}>
          Login
        </button>
      </div>

      <div className="fixed italic bottom-0 right-0 p-1 m-2 text-xs ">
        Code and design by{" "}
        <a
          href="https://github.com/doctarhyf"
          className="p-1 bg-sky-500 hover:bg-sky-400 rounded-md text-white"
        >
          @DOCTARHYF
        </a>
        , ©2023
      </div>
    </div>
  );
}
