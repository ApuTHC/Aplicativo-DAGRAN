import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { parentRoutes } from "../constants/routes";
import { BaseLayout } from "../layouts/BaseLayout";
import { VisorView } from "../views/VisorView";

export const MainRouter = () => {
 
    return (
      <BrowserRouter>
        <Routes>
          {/* Public Paths */}
          <Route
            path={parentRoutes.HOME}
            element={<BaseLayout />}
          >
            <Route index element={<VisorView />} />
          </Route>

          <Route path="*" element={<Navigate to={parentRoutes.NOTFOUND} replace />} />
        </Routes>
      </BrowserRouter>
    );
  };
  