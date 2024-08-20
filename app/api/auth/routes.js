"use strict";
import controller from "./controller.js";
import userController from "../users/controller.js";
import { schema } from "./schema.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/login",
    { schema: schema.login },
    controller.verifyUserCredentials
  );
  fastify.post("/signup", { schema: schema.signup }, controller.createNewUser);
  fastify.post("/refresh", {}, controller.verifyRefreshToken);
  fastify.post("/username", {}, userController.checkUsername);
  fastify.post("/:token", {}, userController.resetPassword);
}
