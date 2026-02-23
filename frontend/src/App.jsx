import React from "react";
import { Navigate, Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import Base from "./components/global/Base";
import Home from "./components/Home";
import Saved from "./components/Saved";
import Explore from "./components/Explore";
import Profile from "./components/Profile";
import SignIn from "./components/Auth/SignIn";
import LoginRequiredRoute from "./components/global/ProtectedRoute";
import Logout from "./components/Auth/Logout";
import ErrorPage from "./components/global/ErrorPage";
import Liked from "./components/Liked";
import PostDetail from "./components/global/PostDetail";
import OtherUserDetail from "./components/OtherUserDetail";
import SignUp from "./components/Auth/Signup";
import Pilots from "./components/Pilots";
import Routes from "./components/Routes";
import RouteDetail from "./components/Routes/RouteDetail";
import Notifications from "./components/Notifications";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/layouts/AdminLayout";
import AdminDashboardPage from "./components/admin/pages/AdminDashboardPage";
import AdminComplaintsPage from "./components/admin/pages/AdminComplaintsPage";
import AdminActivityPage from "./components/admin/pages/AdminActivityPage";
import AdminSettingsPage from "./components/admin/pages/AdminSettingsPage";
import AdminLoginPage from "./components/admin/pages/AdminLoginPage";

const App = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<Base />} errorElement={<ErrorPage />}>
                <Route path="/" element={<LoginRequiredRoute />}>
                    <Route path="" element={<Home />} />
                    <Route path="likes/" element={<Liked />} />
                    <Route path="saved/" element={<Saved />} />
                    <Route path="explore/" element={<Explore />} />
                    <Route path="pilots" element={<Pilots />} />
                    <Route path="pilots/" element={<Pilots />} />
                    <Route path="routes/" element={<Routes />} />
                    <Route path="routes/create" element={<Navigate to="/routes/?tab=create" replace />} />
                    <Route path="routes/create/" element={<Navigate to="/routes/?tab=create" replace />} />
                    <Route path="routes/:routeId" element={<RouteDetail />} />
                    <Route path="notifications/" element={<Notifications />} />
                    <Route path="route/:routeId" element={<RouteDetail />} />
                    <Route path="profile/" element={<Profile />} />
                    <Route path="logout/" element={<Logout />} />
                    <Route path="post/:postId" element={<PostDetail />} />
                    <Route path="user/:userId" element={<OtherUserDetail />} />
                </Route>
            </Route>

            {/* Публичные страницы аутентификации */}
            <Route path="signin/" element={<SignIn />} />
            <Route path="signup/" element={<SignUp />} />

            {/* Админская часть */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminProtectedRoute />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="complaints" element={<AdminComplaintsPage />} />
                    <Route path="activity" element={<AdminActivityPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
            </Route>
        </>
    )
);

export default App;






