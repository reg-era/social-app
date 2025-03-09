import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import Link from "next/link";

const BackHome = () => {
    return (
        <Link href="/" className="back-to-home">
            <FontAwesomeIcon icon={faHome} />
            <span>Back to Home</span>
        </Link>
    )
}

export default BackHome;