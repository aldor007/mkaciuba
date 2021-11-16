import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    if (typeof sessionStorage !== 'undefined') {
      const tokenString = sessionStorage.getItem('token');
      return tokenString;
    }

    return '';
  };

  const [token, setToken] = useState(getToken());

  const saveToken = userToken => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('token', userToken);
    }

    return null;
  };

  return {
    setToken: saveToken,
    token
  }
}