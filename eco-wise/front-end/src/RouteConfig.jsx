import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import PublicRoutes from "./PublicRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import AuthGuard from "./components/utils/AuthGuard";
import NotFoundPage from "./pages/NotFoundPage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [

      // Publicly accessible routes
      ...PublicRoutes,

      // Protected Routes
      ...ProtectedRoutes.map((route) => ({
        ...route,
        element: <AuthGuard type={1}>{route.element}</AuthGuard>,
      })),

      // 404 error Page not found
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;