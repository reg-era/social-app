'use client';
import './error.css';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Error404Page = () => {
  const router = useRouter();

  return (
    <div className="error-page-container">
      <div className="error-content">
        <div className="error-icon">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
        <h1 className="error-title">404</h1>
        <h2 className="error-subtitle">Page Not Found</h2>
        <p className="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="error-actions">
          <button onClick={() => router.push('/')} className="error-btn primary-btn">
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error404Page;