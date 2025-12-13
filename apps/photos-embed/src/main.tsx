import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider, ApolloClient, InMemoryCache  } from '@apollo/client';

import { ImageList } from '@mkaciuba/image';


export const init = ({apiUrl, categorySlug}, selector) => {
  const client = new ApolloClient({
    uri: apiUrl,
    cache: new InMemoryCache(),
    connectToDevTools: true
  });

  ReactDOM.render(
    <ApolloProvider client={client}>
      <ImageList categorySlug={categorySlug}/>
    </ApolloProvider>
    , selector);
    return this
}

