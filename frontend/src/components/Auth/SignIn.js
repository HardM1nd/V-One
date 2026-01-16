import React, { useState, useEffect } from "react";
import useUserContext from "../../contexts/UserContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";

const demoUser = {
    username: "DemoUser",
    password: "randompassword",
};

export default function SignIn() {
    const { login, user } = useUserContext();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    useEffect(() => {
        document.title = "Sign In To V-One";
        return function () {
            document.title = "V-One";
        };
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        login(formData, () => alert("Invalid Login Credentials"));
    }

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const loginInHasDemo = (e) => {
        e.preventDefault();
        setFormData(demoUser);
        // Using a setTimeOut to wait a bit so the passwords are revealed to the user before submitting the form
        setTimeout(() => login(demoUser, () => alert("Invalid Login Credentials")), 100);
    };

    if (user) return <Navigate to="/" />;
    return (
        <main className="w-screen h-screen flex items-center justify-center bg-background">
            <Card className="w-[90vw] max-w-lg">
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">Вход в V-One</h1>
                        <p className="text-sm text-muted-foreground">
                            Добро пожаловать! Войдите в аккаунт.
                        </p>
                    </div>
                    <form onSubmit={(e) => handleSubmit(e)} className="w-full flex flex-col gap-3">
                        <label htmlFor="signup-username" className="text-sm text-muted-foreground">
                            Username
                        </label>
                        <Input
                            type="text"
                            autoFocus
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="username"
                            id="signup-username"
                        />
                        <label htmlFor="signup-password" className="text-sm text-muted-foreground">
                            Password
                        </label>
                        <Input
                            type="password"
                            name="password"
                            id="signup-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="password"
                        />
                        <p className="text-sm text-muted-foreground">
                            Нет аккаунта?{" "}
                            <Link to="/signup" className="text-primary hover:underline">
                                Регистрация
                            </Link>
                        </p>
                        <div className="flex justify-end items-center gap-2">
                            <Button type="submit">Login</Button>
                            <Button type="button" variant="outline" onClick={loginInHasDemo}>
                                Login As Demo User
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
