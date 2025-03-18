import Link from "next/link";
import { HomeIcon } from "@/utils/icons"; 

const BackHome = () => {
    return (
        <Link href="/" className="back-to-home">
            <HomeIcon />
            <span>Back to Home</span>
        </Link>
    );
};

export default BackHome;
