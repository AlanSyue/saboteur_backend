import { Router } from "express";
import * as controller from "./bbs.controller";

const bbsRoute = Router();

bbsRoute.route("/")
    .get(controller.getData)
    .post(controller.create);

export default bbsRoute;
