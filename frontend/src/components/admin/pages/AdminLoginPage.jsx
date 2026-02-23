import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserContext from "../../../contexts/UserContext";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { login, user, isAdmin } = useUserContext();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && isAdmin) {
            navigate("/admin/dashboard", { replace: true });
        } else if (user && !isAdmin) {
            setError("У вас нет прав администратора.");
        }
    }, [user, isAdmin, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        login(
            { username, password },
            () => {
                setLoading(false);
                setError("Неверные логин или пароль.");
            }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md rounded-2xl p-6 md:p-8 space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Вход в админ‑панель</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="username">
                            Логин
                        </label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="password">
                            Пароль
                        </label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button
                        type="submit"
                        className="w-full rounded-full mt-2"
                        disabled={loading}
                    >
                        {loading ? "Вход..." : "Войти"}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default AdminLoginPage;

