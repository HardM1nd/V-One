import React, { useState, useEffect } from "react";
import usePageContext from "../../contexts/pageContext";
import useUserContext from "../../contexts/UserContext";
import PostCommentCard from "./PostCommentCard";
import { Button } from "../ui/button";

const PostComments = () => {
    const [{ next, comments }, setCommentsData] = useState({
        next: null,
        comments: [],
    });
    const { getNextItems } = usePageContext();
    const { axiosInstance } = useUserContext();
    useEffect(() => {
        axiosInstance
            .get("/post/comments/all/")
            .then((response) => {
                const raw = response.data?.results;
                setCommentsData({
                    next: response.data?.next ?? null,
                    comments: Array.isArray(raw) ? raw : [],
                });
            })
            .catch(() => {
                setCommentsData({ next: null, comments: [] });
            });
    }, [axiosInstance]);

    const retrieveNextComments = () => {
        const success = (response) => {
            const page = Array.isArray(response.data?.results) ? response.data.results : [];
            setCommentsData((prev) => {
                const existing = Array.isArray(prev.comments) ? prev.comments : [];
                return {
                    next: response.data?.next ?? null,
                    comments: [...existing, ...page],
                };
            });
        };
        if (!next) return;
        getNextItems(next, success);
    };
    return (
        <div className="w-full ">
            {(Array.isArray(comments) ? comments : []).map((comment) => {
                return <PostCommentCard {...comment} key={comment.id}></PostCommentCard>;
            })}
            {next && (
                <div className="mt-4 flex flex-col items-center w-full">
                    <Button variant="outline" onClick={retrieveNextComments}>
                        Показать еще
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PostComments;
