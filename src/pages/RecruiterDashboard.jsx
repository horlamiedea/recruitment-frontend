import React, { useEffect, useState, useCallback } from 'react';
import useApiWithDelay from '../hooks/useApiWithDelay';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import HoverCard from '../components/ui/HoverCard';
import Modal from '../components/ui/Modal';
import CreateJobForm from '../components/CreateJobForm';

const RecruiterDashboard = () => {
    const [applications, setApplications] = useState([]);
    const { loading, error, execute } = useApiWithDelay();
    const [actionLoading, setActionLoading] = useState(null);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchApplications = useCallback(async () => {
        const response = await execute(() => api.get('/applications/'));
        setApplications(response.data);
    }, [execute]);
    
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // ... (the rest of the functions: handleAction, handleJobCreated, handleCardClick, etc. are correct and can remain the same)

    const handleAction = async (appId, action) => {
        setActionLoading(appId);
        try {
            await api.post(`/applications/${appId}/advance/`, { action });
            const data = await api.get('/applications/');
            setApplications(data.data);
            if (selectedApplication && selectedApplication.id === appId) {
                closeDetailsModal();
            }
        } catch (err) {
            console.error(`Failed to ${action} application`, err);
            alert(`Error: Could not ${action} the application.`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleJobCreated = (newJob) => {
        console.log('New job created:', newJob);
        alert(`Successfully created job: "${newJob.title}"`);
    };

    const handleCardClick = async (appId) => {
        setDetailsLoading(true);
        setIsDetailsModalOpen(true);
        try {
            const response = await api.get(`/applications/${appId}/`);
            setSelectedApplication(response.data);
        } catch (err) {
            setIsDetailsModalOpen(false);
            alert('Could not load application details.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedApplication(null);
    };

    if (loading) return <div className="flex justify-center mt-10"><LoadingSpinner /></div>;
  
    return (
        <div>
            {/* --- Create Job Modal --- */}
            <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title="Create a New Job">
                <CreateJobForm 
                    onClose={() => setIsJobModalOpen(false)} 
                    onJobCreated={handleJobCreated} 
                />
            </Modal>

            {/* --- Application Details Modal --- */}
            <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} title={`Application #${selectedApplication?.id}`}>
                {detailsLoading ? <LoadingSpinner /> : selectedApplication && (
                    <div>
                        <div className="mb-6">
                            <h4 className="text-xl font-bold mb-2 border-b border-gray-300 dark:border-gray-600 pb-2">Job Details</h4>
                            <p><span className="font-semibold">Title:</span> {selectedApplication.job.title}</p>
                            <p><span className="font-semibold">Location:</span> {selectedApplication.job.location}</p>
                        </div>
                        
                        <div>
                            <h4 className="text-xl font-bold mb-2 border-b border-gray-300 dark:border-gray-600 pb-2">Applicant Details</h4>
                            <p><span className="font-semibold">Username:</span> {selectedApplication.applicant.user.username}</p>
                            <p><span className="font-semibold">Email:</span> {selectedApplication.applicant.user.email}</p>
                            <p><span className="font-semibold">Skills:</span> {selectedApplication.applicant.skills}</p>
                            <a 
                                href={`http://127.0.0.1:8000${selectedApplication.applicant.resume}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
                            >
                                Download Resume
                            </a>
                        </div>

                        {(selectedApplication.status === 'submitted' || selectedApplication.status === 'reviewed') && (
                             <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600 flex gap-4">
                                <button 
                                    onClick={() => handleAction(selectedApplication.id, 'invite')} 
                                    disabled={actionLoading === selectedApplication.id}
                                    className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold"
                                >
                                    {actionLoading === selectedApplication.id ? '...' : 'Invite to Interview'}
                                </button>
                                <button 
                                    onClick={() => handleAction(selectedApplication.id, 'reject')} 
                                    disabled={actionLoading === selectedApplication.id}
                                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:bg-gray-400 transition-colors font-semibold"
                                >
                                    {actionLoading === selectedApplication.id ? '...' : 'Reject Application'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold">Recruiter Dashboard</h1>
                <button 
                    onClick={() => setIsJobModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
                >
                    + Create New Job
                </button>
            </div>

            {/* --- APPLICATIONS LIST --- */}
            <h2 className="text-2xl font-semibold mb-6">Incoming Applications</h2>
            {error && <p className="text-red-500 bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-4">Could not load applications: {error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.length > 0 ? applications.map(app => (
                    <HoverCard key={app.id} className="cursor-pointer" onClick={() => handleCardClick(app.id)}>
                        <h3 className="text-xl font-bold mb-2">Application #{app.id}</h3>
                        <p className="mb-1"><span className="font-semibold">Job ID:</span> {app.job}</p>
                        <p className="mb-3"><span className="font-semibold">Applicant ID:</span> {app.applicant}</p>
                        <p className="capitalize">
                            <span className="font-semibold">Status:</span> 
                            <span className={`ml-2 px-2 py-1 text-sm rounded-full ${
                                app.status === 'submitted' ? 'bg-yellow-200 text-yellow-800' :
                                app.status === 'rejected' ? 'bg-red-200 text-red-800' :
                                app.status.includes('interview') ? 'bg-blue-200 text-blue-800' :
                                'bg-gray-200 text-gray-800'
                            }`}>{app.status.replace(/_/g, ' ')}</span>
                        </p>
                    </HoverCard>
                )) : !loading && <p>No applications found.</p>}
            </div>
        </div>
    );
};

export default RecruiterDashboard;