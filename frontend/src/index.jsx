import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { UserContextProvider } from "./contexts/UserContext";
import { PostActionContextProvider } from "./contexts/PostActionContext";
import { ThemeContextProvider } from "./contexts/themeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <UserContextProvider>
        <PostActionContextProvider>
            <ThemeContextProvider>
                <RouterProvider router={App} />
            </ThemeContextProvider>
        </PostActionContextProvider>
    </UserContextProvider>
);


