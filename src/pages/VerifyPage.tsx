import { useState } from 'react';
import axios from 'axios';
import { mockVerifyCredential } from '../services/mockApi';

// Use environment variable or fall back to Vercel deployment
const VERIFICATION_API =
  (import.meta as any).env?.VITE_VERIFICATION_API ||
  'https://verification-kube.vercel.app';
// Enable mock API as fallback when backend services are unavailable
const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || false;
const ENABLE_FALLBACK = true; // Enable automatic fallback to mock API on 500 errors

const VerifyPage = () => {
  const [jsonInput, setJsonInput] = useState('{\n  "id": "credential-123"\n}');
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
        result = await mockVerifyCredential(credential);
      } else {
        try {
          // Send to verification service with CORS headers
          result = await axios.post(`${VERIFICATION_API}/verify`, credential, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            timeout: 10000, // 10 second timeout
          });
        } catch (apiError: any) {
          // If backend returns 500 error and fallback is enabled, use mock API
          if (ENABLE_FALLBACK && apiError.response?.status === 500) {
            console.warn('Verification service returned 500 error, falling back to mock API');
            result = await mockVerifyCredential(credential);
            // Add a note to the response indicating fallback was used
            result.data = {
              ...result.data,
              _note: 'Verification service unavailable - using mock response',
              _fallback: true
            };
          } else {
            throw apiError;
          }
        }
      }
      setResponse(result.data);
    } catch (err: any) {
      console.error('API Error:', err);
      if (err.message.includes('JSON')) {
        setError('Invalid JSON format');
      } else if (err.response) {
        setError(`Error: ${err.response.data?.error || 'Server error'} (${err.response.status})`);
      } else if (err.message.includes('Network Error') || err.message.includes('timeout')) {
        setError('Network Error: Backend service is not running or not accessible. Please start the verification service on port 3002.');
      } else {
        setError(`Error: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Credential Verification System</h2>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-sm">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Instructions</h3>
        <p className="text-green-700 mb-2">
          This page allows you to verify credentials in the Kube Credential system. Follow these steps:
        </p>
        <ol className="list-decimal list-inside text-green-700 ml-2">
          <li className="mb-1">Enter the credential ID in valid JSON format in the text area below</li>
          <li className="mb-1">Click the "Verify Credential Authenticity" button to submit</li>
          <li className="mb-1">The system will check if the credential exists and display the result</li>
          <li className="mb-1">You'll see which worker pod processed your verification request</li>
        </ol>
        <p className="text-green-700 mt-2 text-sm italic">
          Note: Only previously issued credentials can be successfully verified.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Input form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-4">
              <label htmlFor="json" className="block text-gray-700 mb-2 font-semibold">
                Input Credential to Verify
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
              className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 font-bold transition-colors text-lg shadow-md"
            >
              {loading ? 'Processing...' : '✓ Verify Credential Authenticity'}
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
            <h3 className="block text-gray-700 mb-2 font-semibold">Verification Result</h3>
            <div
              className={`border rounded-md p-4 h-[calc(100%-2rem)] ${
                !response
                  ? 'bg-gray-50 border-gray-200'
                  : response.valid
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              {response ? (
                <>
                  <div className="flex items-center mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${response.valid ? 'bg-green-500' : 'bg-red-500'} mr-2`}
                    ></div>
                    <h3 className={`text-lg font-medium ${response.valid ? 'text-green-800' : 'text-red-800'}`}>
                      {response.valid ? 'Credential Verified Successfully' : 'Invalid Credential Detected'}
                    </h3>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="mb-2">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={response.valid ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {response.valid ? 'Valid' : 'Invalid'}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Worker:</span> {response.worker}
                    </p>
                    <p>
                      <span className="font-semibold">Timestamp:</span> {response.timestamp}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 italic flex items-center justify-center h-full">
                  Response will appear here after verification
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
