import React from 'react';
import { gql, useQuery, ApolloProvider, ApolloClient, InMemoryCache  } from '@apollo/client';

export interface CategoriesListProps {
  maxCount: number
}

const CATEGORIES = gql`
query {
  categories (where: {
    Public: true,
  }) {
    id
    Image {
      url
      previewUrl
    }
     Name
    File {
      url
    }
    users {
      email
    }
  }
}
`


export default function CategoriesList(props: CategoriesListProps) {
  const { loading, error, data } = useQuery(CATEGORIES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.rates.map(({ currency, rate }) => (
    <div key={currency}>
      <p>
        {currency}: {rate}
      </p>
    </div>
  ));
}
