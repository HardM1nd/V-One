import React, { useState, useRef, useEffect } from "react";
import useUserContext from "../../contexts/UserContext";
import usePostActionContext from "../../contexts/PostActionContext";
import usePageContext from "../../contexts/pageContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { getMediaUrl } from "../../lib/utils";

const ImagePreview = ({ file, removeImage }) => {
    return (
        <div className="w-full float-right relative mt-3">
            <img
                src={file}
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
};

const TweetForm = () => {
    const { setData, maxFileSizeKb } = usePageContext();
    const { createPost } = usePostActionContext();
    const [previewImage, setPreviewImage] = useState(true);
    const [file, setFile] = useState({ name: "", file: null, sizeKb: 0 });
    const {
        profileData: { username, profile_pic },
    } = useUserContext();
    const chooseImageFile = (e) => {
        e.preventDefault();
        document.querySelector("#post-image-field").click();
    };

    const fileInputRef = useRef();

    const clearFile = (e) => {
        if (e) {
            e.preventDefault();
            const remove = window.confirm(`Clear ${file.name} from form?`);
            if (!remove) return;
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
        setFile({
            name: "",
            file: null,
            sizeKb: 0,
        });
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (file.sizeKb > maxFileSizeKb) {
            alert(
                `Файл слишком большой. Максимум ${maxFileSizeKb} КБ. Ваш файл: ${file.sizeKb} КБ`
            );
            return;
        }
        const formElement = e.target;
        const success = (r) => {
            setData((prev) => ({
                ...prev,
                posts: [r.data, ...(prev.posts || [])],
            }));
            formElement.content.value = "";
            formElement.image.value = "";
            clearFile();
        };
        createPost(new FormData(formElement), success, () =>
            alert("Не удалось отправить пост")
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
    return (
        <Card className="w-[95%] max-w-[598px] mt-3">
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
                            onChange={(e) => {
                                if (!e.target.files || !e.target.files[0]) return;
                                const objUrl = URL.createObjectURL(e.target.files[0]);
                                setFile({
                                    file: objUrl,
                                    sizeKb: Math.round(e.target.files[0].size / 1024),
                                    name: e.target.value.split("\\").pop(),
                                });
                            }}
                        />
                        <div className="text-xs text-muted-foreground">
                            Файл: {file.name || "не выбран"}
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

                        {previewImage && file.file && (
                            <ImagePreview
                                file={file.file}
                                removeImage={(e) => clearFile(e)}
                            />
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="outline" onClick={chooseImageFile}>
                            <iconify-icon icon="bi:image">Выбрать изображение</iconify-icon>
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={!file.file}
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
                                    Показать превью
                            </iconify-icon>
                        </Button>
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

