
import React from 'react';
import './loading.css';
import { Link } from 'react-router-dom'

export interface ErrorPageProps {
    code: number;
    message?: string;
    details?: string;
}

export const getErrorTitle = (code: number): string => {
    switch (code) {
        case 400:
            return 'Bad Request';
        case 401:
            return 'Unauthorized';
        case 403:
            return 'Forbidden';
        case 404:
            return 'Not Found';
        case 500:
            return 'Internal Server Error';
        case 502:
            return 'Bad Gateway';
        case 503:
            return 'Service Unavailable';
        default:
            return 'Error';
    }
};

export const getErrorSuggestion = (code: number, message?: string): string | null => {
    if (code === 500 && message?.toLowerCase().includes('unexpected token')) {
        return 'This appears to be a server configuration issue. The server may have returned HTML instead of JSON. Please try again later or contact support if the issue persists.';
    }
    if (code === 500) {
        return 'Something went wrong on our end. Please try refreshing the page or come back later.';
    }
    if (code === 404) {
        return 'The page you\'re looking for doesn\'t exist or may have been moved.';
    }
    if (code === 403) {
        return 'You don\'t have permission to access this resource.';
    }
    if (code === 401) {
        return 'Please log in to access this content.';
    }
    return null;
};

export const ErrorPage = (props: ErrorPageProps) => {
    const errorTitle = getErrorTitle(props.code);
    const suggestion = getErrorSuggestion(props.code, props.message);

    return (
        <div className="w-full h-screen z-50 overflow-hidden flex flex-col items-center justify-center px-4">
            <div className="ease-linear rounded-full h-12 w-12 mb-4"></div>
            <h1 className="text-center text-6xl font-bold text-gray-800 mb-2">{props.code}</h1>
            <h2 className="text-center text-2xl font-semibold text-gray-700 mb-4">{errorTitle}</h2>
            {props.message && (
                <div className="max-w-2xl w-full mb-4">
                    <p className="text-center text-gray-600 bg-gray-100 rounded-lg p-4 break-words">
                        {props.message}
                    </p>
                </div>
            )}
            {suggestion && (
                <div className="max-w-2xl w-full mb-4">
                    <p className="text-center text-gray-700 italic">
                        {suggestion}
                    </p>
                </div>
            )}
            {props.details && (
                <details className="max-w-2xl w-full mb-4">
                    <summary className="text-center text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                        Technical Details
                    </summary>
                    <pre className="text-left text-xs text-gray-600 bg-gray-50 rounded p-4 mt-2 overflow-auto max-h-48">
                        {props.details}
                    </pre>
                </details>
            )}
            <div className="text-center mt-4">
                <Link to="/">
                    <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Go Home
                    </button>
                </Link>
            </div>
        </div>
    );
    //  <div className="flex justify-center">
    //  <div className="loader center ease-linear rounded-full border-8 border-t-8 border-gray-200 h-64 w-64"></div>
    //  </div>
};
