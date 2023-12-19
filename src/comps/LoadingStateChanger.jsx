import { TRUCK_LOADING_STATE } from "../helpers/flow";

import { useState } from "react";

export default function LoadingStateChanger({ data, updateLoadingState }) {
  function onChange(e) {
    const newState = e.target.value;
    updateLoadingState(data, newState);
  }

  return (
    <select value={data.state || ""} onChange={onChange}>
      <option>Waiting</option>
      <option>Loading</option>
      <option>Cancelled</option>
      <option>Done</option>
    </select>
  );
}
