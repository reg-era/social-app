import Link from "next/link";
import { HomeIcon, UsersIcon, GlobeIcon } from '@/utils/icons'; // Importing the icons
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth_context";

const Sidebar = ({ ishome }) => {

    return (
        <div className="sidebar left-sidebar">
            <div className="sidebar-menu">
                <Link href="/" className={ishome ? 'menu-item active' : 'menu-item'} >
                    <HomeIcon />
                    <span>Home</span>
                </Link>
                <Link href="/profile" className="menu-item">
                    <UsersIcon />
                    <span>Profile</span>
                </Link>
                <Link href="/group" className={ishome ? 'menu-item' : 'menu-item active'}>
                    <GlobeIcon />
                    <span>Groups</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
