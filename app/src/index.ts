import * as express from "express";
import * as cors from "cors";
import { connectDB } from "./database";
import roomRoute from "./route/rooms/rooms.routing";
import bbsRoute from "./route/bbs/bbs.routing";
import { createServer } from "http";
import { startSocketServer } from "./socket";

const startServer = () => {
    const app: express.Application = express();
    app.use(express.json());
    app.use(cors());

    app.use("/api/rooms", roomRoute);
    app.use("/api/bbs", bbsRoute);

    const port = process.env.PORT || 8000;

    const httpServer = createServer(app);

    startSocketServer(httpServer);

    httpServer.listen(port, () => {
        console.log(`Server listen on ${port}`);
    });
};

(async () => {
    await connectDB();
    startServer();
})();
