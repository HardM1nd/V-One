import React, { useState, useRef, useEffect } from "react";
import useUserContext from "../../contexts/UserContext";
import usePostActionContext from "../../contexts/PostActionContext";
import usePageContext from "../../contexts/pageContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { getMediaUrl } from "../../lib/utils";

const ImagePreview = ({ file, removeImage, index }) => {
    return (
        <div className="relative group">
            <img
                src={file.preview}
                alt={`превью изображения ${index + 1}`}
                className="w-full h-full rounded-lg object-cover"
            ></img>
            <button
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 text-white transition-opacity hover:bg-black/80"
                onClick={removeImage}
                type="button"
                aria-label={`Удалить изображение ${index + 1}`}
            >
                <iconify-icon icon="mdi:close" width="20px"></iconify-icon>
            </button>
            {file.sizeKb > 0 && (
                <div className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded ${
                    file.sizeKb > 500 ? "bg-red-600/80 text-white" : "bg-black/60 text-white"
                }`}>
                    {file.sizeKb} КБ
                </div>
            )}
        </div>
    );
};

const TweetForm = () => {
    const { setData, maxFileSizeKb } = usePageContext();
    const { createPost } = usePostActionContext();
    const [previewImage, setPreviewImage] = useState(true);
    const [files, setFiles] = useState([]);
    const {
        profileData: { username, profile_pic },
        isDemoUser,
    } = useUserContext();
    const chooseImageFile = (e) => {
        e.preventDefault();
        document.querySelector("#post-image-field").click();
    };

    const fileInputRef = useRef();

    const addFiles = (newFiles) => {
        const fileArray = Array.from(newFiles || []);
        const validFiles = fileArray
            .map((file) => {
                const sizeKb = Math.round(file.size / 1024);
                if (sizeKb > maxFileSizeKb) {
                    alert(`Файл ${file.name} слишком большой. Максимум ${maxFileSizeKb} КБ. Ваш файл: ${sizeKb} КБ`);
                    return null;
                }
                return {
                    file: file,
                    preview: URL.createObjectURL(file),
                    name: file.name,
                    sizeKb: sizeKb,
                };
            })
            .filter(Boolean);
        
        setFiles((prev) => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        const fileToRemove = files[index];
        URL.revokeObjectURL(fileToRemove.preview);
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const clearAllFiles = () => {
        files.forEach((file) => URL.revokeObjectURL(file.preview));
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        
        // Проверка размера файлов
        const oversizedFiles = files.filter((f) => f.sizeKb > maxFileSizeKb);
        if (oversizedFiles.length > 0) {
            alert(
                `Некоторые файлы слишком большие. Максимум ${maxFileSizeKb} КБ.`
            );
            return;
        }

        const formElement = e.target;
        const formData = new FormData(formElement);
        
        // Добавляем все файлы в FormData
        files.forEach((fileObj, index) => {
            formData.append(`image`, fileObj.file);
        });

        const success = (r) => {
            setData((prev) => ({
                ...prev,
                posts: [r.data, ...(prev.posts || [])],
            }));
            formElement.content.value = "";
            clearAllFiles();
        };
        createPost(
            formData,
            success,
            (err) =>
                alert(
                    isDemoUser && err?.response?.status === 403
                        ? "Демо-аккаунт: публикация недоступна."
                        : "Не удалось отправить пост"
                )
        );
    };

    useEffect(() => {
        const formElement = document.querySelector("#tweet-form");
        if (!formElement) return;
        formElement.addEventListener("submit", submitForm);
        return () => {
            formElement.removeEventListener("submit", submitForm);
        };
    });
    useEffect(() => {
        return () => {
            files.forEach((fileObj) => {
                if (fileObj.preview) {
                    URL.revokeObjectURL(fileObj.preview);
                }
            });
        };
    }, []);
    return (
        <Card className="w-[95%] max-w-[598px] mt-4">
            <CardContent className="p-4 grid grid-cols-[48px,_auto] gap-3">
                <div className="mt-3">
                    <Avatar>
                        <AvatarImage
                            src={profile_pic ? getMediaUrl(profile_pic) : ""}
                            alt={username}
                        />
                        <AvatarFallback>
                            {username && username.at(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <form
                    className="flex flex-col gap-3 justify-between"
                    action="/"
                    method="post"
                    id="tweet-form"
                    encType="multipart/form-data"
                >
                    <div className="space-y-2">
                        <label htmlFor="main-tweet-form" className="fixed -top-[10000px]">
                            Текст поста
                        </label>
                        <Textarea
                            name="content"
                            id="main-tweet-form"
                            placeholder="Что у вас нового?"
                            required
                        />
                        <label htmlFor="post-image-field" className="fixed -top-[10000px]">
                            Выбор изображения
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            name="image"
                            id="post-image-field"
                            className="fixed -top-[10000px]"
                            ref={fileInputRef}
                            multiple
                            onChange={(e) => {
                                if (!e.target.files || e.target.files.length === 0) return;
                                addFiles(e.target.files);
                                e.target.value = ""; // Сбрасываем input для возможности повторного выбора тех же файлов
                            }}
                        />
                        <div className="text-xs text-muted-foreground">
                            Выбрано изображений: {files.length}
                        </div>

                        {files.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                                Общий размер: {files.reduce((sum, f) => sum + f.sizeKb, 0)} КБ / {maxFileSizeKb * files.length} КБ
                            </div>
                        )}

                        {previewImage && files.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                {files.map((fileObj, index) => (
                                    <ImagePreview
                                        key={index}
                                        file={fileObj}
                                        removeImage={() => removeFile(index)}
                                        index={index}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="outline" onClick={chooseImageFile}>
                            <iconify-icon icon="bi:image">Выбрать изображение</iconify-icon>
                        </Button>
                        {files.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setPreviewImage((prev) => !prev);
                                }}
                            >
                                <iconify-icon
                                    icon={
                                        previewImage
                                            ? "ant-design:eye-invisible-filled"
                                            : "icon-park-outline:preview-open"
                                    }
                                >
                                    {previewImage ? "Скрыть превью" : "Показать превью"}
                                </iconify-icon>
                            </Button>
                        )}
                        {files.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (window.confirm("Удалить все изображения?")) {
                                        clearAllFiles();
                                    }
                                }}
                                className="text-destructive hover:text-destructive"
                            >
                                <iconify-icon icon="mdi:delete-outline" width="18px">
                                    Очистить все
                                </iconify-icon>
                            </Button>
                        )}
                        <Button className="ml-auto" type="submit">
                            Опубликовать
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default TweetForm;

