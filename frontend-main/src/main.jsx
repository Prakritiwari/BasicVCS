import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./authContext";
import { ToastProvider } from "./components/ui/Toast";
import ProjectRoutes from "./Routes";
import "./index.css";
import "./components/ui/ui.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ToastProvider>
      <BrowserRouter>
        <ProjectRoutes />
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
);
