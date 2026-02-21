import React, { useEffect, useRef } from "react";
import CardContainer from "../global/CardContainer";
import usePostActionContext from "../../contexts/PostActionContext";
import usePageContext from "../../contexts/pageContext";
import { Button } from "../ui/button";

const Saved = () => {
    const { getPosts } = usePostActionContext();
    const { setData, getNextItems, getNextUrl } = usePageContext();
    const container = useRef();
    useEffect(() => {
        const success = (r) => {
            const raw = r.data?.results;
            setData({ next: r.data?.next ?? null, posts: Array.isArray(raw) ? raw : [] });
        };
        getPosts("saved", success, () => alert("Не удалось загрузить сохраненные посты"));
        return () => {
            setData({ next: null, posts: [] });
        };
    }, [getPosts, setData]);

    const retrieveNextPost = () => {
        const success = (response) => {
            const raw = response.data?.results;
            const newPosts = Array.isArray(raw) ? raw : [];
            setData((prev) => ({
                next: response.data?.next ?? null,
                posts: [...prev.posts, ...newPosts],
            }));
        };
        const nextUrl = getNextUrl();
        if (!nextUrl) return;
        getNextItems(nextUrl, success);
    };
    return (
        <div className="flex flex-col items-center w-full" ref={container} id="demo">
            <CardContainer
                emptyMessage="Нет сохраненных постов."
                emptyHint="Сохраняйте посты, чтобы вернуться к ним позже."
            />
            {getNextUrl() && (
                <Button variant="outline" className="mt-4" onClick={retrieveNextPost}>
                    Показать еще
                </Button>
            )}
        </div>
    );
};

export default Saved;
