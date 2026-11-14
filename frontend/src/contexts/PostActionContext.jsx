import React, { useContext, createContext, useCallback, useMemo } from "react";
import useUserContext from "./UserContext";

export const postActionContext = createContext();

export const PostActionContextProvider = ({ children }) => {
    const { axiosInstance } = useUserContext();

    const createPost = useCallback(
        async (formData, onSuccess, onFailure = console.error) => {
            try {
                const response = await axiosInstance.post("post/create/", formData);
                if (response.status >= 200 && response.status < 400) {
                    onSuccess(response);
                } else {
                    onFailure(response);
                }
            } catch (error) {
                onFailure(error);
            }
        },
        [axiosInstance]
    );

    const getPosts = useCallback(
        async (filter = null, onSuccess, onFailure = console.error) => {
            try {
                const response = await axiosInstance.get(`post/all/?filter=${filter}`);
                if (response.status >= 200 && response.status < 400) {
                    onSuccess(response);
                } else {
                    onFailure(response);
                }
            } catch (error) {
                onFailure(error);
            }
        },
        [axiosInstance]
    );

    const likePost = useCallback(
        async (id, onSuccess, onFailure = console.error) => {
            const response = await axiosInstance.post(`post/${id}/like/`);
            if (response.status >= 200 && response.status < 400) {
                onSuccess(response);
            } else {
                onFailure(response);
            }
        },
        [axiosInstance]
    );

    const savePost = useCallback(
        async (id, onSuccess, onFailure = console.error) => {
            const response = await axiosInstance.post(`post/${id}/save/`);
            if (response.status >= 200 && response.status < 400) {
                onSuccess(response);
            } else {
                onFailure(response);
            }
        },
        [axiosInstance]
    );

    const getComments = useCallback(
        async (id, onSuccess, onFailure = console.log) => {
            const response = await axiosInstance.get(`post/${id}/comments/`);
            if (response.status >= 200 && response.status < 400) {
                onSuccess(response);
            } else {
                onFailure(response);
            }
        },
        [axiosInstance]
    );

    const createComment = useCallback(
        async (id, formData, onSuccess, onFailure = console.error) => {
            try {
                const response = await axiosInstance.post(
                    `post/${id}/comments/create/`,
                    formData
                );
                if (response.status >= 200 && response.status < 400) {
                    onSuccess(response);
                } else {
                    onFailure(response);
                }
            } catch (error) {
                onFailure(error);
            }
        },
        [axiosInstance]
    );

    const contextValue = useMemo(
        () => ({
            createPost,
            getComments,
            getPosts,
            _likePost: likePost,
            _savePost: savePost,
            _createComment: createComment,
        }),
        [createComment, createPost, getComments, getPosts, likePost, savePost]
    );

    return (
        <postActionContext.Provider value={contextValue}>
            {children}
        </postActionContext.Provider>
    );
};

const usePostActionContext = () => {
    return useContext(postActionContext);
};

export default usePostActionContext;






