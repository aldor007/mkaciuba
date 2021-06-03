
import React from 'react';
import './loading.css';
import { Link } from 'react-router-dom'

export interface ErrorPageProps {
    code: number;
    message?: string
}

export const ErrorPage = (props: ErrorPageProps) => {

    return (
        <div className="w-full h-screen z-50 overflow-hidden flex flex-col items-center justify-center">
        <div className="ease-linear rounded-full h-12 w-12 mb-4"></div>
        <h2 className="text-center text-xl font-semibold">{props.code}</h2>
        <p className="w-1/3 text-center">{props.message}</p>
        <div className="w-1/3 text-center">
        <Link to="/">
        <button className="bg-green-500 hover:bg-green-300 text-white font-bold py-2 px-4 rounded">
            Home 
        </button>
        </Link>
        </div>
    </div>);
    //  <div className="flex justify-center">
    //  <div className="loader center ease-linear rounded-full border-8 border-t-8 border-gray-200 h-64 w-64"></div>
    //  </div>
};
