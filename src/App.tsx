import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import IssuePage from './pages/IssuePage';
import VerifyPage from './pages/VerifyPage';

function App() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div className="min-h-screen bg-purple-50">
      <header className="bg-purple-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Kube Credential</h1>
            <div className="flex items-center">
              <div className="mr-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="inline-block w-2 h-2 bg-white rounded-full mr-2"></span>
                Enterprise Edition
              </div>
              <nav>
                <ul className="flex space-x-6">
                  {/* <li>
                    <Link 
                      to="/issue" 
                      className={`px-3 py-1 rounded transition-colors ${currentPath === '/' || currentPath === '/issue' ? 'bg-purple-600 font-bold' : 'hover:bg-purple-600'}`}
                    >
                      Issue
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/verify" 
                      className={`px-3 py-1 rounded transition-colors ${currentPath === '/verify' ? 'bg-purple-600 font-bold' : 'hover:bg-purple-600'}`}
                    >
                      Verify
                    </Link>
                  </li> */}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>
      
      {/* Tab Navigation */}
      <div className="bg-white shadow">
        <div className="container mx-auto">
          <div className="flex border-b">
            <Link 
              to="/issue" 
              className={`px-6 py-3 text-center font-medium ${currentPath === '/' || currentPath === '/issue' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Issue Credential
            </Link>
            <Link 
              to="/verify" 
              className={`px-6 py-3 text-center font-medium ${currentPath === '/verify' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Verify Credential
            </Link>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<IssuePage />} />
          <Route path="/issue" element={<IssuePage />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </main>
      
      <footer className="bg-blue-600 border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-white">
          <strong>Kube Credential System</strong> • Secure Enterprise Solution
        </div>
      </footer>
    </div>
  );
}

export default App;