import React from "react";
import gck from "../assets/gck.png";
import LogoShuiNiCheJian from "./LogoShuiNiCheJian";

export default function LoadingView() {
  return (
    <div className="bg-black/90 flex-col gap-1 text-white text-center flex justify-center items-center absolute h-[100vh] z-[9999]  w-[100vw] ">
      {/* <img src={gck} width={180} className="bg-white p-2" /> */}
      <LogoShuiNiCheJian />
      <p className="italic text-sm">Loading ...</p>
    </div>
  );
}
