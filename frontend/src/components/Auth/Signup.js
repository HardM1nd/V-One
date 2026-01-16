import React, { useState } from "react";
import useUserContext from "../../contexts/UserContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";

const validUsernamePattern = /^[\w.@+-]+$/;

function validateUsername(username) {
    if (!username || username.at(-1) === " ") return false;
    return Boolean(username.match(validUsernamePattern));
}

export default function SignUp() {
    const { user, signup } = useUserContext();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        passwordConfirm: "",
    });
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        if (formData.password !== formData.passwordConfirm) setPasswordError(true);
        else {
            signup(formData, (error) => {
                const data = error.response.data;
                alert(data.username);
            });
        }
    }

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        if (!validateUsername(e.target.value)) {
            setUsernameError(true);
        } else setUsernameError(false);
    };

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
                            Username
                        </label>

                        {usernameError && (
                            <p className="text-sm text-red-500">
                                Invalid username, only letters, numbers, and @/./+/-/_ characters.
                            </p>
                        )}
                        <Input
                            type="text"
                            autoFocus
                            name="username"
                            required
                            onChange={handleChange}
                            value={formData.username}
                            placeholder="username"
                            id="signup-username"
                        />
                        {passwordError && <p className="text-sm text-red-500">invalid password</p>}
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

                        <label
                            htmlFor="signup-password-confirm"
                            className="text-sm text-muted-foreground"
                        >
                            Password confirmation
                        </label>
                        <Input
                            type="password"
                            name="passwordConfirm"
                            id="signup-password-confirm"
                            value={formData.passwordConfirm}
                            required
                            onChange={handleChange}
                            placeholder="password confirm"
                        />
                        <p className="text-sm text-muted-foreground">
                            Уже есть аккаунт?{" "}
                            <Link to="/signin" className="text-primary hover:underline">
                                Войти
                            </Link>
                        </p>
                        <div className="flex justify-end">
                            <Button type="submit">Signup</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
