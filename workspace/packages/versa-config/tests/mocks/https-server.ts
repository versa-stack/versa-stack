import https from "https";
import path from "path";
import fs from "fs";
import selfsigned from "selfsigned";

const attrs = [{ name: "commonName", value: "localhost" }];
const pems = selfsigned.generate(attrs, { days: 365 });

const options = {
  key: pems.private,
  cert: pems.cert,
};

const serverRoot = `${__dirname}/../files/served`;

const httpsServer = https.createServer(options, (req, res) => {
  if (!req.url) {
    res.statusCode = 404;
    res.end();
    return;
  }

  const filePath = path.join(serverRoot, req.url);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

export default httpsServer;
