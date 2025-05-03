import { useAuth } from "@/context/auth_context";
import { useEffect, useState } from "react";

const Notif = () => {
    const { token, loading } = useAuth();

    const [notifications, setNotif] = useState([])

    const getNotification = async () => {
        const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/notif`, {
            headers: {
                'Authorization': token,
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
        !loading && getNotification()
    }, [loading])

    const sendResponse = async (decision, actioner, notifID, notifType) => {
        try {
            let endpoint, body;

            if (notifType === 'group_invite' || notifType === 'group_request') {
                endpoint = `http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/invitation`;
                body = new FormData();
                body.append('group_id', actioner);
                body.append('action', decision);
                if (notifType === 'group_request') {
                    const requestingUser = notifications.find(n => n.Id === notifID)?.sender;
                    body.append('user_id', requestingUser);
                }
            } else {
                endpoint = `http://${process.env.NEXT_PUBLIC_GOSERVER}/api/follow`;
                body = JSON.stringify({
                    noteId: notifID,
                    actioner: actioner,
                    action: decision
                });
            }

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                },
                body: body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process request');
            }

            await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/consumed`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notification_id: notifID
                })
            });
            console.log('Notification consumed successfully id :', notifID);
            setNotif((allNote) => allNote.filter(notif => notif.Id !== notifID));
            getNotification();
        } catch (err) {
            console.error('Failed to make decision: ', err);
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
                            {(notif.type === 'group_invite' || notif.type === 'group_request') && (
                                <div className="user-action">
                                    <button onClick={() => sendResponse('accept', notif.group_id, notif.Id, notif.type)}>
                                        Accept
                                    </button>
                                    <button onClick={() => sendResponse('reject', notif.group_id, notif.Id, notif.type)}>
                                        Decline
                                    </button>
                                </div>
                            )}
                            {(notif.type === 'follow_request') && (
                                <div className="follow-action">
                                    <button onClick={() => sendResponse('accept', notif.sender, notif.Id, notif.type)}>
                                        Yes
                                    </button>
                                    <button onClick={() => sendResponse('decline', notif.sender, notif.Id, notif.type)}>
                                        No
                                    </button>
                                </div>
                            )}


                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notif;