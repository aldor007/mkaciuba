module.exports = ({ env }) => ({
  settings: {
    cors: {
      origin: ['*'], //allow all origins
      headers: ['*'], //allow all headers
    }
  }
});