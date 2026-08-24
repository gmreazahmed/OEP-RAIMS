import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import Admin from "./pages/Admin";


/* =========================================================
   ADMIN ROUTE PROTECTION
   ========================================================= */

function ProtectedAdmin() {
  const isLoggedIn =
    sessionStorage.getItem("admin_logged_in") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/admin" replace />;
  }

  return <Admin />;
}


/* =========================================================
   APP
   ========================================================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public Home */}
        <Route
          path="/"
          element={<Home />}
        />


        {/* Public EC Verification */}
        <Route
          path="/verify/:code"
          element={<Verify />}
        />


        {/* Admin Login */}
        <Route
          path="/admin"
          element={<Login />}
        />


        {/* Protected Admin Dashboard */}
        <Route
          path="/admin/panel"
          element={<ProtectedAdmin />}
        />


        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;