import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useMutation, gql } from "@apollo/client";
import  { Redirect } from 'react-router-dom'


const VALIDATE_TOKEN = gql`
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
    onSuccess : () => void
}

export function LoginForm(props: LoginFormProps) {
  const [validateTokenForCategory, { loading: mutationLoading, error: mutationError, data }] = useMutation(VALIDATE_TOKEN)
  let setFormikStatus;
  const handleSubmit = (values, { setSubmitting, setStatus }) => {
      setSubmitting(mutationLoading);
      validateTokenForCategory({
          variables: {
              token: values.password,
              categorySlug: props.categorySlug
          }
      })
        if (mutationError) {
            console.error(mutationError);
            setStatus('Error')
        }
        setFormikStatus = setStatus;
  };


  let info = null;
  if (data && data.validateTokenForCategory.valid) {
      const redirectUrl = `/gallery/${props.gallerySlug}/${props.categorySlug}`
      localStorage.setItem(`categorySlug:${props.categorySlug}`, data.validateTokenForCategory.token);
      props.onSuccess()
    return (
      <Redirect to={redirectUrl}  />
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
            {mutationError && <div>Error: {mutationError}</div>}
            </div>
                    <Formik
                    initialValues={{ email: "", password: "" }}
                    onSubmit={handleSubmit}
                    >
                    {({ isSubmitting, status }) => {
                        return (
                            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 mb-4">
                        <Form className="w-full max-w-sm">
                            <label className="md:w-2/3 block text-gray-500 font-bol">
                            Password:
                            <Field className="mr-2 leading-tight bg-gray-200" type="password" name="password" />
                            <ErrorMessage name="password" component="div" />
                            </label>
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"  disabled={isSubmitting}>
                            Submit
                            </button>
                            {status && <div className="text-success">{status}</div>}

                        </Form>
                        </div>
                        );
                    }}
                    </Formik>
    </div>
    );
}
