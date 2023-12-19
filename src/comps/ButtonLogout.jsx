import React from "react";
import { CURRENT_LOGGED_IN_USER } from "../pages/supabase";

import { clBtn } from "../helpers/flow";
import IconButton from "./IconButton";
import signout from "../assets/icons/signout.svg";

export default function ButtonLogout(props) {
  function onClick(e) {
    localStorage.removeItem(CURRENT_LOGGED_IN_USER);
    window.location.reload();
  }

  return (
    <div>
      {true && (
        <IconButton
          colorName={"red"}
          title={"LOGOUT"}
          icon={signout}
          onClick={onclick}
        />
      )}
    </div>
  );
}
