import React, { useState, useEffect } from "react";
import useUserContext from "../../contexts/UserContext";
import { useParams, useSearchParams, Navigate } from "react-router-dom";
import usePageContext from "../../contexts/pageContext";
import Posts from "./Posts";
import Media from "./Media";
import Following from "./Following";
import BlockUserModal from "./BlockUserModal";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { getMediaUrl } from "../../lib/utils";

const Profile = () => {
  const { userId } = useParams();
  const { followUser } = usePageContext();
  const [profileData, setProfileData] = useState({});
  const [queryParams, setQueryParams] = useSearchParams();
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const handleChange = (value) => {
    setQueryParams({ tab: value });
  };
  const {
    axiosInstance,
    profileData: { id: curId },
    isAdmin,
  } = useUserContext();

  useEffect(() => {
    axiosInstance
      .get(`/accounts/${userId}/info/`)
      .then((response) => setProfileData(response.data));
  }, [axiosInstance, userId]);

  const {
    id,
    username,
    profile_pic,
    followers,
    following,
    date_joined,
    cover_pic,
    is_following,
    pilot_type_display,
    flight_hours,
    aircraft_types_list,
    license_number,
    bio,
    is_active,
  } = profileData;
  const currentTab = queryParams.get("tab") || "posts";
  const tabs = [
    { value: "posts", label: "Посты" },
    { value: "media", label: "Медиа" },
    { value: "following", label: "Подписки" },
  ];
  const showCover = Boolean(cover_pic) && !cover_pic.includes("coverphoto.jpg");

  useEffect(() => {
    if (!username) return;
    document.title = `V-One | Профиль ${username}`;
    return function () {
      document.title = "V-One";
    };
  }, [username]);

  const handleFollowUnfollow = () => {
    const success = (response) => {
      const { followers } = response.data;
      setProfileData((prev) => ({ ...prev, followers: followers }));
    };
    const failure = () => {
      alert("Не удалось выполнить действие. Проверьте соединение.");
    };
    followUser(id, success, failure);
  };

  const handleBanUnban = () => {
    setIsBlockModalOpen(true);
  };

  const handleConfirmBlock = async (deletePeriod) => {
    try {
      const response = await axiosInstance.post(`/accounts/admin/ban/${id}/`, {
        delete_period: deletePeriod,
      });
      const { is_banned, user: updatedUser, deletion_info } = response.data;
      setProfileData((prev) => ({ ...prev, is_active: updatedUser.is_active }));
      
      let message = `Пользователь ${is_banned ? "забанен" : "разбанен"}`;
      if (deletion_info) {
        const { posts_deleted, comments_deleted } = deletion_info;
        if (posts_deleted > 0 || comments_deleted > 0) {
          message += `. Удалено: ${posts_deleted} постов, ${comments_deleted} комментариев`;
        }
      }
      alert(message);
    } catch (error) {
      alert("Не удалось выполнить действие. Проверьте соединение.");
      console.error(error);
      throw error;
    }
  };

  if (curId && curId === id) {
    return <Navigate to="/profile" />;
  }
  return (
    <div className="w-[599px] max-w-[99%] mt-1 mx-auto space-y-4">
      <Card>
        <div className="h-[270px] w-full relative">
          <div className="h-[200px]">
            {showCover ? (
              <img src={getMediaUrl(cover_pic)} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
          <div className="absolute top-1/2 left-2">
          <Avatar className="h-[136px] w-[136px] border-4 border-primary">
              <AvatarImage
                  src={profile_pic ? getMediaUrl(profile_pic) : ""}
                  alt={username}
              />
              <AvatarFallback className="text-4xl">
                  {username && username.at(0).toUpperCase()}
              </AvatarFallback>
          </Avatar>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={handleFollowUnfollow}
              variant={is_following ? "outline" : "default"}
              size="sm"
            >
              {is_following ? "Отписаться" : "Подписаться"}
            </Button>
            {isAdmin && (
              <Button
                onClick={handleBanUnban}
                variant={is_active === false ? "default" : "destructive"}
                size="sm"
                title={is_active === false ? "Разбанить пользователя" : "Забанить пользователя"}
              >
                {is_active === false ? "Разбанить" : "Забанить"}
              </Button>
            )}
          </div>
        </div>
        <CardContent className="p-4 flex flex-col gap-2">
          <p className="capitalize text-lg mt-4">{username}</p>
          <div className="text-sm text-muted-foreground">зарегистрирован {date_joined}</div>
          {pilot_type_display && (
            <Badge className="w-40 justify-center" variant="secondary">✈️ {pilot_type_display}</Badge>
          )}
          {flight_hours > 0 && (
            <div className="text-sm text-muted-foreground">
              Налет: {parseFloat(flight_hours).toFixed(1)} часов
            </div>
          )}
          {aircraft_types_list && aircraft_types_list.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Самолеты: {aircraft_types_list.join(", ")}
            </div>
          )}
          {license_number && (
            <div className="text-sm text-muted-foreground">Лицензия: {license_number}</div>
          )}
          {bio && <div className="text-sm text-foreground mt-1">{bio}</div>}
          <div className="text-muted-foreground text-sm flex gap-2">
            <div>
              <span className="text-foreground">{followers} </span>
              {followers > 1 ? "подписчиков" : "подписчик"}
            </div>
            <span>•</span>
            <div>
              <span className="text-foreground">{following}</span> подписок
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="sticky top-0 z-10">
        <CardContent className="mt-3 p-3 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              type="button"
              size="sm"
              variant={currentTab === tab.value ? "default" : "outline"}
              onClick={() => handleChange(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </CardContent>
      </Card>
      <div className="w-full mx-auto pl-4">
        {currentTab === "posts" && <Posts />}
        {currentTab === "media" && <Media />}
        {currentTab === "following" && <Following />}
      </div>
      <BlockUserModal
        open={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleConfirmBlock}
        username={username}
        isCurrentlyBanned={is_active === false}
      />
    </div>
  );
};

export default Profile;
