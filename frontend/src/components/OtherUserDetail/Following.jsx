import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import UserProfileCard from "../Profile/UserProfileCard";

const Following = () => {
    const { userId } = useParams();
    const [{ followers, loaded }, setFollowers] = useState({
        next: null,
        followers: [],
        loaded: false,
    });
    const { axiosInstance } = useUserContext();
    useEffect(() => {
        if (!userId) return;
        setFollowers((prev) => ({ ...prev, loaded: false }));
        axiosInstance
            .get(`/accounts/${userId}/following/`)
            .then((response) => {
                const raw = response.data.results;
                setFollowers({
                    next: response.data.next,
                    followers: Array.isArray(raw) ? raw : [],
                    loaded: true,
                });
            })
            .catch(() => {
                alert("Не удалось загрузить подписки");
                setFollowers((prev) => ({ ...prev, loaded: true }));
            });
    }, [axiosInstance, userId]);

    if (loaded && followers.length === 0) {
        return (
            <div className="p-2 py-8 text-center text-sm text-muted-foreground">
                У пользователя пока нет подписок.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 p-2">
            {followers.map((user) => {
                return <UserProfileCard {...user} key={user.id} />;
            })}
        </div>
    );
};

export default Following;
