import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Navbar, MenuType } from './components/Navbar';



export interface HeaderProps {
  mainMenu: MenuType[] | null
}


export default function Header(props: HeaderProps)  {
  const { mainMenu } = props;

  return (
    <React.Fragment>
        <Navbar mainMenu={mainMenu}></Navbar>
    </React.Fragment>
  );
}

