const http = require("http");
const { DaprClient, CommunicationProtocolEnum } = require("@dapr/dapr");

const port = 3000;

async function start() {
  const client = new DaprClient();

  var result = await client.state.get("statestore", "message");

  return result;
}

const server = http.createServer((req, res) => {
  start()
    .then((data) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end(
        data
          ? `Your state from Redis: ${data}`
          : "There is no data stored in Redis"
      );
    })
    .catch((err) => {
      res.statusCode = 400;
      res.setHeader("Content-Type", "text/plain");
      res.end(`An error occurred: ${err}`);
    });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
