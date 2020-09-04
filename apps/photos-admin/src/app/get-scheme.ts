// import 'isomorphic-fetch';
// import { parse, IntrospectionQuery } from 'graphql';
// import { createApolloFetch } from 'apollo-fetch';
// import fs from 'fs';

// const apolloFetch = createApolloFetch({ uri: `https://www.blabla.com/api/graphql` });
// const query = parse(IntrospectionQuery);
// const schemaPath = `${__dirname}/../../schema.json`;

// apolloFetch({ query })
//   .then((result) => {
//     const schema = JSON.stringify(result, null, '  ');

//     return new Promise(resolve => fs.writeFile(schemaPath, schema, 'utf8', resolve));
//   })
//   .catch((err) => {
//     console.error(err);
//   });
