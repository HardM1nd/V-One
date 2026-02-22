import React, { useEffect } from "react";
import useUserContext from "../../contexts/UserContext";
import PostComments from "./PostComments";
import ProfilePostContainer from "./ProfilePostContainer";
import MediaPostContainer from "./MediaPostContainer";
import ProfileUsers from "./ProfileUsers";
import { useSearchParams } from "react-router-dom";
import Settings from "./Settings";
import RouteList from "../Routes/RouteList";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { getMediaUrl } from "../../lib/utils";
import { Pencil } from "lucide-react";

const Profile = () => {
  const { profileData, isDemoUser } = useUserContext();
  const [queryParams, setQueryParams] = useSearchParams();
  const handleChange = (value) => {
    setQueryParams({ tab: value });
  };
  const {
    username,
    profile_pic,
    followers,
    following,
    date_joined,
    cover_pic,
    pilot_type_display,
    flight_hours,
    aircraft_types_list,
    license_number,
    bio,
  } = profileData;
  const currentTab = queryParams.get("tab") || "posts";
  const effectiveTab = isDemoUser && currentTab === "update" ? "posts" : currentTab;
  const tabs = [
    { value: "posts", label: "Посты" },
    { value: "comments", label: "Комментарии" },
    { value: "media", label: "Медиа" },
    { value: "following", label: "Подписки" },
    { value: "routes", label: "Маршруты" },
    ...(!isDemoUser ? [{ value: "update", label: <Pencil className="h-4 w-4" />, iconOnly: true }] : []),
  ];

  useEffect(() => {
    if (!username) return;
    document.title = `V-One | Профиль ${username}`;
    return function () {
      document.title = "V-One";
    };
  }, [username]);

  useEffect(() => {
    if (isDemoUser && currentTab === "update") {
      setQueryParams({ tab: "posts" }, { replace: true });
    }
  }, [isDemoUser, currentTab]);

  const showCover = Boolean(cover_pic) && !cover_pic.includes("coverphoto.jpg");

  return (
    <div className="w-[599px] max-w-[99%] mx-auto space-y-4">
      <Card>
        <div className="h-[270px] w-full relative">
          <div className="h-[200px]">
            {showCover ? (
              <img
                src={getMediaUrl(cover_pic)}
                alt="cover"
                className="w-full h-full object-cover"
              />
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
        </div>
        <CardContent className="p-4 flex flex-col gap-2">
          <p className="mt-4 capitalize text-lg">{username}</p>
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
        <CardContent className="mt-4 p-3 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              type="button"
              size="sm"
              variant={effectiveTab === tab.value ? "default" : "outline"}
              onClick={() => handleChange(tab.value)}
              aria-label={tab.value === "update" ? "Редактировать профиль" : undefined}
            >
              {tab.label}
            </Button>
          ))}
        </CardContent>
      </Card>
      <div className="w-full mx-auto">
        {effectiveTab === "posts" && <ProfilePostContainer />}
        {effectiveTab === "comments" && <PostComments />}
        {effectiveTab === "media" && <MediaPostContainer />}
        {effectiveTab === "following" && <ProfileUsers />}
        {effectiveTab === "routes" && (
          <div className="p-4">
            <RouteList endpoint="post/routes/" pilotId={profileData.id} showFilters={false} />
          </div>
        )}
        {effectiveTab === "update" && <Settings />}
      </div>
    </div>
  );
};

export default Profile;
