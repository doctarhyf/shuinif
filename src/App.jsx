import { BrowserRouter, Route, Routes } from "react-router-dom";
import "react-widgets/styles.css";
import "./App.css";
import { ROUTES } from "./helpers/flow";
import Charg from "./pages/Charg";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Rapp from "./pages/Rapp";
import Sched from "./pages/Sched";
import Stats from "./pages/Stats";
import { LoggedInUser } from "./pages/supabase";
import { useState } from "react";
import NoPage from "./pages/NoPage";
import SchedNew from "./pages/SchedNew";
import Dict from "./pages/Dict";

function App() {
  const [loading, setLoading] = useState(false);

  const loggedInUser = LoggedInUser();

  function toggleLoadingView(show) {
    setLoading(show);
  }

  return (
    <BrowserRouter basename="shuinif">
      <Routes>
        <Route
          path="/"
          element={loggedInUser ? <Layout loading={loading} /> : <Login />}
        >
          <Route
            index
            element={<Stats toggleLoadingView={toggleLoadingView} />}
          />
          {/*  <Route
            path={ROUTES.STATS.path}
            element={<Stats toggleLoadingView={toggleLoadingView} />}
          />
          <Route
            path={ROUTES.CHARG.path}
            element={<Charg toggleLoadingView={toggleLoadingView} />}
          />
          <Route path={ROUTES.RAPP.path} element={<Rapp />} />

          <Route
            path={ROUTES.SCHED.path}
            element={<Sched toggleLoadingView={toggleLoadingView} />}
          />

          <Route
            path={ROUTES.SCHED_NEW.path}
            element={<SchedNew toggleLoadingView={toggleLoadingView} />}
          />

          <Route
            path={ROUTES.DICT.path}
            element={<Dict toggleLoadingView={toggleLoadingView} />}
          /> */}

          {Object.values(ROUTES).map((route, i) => (
            <Route
              key={i}
              path={route.path}
              element={<route.node toggleLoadingView={toggleLoadingView} />}
            />
          ))}

          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
