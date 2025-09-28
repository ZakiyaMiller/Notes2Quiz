import React, { useContext, useState, useEffect } from "react";
import { onAuthChange } from "./authService";
import { syncUser } from "../api/apiClient";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        // User is signed in
        try {
          const token = await user.getIdToken();
          // Sync the user with the backend to get/create their profile
          const backendUser = await syncUser(token);
          console.log("Backend user profile:", backendUser);
          // We store the Firebase user object, which contains uid, email, etc.
          setCurrentUser(user);
        } catch (error) {
          console.error("Failed to sync user with backend.", error);
          // If sync fails, we'll still set the user for frontend-only tasks
          // but you might want to handle this more gracefully, e.g., by signing them out.
          setCurrentUser(user);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading, // Expose loading state
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}