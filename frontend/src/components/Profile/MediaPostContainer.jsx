import React, { useEffect, useRef } from "react";
import usePageContext from "../../contexts/pageContext";
import usePostActionContext from "../../contexts/PostActionContext";
import CardContainer from "../global/CardContainer";
import { Button } from "../ui/button";

const MediaPostContainer = () => {
    const { setData, getNextItems, getNextUrl } = usePageContext();
    const { getPosts } = usePostActionContext();
    const container = useRef();
    useEffect(() => {
        const success = (response) => {
            const { next, results } = response.data;
            setData({ next: next ?? null, posts: Array.isArray(results) ? results : [] });
        };
        getPosts("media", success, (err) => {
            console.error("MediaPostContainer: load failed", err);
            alert("Не удалось загрузить медиа");
        });
        return () => setData({ next: null, posts: [] });
    }, [getPosts, setData]);

    const retrieveNextPost = () => {
        const success = (response) => {
            const nextPage = response.data?.next ?? null;
            const newResults = Array.isArray(response.data?.results) ? response.data.results : [];
            setData((prev) => ({ next: nextPage, posts: [...prev.posts, ...newResults] }));
        };
        const nextUrl = getNextUrl();
        if (!nextUrl) return;
        getNextItems(nextUrl, success);
    };

    return (
        <div ref={container} className="flex flex-col items-center w-full">
            <CardContainer
                emptyMessage="Постов с медиа пока нет."
                emptyHint="Добавьте изображение к посту."
            />
            {getNextUrl() && (
                <Button variant="outline" className="mt-6" onClick={retrieveNextPost}>
                    Показать еще
                </Button>
            )}
        </div>
    );
};

export default MediaPostContainer;
