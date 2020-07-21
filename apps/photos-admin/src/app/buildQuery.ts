import gql from 'graphql-tag';

const buildFieldList = (fields) => {
  return fields
    .filter(({type}) => type.ofType.kind === 'SCALAR')
    .map(({name}) => name)
    .join(',')
}

const buildMutationFields = (fields) => {
  return fields
    .filter(({type}) => type.ofType.kind === 'SCALAR')
    .filter(({name}) => name != 'id')
    .map(({name}) => `${name}: $${name}`)
    .join(',')
}

const firstLetterUpper = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const QUERIES = {
  'Category': 'categories'
}

export const buildQuery = introspectionResults => (raFetchType, resourceName, params) => {
    const resource = introspectionResults.queries.find(r =>{console.info('----', r.name, resourceName); return r.name === QUERIES[resourceName] } );
    const type = introspectionResults.types.find(r =>{console.info('----', r.name, resourceName); return r.name === resourceName } );
    console.info(raFetchType, params)
    const resourceNameCap = firstLetterUpper(resource.name)
    switch (raFetchType) {
        case 'CREATE': {
          return {
            query: gql`mutation create${resourceName}($data: Create${resourceName}Input!) {
              create${resourceName}(data: $data) {
                ${buildFieldList(type.fields)}
              }
            }`,
            variables: { data: params, ...params }, // params = { id: ... }
            parseResponse: response => response,
          }
        }
        case 'GET_ONE': {
          return {
            query: gql`query ${resourceName.toLowerCase()}($id: String) {
              ${resourceName.toLowerCase()}(id: $id) {
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
