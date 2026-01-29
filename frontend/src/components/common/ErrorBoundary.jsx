import React from 'react';
import { Button } from '../ui';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        // Attempt to clear local storage in case of corrupt state
        localStorage.clear();
        window.location.reload();
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-error-warning-line text-3xl"></i>
                        </div>

                        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-6">
                            The application encountered an unexpected error.
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg text-left mb-6 overflow-auto max-h-40 border border-gray-200">
                            <p className="font-mono text-xs text-red-600 break-words">
                                {this.state.error && this.state.error.toString()}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button onClick={this.handleReload} variant="primary" className="w-full justify-center">
                                Reload Page
                            </Button>
                            <Button onClick={this.handleReset} variant="outline" className="w-full justify-center text-red-600 hover:bg-red-50 border-red-200">
                                Reset App Data (Clear Cache)
                            </Button>
                        </div>

                        <p className="mt-4 text-xs text-gray-400">
                            If the problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
