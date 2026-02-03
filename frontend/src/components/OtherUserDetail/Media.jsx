import React, { useEffect, useState } from "react";
import useUserContext from "../../contexts/UserContext";
import usePageContext from "../../contexts/pageContext";
import CardContainer from "../global/CardContainer";
import { useParams } from "react-router-dom";
import { Button } from "../ui/button";

const Media = () => {
    const { axiosInstance } = useUserContext();
    const { getNextItems } = usePageContext();
    const { userId } = useParams();
    const [{ posts, next }, setData] = useState({
        posts: [],
        next: null,
    });

    useEffect(() => {
        if (!userId) return;
        axiosInstance
            .get(`/post/user/${userId}/all/?filter=media`)
            .then((response) => {
                const { next, results } = response.data;
                setData({ next: next ?? null, posts: Array.isArray(results) ? results : [] });
            })
            .catch((error) => {
                console.error("Media: failed to load", error?.response?.data ?? error.message);
                alert("Не удалось загрузить посты. Проверьте соединение.");
                setData({ next: null, posts: [] });
            });
    }, [axiosInstance, userId]);

    const retrieveNextPosts = () => {
        const success = (response) => {
            const nextPage = response.data?.next ?? null;
            const newResults = Array.isArray(response.data?.results) ? response.data.results : [];
            setData((prev) => ({ next: nextPage, posts: [...prev.posts, ...newResults] }));
        };
        if (!next) return;
        getNextItems(next, success);
    };

    const onLike = (response) => {
        setData((prev) => {
            const update = response.data;
            let newPost = prev.posts.map((post) => (post.id === update.id ? update : post));
            return { ...prev, posts: newPost };
        });
    };

    const onSave = (response) => {
        setData((prev) => {
            const update = response.data;
            let newPost = prev.posts.map((post) => (post.id === update.id ? update : post));
            return { ...prev, posts: newPost };
        });
    };

    const updateCommentCount = (id) => {
        setData((prev) => {
            const newPosts = prev.posts.map((post) => {
                return post.id === id
                    ? { ...post, comments: post.comments + 1, is_commented: true }
                    : post;
            });
            return { ...prev, posts: newPosts };
        });
    };

    return (
        <>
            <CardContainer
                posts={posts}
                onLike={onLike}
                onSave={onSave}
                onComment={updateCommentCount}
                emptyMessage="У пользователя нет медиа."
                emptyHint="Здесь появятся посты с изображениями."
            />
            {next && (
                <div className="mt-4 flex flex-col items-center w-full">
                    <Button variant="outline" onClick={retrieveNextPosts}>
                        Показать еще
                    </Button>
                </div>
            )}
        </>
    );
};

export default Media;
