import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    if (sessionStorage) {
      const tokenString = sessionStorage.getItem('token');
      return tokenString;
    }

    return '';
  };

  const [token, setToken] = useState(getToken());

  const saveToken = userToken => {
    if (sessionStorage) {
      sessionStorage.setItem('token', userToken);
    }

    return null;
  };

  return {
    setToken: saveToken,
    token
  }
}