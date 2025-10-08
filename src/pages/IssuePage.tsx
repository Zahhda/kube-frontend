import { useState } from 'react';
import axios from 'axios';
import { mockIssueCredential } from '../services/mockApi';

// Use environment variable or fall back to Vercel deployment
const ISSUANCE_API =
  (import.meta as any).env?.VITE_ISSUANCE_API ||
  'https://insurance-kube.vercel.app';
// Enable mock API as fallback when backend services are unavailable
const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || false;
const ENABLE_FALLBACK = true; // Enable automatic fallback to mock API on 500 errors

const IssuePage = () => {
  // Form state for credential data
  const [credentialData, setCredentialData] = useState({
    id: '',
    type: 'VerifiableCredential',
    holderName: '',
    holderEmail: '',
    holderPhone: '',
    issuerName: 'Kube Credential System',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    additionalData: ''
  });
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<'personal' | 'sample'>('personal');

  // Sample data function
  const loadSampleData = () => {
    setCredentialData({
      id: `cred-${Date.now()}`,
      type: 'EducationCredential',
      holderName: 'John Doe',
      holderEmail: 'john.doe@example.com',
      holderPhone: '+1-555-0123',
      issuerName: 'University of Technology',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      additionalData: 'Bachelor of Science in Computer Science, GPA: 3.8'
    });
    setInputMode('sample');
  };

  const loadPersonalData = () => {
    setCredentialData({
      id: '',
      type: 'VerifiableCredential',
      holderName: '',
      holderEmail: '',
      holderPhone: '',
      issuerName: 'Kube Credential System',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      additionalData: ''
    });
    setInputMode('personal');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Build credential object from form data
      const credential = {
        id: credentialData.id || `cred-${Date.now()}`,
        type: credentialData.type,
        credentialSubject: {
          id: credentialData.holderEmail,
          name: credentialData.holderName,
          email: credentialData.holderEmail,
          phone: credentialData.holderPhone,
          additionalData: credentialData.additionalData
        },
        issuer: credentialData.issuerName,
        issuanceDate: new Date().toISOString(),
        validFrom: credentialData.validFrom,
        validUntil: credentialData.validUntil,
        data: credentialData.additionalData
      };
      
      let result;
      if (USE_MOCK_API) {
        // Use mock API
        result = await mockIssueCredential(credential);
      } else {
        try {
          // Use real API
          result = await axios.post(`${ISSUANCE_API}/issue`, credential, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          });
        } catch (apiError: any) {
          // If backend returns 500 error and fallback is enabled, use mock API
          if (ENABLE_FALLBACK && apiError.response?.status === 500) {
            console.warn('Backend service returned 500 error, falling back to mock API');
            result = await mockIssueCredential(credential);
            // Add a note to the response indicating fallback was used
            result.data = {
              ...result.data,
              _note: 'Backend service unavailable - using mock response',
              _fallback: true
            };
          } else {
            throw apiError;
          }
        }
      }
      setResponse(result.data);
    } catch (err: any) {
      console.error("API Error:", err);
      if (err.response) {
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
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Credential Issuance</h3>
        <p className="text-blue-700 mb-4">
          Issue new digital credentials with our secure system. Choose to enter your own data or use sample data for testing.
        </p>
        
        {/* Data Type Selection */}
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={loadPersonalData}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              inputMode === 'personal'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
            }`}
          >
            Enter Personal Data
          </button>
          <button
            type="button"
            onClick={loadSampleData}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              inputMode === 'sample'
                ? 'bg-green-600 text-white'
                : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
            }`}
          >
            Load Sample Data
          </button>
        </div>
        
        {inputMode === 'sample' && (
          <div className="bg-green-100 border border-green-200 rounded p-3 text-green-800 text-sm">
            Sample data loaded for testing purposes. You can modify the fields below or click "Enter Personal Data" to start fresh.
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Input form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="mb-4">
            {/* Credential ID */}
            <div className="mb-4">
              <label htmlFor="credentialId" className="block text-gray-700 mb-2 font-semibold">
                Credential ID
              </label>
              <input
                id="credentialId"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={credentialData.id}
                onChange={(e) => setCredentialData({...credentialData, id: e.target.value})}
                placeholder="Leave empty for auto-generation"
              />
            </div>

            {/* Credential Type */}
            <div className="mb-4">
              <label htmlFor="credentialType" className="block text-gray-700 mb-2 font-semibold">
                Credential Type
              </label>
              <select
                id="credentialType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={credentialData.type}
                onChange={(e) => setCredentialData({...credentialData, type: e.target.value})}
                required
              >
                <option value="VerifiableCredential">Verifiable Credential</option>
                <option value="EducationCredential">Education Credential</option>
                <option value="EmploymentCredential">Employment Credential</option>
                <option value="IdentityCredential">Identity Credential</option>
                <option value="CertificationCredential">Certification Credential</option>
              </select>
            </div>

            {/* Holder Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Credential Holder Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="holderName" className="block text-gray-700 mb-2 font-medium">
                    Full Name *
                  </label>
                  <input
                    id="holderName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={credentialData.holderName}
                    onChange={(e) => setCredentialData({...credentialData, holderName: e.target.value})}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="holderEmail" className="block text-gray-700 mb-2 font-medium">
                    Email Address *
                  </label>
                  <input
                    id="holderEmail"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={credentialData.holderEmail}
                    onChange={(e) => setCredentialData({...credentialData, holderEmail: e.target.value})}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label htmlFor="holderPhone" className="block text-gray-700 mb-2 font-medium">
                    Phone Number
                  </label>
                  <input
                    id="holderPhone"
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={credentialData.holderPhone}
                    onChange={(e) => setCredentialData({...credentialData, holderPhone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label htmlFor="issuerName" className="block text-gray-700 mb-2 font-medium">
                    Issuing Organization
                  </label>
                  <input
                    id="issuerName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={credentialData.issuerName}
                    onChange={(e) => setCredentialData({...credentialData, issuerName: e.target.value})}
                    required
                    placeholder="Enter issuing organization"
                  />
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Validity Period</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="validFrom" className="block text-gray-700 mb-2 font-medium">
                    Valid From *
                  </label>
                  <input
                    id="validFrom"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={credentialData.validFrom}
                    onChange={(e) => setCredentialData({...credentialData, validFrom: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="validUntil" className="block text-gray-700 mb-2 font-medium">
                    Valid Until
                  </label>
                  <input
                    id="validUntil"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={credentialData.validUntil}
                    onChange={(e) => setCredentialData({...credentialData, validUntil: e.target.value})}
                    placeholder="Leave empty for no expiration"
                  />
                </div>
              </div>
            </div>

            {/* Additional Data */}
            <div className="mb-6">
              <label htmlFor="additionalData" className="block text-gray-700 mb-2 font-semibold">
                Additional Information
              </label>
              <textarea
                id="additionalData"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={credentialData.additionalData}
                onChange={(e) => setCredentialData({...credentialData, additionalData: e.target.value})}
                placeholder="Enter any additional credential information (qualifications, achievements, etc.)"
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