import React, { useState } from 'react';
import './loading.css';

export const Loading = () => {
   return (
            <div className="w-screen fixed h-screen z-50 overflow-hidden flex flex-col items-center justify-center">
            <div className="loader ease-linear rounded-full spinner bg-white border-4 border-t-4 border-blue-700	 h-12 w-12 mb-4"></div>
            <h2 className="text-center text-xl font-semibold">Loading...</h2>
            <p className="w-1/3 text-center">This may take a few seconds, please don't close this page.</p>
        </div>);
};

export const LoadingMore = () => {
    return (
        <div className="flex justify-center">
        <div className="loader center ease-linear rounded-full border-8 border-t-8 border-gray-200 h-64 w-64"></div>
        </div>
    )
}