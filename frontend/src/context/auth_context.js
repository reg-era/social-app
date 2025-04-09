import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAuthToken = async () => {
        try {
            const match = document.cookie.match(new RegExp(`(?:^|;\\s*)auth_session=([^;]+)`));
            const token_cookie = match ? match[1] : null;
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/check`, {
                method: 'POST',
                headers: {
                    'Authorization': token_cookie,
                },
            });
            if (res.ok) {
                console.log('session token is set: ', token_cookie)
                setToken(token_cookie);
            }
        } catch (error) {
            console.error("Error fetching the token:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthToken();
    }, []);

    return (
        <AuthContext.Provider value={{ token, loading }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};