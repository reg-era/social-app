import Link from "next/link";
import { HomeIcon, UsersIcon, GlobeIcon } from '@/utils/icons'; // Importing the icons
import { useState,useEffect } from "react";

const Sidebar = () => {
    const [groups, setGroups] = useState([]);

    // Fetch groups on mount
    const fetchGroups = async () => {
        try {
            const response = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/all`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                method: "GET"
            });
            const data = await response.json();
            const acceptedGroups = Array.isArray(data) 
                ? data.filter(group => group.status === 'accepted')
                : [];
            setGroups(acceptedGroups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setGroups([]);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <div className="sidebar left-sidebar">
            <div className="sidebar-menu">
                <Link href="/" className="menu-item active">
                    <HomeIcon />
                    <span>Home</span>
                </Link>
                <Link href="/profile" className="menu-item">
                    <UsersIcon />
                    <span>Profile</span>
                </Link>
                <Link href="/group" className="menu-item">
                    <GlobeIcon />
                    <span>Groups</span>
                </Link>
            </div>
            <div className="sidebar-section">
                <h3>Your Groups</h3>
                {groups.slice(0, 3).map((group) => (
                    <Link href={`/group/${group.id}`} key={group.id} className="sidebar-item">
                        <div className="sidebar-icon group-icon"></div>
                        <span>{group.title}</span>
                    </Link>
                ))}
                <Link href="/group" className="sidebar-item view-more">
                    <span>See All Groups</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
