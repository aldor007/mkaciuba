import gql from 'graphql-tag';

const buildFieldList = (fields) => {
  return fields
    .filter(({type}) => type.ofType.kind === 'SCALAR')
    .map(({name}) => name)
    .join(',')
}

const QUERIES = {
  'Category': 'categories'
}

export const buildQuery = introspectionResults => (raFetchType, resourceName, params) => {
    const resource = introspectionResults.queries.find(r =>{console.info('----', r.name, resourceName); return r.name === QUERIES[resourceName] } );
    const type = introspectionResults.types.find(r =>{console.info('----', r.name, resourceName); return r.name === resourceName } );
    switch (raFetchType) {
        case 'GET_ONE': {

          return {
            query: gql`query ${resource.name}($id: ID) {
              ${resource.name}(id: $id) {
                ${buildFieldList(type.fields)}
              }
            }`,
            variables: params, // params = { id: ... }
            parseResponse: response => response.data,
          }
        }
        case 'GET_LIST': {
          const query = `query ${resource.name} {
                    ${resource.name} {
                        ${buildFieldList(type.fields)}
                    }
                }`;

          return {
            query: gql`${query}`,
            variables: params, // params = { id: ... }
            parseResponse: response => {
              return {
                data: response.data[QUERIES[resourceName]],
                total: response.data[QUERIES[resourceName]].length,
              }
            },
          }
        }
    }
}
