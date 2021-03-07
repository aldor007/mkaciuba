import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Dropdown } from './components/Dropdown';
import { Navbar } from './components/Navbar';

const useStyles = makeStyles(theme => ({
  toolbar: { borderBottom: `1px solid ${theme.palette.divider}`,
     },
  toolbarTitle: {
    flex: 1,
  },
  toolbarSecondary: {
    justifyContent: 'space-between',
    overflowX: 'auto',
  },
  toolbarLink: {
    padding: theme.spacing(1),
    flexShrink: 0,
  },
  headerTopArea: {
    backgroundColor: '#000',
    fontSize: '12px',
    '& a': {
      color: '#fff'
    }
  },
  socialIcon: {
    fontSize: '14px',
    textAlign: 'right',
    paddingRight: '30px',
    '& a': {
      padding: '10px 5px',
      marginTop: '10px'
    },
    // '& svg': {
    //   padding: '10px 5px',
    //   marginTop: '10px'
    // }
  },
  socialIconsItems: {
    marginTop: '5px'
  },
  menuDropdown: {
    textAlign: 'center'
  }
}))

export interface MenuType {
  url: string
  name: string
  children?: MenuType[]
}

export interface HeaderProps {
  social: { url: string, icon: IconDefinition}[]
  brand: { imageUrl: string, name: string}
  mainMenu: MenuType[]
  topMenu: MenuType[]
}



export default function Header(props: HeaderProps)  {
  const classes = useStyles();
  const { social, brand, mainMenu, topMenu } = props;

  return (
    <React.Fragment>
        <Navbar social={social} topMenu={topMenu}></Navbar>
    </React.Fragment>
  );
}

