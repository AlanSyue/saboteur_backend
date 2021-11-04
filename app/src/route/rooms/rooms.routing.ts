import { Router } from "express";
import * as controller from "./rooms.controller";

const roomsRoute = Router();

roomsRoute.route("/:id")
    .get(controller.getRoomInfo)
    .post(controller.startGame);
roomsRoute.route("/").post(controller.create);
roomsRoute.route("/:id/players").post(controller.joinPlayers);
roomsRoute.route("/:id/players/:name").get(controller.getPlayerInfo);
roomsRoute.route("/:id/players/:name/cards").post(controller.putCard);
roomsRoute.route("/:id/players/:name/cards/delete").post(controller.deleteCard);
roomsRoute.route("/:id/players/:name/tools").post(controller.updateTools);


export default roomsRoute;
