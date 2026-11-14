import { Navigate, useRoutes } from "react-router-dom";
import { useAuth } from "./authContext";
import Landing from "./components/landing/Landing";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import RepoDetail from "./components/repo/RepoDetail";
import Profile from "./components/user/Profile";

function RequireAuth({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/auth" replace />;
}

export default function ProjectRoutes() {
  const { currentUser } = useAuth();

  return useRoutes([
    {
      path: "/",
      element: currentUser ? <Dashboard /> : <Landing />,
    },
    {
      path: "/auth",
      element: currentUser ? <Navigate to="/" replace /> : <Login />,
    },
    {
      path: "/signup",
      element: currentUser ? <Navigate to="/" replace /> : <Signup />,
    },
    {
      path: "/profile",
      element: (
        <RequireAuth>
          <Profile />
        </RequireAuth>
      ),
    },
    {
      path: "/repo/:id",
      element: (
        <RequireAuth>
          <RepoDetail />
        </RequireAuth>
      ),
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);
}
