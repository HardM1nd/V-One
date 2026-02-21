import React, { useEffect, useRef } from "react";
import usePageContext from "../../contexts/pageContext";
import usePostActionContext from "../../contexts/PostActionContext";
import CardContainer from "../global/CardContainer";
import { Button } from "../ui/button";

const ProfilePostContainer = () => {
    const { setData, getNextItems, getNextUrl } = usePageContext();
    const { getPosts } = usePostActionContext();
    const container = useRef();
    useEffect(() => {
        const success = (response) => {
            const raw = response.data?.results;
            setData({ next: response.data?.next ?? null, posts: Array.isArray(raw) ? raw : [] });
        };
        getPosts("user", success, () => alert("Не удалось загрузить посты"));
        return () => setData({ next: null, posts: [] });
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
        <div ref={container} className="flex flex-col items-center w-full">
            <CardContainer
                emptyMessage="У вас пока нет постов."
                emptyHint="Создайте первый пост в ленте."
            />
            {getNextUrl() && (
                <Button variant="outline" className="mt-4" onClick={retrieveNextPost}>
                    Показать еще
                </Button>
            )}
        </div>
    );
};

export default ProfilePostContainer;
