const http = require("http");
const { DaprClient, CommunicationProtocolEnum } = require("@dapr/dapr");

const host = {
  address: "127.0.0.1",
  appPort: 3000,
  daprPort: 3601,
};

async function start() {
  const client = new DaprClient(
    host.address,
    host.daprPort,
    CommunicationProtocolEnum.HTTP
  );
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

server.listen(host.appPort, () => {
  console.log(`Server running on port ${host.appPort}`);
});
