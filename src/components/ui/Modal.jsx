import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        // Backdrop
        <div 
            onClick={onClose} 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
        >
            {/* Modal Content */}
            <div 
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-2xl font-bold"
                    >
                        &times;
                    </button>
                </div>
                {/* Body */}
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;