import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { parentRoutes } from "../constants/routes";
import { VisorView } from "../views/VisorView";

export const MainRouter = () => {
 
    return (
      <BrowserRouter>
        <Routes>
          {/* Public Paths */}
          <Route
            path={parentRoutes.HOME}
          >
            <Route index element={<VisorView />} />
          </Route>

          <Route path="*" element={<Navigate to={parentRoutes.NOTFOUND} replace />} />
        </Routes>
      </BrowserRouter>
    );
  };
  