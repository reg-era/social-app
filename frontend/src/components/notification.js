import { useEffect, useState } from "react";

const Notif = () => {
    const [notifications,setNotif] = useState([])

    const getNotification = async() =>{
        const res = await fetch(`http://127.0.0.1:8080/api/notif`, {
            headers: {
                'Authorization': document.cookie.slice('auth_session='.length),
            },
        });
        if (res.ok) {
            const data = await res.json();
            console.log(data)
            setNotif(() => data)
        } else {
            console.error('Failed to fetch posts');
        }
    }

    useEffect(()=>{
        getNotification()
    },[])

    return (
        <div className="notification-dropdown">
            <div className="notification-header">
                <p>Notifications</p>
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <p>No new notifications</p>
                ) : (
                    notifications.map((notif, index) => (
                        <div className="notification" key={index}>
                            <p>{notif.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notif;
