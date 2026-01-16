import React from "react";
import useUserContext from "../../contexts/UserContext";
import { useLocation } from "react-router-dom";
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
    return (
        <header className="flex items-center justify-center pl-12 sm:pl-2 p-2 h-14 absolute w-full bg-background border-0 text-foreground sm:px-8">
            <div className="max max-w-6xl w-full flex justify-between">
                <div
                    className="flex gap-1 text-2xl text-primary items-center"
                    aria-hidden={true}
                >
                    <h1 className="font-bold italic inline-block capitalize">
                        {isError ? "v-one" : cur}
                    </h1>
                </div>
                <div className="flex justify-between items-center gap-2 lg:gap-3">
                    <a
                        className="text-foreground text-2xl hover:text-primary"
                        href="https://github.com/HardM1nd/V-One"
                        target="_blank"
                        rel="noreferrer"
                        alt="github"
                        aria-label="view code on github"
                    >
                        <span className="fixed -left-[10000000000000000px]">
                            View code on Github
                        </span>
                        <iconify-icon icon="bi:github">Light Theme</iconify-icon>
                    </a>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDarkTheme((p) => !p)}
                    >
                        {darkTheme ? (
                            <iconify-icon icon="carbon:light">Light Theme</iconify-icon>
                        ) : (
                            <iconify-icon icon="bi:moon-stars-fill">Dark theme</iconify-icon>
                        )}
                    </Button>
                    <Avatar>
                        <AvatarImage src={user && profile_pic ? profile_pic : ""} alt={user && username} />
                        <AvatarFallback>{username && username.at(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="text-primary text-sm xm:static fixed -top-36 capitalize">
                        {user && username}
                    </p>
                </div>
            </div>
        </header>
    );
};

export default Header;
