import { useState, useEffect } from "react";

const useAuthToken = () => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);

    const clearToken = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return { token, setToken, clearToken };
};

export default useAuthToken;