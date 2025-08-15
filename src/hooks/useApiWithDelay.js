import { useState, useCallback } from 'react';

const useApiWithDelay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const apiPromise = apiCall();
      const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));

      // This waits for both the API call and the delay to finish
      const [apiResult] = await Promise.all([apiPromise, delayPromise]);
      
      // We now return the result of the API call directly.
      // If apiCall was a single request, apiResult is the response object.
      // If apiCall was a Promise.all, apiResult is the array of responses.
      return apiResult; 

    } catch (err) {
      const errorMessage = err.response ? JSON.stringify(err.response.data) : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
        setLoading(false);
    }
  }, []); 

  return { loading, error, execute };
};

export default useApiWithDelay;