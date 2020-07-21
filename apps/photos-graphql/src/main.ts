/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import "reflect-metadata";
import { buildSchema } from 'type-graphql';
import { CategoryResolver } from './resolvers/CategoryResolver'; // add this
import  {connect } from './connection';
import { ApolloServer } from 'apollo-server-express';
import  express from 'express';
import cors from 'cors';

async function main() {
  const connection = await connect()
  try {
    const schema = await buildSchema({
      resolvers: [CategoryResolver]
    })
    const app = express();
    app.use(cors())
    const server = new ApolloServer({ schema, introspection: true })
    server.applyMiddleware({ app,  path: '/graphql' });
    await app.listen(4000)
    console.log("Server has started! 4000")
  } catch (err) {
    console.error('Error',err, err.message)
  }
}

main()
