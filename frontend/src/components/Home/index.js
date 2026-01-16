import React, { useEffect, useRef } from "react";
import CardContainer from "../global/CardContainer";
import TweetForm from "../global/TweetForm";
import usePostActionContext from "../../contexts/PostActionContext";
import usePageContext from "../../contexts/pageContext";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import useUserContext from "../../contexts/UserContext";
import RouteList from "../Routes/RouteList";

const Home = () => {
    const { getPosts } = usePostActionContext();
    const { setData, getNextItems, getNextUrl } = usePageContext();
    const { user } = useUserContext();
    const container = useRef();
    useEffect(() => {
        const success = (r) => {
            setData({ next: r.data.next, posts: r.data.results });
        };
        getPosts("", success, () => alert("Couldn't load content"));
        return () => {
            setData({ next: null, posts: [] });
        };
    }, [getPosts, setData]);

    useEffect(() => {
        document.title = "V-One | Home";
        return () => {
            document.title = "V-One";
        };
    }, []);
    const retrieveNextPost = () => {
        const success = (response) => {
            setData((prev) => {
                return {
                    next: response.data.next,
                    posts: [...prev.posts, ...response.data.results],
                };
            });
        };
        const nextUrl = getNextUrl();
        if (!nextUrl) return;
        getNextItems(nextUrl, success);
    };

    return (
        <div className="flex flex-col items-center w-full" ref={container} id="demo">
            <TweetForm />
            <CardContainer />
            {getNextUrl() && (
                <button
                    className="text-purple-500 m-10 text-3xl p-1 flex justify-center items-center gap-1"
                    onClick={retrieveNextPost}
                >
                    more
                    <KeyboardDoubleArrowDownIcon />
                </button>
            )}
            <div className="w-[599px] max-w-[99%] mt-6">
                <div className="bg-gray-100 dark:bg-[#030108] p-4 mb-4 rounded-lg">
                    <h3 className="text-xl font-bold dark:text-gray-100">
                        🛫 Активность в маршрутах
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Последние маршруты пилотов, на которых вы подписаны
                    </p>
                </div>
                {user ? (
                    <RouteList endpoint="post/routes/following/" showFilters={false} />
                ) : (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Войдите, чтобы видеть маршруты подписок
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
