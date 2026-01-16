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
            setData({ next: response.data.next, posts: response.data.results });
        };
        getPosts("user", success, () => alert("Couldn't load content"));
        return () => setData({ next: null, posts: [] });
    }, [getPosts, setData]);

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
        <div ref={container} className="flex flex-col items-center w-full">
            <CardContainer />
            {getNextUrl() && (
                <Button variant="outline" className="mt-6" onClick={retrieveNextPost}>
                    Показать еще
                </Button>
            )}
        </div>
    );
};

export default ProfilePostContainer;
