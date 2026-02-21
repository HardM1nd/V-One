import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import UserProfileCard from "../Profile/UserProfileCard";

const Following = () => {
    const { userId } = useParams();
    const [{ followers }, setFollowers] = useState({
        next: null,
        followers: [],
    });
    const { axiosInstance } = useUserContext();
    useEffect(() => {
        axiosInstance
            .get(`/accounts/${userId}/following/`)
            .then((response) => {
                const raw = response.data.results;
                setFollowers({
                    next: response.data.next,
                    followers: Array.isArray(raw) ? raw : [],
                });
            })
            .catch(() => alert("Не удалось загрузить подписки"));
    }, [axiosInstance, userId]);
    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 p-2">
            {followers.map((user) => {
                return <UserProfileCard {...user} key={user.id} />;
            })}
        </div>
    );
};

export default Following;
