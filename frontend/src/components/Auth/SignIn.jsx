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
        document.title = "V-One | Вход";
        return function () {
            document.title = "V-One";
        };
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        login(formData, () => alert("Неверный логин или пароль"));
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
        setTimeout(() => login(demoUser, () => alert("Неверный логин или пароль")), 100);
    };

    if (user) return <Navigate to="/" />;
    return (
        <main className="w-screen h-screen flex items-center justify-center bg-background">
            <Card className="w-[90vw] max-w-lg">
                <CardContent className="p-6 space-y-4">
                    <div className="mt-4 space-y-1">
                        <h1 className="text-2xl font-semibold">Вход в V-One</h1>
                        <p className="text-sm text-muted-foreground">
                            Добро пожаловать! Войдите в аккаунт.
                        </p>
                    </div>
                    <form onSubmit={(e) => handleSubmit(e)} className="w-full flex flex-col gap-3">
                        <label htmlFor="signin-login" className="text-sm text-muted-foreground">
                            Логин
                        </label>
                        <Input
                            type="text"
                            autoFocus
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="имя пользователя или email"
                            id="signin-login"
                            autoComplete="username"
                        />
                        <label htmlFor="signup-password" className="text-sm text-muted-foreground">
                            Пароль
                        </label>
                        <Input
                            type="password"
                            name="password"
                            id="signup-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="пароль"
                        />
                        <p className="text-sm text-muted-foreground">
                            Нет аккаунта?{" "}
                            <Link to="/signup" className="text-primary hover:underline">
                                Регистрация
                            </Link>
                        </p>
                        <div className="flex justify-end items-center gap-2">
                            <Button type="submit">Войти</Button>
                            <Button type="button" variant="outline" onClick={loginInHasDemo}>
                                Войти как Demo
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
