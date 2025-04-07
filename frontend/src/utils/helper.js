export const getDownloadImage = async (link) => {
    try {
        if (!link || link === '') {
            return null
        }
        const newLink = `http://${process.env.NEXT_PUBLIC_GOSERVER}/${link}`
        console.log('downloading: ', newLink);
        const res = await fetch(newLink, {
            headers: {
                'Authorization': document.cookie.slice('auth_session='.length),
            },
        });
        if (res.ok) {
            const image = await res.blob();
            const newUrl = URL.createObjectURL(image);
            return newUrl
        } else {
            return null
        }
    } catch (err) {
        console.error("fetching image: ", err);
        return null
    }
};