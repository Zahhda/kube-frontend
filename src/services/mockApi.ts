// Mock API service to simulate backend responses
import { AxiosResponse } from 'axios';

// Mock successful response for issuance
export const mockIssueCredential = (data: any): Promise<AxiosResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          credential: {
            id: "cred-" + Math.random().toString(36).substring(2, 10),
            issuer: "did:example:issuer",
            issuanceDate: new Date().toISOString(),
            ...data
          },
          message: "Credential issued successfully"
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
      resolve({
        data: {
          success: true,
          verification: {
            verified: true,
            checks: ["signature", "expiration", "revocation"],
            warnings: []
          },
          message: "Credential verified successfully"
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });
    }, 800); // Simulate network delay
  });
};