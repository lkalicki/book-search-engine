const path = require('path');
const express = require('express');
const { typeDefs, resolvers } = require("./schemas");
const db = require('./config/connection');
const routes = require('./routes');

const { ApolloServer } = require("apollo-server-express");
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });
  await server.start();
  server.applyMiddleware({ app });
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

startServer();

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

 app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`Now listening on localhost:${PORT}`));
});
