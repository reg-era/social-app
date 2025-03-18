import Link from "next/link";
import { HomeIcon, UsersIcon, GlobeIcon } from '@/utils/icons'; // Importing the icons

const Sidebar = () => {
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
                <div className="sidebar-item">
                    <div className="sidebar-icon group-icon"></div>
                    <span>Web Development</span>
                </div>
                <div className="sidebar-item">
                    <div className="sidebar-icon group-icon"></div>
                    <span>UI/UX Design</span>
                </div>
                <div className="sidebar-item">
                    <div className="sidebar-icon group-icon"></div>
                    <span>Photography Club</span>
                </div>
                <div className="sidebar-item view-more">
                    <span>See All Groups</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
