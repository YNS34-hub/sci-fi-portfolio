import { lazy, Suspense, useEffect } from "react";
import { directionContracts, type DirectionContractKey } from "./design-contract";

const Gallery = lazy(() => import("./sites/gallery/Gallery"));
const Site01 = lazy(() => import("./sites/site-01/Site01"));
const Site02 = lazy(() => import("./sites/site-02/Site02"));
const Site03 = lazy(() => import("./sites/site-03/Site03"));
const Site04 = lazy(() => import("./sites/site-04/Site04"));

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export default function App() {
  const path = normalizePath(window.location.pathname);
  const contractKey: DirectionContractKey =
    path === "/site-01"
      ? "site-01"
      : path === "/site-02"
        ? "site-02"
        : path === "/site-03"
          ? "site-03"
          : path === "/site-04"
            ? "site-04"
            : "gallery";
  const Route =
    path === "/site-01"
      ? Site01
      : path === "/site-02"
        ? Site02
        : path === "/site-03"
          ? Site03
          : path === "/site-04"
            ? Site04
            : Gallery;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <>
      <script id="direction-contract" type="application/json">
        {JSON.stringify(directionContracts[contractKey])}
      </script>
      <Suspense
        fallback={
          <div className="route-loading" role="status" aria-live="polite">
            <span>Opening work</span>
          </div>
        }
      >
        <Route />
      </Suspense>
    </>
  );
}
