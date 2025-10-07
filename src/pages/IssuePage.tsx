import { useState } from 'react';
import axios from 'axios';
import { mockIssueCredential } from '../services/mockApi';

// Use real API if available, otherwise use mock
const ISSUANCE_API = import.meta.env.VITE_ISSUANCE_API || 'http://localhost:3001';
const USE_MOCK_API = false; // Set to false to use real backend

const IssuePage = () => {
  const [jsonInput, setJsonInput] = useState('{\n  "id": "credential-123",\n  "type": "example",\n  "data": "sample-data"\n}');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Parse JSON input
      const credential = JSON.parse(jsonInput);
      
      let result;
      if (USE_MOCK_API) {
        // Use mock API
        result = await mockIssueCredential(credential);
      } else {
        // Use real API
        result = await axios.post(`${ISSUANCE_API}/issue`, credential, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });
      }
      setResponse(result.data);
    } catch (err: any) {
      console.error("API Error:", err);
      if (err.message.includes('JSON')) {
        setError('Invalid JSON format');
      } else if (err.response) {
        setError(`Error: ${err.response.data?.error || 'Server error'} (${err.response.status})`);
      } else if (err.message.includes('Network Error') || err.message.includes('timeout')) {
        setError('Network Error: Backend service is not running or not accessible. Please start the issuance service on port 3001.');
      } else {
        setError(`Error: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Credential Issuance System</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h3>
        <p className="text-blue-700 mb-2">
          This page allows you to issue new credentials to the Kube Credential system. Follow these steps:
        </p>
        <ol className="list-decimal list-inside text-blue-700 ml-2">
          <li className="mb-1">Enter your credential data in valid JSON format in the text area below</li>
          <li className="mb-1">Click the "Issue Secure Credential" button to submit</li>
          <li className="mb-1">The system will process your request and display the result on the right</li>
          <li className="mb-1">Each credential is processed by a worker pod in the Kubernetes cluster</li>
        </ol>
        <p className="text-blue-700 mt-2 text-sm italic">
          Note: The system will check if the credential already exists and notify you accordingly.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Input form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-4">
              <label htmlFor="json" className="block text-gray-700 mb-2 font-semibold">
                Input Credential Data
              </label>
              <textarea
                id="json"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-bold transition-colors text-lg shadow-md"
            >
              {loading ? 'Processing...' : '🔐 Issue Secure Credential'}
            </button>
          </form>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              {error}
            </div>
          )}
        </div>
        
        {/* Right side - Response */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="block text-gray-700 mb-2 font-semibold">Credential Response</h3>
            <div className={`border rounded-md p-4 h-[calc(100%-2rem)] ${response ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              {response ? (
                <>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <h3 className="text-lg font-medium text-green-800">Credential Issued Successfully</h3>
                  </div>
                  <pre className="bg-white p-3 rounded border text-sm overflow-auto h-[calc(100%-2rem)]">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </>
              ) : (
                <div className="text-gray-500 italic flex items-center justify-center h-full">
                  Response will appear here after issuance
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Secure Credential System • Enterprise Edition
        </span>
      </div>
    </div>
  );
};

export default IssuePage;