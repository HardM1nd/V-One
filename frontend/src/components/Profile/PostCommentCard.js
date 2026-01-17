import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { formatDateTime } from "../../lib/utils";

const PostCommentCard = (props) => {
    const {
        post_id,
        created,
        post_content,
        content,
        post_creator_profile,
        post_creator,
        post_created,
        post_created_at,
        created_at,
    } = props;
    return (
        <Card className="mt-4">
            <CardContent className="p-4 grid grid-cols-1 gap-2">
                <div className="flex gap-3 items-center">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={post_creator_profile || ""} alt={post_creator} />
                        <AvatarFallback>{post_creator.at(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-xs">
                        <div className="capitalize text-foreground">{post_creator}</div>
                        <div className="text-muted-foreground">
                            опубликовано {formatDateTime(post_created_at, post_created)}
                        </div>
                    </div>
                </div>
                <Link to={`/post/${post_id}`} className="text-sm text-muted-foreground hover:text-primary">
                    {post_content.slice(0, 100)} {post_content > 100 && <span> ...</span>}
                    <span aria-hidden={true} className="text-sm">
                        <iconify-icon icon="bx:link-alt"></iconify-icon>
                    </span>
                </Link>
                <p className="text-sm flex flex-col text-foreground">
                    <span>Вы — {content}</span>
                    <span className="text-xs text-muted-foreground">
                        Комментарий {formatDateTime(created_at, created)}
                    </span>
                </p>
            </CardContent>
        </Card>
    );
};

export default PostCommentCard;

};

export default PostCommentCard;
