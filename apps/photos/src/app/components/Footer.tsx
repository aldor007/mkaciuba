import React from "react";
import { FacebookProvider, Page } from 'react-facebook';

export const Footer = () => {

return (<div className="bg-gray-400 text-black	">

    <div className="container mx-auto pt-8 pb-4 ">

        <div className="flex flex-wrap overflow-hidden sm:-mx-1 md:-mx-px lg:-mx-2 xl:-mx-2">

                   <div className="w-full overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/2 xl:my-2 xl:px-2 xl:w-1/2 pb-6">
                <h4 className="uppercase">Facebook</h4>
                <FacebookProvider appId="1724717534454966">
                  <Page href="https://www.facebook.com/mkaciubapl" tabs="timeline" />
                </FacebookProvider>

            </div>

            <div className="w-full overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/4 xl:my-2 xl:px-2 xl:w-1/4 pb-6">
                <h4 className="uppercase">Fotografie</h4>
                <ul className="">
                <li className="leading-7 text-sm">
                    <a className="text-white underline text-small" href="/page-1">
                        Page 1 </a>
                </li>
                <li id="navi-1" className="leading-7 text-sm"><a className="text-white underline text-small" href="/page-2">Page 2</a></li>
                </ul>
            </div>



        </div>

  <hr/>

        <div className="pt-4 md:flex md:items-center md:justify-center ">
            <ul className="text-black">
                <li className="md:mx-2 md:inline leading-7 text-sm" id="footer-navi-2"><a className="text-small" href="/cookie">Cookie policy</a></li>
                <li className="md:mx-2 md:inline leading-7 text-sm" id="footer-navi-2"><a className="text-small" href="/privacy">Privacy</a></li>
                </ul>
            </div>
        </div>
    </div>
);
}
