import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import HoverCard from '../components/ui/HoverCard';

const Signup = () => {
    const [userType, setUserType] = useState('applicant');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        company_name: '',
        skills: '',
        resume: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('user.username', formData.username);
        data.append('user.email', formData.email);
        data.append('user.password', formData.password);

        let url = '';
        if (userType === 'applicant') {
            url = '/signup/applicant/';
            data.append('skills', formData.skills);
            if (formData.resume) {
                data.append('resume', formData.resume);
            }
        } else {
            url = '/signup/recruiter/';
            data.append('company_name', formData.company_name);
        }

        try {
            await api.post(url, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            await new Promise(resolve => setTimeout(resolve, 2000));
            navigate('/login');
        } catch (err) {
            setError('Failed to sign up. Please check your details.');
            console.error(err.response.data);
            setLoading(false);
        }
    };


    return (
        <div className="flex justify-center items-center mt-10 sm:mt-20">
            <HoverCard className="w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-4">Create Account</h2>
                
                {loading ? <LoadingSpinner /> : (
                    <>
                        <div className="flex justify-center border border-gray-300 dark:border-gray-600 rounded-lg p-1 mb-6 bg-gray-200 dark:bg-gray-700">
                            <button onClick={() => setUserType('applicant')} className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${userType === 'applicant' ? 'bg-blue-600 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                Applicant
                            </button>
                            <button onClick={() => setUserType('recruiter')} className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${userType === 'recruiter' ? 'bg-blue-600 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                Recruiter
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                            <input type="text" name="username" placeholder="Username" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" required />
                            <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" required />
                            <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" required />
                            
                            {userType === 'applicant' && (
                                <>
                                    <input type="text" name="skills" placeholder="Skills (e.g., Python, React)" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" required />
                                    <label className="block mb-2 font-semibold">Resume (PDF)</label>
                                    <input type="file" name="resume" onChange={handleFileChange} className="w-full p-3 mb-4 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" accept=".pdf" required />
                                </>
                            )}

                            {userType === 'recruiter' && (
                                <input type="text" name="company_name" placeholder="Company Name" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" required />
                            )}

                            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-bold transition-colors">Sign Up</button>
                        </form>
                    </>
                )}
                 <p className="text-center mt-4">
                    Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Log In</Link>
                </p>
            </HoverCard>
        </div>
    );
};

export default Signup;