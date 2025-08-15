import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import HoverCard from '../components/ui/HoverCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      // Artificial 2-second delay for UX as requested
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (user.user_type === 'recruiter') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/applicant/dashboard', { replace: true });
      }
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-10 sm:mt-20">
      <HoverCard className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Login to JRATS</h2>
        {loading ? <LoadingSpinner /> : (
          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="mb-6">
              <label className="block mb-2 font-semibold">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-bold transition-colors">Login</button>
          </form>
        )}
         <p className="text-center mt-4">
            Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
        </p>
      </HoverCard>
    </div>
  );
};

export default Login;