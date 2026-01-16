import React, { useEffect } from "react";
import { Tab, Tabs, createTheme } from "@mui/material";
import useUserContext from "../../contexts/UserContext";
import PostComments from "./PostComments";
import ProfilePostContainer from "./ProfilePostContainer";
import MediaPostContainer from "./MediaPostContainer";
import useThemeContext from "../../contexts/themeContext";
import ProfileUsers from "./ProfileUsers";
import { useSearchParams } from "react-router-dom";
import Settings from "./Settings";
import RouteList from "../Routes/RouteList";

const tabDarkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const Profile = () => {
  const { profileData } = useUserContext();
  const [queryParams, setQueryParams] = useSearchParams();
  const { darkTheme } = useThemeContext();
  const handleChange = (x, value) => {
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

  useEffect(() => {
    if (!username) return;
    document.title = `V-One Profile | @${username}`;
    return function () {
      document.title = "V-One";
    };
  }, [username]);

  const showCover = Boolean(cover_pic) && !cover_pic.includes("coverphoto.jpg");

  return (
    <div className="w-[599px] max-w-[99%] mt-1 mx-auto">
      <div className="bg-gray-100 dark:bg-[#030108]">
        <div className="h-[270px] w-full relative">
          <div className="h-[200px]">
            {showCover ? (
              <img
                src={cover_pic}
                alt="cover"
                className="w-full h-full object-cover"
              ></img>
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-[#0b0b12]" />
            )}
          </div>
          {profile_pic ? (
            <img
              src={profile_pic}
              alt={username}
              className="rounded-full w-[136px] h-[136px] object-cover absolute top-1/2 left-2 border-4 border-purple-500"
            ></img>
          ) : (
            <div className="rounded-full w-[136px] h-[136px] flex items-center justify-center text-white text-5xl absolute top-1/2 left-2 border-4 bg-[#bdbdbd]">
              {username && username.at(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col gap-1">
          <p className="capitalize text-black text-lg dark:text-gray-400">
            @{username}
          </p>
          <div className="capitalize text-sm text-[#5B7083]">
            joined {date_joined}
          </div>
          {pilot_type_display && (
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              ✈️ {pilot_type_display}
            </div>
          )}
          {flight_hours > 0 && (
            <div className="text-sm text-[#5B7083]">
              Налет: {parseFloat(flight_hours).toFixed(1)} часов
            </div>
          )}
          {aircraft_types_list && aircraft_types_list.length > 0 && (
            <div className="text-sm text-[#5B7083]">
              Самолеты: {aircraft_types_list.join(', ')}
            </div>
          )}
          {license_number && (
            <div className="text-sm text-[#5B7083]">
              Лицензия: {license_number}
            </div>
          )}
          {bio && (
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {bio}
            </div>
          )}
          <div className="text-[#5b7083] text-sm flex gap-1">
            <div>
              <span className="text-black dark:text-gray-400">
                {followers}{" "}
              </span>
              {followers > 1 ? "followers" : "follower"}
            </div>
            <span className="text-black">.</span>
            <div>
              <span className="text-black dark:text-gray-400">{following}</span>{" "}
              following
            </div>
          </div>
        </div>
      </div>
      <div className="w-full sticky top-0 z-10 mt-3 bg-gray-100 border-b-4 p-3 dark:bg-[#030108] dark:border-gray-900">
        <Tabs
          value={currentTab}
          onChange={handleChange}
          variant="scrollable"
          aria-label="basic tabs example"
          theme={tabDarkTheme}
          component="nav"
          style={darkTheme ? { background: "#030108" } : null}
        >
          <Tab
            label="Posts"
            value="posts"
            theme={darkTheme ? tabDarkTheme : null}
          />
          <Tab
            label="Comments"
            value="comments"
            theme={darkTheme ? tabDarkTheme : null}
          />
          <Tab
            label="media"
            value="media"
            theme={darkTheme ? tabDarkTheme : null}
          />
          <Tab
            label="following"
            value="following"
            theme={darkTheme ? tabDarkTheme : null}
          />
          <Tab
            label="Routes"
            value="routes"
            theme={darkTheme ? tabDarkTheme : null}
          />
          <Tab
            label="Update Profile"
            value="update"
            theme={darkTheme ? tabDarkTheme : null}
          />
        </Tabs>
      </div>
      <div className="w-full mx-auto">
        {currentTab === "posts" && <ProfilePostContainer />}
        {currentTab === "comments" && <PostComments />}
        {currentTab === "media" && <MediaPostContainer />}
        {currentTab === "following" && <ProfileUsers />}
        {currentTab === "routes" && (
          <div className="p-4">
            <RouteList endpoint="post/routes/" pilotId={profileData.id} showFilters={false} />
          </div>
        )}
        {currentTab === "update" && <Settings />}
      </div>
    </div>
  );
};

export default Profile;
