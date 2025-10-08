// Mock API service to simulate backend responses
import { AxiosResponse } from 'axios';

// Mock successful response for issuance
export const mockIssueCredential = (data: any): Promise<AxiosResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const credentialId = data.id || `cred-${Math.random().toString(36).substring(2, 10)}`;
      
      resolve({
        data: {
          success: true,
          id: credentialId,
          worker: `mock-worker-${Math.floor(Math.random() * 3) + 1}`,
          timestamp: new Date().toISOString(),
          credential: {
            id: credentialId,
            issuer: "did:example:kube-credential-system",
            issuanceDate: new Date().toISOString(),
            type: data.type || "VerifiableCredential",
            credentialSubject: {
              id: data.id,
              ...data
            }
          },
          message: "Credential issued successfully to Kubernetes cluster"
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });
    }, 800); // Simulate network delay
  });
};

// Mock successful response for verification
export const mockVerifyCredential = (data: any): Promise<AxiosResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate checking if credential exists (random success/failure for demo)
      const isValid = Math.random() > 0.3; // 70% success rate
      
      resolve({
        data: {
          valid: isValid,
          worker: `mock-worker-${Math.floor(Math.random() * 3) + 1}`,
          timestamp: new Date().toISOString(),
          credentialId: data.id,
          message: isValid ? "Credential verified successfully" : "Credential not found or invalid"
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });
    }, 800); // Simulate network delay
  });
};
