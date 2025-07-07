'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

function LoginPageContent() {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const checkSetupAndHandleParams = async () => {
      try {
        // First check if setup is needed
        const setupResponse = await fetch('/api/setup/status');
        if (setupResponse.ok) {
          const setupData = await setupResponse.json();
          if (setupData.needsSetup) {
            // Setup is needed, redirect to setup page
            router.push('/setup');
            return;
          }
        }

        // Setup is complete, check if redirected from successful setup
        const setupSuccess = searchParams.get('setup');
        if (setupSuccess === 'success') {
          setSuccessMessage('Setup completed successfully! You can now sign in with your admin account.');
        }
      } catch {
        // If setup check fails, assume setup is complete and continue
        const setupSuccess = searchParams.get('setup');
        if (setupSuccess === 'success') {
          setSuccessMessage('Setup completed successfully! You can now sign in with your admin account.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSetupAndHandleParams();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" role="status" aria-label="Loading"></div>
          <p className="mt-4 text-gray-600">Checking setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link 
              href="/register" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 p-4" data-testid="login-error">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <LoginForm 
          onError={setError}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
} 