import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';
import {  Enum_Componentmenuconfigmenu_Icon, Maybe, Query, QueryMenuArgs } from '@mkaciuba/api'
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter';

const ICONS = {
  [Enum_Componentmenuconfigmenu_Icon.Facebook]: faFacebook,
  [Enum_Componentmenuconfigmenu_Icon.Instagram]: faInstagram,
  [Enum_Componentmenuconfigmenu_Icon.Github]: faGithub,
  [Enum_Componentmenuconfigmenu_Icon.Linkedin]: faLinkedinIn
}

export interface MenuType {
  url: string
  name: string
  children?: MenuType[]
}
const GET_MENU = gql`
  query menu {
   menu {
    brandName
    topMenu {
      name
      url
    }
    mainMenu {
      name
      url
    }
    socialIcons {
      name
      url
      icon
    }
    brand {
      url
    }
 }
}
`;

export interface NavbarProps {
  additionalMainMenu?: MenuType[]
}


const createDropdown = ( additionalMainMenu, setDropdownOpen, dropdownOpen) => {
  const generateIdKey = (item) => (
    `${item.id}-${item.url}`
  )
  const dropDownItems = additionalMainMenu[0].children.map((item, id) => (
    <a key={generateIdKey(item)} className="block px-4 py-2 mt-2 text-sm font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline" href={item.url}>
      {item.name}
     </a>
  ))
  const dropdownMenu = (
    <div className="relative" x-data="{ open: false }">
      <button className="flex flex-row items-center w-full px-4 py-2 mt-2 text-sm font-semibold text-left bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:focus:bg-gray-600 dark-mode:hover:bg-gray-600 md:w-auto md:inline md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
      onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span>{additionalMainMenu[0].name}</span>
            <svg fill="currentColor" viewBox="0 0 20 20" className="inline w-4 h-4 mt-1 ml-1 transition-transform duration-200 transform md:-mt-1"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
      <div    x-show="open"    className="absolute right-0 w-full mt-2 origin-top-right rounded-md shadow-lg md:w-48">
        {dropdownOpen &&
      <div className="overflow-y-auto h-64 bg-white rounded-md shadow dark-mode:bg-gray-800">
        {dropDownItems}
      </div>
        }
    </div>
    </div>
  )

  return dropdownMenu;
}

export const Navbar = function (props: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const { loading, error, data } = useQuery<Query,QueryMenuArgs>(GET_MENU, {
  });
  if (loading) return <p>Loading...</p>;
  if (error) {
    console.info(error)
     return <p>Error :(</p>
   };
  const social = data.menu.socialIcons;
  const { topMenu, mainMenu, brandName, brand } = data.menu;
  const socialIcons = social.map((icon, id) => (
    <li className="nav-item" key={id}>
      <a
        className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
        href={icon.url}
      >
        <FontAwesomeIcon icon={ICONS[icon.icon]} size='1x' />
      </a>
    </li>
  ))

  const topMenuList = topMenu.map((item, id) => (
    <li className="nav-item" key={id}>
      <a
        className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
        href={item.url}
      >
        <span>{item.name}</span>
      </a>
    </li>
  ))
  const mainMenuList = mainMenu.map((item, id) => (
     <a key={item.url} href={item.url} className="px-4 py-2 mt-2 text-sm font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline">
       {item.name}
     </a>
  ))

  let dropdownMenu = null;
  if (props.additionalMainMenu) {
    dropdownMenu = createDropdown(props.additionalMainMenu, setDropdownOpen, dropdownOpen)
  }

  let navbarCSS = '';
  if (navbarOpen) {
    navbarCSS = 'flex-col flex-grow pb-4 md:pb-0 md:flex md:justify-end md:flex-row flex';
  } else {
    navbarCSS = 'flex-col flex-grow pb-4 md:pb-0 md:flex md:justify-end md:flex-row hidden';
  }
  return (
    <>
      <div className="w-full top-0 text-gray-700 bg-black  px-2 py-3 navbar-expand-lg dark-mode:text-gray-200 dark-mode:bg-gray-800">
      <nav className="flex flex-col max-w-screen-xl px-4 mx-auto md:items-center md:justify-between md:flex-row md:px-6 lg:px-8">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <ul className="flex flex-col lg:flex-row list-none lg:ml-auto">
          {topMenuList}
            </ul>
          </div>
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <ul className="flex flex-row list-none lg:ml-auto">
              {socialIcons}
            </ul>
          </div>
        </div>
      </nav>
      </div>
      <div className="w-full sticky top-0 text-gray-700 bg-white dark-mode:text-gray-200 dark-mode:bg-gray-800">
        <div x-data="{ open: false }" className="flex flex-col max-w-screen-xl px-4 mx-auto md:items-center md:justify-between md:flex-row md:px-6 lg:px-8">
          <div className="p-4 flex flex-row items-center justify-between">
            <a href="#" className="flex flex-wrap -mx-1 overflow-hidden text-lg font-semibold tracking-widest text-gray-900 rounded-lg dark-mode:text-white focus:outline-none focus:shadow-outline">
              <img  className="py-2" width="35px" height="35px" src={brand.url}/>
              <span className="px-2 py-2 mt-2">{brandName}</span>
              </a>
            <button className="md:hidden rounded-lg focus:outline-none focus:shadow-outline" onClick={() => setNavbarOpen(!navbarOpen)}>
              <svg fill="currentColor" viewBox="0 0 20 20" className="w-6 h-6">
               {!navbarOpen && <path x-show="!open" fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd"></path>}
               {navbarOpen && <path x-show="open" fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>}
             </svg>
            </button>
         </div>
         <nav className={navbarCSS}>
           {mainMenuList}
           {dropdownMenu &&dropdownMenu}
           <button className="block lg:hidden cursor-pointer ml-auto relative w-12 h-12 p-4">
            <svg className="fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
            <svg className="fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/></svg>
          </button>
          </nav>
        </div>
      </div>
    </>
  );
}
