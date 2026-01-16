import React from "react";
import useUserContext from "../../contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";

const CommentCard = (props) => {
    const {
        user: { user_id },
    } = useUserContext();
    const { content, creator_name, creator_profile_pic, creator_id, created } = props;
    return (
        <Card className="my-2">
            <CardContent className="p-3 flex gap-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={creator_profile_pic || ""} alt={creator_name} />
                    <AvatarFallback>{creator_name.at(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="capitalize text-foreground">
                            {creator_id === user_id ? "Вы" : creator_name}
                        </div>
                        <div className="text-xs text-muted-foreground">• {created}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2 text-justify">
                        {content}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CommentCard;
