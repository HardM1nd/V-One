import React, { useEffect, useRef, useState } from "react";
import usePageContext from "../../contexts/pageContext";
import useUserContext from "../../contexts/UserContext";
import usePostActionContext from "../../contexts/PostActionContext";
import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";

const ImagePreview = ({ src, removeImage, file }) => {
    if (src || file.file) {
        return (
            <div className="w-full float-right relative mt-3">
                <img
                    src={file.file ? file.file : src}
                    alt="превью выбранного файла"
                    className="w-full rounded-lg object-cover max-h-[50vh]"
                ></img>
                <button
                    className="w-full h-full p-3  rounded-lg lg:text-2xl absolute top-0 left-0 bg-gray-900 opacity-0 hover:opacity-80 text-white transition-all"
                    onClick={removeImage}
                    type="button"
                >
                    Удалить изображение
                </button>
            </div>
        );
    }
    return (
        <div className="w-full h-48 rounded-md bg-white text-gray-700 dark:text-gray-200 flex items-center text-3xl justify-center dark:bg-[#03060e]">
            Файл не выбран
        </div>
    );
};

const CommentsModal = ({ id, open, close, onComment }) => {
    const { getComments } = usePostActionContext();
    const { createComment, getNextItems, setData } = usePageContext();
    const { axiosInstance, user, profileData, isDemoUser } = useUserContext();
    const [{ comments, next }, setComments] = useState({
        next: null,
        comments: [],
    });
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = (response) => {
            setComments((prev) => {
                return {
                    ...prev,
                    comments: [response.data, ...prev.comments],
                };
            });
            onComment && onComment(id);
            e.target.content.value = "";
        };
        const onFailure = (err) => {
            alert(
                isDemoUser && err?.response?.status === 403
                    ? "Демо-аккаунт: публикация недоступна."
                    : "Не удалось отправить комментарий"
            );
        };
        const formData = new FormData(e.target);
        createComment(id, formData, success, onFailure);
    };

    useEffect(() => {
        const success = (response) => {
            setComments({
                next: response.data.next,
                comments: response.data.results,
            });
        };
        getComments(id, success, () => alert("Не удалось загрузить комментарии"));
    }, [id, setComments, getComments]);

    const retrieveNextComments = () => {
        const success = (response) => {
            setComments((prev) => {
                return {
                    next: response.data.next,
                    comments: [...prev.comments, ...response.data.results],
                };
            });
        };
        if (!next) return;
        getNextItems(next, success);
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Удалить комментарий?")) {
            return;
        }
        try {
            await axiosInstance.delete(`post/comments/delete/${commentId}/`);
            setComments((prev) => ({
                ...prev,
                comments: prev.comments.filter((c) => c.id !== commentId),
            }));
            setData((prev) => {
                if (!prev?.posts?.length) return prev;
                return {
                    ...prev,
                    posts: prev.posts.map((post) =>
                        post.id === id
                            ? { ...post, comments: Math.max(0, post.comments - 1) }
                            : post
                    ),
                };
            });
        } catch (error) {
            console.error("Delete comment error:", error);
            alert("Не удалось удалить комментарий");
        }
    };

    const handleEditStart = (comment) => {
        setEditingId(comment.id);
        setEditingText(comment.content || "");
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditingText("");
    };

    const handleEditSave = async (commentId) => {
        if (!editingText.trim()) {
            alert("Комментарий не может быть пустым");
            return;
        }
        try {
            const response = await axiosInstance.patch(`post/comments/update/${commentId}/`, {
                content: editingText.trim(),
            });
            setComments((prev) => ({
                ...prev,
                comments: prev.comments.map((c) =>
                    c.id === commentId ? response.data : c
                ),
            }));
            handleEditCancel();
        } catch (error) {
            console.error("Update comment error:", error);
            alert("Не удалось обновить комментарий");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && close()}>
            <DialogContent className="p-0 max-w-2xl w-[95vw] h-[90vh] sm:h-auto">
                <div className="flex flex-col gap-3 p-4 h-full">
                    <DialogHeader>
                        <DialogTitle>Комментарии</DialogTitle>
                    </DialogHeader>
                    <CommentForm handleSubmit={handleSubmit} />
                    <div className="overflow-y-auto h-full pb-6 pr-1">
                        {comments.map((comment) => {
                            const currentUserId = user?.user_id || profileData?.id;
                            const canEdit =
                                currentUserId &&
                                Number(comment.creator?.id) === Number(currentUserId);
                            if (editingId === comment.id) {
                                return (
                                    <Card key={comment.id}>
                                        <CardContent className="p-3 space-y-2">
                                            <Textarea
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                rows={3}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleEditCancel}
                                                >
                                                    Отмена
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleEditSave(comment.id)}
                                                >
                                                    Сохранить
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }
                            return (
                                <div key={comment.id} className="space-y-1">
                                    <CommentCard
                                        content={comment.content}
                                        creator_name={comment.creator.username}
                                        creator_profile_pic={comment.creator.profile_pic}
                                        creator_id={comment.creator.id}
                                        created={comment.created}
                                        created_at={comment.created_at}
                                    />
                                    {canEdit && (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditStart(comment)}
                                            >
                                                Редактировать
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                                onClick={() => handleDelete(comment.id)}
                                            >
                                                Удалить
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {next && (
                            <div className="mt-4 flex flex-col items-center w-full">
                                <Button variant="outline" onClick={retrieveNextComments}>
                                    Показать еще
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={close}>
                            Закрыть
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const EditPostModal = ({ id, open, onClose }) => {
    const {
        profileData: { username, profile_pic },
    } = useUserContext();
    const { getCardInfoFromData, maxFileSizeKb, updatePost } = usePageContext();
    const prevContent = getCardInfoFromData(id)[0];
    const [file, setFile] = useState({ name: "", file: null, sizeKb: 0 });
    const [prevImageSrc, setPrevImageSrc] = useState(prevContent.image);
    const [editPostText, setEditPostText] = useState(prevContent.content);
    const chooseImageFile = (e) => {
        e.preventDefault();
        document.querySelector("#edit-post-image-field").click();
    };
    const fileInputRef = useRef();

    const submitForm = (e) => {
        e.preventDefault();
        const formElement = e.target;
        if (file.sizeKb > maxFileSizeKb) {
            alert(
                `File to large, maximum size is ${maxFileSizeKb} kb. Your file is ${file.sizeKb} kb`
            );
            return;
        }
        const success = () => {
            alert("Пост обновлен");
        };
        updatePost(id, new FormData(formElement), success, () => {
            alert("Не удалось обновить пост");
        });
    };

    const clearFile = (e) => {
        e.preventDefault();
        const remove = window.confirm("Удалить изображение из формы?");
        if (!remove) return;
        if (!file.file) {
            setPrevImageSrc("");
        }
        fileInputRef.value = null;
        setFile({
            name: "",
            file: null,
            sizeKb: 0,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="p-0 max-w-2xl w-[95vw]">
                <div className="flex flex-col gap-3 p-4">
                    <DialogHeader>
                        <DialogTitle>Редактировать пост</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-[48px,_auto] gap-3">
                        <Avatar>
                            <AvatarImage src={profile_pic || ""} alt={username} />
                            <AvatarFallback>{username && username.at(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <form
                            className="flex flex-col gap-3 justify-between"
                            action="/"
                            method="post"
                            id="edit-form"
                            onSubmit={submitForm}
                            encType="multipart/form-data"
                        >
                            <div className="space-y-2">
                                <label htmlFor="edit-tweet-input" className="fixed -top-[10000px]">
                                    Текст поста
                                </label>
                                <Textarea
                                    name="content"
                                    value={editPostText}
                                    id="edit-tweet-input"
                                    required
                                    onChange={(e) => setEditPostText(e.target.value)}
                                />
                                <label
                                    htmlFor="edit-post-image-field"
                                    className="fixed -top-[10000px]"
                                >
                                    Выбор изображения
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    name="image"
                                    id="edit-post-image-field"
                                    ref={fileInputRef}
                                    className="fixed -top-[10000px]"
                                    disabled={prevImageSrc && !file.file}
                                    onChange={(e) => {
                                        const file = URL.createObjectURL(e.target.files[0]);
                                        setFile({
                                            file: file,
                                            sizeKb: Math.round(e.target.files[0].size / 1024),
                                            name: e.target.value.split("\\").pop(),
                                        });
                                    }}
                                />
                                <input type="hidden" name="isEdited" value="True" />
                            </div>
                            {file.file && (
                                <div
                                    className={`text-xs ${
                                        file.sizeKb > maxFileSizeKb
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-emerald-600 dark:text-emerald-300"
                                    }`}
                                >
                                    Размер: {file.sizeKb} КБ / {maxFileSizeKb} КБ (
                                    {file.sizeKb <= maxFileSizeKb ? "Ок" : "Слишком большой"})
                                </div>
                            )}
                            <ImagePreview
                                file={file}
                                src={prevImageSrc}
                                removeImage={(e) => clearFile(e)}
                            />
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" onClick={chooseImageFile}>
                                    <iconify-icon icon="bi:image">Выбрать изображение</iconify-icon>
                                </Button>
                                <Button type="submit" className="ml-auto">
                                    Обновить
                                </Button>
                            </div>
                        </form>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Закрыть
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const validUsernamePattern = /^[\w.@+-]+$/;

function validateUsername(username) {
    if (!username || username.at(-1) === " ") return false;
    return Boolean(username.match(validUsernamePattern));
}

const ChangePasswordModal = ({ open, close }) => {
    const [passwordError, setPasswordError] = useState(false);
    const [{ newPassword, newPasswordConfirm }, setPasswords] = useState({
        newPassword: "",
        newPasswordConfirm: "",
    });
    const { axiosInstance } = useUserContext();

    function handleSubmit(e) {
        e.preventDefault();
        if (newPassword !== newPasswordConfirm) {
            alert("Пароли не совпадают");
            return;
        }
        axiosInstance
            .patch("/accounts/profile/update/", {
                password: newPassword,
            })
            .then(() => {
                alert("Пароль обновлен");
                close();
            })
            .catch(() => alert("Не удалось обновить пароль"));
    }
    function handleChange(e) {
        setPasswords((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setPasswordError(!validateUsername(e.target.value));
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && close()}>
            <DialogContent className="max-w-lg w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Смена пароля</DialogTitle>
                </DialogHeader>
                <form
                    className="flex flex-col gap-3"
                    id="update-password-form"
                    onSubmit={handleSubmit}
                >
                    {passwordError && <p className="text-sm text-red-500">Некорректный пароль</p>}
                    <label htmlFor="new-password" className="text-sm">
                        Новый пароль
                    </label>
                    <Input
                        type="password"
                        name="newPassword"
                        id="new-password"
                        onChange={handleChange}
                        required
                        value={newPassword}
                        placeholder="пароль"
                    />
                    <label htmlFor="new-password-confirm" className="text-sm">
                        Повторите пароль
                    </label>
                    <Input
                        type="password"
                        value={newPasswordConfirm}
                        onChange={handleChange}
                        name="newPasswordConfirm"
                        id="new-password-confirm"
                        required
                        placeholder="повторите пароль"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={close}>
                            Отмена
                        </Button>
                        <Button type="submit">Обновить</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export { CommentsModal, EditPostModal, ChangePasswordModal };
