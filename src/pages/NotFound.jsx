import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="text-center mt-20">
            <h1 className="text-6xl font-bold text-blue-500">404</h1>
            <p className="text-2xl mt-4">Page Not Found</p>
            <p className="mt-2 text-gray-500">Sorry, the page you are looking for does not exist.</p>
            <Link to="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFound;