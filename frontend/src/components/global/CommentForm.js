import React from "react";
import useUserContext from "../../contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";

const CommentForm = ({ handleSubmit }) => {
    const {
        profileData: { username, profile_pic },
    } = useUserContext();
    return (
        <Card className="w-full">
            <CardContent className="p-3 flex gap-2">
                <Avatar>
                    <AvatarImage src={profile_pic || ""} alt={username} />
                    <AvatarFallback>{username && username.at(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <form className="flex-1 flex flex-col focus:outline-0 gap-3" onSubmit={handleSubmit}>
                    <label htmlFor="commentText" className="fixed -top-[200000px]">
                        Comment
                    </label>
                    <Input
                        type="text"
                        name="content"
                        id="commentText"
                        placeholder="Напишите комментарий"
                    />
                    <Button type="submit" className="ml-auto">
                        Post
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CommentForm;
