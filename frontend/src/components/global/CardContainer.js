import React from "react";
import usePageContext from "../../contexts/pageContext";
import Card from "./Card";
import { Card as UiCard, CardContent } from "../ui/card";

const CardContainer = (props) => {
    const {
        data: { posts },
    } = usePageContext();
    let results = posts;
    if (props.posts) results = props.posts;
    const { onLike, onSave, onComment } = props;
    const emptyMessage = props.emptyMessage || "Пока нет постов.";
    const emptyHint = props.emptyHint || "Добавьте первый пост, чтобы начать общение.";

    if (!results || results.length === 0) {
        return (
            <UiCard className="w-[598px] max-w-[95%] mt-4">
                <CardContent className="p-6 text-center">
                    <div className="text-sm text-muted-foreground">{emptyMessage}</div>
                    {emptyHint && <div className="text-xs text-muted-foreground mt-1">{emptyHint}</div>}
                </CardContent>
            </UiCard>
        );
    }

    return (
        <>
            {results.map((post) => {
                return (
                    <Card
                        id={post.id}
                        // Trying to randomize the key has much has possible to prevent conflict
                        // when dealing with newly requested posts from paginization
                        key={post.id + new Date().toJSON() + Math.random() ** Math.random()}
                        user={post.creator.username}
                        card_content={post.content}
                        card_image={post.image}
                        onLike={onLike}
                        onComment={onComment}
                        onSave={onSave}
                        comments={post.comments}
                        likes={post.likes}
                        saves={post.saves}
                        liked={post.is_liked}
                        avatar={post.creator.profile_pic}
                        creator_id={post.creator.id}
                        is_saved={post.is_saved}
                        is_commented={post.is_commented}
                        is_following_user={post.is_following_user}
                        is_followed_by_user={post.is_followed_by_user}
                        created={post.created}
                        created_at={post.created_at}
                        isEdited={post.isEdited}
                    />
                );
            })}
        </>
    );
};

export default CardContainer;
