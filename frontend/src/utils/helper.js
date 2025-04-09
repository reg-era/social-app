export const handleLogout = async (e) => {
    try {
        const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/logout`, {
            headers: {
                'Authorization': document.cookie.slice('auth_session='.length),
            },
        });
        if (res.ok) {
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