import * as express from "express";
import * as cors from "cors";
import { connectDB } from "./database";
import roomRoute from "./route/rooms/rooms.routing";
import { connectSocket } from "./socket"

const startServer = () => {
    const app: express.Application = express();
    app.use(express.json());
    app.use(cors());

    app.use("/api/rooms", roomRoute);

    const port = process.env.PORT || 8000;
    const server = app.listen(port, () => console.log(`API Server is running at port ${port}.`));
    connectSocket(server);

};

(async () => {
    await connectDB();
    startServer();
})();
