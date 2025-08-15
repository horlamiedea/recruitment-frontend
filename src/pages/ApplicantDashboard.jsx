import React, { useEffect, useState, useCallback } from 'react';
import useApiWithDelay from '../hooks/useApiWithDelay';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import HoverCard from '../components/ui/HoverCard';

const ApplicantDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const { loading, error, execute } = useApiWithDelay();
    const [actionLoading, setActionLoading] = useState(null);

    const fetchData = useCallback(async () => {
        // execute() now correctly returns the array of response objects
        const [jobsResponse, appsResponse] = await execute(() => Promise.all([
            api.get('/jobs/'),
            api.get('/applications/')
        ]));
        
        // We can now safely access the .data property
        setJobs(jobsResponse.data);
        setMyApplications(appsResponse.data);

    }, [execute]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApply = async (jobId) => {
        setActionLoading(jobId);
        try {
            const response = await api.post('/applications/', { job: jobId });
            setMyApplications(prevApplications => [...prevApplications, response.data]);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                alert('You have already applied for this job.');
            } else {
                alert('An error occurred while submitting your application.');
            }
        } finally {
            setActionLoading(null);
        }
    };
    
    const appliedJobIds = new Set(myApplications.map(app => app.job));

    if (loading) return <div className="flex justify-center mt-10"><LoadingSpinner /></div>;

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">Applicant Dashboard</h1>
            {error && <p className="text-red-500 bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-4">Could not load data: {error}</p>}
            
            <section>
                <h2 className="text-2xl font-semibold mb-6">My Applications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {myApplications.length > 0 ? myApplications.map(app => (
                         <HoverCard key={app.id}>
                            <h3 className="text-xl font-bold mb-2">Application for Job #{app.job}</h3>
                             <p className="capitalize mb-4">
                                <span className="font-semibold">Status:</span> 
                                <span className={`ml-2 px-2 py-1 text-sm rounded-full ${
                                    app.status === 'submitted' ? 'bg-yellow-200 text-yellow-800' :
                                    app.status === 'rejected' ? 'bg-red-200 text-red-800' :
                                    app.status.includes('interview') ? 'bg-blue-200 text-blue-800' :
                                    'bg-gray-200 text-gray-800'
                                }`}>{app.status.replace(/_/g, ' ')}</span>
                            </p>
                            <p className="text-sm text-gray-500">Applied on: {new Date(app.applied_at).toLocaleDateString()}</p>
                         </HoverCard>
                    )) : <p>You haven't applied to any jobs yet.</p>}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-6">Available Jobs</h2>
                <div className="space-y-6">
                    {jobs.length > 0 ? jobs.map(job => (
                        <HoverCard key={job.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{job.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-2">{job.location}</p>
                                <p>{job.description}</p>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
                                <button
                                    onClick={() => handleApply(job.id)}
                                    disabled={appliedJobIds.has(job.id) || actionLoading === job.id}
                                    className="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {actionLoading === job.id ? 'Applying...' : appliedJobIds.has(job.id) ? 'Applied' : 'Apply Now'}
                                </button>
                            </div>
                        </HoverCard>
                    )) : <p>No open positions at the moment.</p>}
                </div>
            </section>
        </div>
    );
};

export default ApplicantDashboard;