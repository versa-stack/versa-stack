import http, { Server } from "http";
import st from "st";

const server = http.createServer(st(`${__dirname}/../files/served`));

export default server;