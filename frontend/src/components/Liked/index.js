import React, { useEffect, useRef } from "react";
import CardContainer from "../global/CardContainer";
import usePostActionContext from "../../contexts/PostActionContext";
import usePageContext from "../../contexts/pageContext";
import { Button } from "../ui/button";

const Liked = () => {
    const { getPosts } = usePostActionContext();
    const { setData, getNextItems, getNextUrl } = usePageContext();
    const container = useRef();
    useEffect(() => {
        const success = (r) => {
            setData({ next: r.data.next, posts: r.data.results });
        };
        getPosts("liked", success, () => alert("Не удалось загрузить лайкнутые посты"));
        return () => {
            setData({ next: null, posts: [] });
        };
    }, [getPosts, setData]);

    useEffect(() => {
        document.title = "V-One | Лайкнутые посты";
        return function () {
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
            <CardContainer
                emptyMessage="Нет лайкнутых постов."
                emptyHint="Поставьте лайк — пост появится здесь."
            />
            {getNextUrl() && (
                <Button variant="outline" className="mt-6" onClick={retrieveNextPost}>
                    Показать еще
                </Button>
            )}
        </div>
    );
};

export default Liked;
