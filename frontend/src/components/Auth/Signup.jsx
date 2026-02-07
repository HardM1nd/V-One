import React, { useState, useEffect } from "react";
import useUserContext from "../../contexts/UserContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";

const validUsernamePattern = /^[\w.@+-]+$/;
const validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUsername(username) {
    if (!username || username.at(-1) === " ") return false;
    return Boolean(username.match(validUsernamePattern));
}

function validateEmail(email) {
    return email && Boolean(email.match(validEmailPattern));
}

function validatePassword(password) {
    if (!password || password.length < 8) return "min_length";
    if (!/[a-zA-Zа-яА-Я]/.test(password)) return "no_letters";
    return null;
}

export default function SignUp() {
    const { user, signup } = useUserContext();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
    });
    const [usernameError, setUsernameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(null); // null | "min_length" | "no_letters" | "mismatch"
    const [backendError, setBackendError] = useState(null);

    function handleSubmit(e) {
        e.preventDefault();
        setBackendError(null);
        const pwdIssue = validatePassword(formData.password);
        if (pwdIssue) {
            setPasswordError(pwdIssue);
            return;
        }
        if (formData.password !== formData.passwordConfirm) {
            setPasswordError("mismatch");
            return;
        }
        setPasswordError(null);
        signup(
            { username: formData.username, email: formData.email, password: formData.password },
            (error) => {
                const data = error?.response?.data || {};
                const msg = [data.username, data.email, data.password].flat().filter(Boolean).join(" ") || "Ошибка регистрации.";
                setBackendError(msg);
            }
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setBackendError(null);
        if (name === "username") setUsernameError(!validateUsername(value));
        if (name === "email") setEmailError(value && !validateEmail(value));
        if (name === "password" || name === "passwordConfirm") setPasswordError(null);
    };

    useEffect(() => {
        document.title = "V-One | Регистрация";
        return () => {
            document.title = "V-One";
        };
    }, []);

    if (user) return <Navigate to="/" />;
    return (
        <main className="w-screen h-screen flex items-center justify-center bg-background">
            <Card className="w-[90vw] max-w-lg">
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">Создать аккаунт</h1>
                        <p className="text-sm text-muted-foreground">
                            Зарегистрируйтесь, чтобы публиковать посты и маршруты.
                        </p>
                    </div>
                    <form onSubmit={(e) => handleSubmit(e)} className="w-full flex flex-col gap-3">
                        <label htmlFor="signup-username" className="text-sm text-muted-foreground">
                            Имя пользователя
                        </label>

                        {usernameError && (
                            <p className="text-sm text-red-500">
                                Некорректное имя: допустимы буквы, цифры и символы @/./+/-/_.
                            </p>
                        )}
                        <Input
                            type="text"
                            autoFocus
                            name="username"
                            required
                            onChange={handleChange}
                            value={formData.username}
                            placeholder="имя пользователя"
                            id="signup-username"
                        />
                        <label htmlFor="signup-email" className="text-sm text-muted-foreground">
                            Email
                        </label>
                        {emailError && (
                            <p className="text-sm text-red-500">Введите корректный адрес почты.</p>
                        )}
                        <Input
                            type="email"
                            name="email"
                            required
                            onChange={handleChange}
                            value={formData.email}
                            placeholder="email@example.com"
                            id="signup-email"
                        />
                        {backendError && <p className="text-sm text-red-500">{backendError}</p>}
                        {passwordError === "min_length" && (
                            <p className="text-sm text-red-500">Пароль должен содержать минимум 8 символов.</p>
                        )}
                        {passwordError === "no_letters" && (
                            <p className="text-sm text-red-500">Пароль должен содержать хотя бы одну букву.</p>
                        )}
                        {passwordError === "mismatch" && (
                            <p className="text-sm text-red-500">Пароли не совпадают.</p>
                        )}
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

                        <label
                            htmlFor="signup-password-confirm"
                            className="text-sm text-muted-foreground"
                        >
                            Подтверждение пароля
                        </label>
                        <Input
                            type="password"
                            name="passwordConfirm"
                            id="signup-password-confirm"
                            value={formData.passwordConfirm}
                            required
                            onChange={handleChange}
                            placeholder="повторите пароль"
                        />
                        <p className="text-sm text-muted-foreground">
                            Уже есть аккаунт?{" "}
                            <Link to="/signin" className="text-primary hover:underline">
                                Войти
                            </Link>
                        </p>
                        <div className="flex justify-end">
                            <Button type="submit">Зарегистрироваться</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
