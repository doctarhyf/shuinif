import React from "react";

function LoadingScreen({ loading }) {
  return (
    <div className="text-center">
      <span
        className={` ${loading && "loading"} loading-spinner text-secondary`}
      ></span>
    </div>
  );
}

export default LoadingScreen;
