import * as express from "express";
import * as http from "http";

const app = express();
const port = 8080 || process.env.PORT;
app.set("port", port);

app.use(express.static("dist"));

const server = http.createServer(app);

server.listen(8080, function() {
  console.log("server started" + port);
})

server.on("error", (e) => console.error(e));
