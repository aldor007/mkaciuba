import React from 'react';
import { Navbar, MenuType } from './components/Navbar';

export interface HeaderProps {
  mainMenu?: MenuType[] | null
}


export default function Header(props: HeaderProps)  {
  const { mainMenu } = props;

  return (
    <React.Fragment>
        <Navbar additionalMainMenu={mainMenu}/>
    </React.Fragment>
  );
}

