import React, { useEffect, useState, useCallback } from 'react';
import useApiWithDelay from '../hooks/useApiWithDelay';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import HoverCard from '../components/ui/HoverCard';
import { useAuth } from '../contexts/AuthContext';

const AllJobs = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const { loading, error, execute } = useApiWithDelay();
    const [actionLoading, setActionLoading] = useState(null);

    const fetchData = useCallback(async () => {
        const [jobsResponse, appsResponse] = await execute(() => Promise.all([
            api.get('/jobs/'),
            user?.user_type === 'applicant' ? api.get('/applications/') : Promise.resolve({ data: [] })
        ]));
        setJobs(jobsResponse.data);
        setMyApplications(appsResponse.data);
    }, [execute, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApply = async (jobId) => {
        setActionLoading(jobId);
        try {
            const response = await api.post('/applications/', { job: jobId });
            setMyApplications(prev => [...prev, response.data]);
        } catch (err) {
            console.error('Failed to apply', err);
            alert(err.response?.data?.detail || 'You have already applied for this job.');
        } finally {
            setActionLoading(null);
        }
    };

    const appliedJobIds = new Set(myApplications.map(app => app.job));

    if (loading) return <div className="flex justify-center mt-10"><LoadingSpinner /></div>;

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">All Job Postings</h1>
            {error && <p className="text-red-500 bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-4">Could not load jobs: {error}</p>}
            
            <div className="space-y-6">
                {jobs.length > 0 ? jobs.map(job => (
                    <HoverCard key={job.id}>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                            {/* Job Details Section */}
                            <div className="flex-grow">
                                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{job.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-2">{job.location}</p>
                                <p>{job.description}</p>
                                <p className="text-sm text-gray-400 mt-4">Posted on: {new Date(job.created_at).toLocaleDateString()}</p>
                            </div>
                            
                            {/* Apply Button Section */}
                            {user?.user_type === 'applicant' && (
                                 <div className="flex-shrink-0">
                                    <button
                                        onClick={() => handleApply(job.id)}
                                        disabled={appliedJobIds.has(job.id) || actionLoading === job.id}
                                        className="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                                    >
                                        {actionLoading === job.id ? 'Applying...' : appliedJobIds.has(job.id) ? 'Applied' : 'Apply Now'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </HoverCard>
                )) : <p>No open positions at the moment.</p>}
            </div>
        </div>
    );
};

export default AllJobs;