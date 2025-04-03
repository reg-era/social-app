import { useEffect, useState } from "react";

const Notif = () => {
    const [notifications, setNotif] = useState([])

    const getNotification = async () => {
        const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/notif`, {
            headers: {
                'Authorization': document.cookie.slice('auth_session='.length),
            },
        });
        if (res.ok) {
            const data = await res.json();
            setNotif(() => data)
        } else {
            console.error('Failed to fetch posts');
        }
    }

    useEffect(() => {
        getNotification()
    }, [])

    const sendResponse = async (desision, actioner, notifID) => {
        try {
            const res = await fetch(`http://localhost:8080/api/follow`, {
                method: 'PUT',
                body: JSON.stringify({
                    noteId: notifID,
                    actioner: actioner,
                    action: desision
                }),
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
            });

            if (res.ok) {
                setNotif((allNote) => allNote.filter(notif => notif.Id !== notifID));
            }
        } catch (err) {
            console.error('Failed to make desision: ', err);
        }
    }

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
                            <div className="user-action">
                                <button onClick={(e) => sendResponse('accept', notif.sender, notif.Id)}>yes</button>
                                <button onClick={(e) => sendResponse('decline', notif.sender, notif.Id)}>no</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notif;
