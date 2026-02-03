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
        axiosInstance.get("/post/comments/all/").then((response) => {
            setCommentsData({
                next: response.data.next,
                comments: response.data.results,
            });
        });
    }, [axiosInstance]);

    const retrieveNextComments = () => {
        const success = (response) => {
            setCommentsData((prev) => {
                return {
                    next: response.data.next,
                    comments: [...prev.comments, ...response.data.results],
                };
            });
        };
        if (!next) return;
        getNextItems(next, success);
    };
    return (
        <div className="w-full ">
            {comments.map((comment) => {
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
