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
            console.log('notific', data)
            setNotif(() => data)
        } else {
            console.error('Failed to fetch posts');
        }
    }

    useEffect(() => {
        getNotification()
    }, [])

    const sendResponse = async (decision, actioner, notifID, notifType) => {
        try {
            let endpoint = '';
            let formData = new FormData();

            if (notifType === 'group_invite') {
                // Handle group invitations
                endpoint = `http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/invitation`;
                formData.append('group_id', actioner);
                console.log('groupppp id', actioner)
                formData.append('action', `${decision}`);
            } else {
                // Handle follow requests
                endpoint = `http://${process.env.NEXT_PUBLIC_GOSERVER}/api/follow`;
                const body = JSON.stringify({
                    noteId: notifID,
                    actioner: actioner,
                    action: decision
                });
                return await fetch(endpoint, {
                    method: 'PUT',
                    body: body,
                    headers: {
                        'Authorization': document.cookie.slice('auth_session='.length),
                        'Content-Type': 'application/json',
                    },
                });
            }

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process request');
            }

            setNotif((allNote) => allNote.filter(notif => notif.Id !== notifID));
            
            getNotification();
            
        } catch (err) {
            console.error('Failed to make decision: ', err);
            alert(err.message || 'Failed to process request');
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
                            {notif.type !== 'event_created' && (
                                <div className="user-action">
                                    {notif.type === 'group_invite' ? (
                                        <>
                                            <button onClick={() => sendResponse('accept', notif.group_id, notif.Id, notif.type)}>
                                                Accept
                                            </button>
                                            <button onClick={() => sendResponse('reject', notif.group_id, notif.Id, notif.type)}>
                                                Decline
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => sendResponse('accept', notif.sender, notif.Id, notif.type)}>
                                                Yes
                                            </button>
                                            <button onClick={() => sendResponse('decline', notif.sender, notif.Id, notif.type)}>
                                                No
                                            </button>
                                        </>
                                    )}
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