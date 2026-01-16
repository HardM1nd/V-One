import React, { useState } from "react";
import useUserContext from "../../contexts/UserContext";
import usePageContext from "../../contexts/pageContext";
import { useEffect } from "react";
import { ChangePasswordModal } from "../global/Modals";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const validUsernamePattern = /^[\w.@+-]+$/;

function validateUsername(username) {
    if (!username || username.at(-1) === " ") return false;
    return Boolean(username.match(validUsernamePattern));
}

const Settings = () => {
    const { profileData, updateInfo, isDemoUser } = useUserContext();
    const { maxFileSizeKb } = usePageContext();
    const { 
        profile_pic, 
        username, 
        cover_pic, 
        pilot_type = 'virtual',
        flight_hours = 0,
        aircraft_types = '',
        license_number = '',
        bio = ''
    } = profileData;
    const defaultFileValues = {
        profile_pic: { name: "", file: null, sizeKb: 0 },
        cover_pic: { name: "", file: null, sizeKb: 0 },
    };
    const showCover = Boolean(cover_pic) && !cover_pic.includes("coverphoto.jpg");
    const [editUsername, setEditUsername] = useState(false);
    const [formValues, setFormValues] = useState({
        username: username,
        pilot_type: pilot_type,
        flight_hours: flight_hours,
        aircraft_types: aircraft_types,
        license_number: license_number,
        bio: bio,
        ...defaultFileValues,
    });
    const [updatePassword, setupdatePassword] = useState(false);
    const clearField = (field) => {
        const fieldFileIdMapping = {
            profile_pic: "profilePicUpdate",
            cover_pic: "coverPicUpdate",
        };
        setFormValues((prev) => {
            return { ...prev, [field]: defaultFileValues[field] };
        });
        const fieldId = fieldFileIdMapping[field];
        document.getElementById(fieldId).value = "";
        document.getElementById(fieldId).disabled = true;
    };
    const handleEditClick = (name) => {
        document.querySelector(`#${name}`).click();
        document.querySelector(`#${name}`).disabled = false;
    };

    const handleChange = (e) => {
        setFormValues((prev) => {
            return { ...prev, [e.target.name]: e.target.value };
        });
    };

    const handleFileChange = (e) => {
        const file = URL.createObjectURL(e.target.files[0]);
        setFormValues((prev) => {
            return {
                ...prev,
                [e.target.name]: {
                    file: file,
                    sizeKb: Math.round(e.target.files[0].size / 1024),
                    name: e.target.value.split("\\").pop(),
                },
            };
        });
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (!validateUsername(formValues.username)) {
            alert("Некорректное имя пользователя");
            return;
        }
        const formElement = e.target;
        const success = () => {
            alert("Изменения применятся после обновления страницы");
        };

        const failure = (e) => {
            const errorMessages = e.response.data;
            const field = Object.keys(errorMessages)[0];
            alert(errorMessages[field][0]);
        };

        updateInfo(new FormData(formElement), success, failure);
    };

    useEffect(() => {
        setFormValues((prev) => ({ ...prev, username: username }));
    }, [editUsername, username]);

    return (
        <Card className="w-full mt-3">
            <CardContent className="p-6">
                <form
                    onSubmit={submitForm}
                    className="flex flex-col gap-7 justify-between"
                    id="tweet-form"
                    encType="multipart/form-data"
                >
                <div className="flex gap-3 flex-col w-full relative">
                    <label
                        htmlFor="profilePicUpdate"
                        className="dark:text-gray-200 font-medium tracking-wide"
                    >
                        Аватар
                    </label>
                    <input
                        type="file"
                        disabled
                        name="profile_pic"
                        accept="image/*"
                        id="profilePicUpdate"
                        className="fixed -top-[20000px]"
                        onChange={handleFileChange}
                    />
                    <div className="flex gap-3 absolute right-3">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick("profilePicUpdate")}
                        >
                            Редактировать
                        </Button>
                        {formValues.profile_pic.file && (
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => clearField("profile_pic")}
                            >
                            Очистить
                            </Button>
                        )}
                    </div>

                    {formValues.profile_pic.file && (
                        <div
                            className={`w-max  ${
                                formValues.profile_pic.sizeKb > maxFileSizeKb
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-green-600 dark:text-green-300 "
                            }`}
                        >
                            Размер: {formValues.profile_pic.sizeKb} КБ / {maxFileSizeKb} КБ (
                            {formValues.profile_pic.sizeKb <= maxFileSizeKb ? "Ок" : "Слишком большой"})
                        </div>
                    )}
                    <div className="w-full flex items-center justify-center">
                        {formValues.profile_pic.file || profile_pic ? (
                            <img
                                src={
                                    formValues.profile_pic.file
                                        ? formValues.profile_pic.file
                                        : profile_pic
                                }
                                alt={username}
                                className="rounded-full w-[136px] h-[136px] border-4 border-primary"
                            ></img>
                        ) : (
                            <div className="rounded-full w-[136px] h-[136px] flex items-center justify-center text-white text-5xl border-4 border-primary bg-muted">
                                {username && username.at(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-3 flex-col w-full relative">
                    <label
                        htmlFor="coverPicUpdate"
                        className="dark:text-gray-200 font-medium tracking-wide"
                    >
                        Обложка
                    </label>
                    <input
                        type="file"
                        disabled
                        name="cover_pic"
                        className="fixed -top-[20000px]"
                        accept="image/*"
                        id="coverPicUpdate"
                        onChange={handleFileChange}
                    />

                    <div className="flex gap-3 absolute right-3">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick("coverPicUpdate")}
                        >
                            Редактировать
                        </Button>
                        {formValues.cover_pic.file && (
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => clearField("cover_pic")}
                            >
                            Очистить
                            </Button>
                        )}
                    </div>

                    {formValues.cover_pic.file && (
                        <div
                            className={` w-max  ${
                                formValues.cover_pic.sizeKb > maxFileSizeKb
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-green-600 dark:text-green-300 "
                            }`}
                        >
                            Размер: {formValues.cover_pic.sizeKb} КБ / {maxFileSizeKb} КБ (
                            {formValues.cover_pic.sizeKb <= maxFileSizeKb ? "Ок" : "Слишком большой"})
                        </div>
                    )}
                    <div className="w-full flex items-center justify-center p-2 rounded">
                        {formValues.cover_pic.file || showCover ? (
                            <img
                                src={formValues.cover_pic.file ? formValues.cover_pic.file : cover_pic}
                                alt="Обложка профиля"
                                className="w-4/5 rounded-lg object-cover max-h-[40vh]"
                            ></img>
                        ) : (
                            <div className="w-4/5 rounded-lg max-h-[40vh] h-40 bg-muted" />
                        )}
                    </div>
                </div>
                <div className="flex gap-1 flex-col justify-center relative">
                    <label
                        htmlFor="usernameUpdate"
                        className="dark:text-gray-200 font-medium tracking-wide"
                    >
                        Имя пользователя
                    </label>
                    <div className="flex gap-3 absolute top-0 right-3">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                if (isDemoUser) {
                                    alert("Нельзя изменить имя у демо-аккаунта");
                                    return;
                                }
                                setEditUsername((prev) => !prev);
                            }}
                        >
                            {editUsername ? "отмена" : "редактировать"}
                        </Button>
                    </div>
                    <div className="w-2 h-2"></div>
                    {editUsername ? (
                        <Input
                            type="text"
                            name="username"
                            placeholder="Имя пользователя"
                            id="usernameUpdate"
                            autoFocus
                            onChange={handleChange}
                            value={formValues.username}
                        />
                    ) : (
                        <Input value={`@${username}`} disabled />
                    )}
                </div>
                <div className="flex gap-1 flex-col justify-center relative">
                    <label
                        htmlFor="usernameUpdate"
                        className="dark:text-gray-200 font-medium tracking-wide"
                    >
                        Пароль
                    </label>
                    <div className="flex gap-3 absolute top-0 right-3">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                if (isDemoUser) {
                                    alert("Нельзя менять пароль у демо-аккаунта");
                                    return;
                                }
                                setupdatePassword(true);
                            }}
                        >
                            Изменить
                        </Button>
                    </div>
                </div>
                <div className="flex gap-1 flex-col justify-center relative">
                    <label
                        htmlFor="pilotType"
                        className="dark:text-gray-200 font-medium tracking-wide"
                    >
                        Тип пилота
                    </label>
                    <select
                        name="pilot_type"
                        id="pilotType"
                        value={formValues.pilot_type}
                        onChange={handleChange}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    >
                        <option value="virtual">Виртуальный пилот</option>
                        <option value="real">Реальный пилот</option>
                        <option value="both">Виртуальный и реальный</option>
                    </select>
                </div>
                <div className="flex gap-1 flex-col justify-center relative">
                    <label
                        htmlFor="flightHours"
                        className="dark:text-gray-200 font-medium tracking-wide"
                    >
                        Часы налета
                    </label>
                    <Input
                        type="number"
                        name="flight_hours"
                        id="flightHours"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={formValues.flight_hours}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex gap-1 flex-col justify-center relative">
                    <label
                        htmlFor="aircraftTypes"
                        className="dark:text-gray-200 font-medium tracking-wide"
                    >
                        Типы самолетов (через запятую)
                    </label>
                    <Input
                        type="text"
                        name="aircraft_types"
                        id="aircraftTypes"
                        placeholder="Cessna 172, Boeing 737"
                        value={formValues.aircraft_types}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex gap-1 flex-col justify-center relative">
                    <label
                        htmlFor="licenseNumber"
                        className="dark:text-gray-200 font-medium tracking-wide"
                    >
                        Номер лицензии
                    </label>
                    <Input
                        type="text"
                        name="license_number"
                        id="licenseNumber"
                        placeholder="PPL-12345"
                        value={formValues.license_number}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex gap-1 flex-col justify-center relative">
                    <label
                        htmlFor="bio"
                        className="dark:text-gray-200 font-medium tracking-wide"
                    >
                        Биография
                    </label>
                    <Textarea
                        name="bio"
                        id="bio"
                        rows="4"
                        maxLength="500"
                        placeholder="Расскажите о себе..."
                        value={formValues.bio}
                        onChange={handleChange}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formValues.bio?.length || 0}/500
                    </div>
                </div>
                <div className="flex items-center justify-end w-full">
                    <Button type="submit">Сохранить</Button>
                </div>
                </form>
                {updatePassword && (
                    <ChangePasswordModal
                        open={updatePassword}
                        close={() => setupdatePassword(false)}
                    />
                )}
            </CardContent>
        </Card>
    );
};

export default Settings;
