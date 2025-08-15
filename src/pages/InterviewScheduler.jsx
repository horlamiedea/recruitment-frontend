import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import useApiWithDelay from '../hooks/useApiWithDelay';
import LoadingSpinner from '../components/LoadingSpinner';
import HoverCard from '../components/ui/HoverCard';

const InterviewScheduler = () => {
    const { token } = useParams();
    const [scheduledTime, setScheduledTime] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { loading, execute } = useApiWithDelay();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await execute(() => api.post(`/interview/schedule/${token}/`, {
                scheduled_time: new Date(scheduledTime).toISOString(),
            }));
            setMessage(response.message || 'Interview scheduled successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to schedule interview. The slot may be taken or the link may be invalid.');
        }
    };

    return (
        <div className="flex justify-center items-center mt-10 sm:mt-20">
            <HoverCard className="w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6">Schedule Your Interview</h2>
                {loading && <LoadingSpinner />}

                {!loading && message && (
                    <div className="text-center">
                        <p className="text-green-500 text-xl font-semibold bg-green-100 dark:bg-green-900 p-4 rounded-lg">{message}</p>
                        <p className="mt-4">We will be in touch with further details. You can now close this page.</p>
                    </div>
                )}
                
                {!loading && !message && (
                    <form onSubmit={handleSubmit}>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        <div className="mb-4">
                            <label className="block mb-2 font-semibold">Choose a Date and Time</label>
                            <input 
                                type="datetime-local" 
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-2">Please note: Interviews can only be scheduled on the hour or half-hour (e.g., 10:00, 10:30).</p>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-bold transition-colors">Confirm Time</button>
                    </form>
                )}
            </HoverCard>
        </div>
    );
};

export default InterviewScheduler;