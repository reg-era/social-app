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