"use client";

import { useAuth } from "../providers/AuthProvider";
import { useState, useEffect } from "react";

export function AuthDebug() {
  const auth = useAuth();
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBackendAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = auth.cachedToken || (await auth.getToken());

      if (!token) {
        setError("No token available");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/debug`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setBackendStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Check token validity
  const isTokenValid = auth.isTokenValid ? auth.isTokenValid() : false;

  // Format expiry time
  const expiryTime = auth.tokenExpiresAt
    ? new Date(auth.tokenExpiresAt).toLocaleTimeString()
    : "N/A";

  // Time until expiry in minutes
  const minsUntilExpiry = auth.tokenExpiresAt
    ? Math.round((auth.tokenExpiresAt - Date.now()) / 60000)
    : "N/A";

  return (
    <div className='p-4 border rounded-lg bg-gray-50 text-sm'>
      <h3 className='font-bold mb-2'>Auth Debug</h3>

      <div className='mb-4'>
        <div>
          <strong>User ID:</strong> {auth.userId || "Not logged in"}
        </div>
        <div>
          <strong>Auth Ready:</strong> {auth.isReady ? "Yes" : "No"}
        </div>
        <div>
          <strong>Auth Loaded:</strong> {auth.isLoaded ? "Yes" : "No"}
        </div>
        <div>
          <strong>Has Token:</strong> {auth.cachedToken ? "Yes" : "No"}
        </div>
        <div>
          <strong>Token Valid:</strong> {isTokenValid ? "Yes" : "No"}
        </div>
        <div>
          <strong>Expires At:</strong> {expiryTime}
        </div>
        <div>
          <strong>Minutes Until Expiry:</strong> {minsUntilExpiry}
        </div>
        <div>
          <strong>Last Refresh:</strong>{" "}
          {auth.lastRefreshAttempt
            ? new Date(auth.lastRefreshAttempt).toLocaleTimeString()
            : "Never"}
        </div>
        {auth.refreshError && (
          <div className='text-red-500'>
            <strong>Refresh Error:</strong> {auth.refreshError}
          </div>
        )}
      </div>

      <button
        onClick={checkBackendAuth}
        disabled={loading}
        className='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
      >
        {loading ? "Checking..." : "Check Backend Auth"}
      </button>

      {error && <div className='mt-2 text-red-500'>{error}</div>}

      {backendStatus && (
        <div className='mt-4'>
          <h4 className='font-semibold'>Backend Auth Status:</h4>
          <pre className='mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40'>
            {JSON.stringify(backendStatus, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
