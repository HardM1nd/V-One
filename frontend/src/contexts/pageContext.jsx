import { useState, useContext, createContext, useCallback, useMemo } from "react";
import usePostActionContext from "./PostActionContext";
import useUserContext from "./UserContext";

export const pageContext = createContext();

export const PageContextProvider = ({ children }) => {
    const { axiosInstance } = useUserContext();
    const [data, setData] = useState({
        next: null,
        posts: [],
    });
    const { _likePost, _savePost, _createComment } = usePostActionContext();

    const likePost = useCallback(
        (id, success) => {
            const _success = (response) => {
                setData((prev) => {
                    const posts = Array.isArray(prev.posts) ? prev.posts : [];
                    const update = response.data;
                    const newPost = posts.map((post) => (post.id === update.id ? update : post));
                    return { ...prev, posts: newPost };
                });
            };
            _likePost(id, success ? success : _success);
        },
        [_likePost, setData]
    );

    const savePost = useCallback(
        (id, success) => {
            const _success = (response) => {
                setData((prev) => {
                    const posts = Array.isArray(prev.posts) ? prev.posts : [];
                    const update = response.data;
                    const newPost = posts.map((post) => (post.id === update.id ? update : post));
                    return { ...prev, posts: newPost };
                });
            };
            _savePost(id, success ? success : _success);
        },
        [_savePost, setData]
    );

    const createComment = useCallback(
        async (id, formData, onSuccess, onFailure) => {
            const success = (response) => {
                onSuccess(response);
                setData((prev) => {
                    const posts = Array.isArray(prev.posts) ? prev.posts : [];
                    const newPosts = posts.map((post) => {
                        return post.id === id
                            ? { ...post, comments: post.comments + 1, is_commented: true }
                            : post;
                    });
                    return { ...prev, posts: newPosts };
                });
            };
            _createComment(id, formData, success, onFailure);
        },
        [_createComment, setData]
    );

    const getNextItems = useCallback(
        async (next, onSuccess, onFailure = console.log) => {
            const response = await axiosInstance.get(`${next}`);
            if (response.status >= 200 && response.status < 400) {
                onSuccess(response);
            } else onFailure(response);
        },
        [axiosInstance]
    );

    const followUser = useCallback(
        (id, success, onFailure) => {
            axiosInstance
                .post(`/accounts/follow_unfollow/${id}/`)
                .then((response) => {
                    success(response);
                })
                .catch((e) => onFailure(e));
        },
        [axiosInstance]
    );

    const deletePost = useCallback(
        (id, onSuccess, onFailure) => {
            axiosInstance
                .delete(`/post/delete/${id}/`)
                .then((response) => {
                    setData((prev) => {
                        const newPosts = prev.posts.filter((post) => post.id !== id);
                        return { ...prev, posts: newPosts };
                    });
                    onSuccess(response);
                })
                .catch((e) => onFailure(e));
        },
        [axiosInstance]
    );

    const getCardInfoFromData = useCallback(
        (id) => data.posts.filter((post) => post.id === id),
        [data.posts]
    );

    const updatePost = useCallback(
        (id, formData, onSuccess, onFailure) => {
            axiosInstance
                .patch(`/post/update/${id}/`, formData)
                .then((response) => {
                    const updatedData = response.data;
                    setData((prev) => {
                        const posts = Array.isArray(prev.posts) ? prev.posts : [];
                        const newPosts = posts.map((post) => (post.id === id ? updatedData : post));
                        return { ...prev, posts: newPosts };
                    });
                    onSuccess(response);
                })
                .catch((e) => onFailure(e));
        },
        [axiosInstance, setData]
    );
    const context = useMemo(
        () => ({
            data,
            setData,
            likePost,
            savePost,
            deletePost,
            updatePost,
            getCardInfoFromData,
            createComment,
            getNextItems,
            getNextUrl: () => data.next,
            followUser,
            maxFileSizeKb: 51200,
        }),
        [
            data,
            setData,
            likePost,
            savePost,
            deletePost,
            updatePost,
            getCardInfoFromData,
            createComment,
            getNextItems,
            followUser,
        ]
    );

    return <pageContext.Provider value={context}>{children}</pageContext.Provider>;
};

const usePageContext = () => {
    return useContext(pageContext);
};

export default usePageContext;
