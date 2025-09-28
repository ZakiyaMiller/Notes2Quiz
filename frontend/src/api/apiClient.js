import axios from "axios";

// Create an Axios instance with the base URL of your backend
const apiClient = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

/**
 * Synchronizes the Firebase user with the backend database.
 * After a user logs in, this function sends their ID token to the backend.
 * The backend will then either find the user in its database or create a new entry.
 *
 * @param {string} token - The Firebase ID token of the authenticated user.
 * @returns {Promise<object>} The user data from the backend database.
 */
export const syncUser = async (token) => {
    try {
        const response = await apiClient.post(
            "/users/me",
            {}, // The body is empty as the user info is derived from the token
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error syncing user with backend:", error.response?.data || error.message);
        throw error;
    }
};

export default apiClient;