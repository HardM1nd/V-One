import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { UserContextProvider } from "./contexts/UserContext";
import { PostActionContextProvider } from "./contexts/PostActionContext";
import { ThemeContextProvider } from "./contexts/themeContext";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Не удалось найти корневой элемент с id 'root'");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
    React.createElement(
        React.StrictMode,
        null,
        React.createElement(
            UserContextProvider,
            null,
            React.createElement(
                PostActionContextProvider,
                null,
                React.createElement(
                    ThemeContextProvider,
                    null,
                    React.createElement(RouterProvider, { router: App })
                )
            )
        )
    )
);