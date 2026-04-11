import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Layout } from "./components/Layout";
import { ClientLayout } from "./components/ClientLayout";

import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Participants from "./pages/Participants";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

import ClientHome from "./pages/client/Home";
import ClientEventList from "./pages/client/EventList";
import ClientEventDetail from "./pages/client/EventDetail";
import RaceParticipation from "./pages/client/RaceParticipation";
import Leaderboard from "./pages/client/Leaderboard";
import Profile from "./pages/client/Profile";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Logout from "./pages/auth/Logout";
import { PublicLayout } from "./components/PublicLayout";
import Landing from "./pages/public/Landing";
import PublicEventList from "./pages/public/PublicEventList";
import PublicEventSpectate from "./pages/public/PublicEventSpectate";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentSuccess from "./pages/PaymentSuccess";
import Devices from "./pages/Devices";
import RfidTags from "./pages/RfidTags";
import RfidScanner from "./pages/RfidScanner";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import CompletedEvents from "./pages/client/CompletedEvents";

const router = createBrowserRouter([
  /* ------------------ Auth Routes ------------------ */
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },

  /* ------------------ Public Routes ------------------ */
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "public/events",
        element: <PublicEventList />,
      },
      {
        path: "public/events/:id",
        element: <PublicEventSpectate />,
      },
    ],
  },

  /* ------------------ Admin Routes ------------------ */
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "events",
        element: <Events />,
      },
      {
        path: "events/:eventID",
        element: <EventDetail />,
      },
      {
        path: "participants",
        element: <Participants />,
      },
      {
        path: "devices",
        element: <Devices />,
      },
      {
        path: "rfid-tags",
        element: <RfidTags />,
      },
      {
        path: "rfid-scanner",
        element: <RfidScanner />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },

  /* ------------------ Client Routes ------------------ */
  {
    path: "/client",
    element: (
      <ProtectedRoute>
        <ClientLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ClientHome />,
      },
      {
        path: "events",
        element: <ClientEventList />,
      },
      {
        path: "events/:id",
        element: <ClientEventDetail />,
      },
      {
        path: "race/:eventId",
        element: <RaceParticipation />,
      },
      {
        path: "race",
        element: <RaceParticipation />,
      },
      {
        path: "completed",
        element: <CompletedEvents />,
      },
      {
        path: "completed/:eventID",
        element: <EventDetail />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "payment/success",
        element: <PaymentSuccess />,
      },
    ],
  },

  /* ------------------ 404 ------------------ */
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function Route() {
  return <RouterProvider router={router} />;
}
