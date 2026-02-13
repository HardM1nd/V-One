import React, { useEffect, useRef } from "react";
import CardContainer from "../global/CardContainer";
import TweetForm from "../global/TweetForm";
import usePostActionContext from "../../contexts/PostActionContext";
import usePageContext from "../../contexts/pageContext";
import useUserContext from "../../contexts/UserContext";
import RouteList from "../Routes/RouteList";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const Home = () => {
    const { getPosts } = usePostActionContext();
    const { setData, getNextItems, getNextUrl } = usePageContext();
    const { user } = useUserContext();
    const container = useRef();

    useEffect(() => {
        const success = (r) => {
            setData({ next: r.data.next, posts: r.data.results });
        };
        getPosts("", success, () => alert("Не удалось загрузить ленту"));
        return () => {
            setData({ next: null, posts: [] });
        };
    }, [getPosts, setData]);

    useEffect(() => {
        document.title = "V-One | Главная";
        return () => {
            document.title = "V-One";
        };
    }, []);

    const retrieveNextPost = () => {
        const success = (response) => {
            setData((prev) => ({
                next: response.data.next,
                posts: [...prev.posts, ...response.data.results],
            }));
        };
        const nextUrl = getNextUrl();
        if (!nextUrl) return;
        getNextItems(nextUrl, success);
    };

    return (
        <div className="flex flex-col items-center w-full" ref={container} id="demo">
            <TweetForm />
            <CardContainer
                emptyMessage="Пока нет постов в ленте."
                emptyHint="Опубликуйте первый пост, чтобы начать."
            />
            {getNextUrl() && (
                <Button variant="outline" className="mt-4" onClick={retrieveNextPost}>
                    Показать еще
                </Button>
            )}
            <div className="sm:w-[599px] max-w-[95%] mt-6">
                <Card className="mb-4">
                    <CardContent className="mt-4 p-4">
                        <h3 className="text-xl font-bold">🛫 Активность в маршрутах</h3>
                        <p className="text-sm text-muted-foreground">
                            Последние маршруты пилотов, на которых вы подписаны
                        </p>
                    </CardContent>
                </Card>
                {user ? (
                    <RouteList endpoint="post/routes/following/" showFilters={false} />
                ) : (
                    <div className="text-center text-sm text-muted-foreground mt-4">
                        Войдите, чтобы видеть маршруты подписок
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;






