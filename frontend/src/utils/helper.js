import { useAuth } from "@/context/auth_context";
import Link from "next/link";

export const handleLogout = async (e) => {
    const { token, loading } = useAuth();

    try {
        const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/logout`, {
            headers: {
                'Authorization': token,
            },
        });
        if (res.ok) {
            console.log("logout");

            document.cookie = "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            connected && websocket.close()
            router.push('/login')
        }
    } catch (err) {
        console.error("Error: ", err);
    }
}

export const getDownloadImage = async (link, token) => {
    try {
        if (!link || link === '') {
            return '/default_profile.jpg'
        }
        const newLink = `http://${process.env.NEXT_PUBLIC_GOSERVER}/${link}`
        console.log('downloading: ', newLink);
        const res = await fetch(newLink, {
            headers: {
                'Authorization': token,
            },
        });
        if (res.ok) {
            const image = await res.blob();
            const newUrl = URL.createObjectURL(image);
            return newUrl
        } else {
            return '/default_profile.jpg'
        }
    } catch (err) {
        console.error("fetching image: ", err);
        return '/default_profile.jpg'
    }
};

export function timeAgo(date, now = new Date()) {
    const diffInSeconds = Math.floor((new Date(date) - now) / 1000);
    const isFuture = diffInSeconds > 0;
    const seconds = Math.abs(diffInSeconds);

    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count > 0) {
            const label = `${count} ${interval.label}${count !== 1 ? 's' : ''}`;
            return isFuture ? `in ${label}` : `${label} ago`;
        }
    }

    return "just now";
}
