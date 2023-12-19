import React from "react";
import { UserAlreadyLoggedIn } from "./supabase";

export default function Home(props) {
  return (
    <div>
      Home
      {UserAlreadyLoggedIn()}
    </div>
  );
}
