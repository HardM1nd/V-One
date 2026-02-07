import React, { useContext, createContext } from "react";
import useUserContext from "./UserContext";

export const postActionContext = createContext();

export const PostActionContextProvider = ({ children }) => {
    const { axiosInstance } = useUserContext();

    const createPost = async (formData, onSuccess, onFailure = console.error) => {
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
    };

    const getPosts = async (filter = null, onSuccess, onFailure = console.error) => {
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
    };

    const likePost = async (id, onSuccess, onFailure = console.error) => {
        const response = await axiosInstance.post(`post/${id}/like/`);
        if (response.status >= 200 && response.status < 400) {
            onSuccess(response);
        } else {
            onFailure(response);
        }
    };

    const savePost = async (id, onSuccess, onFailure = console.error) => {
        const response = await axiosInstance.post(`post/${id}/save/`);
        if (response.status >= 200 && response.status < 400) {
            onSuccess(response);
        } else {
            onFailure(response);
        }
    };

    const getComments = async (id, onSuccess, onFailure = console.log) => {
        const response = await axiosInstance.get(`post/${id}/comments/`);
        if (response.status >= 200 && response.status < 400) {
            onSuccess(response);
        } else {
            onFailure(response);
        }
    };

    const createComment = async (id, formData, onSuccess, onFailure = console.error) => {
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
    };

    const contextValue = {
        createPost,
        getComments,
        getPosts,
        _likePost: likePost,
        _savePost: savePost,
        _createComment: createComment,
    };

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






