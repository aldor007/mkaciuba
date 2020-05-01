/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { buildSchema } from 'type-graphql';
import { CategoryResolver } from './resolvers/CategoryResolver'; // add this
import  {connect } from './connection';

async function main() {
  const connection = await connect()
  try {
    const schema = await buildSchema({
      resolvers: [CategoryResolver] 
    })
    const server = new ApolloServer({ schema })
    await server.listen(4000)
    console.log("Server has started! 4000")
  } catch (err) {
    console.error('Error',err, err.message)
  }
}

main()