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
        if (!userId) {
            console.log('Media: No userId, skipping fetch');
            return;
        }
        
        console.log('Media: Fetching posts for userId:', userId);
        axiosInstance
            .get(`/post/user/${userId}/all/?filter=media`)
            .then((response) => {
                console.log('Media: Full API response:', response.data);
                const { next, results } = response.data;
                console.log('Media: Raw results:', results);
                
                // Фильтруем посты, которые действительно имеют изображения
                const mediaPosts = (results || []).filter(post => {
                    const hasImage = post.image && post.image.trim() !== '';
                    if (!hasImage) {
                        console.log('Media: Filtered out post without image:', post.id, post.image);
                    }
                    return hasImage;
                });
                
                console.log('Media: Filtered media posts:', mediaPosts.length, 'from', results?.length || 0, 'total posts');
                console.log('Media: Posts data:', mediaPosts);
                setData({ next: next, posts: mediaPosts });
            })
            .catch((error) => {
                console.error('Media: Error loading media posts:', error);
                console.error('Media: Error details:', error.response?.data || error.message);
                alert("Не удалось загрузить посты. Проверьте соединение.");
                setData({ next: null, posts: [] });
            });
    }, [axiosInstance, userId]);

    const retrieveNextPosts = () => {
        const success = (response) => {
            // Фильтруем новые посты с изображениями
            const newMediaPosts = (response.data.results || []).filter(post => 
                post.image && post.image.trim() !== ''
            );
            setData((prev) => {
                return {
                    next: response.data.next,
                    posts: [...prev.posts, ...newMediaPosts],
                };
            });
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
    console.log('Media: Rendering with', posts?.length || 0, 'posts');
    
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
                <div className="flex flex-col items-center w-full">
                    <Button variant="outline" onClick={retrieveNextPosts}>
                        Показать еще
                    </Button>
                </div>
            )}
        </>
    );
};

export default Media;
