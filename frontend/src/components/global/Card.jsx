import React, { useState, useEffect } from "react";
import useUserContext from "../../contexts/UserContext";
import usePageContext from "../../contexts/pageContext";
import { CommentsModal, EditPostModal } from "./Modals";
import { Link } from "react-router-dom";
import { Flag, MoreVertical, Trash2, X } from "lucide-react";
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
        user: authUser,
        isAdmin,
        axiosInstance,
    } = useUserContext();
    const user_id = authUser?.user_id;
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
    const { likePost, savePost, deletePost, setData } = usePageContext();
    const [viewComment, setViewComment] = useState(false);
    const [openOptions, setOpenOptions] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Нормализуем изображения: поддерживаем как одно изображение, так и массив
    const images = React.useMemo(() => {
        if (!card_image) return [];
        if (Array.isArray(card_image)) {
            return card_image.filter(Boolean);
        }
        return [card_image];
    }, [card_image]);

    useEffect(() => {
        setImageError(false);
    }, [card_image]);

    // Обработка клавиатурной навигации в модальном окне
    useEffect(() => {
        if (!showImageModal || images.length <= 1) return;

        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft" && selectedImageIndex > 0) {
                setSelectedImageIndex((prev) => prev - 1);
            } else if (e.key === "ArrowRight" && selectedImageIndex < images.length - 1) {
                setSelectedImageIndex((prev) => prev + 1);
            } else if (e.key === "Escape") {
                setShowImageModal(false);
                setSelectedImageIndex(0);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showImageModal, selectedImageIndex, images.length]);

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

    const handleAdminDelete = (e) => {
        e.stopPropagation();
        const del = window.confirm("Удалить пост?");
        if (!del) {
            return;
        }
        axiosInstance
            .delete(`/post/admin/delete/${id}/`)
            .then((response) => {
                alert("Пост удален");
                // Обновляем состояние, удаляя пост из списка
                setData((prev) => {
                    const newPosts = prev.posts.filter((post) => post.id !== id);
                    return { ...prev, posts: newPosts };
                });
            })
            .catch((error) => {
                alert("Не удалось удалить пост");
                console.error(error);
            });
    };

    const handleReport = (e) => {
        e.stopPropagation();
        const ok = window.confirm("Отправить жалобу администратору?");
        if (!ok) return;

        axiosInstance
            .post(`/post/${id}/report/`)
            .then(() => {
                alert("Жалоба отправлена");
            })
            .catch((error) => {
                alert("Не удалось отправить жалобу");
                console.error(error);
            });
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground pr-12 sm:pr-0">
                        <div className="flex items-center gap-2">
                            <Link
                                className="text-foreground font-medium hover:text-primary"
                                to={user_id && creator_id && Number(user_id) === Number(creator_id) ? "/profile" : `/user/${creator_id}/`}
                            >
                                {user_id && creator_id && Number(user_id) === Number(creator_id) ? "Вы" : user}
                            </Link>
                            <span>•</span>
                            <span>{formatDateTime(created_at, created)}</span>
                        </div>
                        {id !== creator_id && is_following_user && (
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline">•</span>
                                <span>в подписках</span>
                            </div>
                        )}
                    </div>
                    <div className="text-sm text-foreground">
                        {isEdited ? "Изменено: " : ""}
                        {card_content}
                    </div>
                    {images.length > 0 && !imageError && (
                        <div className="pt-1">
                            {images.length === 1 ? (
                                <div className="w-full">
                                    <img
                                        src={getMediaUrl(images[0])}
                                        className="max-h-[65vh] w-full rounded-xl object-cover cursor-pointer"
                                        alt="пост"
                                        onError={() => setImageError(true)}
                                        onClick={() => {
                                            setSelectedImageIndex(0);
                                            setShowImageModal(true);
                                        }}
                                    />
                                </div>
                            ) : images.length === 2 ? (
                                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                                    {images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={getMediaUrl(img)}
                                            className="w-full h-[300px] sm:h-[400px] object-cover cursor-pointer"
                                            alt={`пост ${idx + 1}`}
                                            onError={() => setImageError(true)}
                                            onClick={() => {
                                                setSelectedImageIndex(idx);
                                                setShowImageModal(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : images.length === 3 ? (
                                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                                    <img
                                        src={getMediaUrl(images[0])}
                                        className="w-full h-[400px] sm:h-[500px] row-span-2 object-cover cursor-pointer"
                                        alt="пост 1"
                                        onError={() => setImageError(true)}
                                        onClick={() => {
                                            setSelectedImageIndex(0);
                                            setShowImageModal(true);
                                        }}
                                    />
                                    {images.slice(1).map((img, idx) => (
                                        <img
                                            key={idx + 1}
                                            src={getMediaUrl(img)}
                                            className="w-full h-[195px] sm:h-[245px] object-cover cursor-pointer"
                                            alt={`пост ${idx + 2}`}
                                            onError={() => setImageError(true)}
                                            onClick={() => {
                                                setSelectedImageIndex(idx + 1);
                                                setShowImageModal(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : images.length === 4 ? (
                                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                                    {images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={getMediaUrl(img)}
                                            className="w-full h-[300px] sm:h-[400px] object-cover cursor-pointer"
                                            alt={`пост ${idx + 1}`}
                                            onError={() => setImageError(true)}
                                            onClick={() => {
                                                setSelectedImageIndex(idx);
                                                setShowImageModal(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                                    {images.slice(0, 4).map((img, idx) => (
                                        <div key={idx} className="relative">
                                            <img
                                                src={getMediaUrl(img)}
                                                className="w-full h-[300px] sm:h-[400px] object-cover cursor-pointer"
                                                alt={`пост ${idx + 1}`}
                                                onError={() => setImageError(true)}
                                                onClick={() => {
                                                    setSelectedImageIndex(idx);
                                                    setShowImageModal(true);
                                                }}
                                            />
                                            {idx === 3 && images.length > 4 && (
                                                <div
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer text-white text-2xl font-bold"
                                                    onClick={() => {
                                                        setSelectedImageIndex(3);
                                                        setShowImageModal(true);
                                                    }}
                                                >
                                                    +{images.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="absolute top-4 right-3 flex items-center gap-1 z-10">
                        {(!user_id || !creator_id || Number(user_id) !== Number(creator_id)) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleReport}
                                className="text-muted-foreground hover:text-foreground h-8 w-8"
                                title="Пожаловаться"
                            >
                                <span className="sr-only">пожаловаться</span>
                                <Flag className="h-4 w-4" />
                            </Button>
                        )}

                        {user_id && creator_id && Number(user_id) === Number(creator_id) ? (
                            <>
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
                            </>
                        ) : null}

                        {isAdmin && (!user_id || !creator_id || Number(user_id) !== Number(creator_id)) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleAdminDelete}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                title="Удалить пост"
                            >
                                <span className="sr-only">удалить пост</span>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {showEditPostModal && (
                        <EditPostModal
                            id={id}
                            onClose={() => setShowEditPostModal(false)}
                            open={showEditPostModal}
                        />
                    )}
                    {showImageModal && images.length > 0 && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                            onClick={() => {
                                setShowImageModal(false);
                                setSelectedImageIndex(0);
                            }}
                        >
                            <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center w-full h-full">
                                {/* Кнопка закрытия */}
                                <button
                                    className="absolute top-4 right-4 z-20 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 hover:bg-black/70"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowImageModal(false);
                                        setSelectedImageIndex(0);
                                    }}
                                    aria-label="Закрыть"
                                >
                                    <X className="h-6 w-6" />
                                </button>

                                {/* Навигация влево */}
                                {images.length > 1 && selectedImageIndex > 0 && (
                                    <button
                                        className="absolute left-4 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 hover:bg-black/70"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImageIndex((prev) => Math.max(0, prev - 1));
                                        }}
                                        aria-label="Предыдущее изображение"
                                    >
                                        <iconify-icon icon="mdi:chevron-left" width="24px"></iconify-icon>
                                    </button>
                                )}

                                {/* Навигация вправо */}
                                {images.length > 1 && selectedImageIndex < images.length - 1 && (
                                    <button
                                        className="absolute right-4 z-20 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 hover:bg-black/70"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImageIndex((prev) => Math.min(images.length - 1, prev + 1));
                                        }}
                                        aria-label="Следующее изображение"
                                    >
                                        <iconify-icon icon="mdi:chevron-right" width="24px"></iconify-icon>
                                    </button>
                                )}

                                {/* Счетчик изображений */}
                                {images.length > 1 && (
                                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-white bg-black/50 rounded-full px-4 py-2 text-sm">
                                        {selectedImageIndex + 1} / {images.length}
                                    </div>
                                )}

                                {/* Изображение */}
                                <img
                                    src={getMediaUrl(images[selectedImageIndex])}
                                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                                    alt={`пост ${selectedImageIndex + 1}`}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
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
