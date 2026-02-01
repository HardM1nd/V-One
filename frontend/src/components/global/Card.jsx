import React, { useState, useEffect } from "react";
import useUserContext from "../../contexts/UserContext";
import usePageContext from "../../contexts/pageContext";
import { CommentsModal, EditPostModal } from "./Modals";
import { Link } from "react-router-dom";
import { MoreVertical, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card as UiCard, CardContent } from "../ui/card";
import { formatDateTime, getMediaUrl } from "../../lib/utils";

const CardOptionsComponent = ({ deletePost, edit, onClose }) => {
    useEffect(() => {
        window.addEventListener("click", onClose);
        return () => window.removeEventListener("click", onClose);
    }, [onClose]);

    return (
        <div className="flex flex-col items-start rounded-md text-sm border bg-card shadow">
            <button
                className="flex gap-2 justify-between p-2 w-full hover:bg-accent"
                onClick={edit}
            >
                <span>Редактировать</span>
                <iconify-icon icon="material-symbols:edit"></iconify-icon>
            </button>
            <div className="w-full h-px bg-border"></div>
            <button
                className="flex gap-2 justify-between p-2 w-full hover:bg-accent text-destructive"
                onClick={deletePost}
            >
                <span>Удалить</span>
                <iconify-icon icon="material-symbols:delete-rounded"></iconify-icon>
            </button>
        </div>
    );
};

const Card = (props) => {
    const {
        user: { user_id },
    } = useUserContext();
    const [showEditPostModal, setShowEditPostModal] = useState(false);

    const {
        id,
        avatar,
        card_content,
        card_image,
        comments,
        likes,
        saves,
        user,
        liked,
        creator_id,
        onLike,
        onSave,
        is_saved,
        is_commented,
        is_following_user,
        created,
        created_at,
        isEdited,
        onComment,
    } = props;
    const { likePost, savePost, deletePost } = usePageContext();
    const [viewComment, setViewComment] = useState(false);
    const [openOptions, setOpenOptions] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [card_image]);

    const handleDelete = (e) => {
        const del = window.confirm("Удалить пост?");
        if (!del) {
            alert("Удаление отменено");
            return;
        }
        const success = (response) => {
            alert("Действие выполнено");
        };
        const failure = () => alert("Не удалось выполнить действие");
        deletePost(id, success, failure);
    };

    return (
        <UiCard className="w-[598px] max-w-[95%] mt-4 post-card relative">
            <CardContent className="p-4 grid grid-cols-[48px,_auto] gap-1 space-y-3">
                <div className="mt-4">
                    <Avatar>
                        <AvatarImage src={getMediaUrl(avatar || "")} alt={user} />
                        <AvatarFallback>{user?.at(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link
                            className="text-foreground font-medium hover:text-primary"
                            to={user_id && creator_id && Number(user_id) === Number(creator_id) ? "/profile" : `/user/${creator_id}/`}
                        >
                            {user_id && creator_id && Number(user_id) === Number(creator_id) ? "Вы" : user}
                        </Link>
                        <span>•</span>
                        <span>{formatDateTime(created_at, created)}</span>
                        {id !== creator_id && is_following_user && (
                            <>
                                <span>•</span>
                                <span>в подписках</span>
                            </>
                        )}
                    </div>
                    <div className="text-sm text-foreground">
                        {isEdited ? "Изменено: " : ""}
                        {card_content}
                    </div>
                    {card_image && !imageError && (
                        <div className="pt-1">
                            <img
                                src={getMediaUrl(card_image)}
                                className="max-h-[65vh] w-full rounded-xl object-cover"
                                alt="пост"
                                onError={() => setImageError(true)}
                            />
                        </div>
                    )}
                    {user_id && creator_id && Number(user_id) === Number(creator_id) && (
                        <>
                            <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenOptions((prev) => !prev);
                                    }}
                                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                                    title="Меню"
                                >
                                    <span className="sr-only">открыть меню</span>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                                {openOptions ? (
                                    <div className="right-1 absolute top-10 z-20">
                                        <CardOptionsComponent
                                            onClose={() => setOpenOptions(false)}
                                            deletePost={handleDelete}
                                            id={id}
                                            edit={() => {
                                                setOpenOptions(false);
                                                setShowEditPostModal(true);
                                            }}
                                        />
                                    </div>
                                ) : null}
                            </div>
                            {showEditPostModal && (
                                <EditPostModal
                                    id={id}
                                    onClose={() => setShowEditPostModal(false)}
                                    open={showEditPostModal}
                                />
                            )}
                        </>
                    )}
                    <nav className="w-full grid grid-cols-3 gap-2 pt-2 border-t border-border">
                        <Button
                            variant="ghost"
                            className={is_commented ? "text-blue-500" : "text-muted-foreground"}
                            onClick={() => setViewComment(true)}
                        >
                            {is_commented ? (
                                <iconify-icon icon="bi:chat-fill">Комментарии</iconify-icon>
                            ) : (
                                <iconify-icon icon="fa:comment-o">Комментарии</iconify-icon>
                            )}
                            <span>{comments}</span>
                        </Button>
                        {viewComment && (
                            <CommentsModal
                                id={id}
                                onComment={onComment}
                                open={viewComment}
                                close={() => setViewComment(false)}
                            />
                        )}
                        <Button
                            variant="ghost"
                            className={liked ? "text-red-500" : "text-muted-foreground"}
                            onClick={() => likePost(id, onLike)}
                        >
                            {liked ? (
                                <iconify-icon icon="flat-color-icons:like">Лайк</iconify-icon>
                            ) : (
                                <iconify-icon icon="icon-park-outline:like">Лайк</iconify-icon>
                            )}
                            <span>{likes}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className={is_saved ? "text-blue-500" : "text-muted-foreground"}
                            onClick={() => savePost(id, onSave)}
                        >
                            <iconify-icon icon="bi:save">Сохранить</iconify-icon>
                            <span>{saves}</span>
                        </Button>
                    </nav>
                </div>
            </CardContent>
        </UiCard>
    );
};

export default Card;
