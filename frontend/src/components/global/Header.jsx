import React from "react";
import useUserContext from "../../contexts/UserContext";
import { useLocation, Link } from "react-router-dom";
import useThemeContext from "../../contexts/themeContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const Header = (props) => {
    const {
        user,
        profileData: { username, profile_pic },
    } = useUserContext();
    const { darkTheme, setDarkTheme } = useThemeContext();
    const { isError } = props;
    const location = useLocation();
    let cur = location.pathname.split("/").at(1);
    if (cur === "") cur = "home";
    const titleMap = {
        home: "главная",
        explore: "обзор",
        pilots: "пилоты",
        routes: "маршруты",
        notifications: "уведомления",
        likes: "лайки",
        saved: "сохраненные",
        profile: "профиль",
    };
    const pageTitle = titleMap[cur] || cur;
    return (
        <header className="flex items-center justify-center pl-12 sm:pl-2 p-2 h-14 absolute w-full bg-background border-0 text-foreground sm:px-8">
            <div className="max max-w-6xl w-full flex justify-between">
                <div
                    className="flex gap-1 text-2xl text-primary items-center pl-10 sm:pl-10"
                    aria-hidden={true}
                >
                    <h1 className="font-bold inline-block capitalize">
                        {isError ? "v-one" : pageTitle}
                    </h1>
                </div>
                <div className="flex justify-between items-center gap-2 lg:gap-3">
                    <a
                        className="text-foreground text-2xl hover:text-primary"
                        href="https://github.com/HardM1nd/V-One"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="код на GitHub"
                    >
                        <span className="sr-only">Код на GitHub</span>
                        <svg
                            viewBox="0 0 24 24"
                            className="h-9 w-9"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path
                                fill="currentColor"
                                d="M12 2C6.477 2 2 6.484 2 12.02c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.455-1.159-1.11-1.468-1.11-1.468-.908-.62.069-.608.069-.608 1.003.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.953 0-1.094.39-1.99 1.029-2.69-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.297 2.748-1.027 2.748-1.027.546 1.378.203 2.397.1 2.65.64.7 1.028 1.596 1.028 2.69 0 3.85-2.339 4.697-4.566 4.945.359.309.679.92.679 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.02C22 6.484 17.523 2 12 2z"
                            />
                        </svg>
                    </a>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDarkTheme((p) => !p)}
                        aria-label={darkTheme ? "Переключить на светлую тему" : "Переключить на темную тему"}
                    >
                        {darkTheme ? (
                            <svg
                                viewBox="0 0 24 24"
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                    </Button>
                    <Link to="/profile/" className="cursor-pointer">
                        <Avatar>
                            <AvatarImage
                                src={user && profile_pic ? profile_pic : ""}
                                alt={user && username}
                            />
                            <AvatarFallback>
                                {username && username.at(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <Link to="/profile/" className="cursor-pointer">
                        <p className="text-primary font-bold xm:static fixed -top-36 capitalize">
                        {user && username}
                        </p>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;

