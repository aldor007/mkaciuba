import React from "react";
import { useMutation} from '@apollo/client/react';
import gql from  'graphql-tag';
import  { Navigate } from 'react-router-dom'
import { Mutation } from '@mkaciuba/api';
import useToken from '../useToken';

export const VALIDATE_TOKEN = gql`
  mutation validateTokenForCategory($token: String!, $categorySlug: String!) {
    validateTokenForCategory(token: $token, categorySlug: $categorySlug) {
        token
        valid
    }
}
`;

export interface LoginFormProps {
    categorySlug: string
    gallerySlug: string
}

export function LoginForm(props: LoginFormProps) {
  const passwordRef = React.useRef<HTMLInputElement>();
  const {setToken } = useToken();
  const [validateTokenForCategory, { loading: mutationLoading, error: mutationError, data }] = useMutation<Mutation>(VALIDATE_TOKEN)
  const handleSubmit = (e) => {
    e.preventDefault();
    validateTokenForCategory({
      variables: {
        token: passwordRef.current.value,
        categorySlug: props.categorySlug
    }
    })
    if (mutationError) {
        console.error(mutationError);
    }
  };


  let info = null;
  if (data && data.validateTokenForCategory.valid) {
      const redirectUrl = `/gallery/${props.gallerySlug}/${props.categorySlug}`
      setToken(data.validateTokenForCategory.token)
    return (
      <Navigate to={redirectUrl} replace />
   )
  } else if (data) {
    info = (
    <div className="bg-red-400 border-red-light text-red-dark pl-4 pr-8 py-3 rounded relative" role="alert">
  <span className="block sm:inline">Invalid credentals.</span>
</div>
)
  }

    return (
    <div className="container mx-auto pt-8 pb-4 ">
            {info && info}
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 mb-4">
            {mutationError && <div>Error: {String(mutationError)}</div>}
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 mb-4">
          <form className="w-full max-w-sm" onSubmit={handleSubmit}>
            <label className="md:w-2/3 block text-gray-500 font-bol">
            Password:
              <input ref={passwordRef} className="mr-2 leading-tight bg-gray-200" type="password" name="password" />
            </label>
            <button type="submit"  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Submit
            </button>

          </form>
      </div>
    </div>
    );
}
