import React, { useEffect, useState } from "react";

/*
@live for live view

*/

function GetDateParts() {
  return new Date().toString();
}

export default function DateTimeDisplay({ y, m, d, h, i, s, live }) {
  const [dateParts, setDateParts] = useState(GetDateParts());

  useEffect(() => {
    let timer;

    if (live) {
      timer = setInterval(() => {
        setDateParts(GetDateParts());
      }, 1000);
    }
  }, []);

  return <div>{dateParts}</div>;
}
