import React from "react";
import { Link } from "react-router-dom";
import useUserContext from "../../contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const UserProfileCard = (props) => {
    const { id, profile_pic, username, followers } = props;
    const {
        profileData: { id: userId },
    } = useUserContext();
    return (
        <Card className="mt-2">
            <CardContent className="p-3 flex gap-3 items-center">
                <Avatar>
                    <AvatarImage src={profile_pic || ""} alt={username} />
                    <AvatarFallback>{username.at(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col mr-auto">
                    <div className="text-sm">{id === userId ? "You" : username}</div>
                    <div className="text-xs text-muted-foreground">
                        {followers === 1 ? "1 подписчик" : `${followers} подписчиков`}
                    </div>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link to={id === userId ? "/profile" : `/user/${id}/`}>Профиль</Link>
                </Button>
            </CardContent>
        </Card>
    );
};

export default UserProfileCard;

export default UserProfileCard;
