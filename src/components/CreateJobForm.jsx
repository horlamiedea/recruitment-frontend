import React, { useState } from 'react';
import api from '../api/axiosConfig';

const CreateJobForm = ({ onClose, onJobCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/jobs/', formData);
            onJobCreated(response.data); // Pass the new job back to the dashboard
            onClose(); // Close the modal
        } catch (err) {
            setError('Failed to create job. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4">
                <label className="block mb-2 font-semibold">Job Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" required />
            </div>
            <div className="mb-4">
                <label className="block mb-2 font-semibold">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" required />
            </div>
            <div className="mb-6">
                <label className="block mb-2 font-semibold">Job Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" required />
            </div>
            <div className="flex justify-end gap-4">
                 <button type="button" onClick={onClose} className="px-6 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">Cancel</button>
                 <button type="submit" disabled={loading} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 font-semibold">
                    {loading ? 'Creating...' : 'Create Job'}
                </button>
            </div>
        </form>
    );
};

export default CreateJobForm;