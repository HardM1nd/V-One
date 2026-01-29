import React, { useEffect, useRef } from "react";
import usePageContext from "../../contexts/pageContext";
import usePostActionContext from "../../contexts/PostActionContext";
import CardContainer from "../global/CardContainer";
import { Button } from "../ui/button";

const MediaPostContainer = () => {
    const { setData, getNextItems, getNextUrl, data } = usePageContext();
    const { getPosts } = usePostActionContext();
    const container = useRef();
    useEffect(() => {
        console.log('MediaPostContainer: useEffect triggered');
        const success = (response) => {
            console.log('MediaPostContainer: API response:', response.data);
            // Фильтруем посты, которые действительно имеют изображения
            const mediaPosts = (response.data.results || []).filter(post => {
                const hasImage = post.image && post.image.trim() !== '';
                if (!hasImage) {
                    console.log('MediaPostContainer: Filtered out post without image:', post.id);
                }
                return hasImage;
            });
            console.log('MediaPostContainer: loaded', mediaPosts.length, 'media posts from', response.data.results?.length || 0, 'total');
            setData({ next: response.data.next, posts: mediaPosts });
        };
        const failure = (error) => {
            console.error('MediaPostContainer: Error loading media:', error);
            alert("Не удалось загрузить медиа");
        };
        getPosts("media", success, failure);
        return () => {
            console.log('MediaPostContainer: Cleanup - clearing posts');
            setData({ next: null, posts: [] });
        };
    }, [getPosts, setData]);

    const retrieveNextPost = () => {
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
        const nextUrl = getNextUrl();
        if (!nextUrl) return;
        getNextItems(nextUrl, success);
    };
    
    console.log('MediaPostContainer: Rendering with', data.posts?.length || 0, 'posts from pageContext');
    
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
