const Notif = ({ notifications }) => {
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
                            <p>{notif}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notif;
