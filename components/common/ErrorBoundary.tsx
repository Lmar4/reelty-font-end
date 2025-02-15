"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error);
    console.error("Component stack:", errorInfo.componentStack);

    // TODO: Send to error reporting service (e.g., Sentry)
    this.setState({ errorInfo });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='min-h-screen flex items-center justify-center bg-gray-50/50'>
            <div className='max-w-md w-full mx-4'>
              <div className='bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0'>
                    <AlertCircle className='w-6 h-6 text-red-600' />
                  </div>
                  <div>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Something went wrong
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                      We apologize for the inconvenience
                    </p>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                  <p className='text-sm text-gray-600 font-mono break-all'>
                    {this.state.error?.message ||
                      "An unexpected error occurred"}
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-3'>
                  <Button
                    onClick={this.handleRefresh}
                    className='flex-1'
                    variant='default'
                  >
                    <RefreshCcw className='w-4 h-4 mr-2' />
                    Try Again
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    className='flex-1'
                    variant='outline'
                  >
                    <Home className='w-4 h-4 mr-2' />
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
