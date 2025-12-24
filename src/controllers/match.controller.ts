import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { JoinMatchSchema, LeaveMatchSchema } from "../schemas/match.schema";
import { join, leave } from "../services/match";
import * as redisMock from "../integrationTests/mocks/redisMock";

type JoinMatchPayload = z.infer<typeof JoinMatchSchema>;
type LeaveMatchPayload = z.infer<typeof LeaveMatchSchema>;

export const joinMatch = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const result = JoinMatchSchema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send({
      message: "Invalid join payload",
      errors: result.error.flatten(),
    });
  }

  const payload: JoinMatchPayload = result.data;

  try {
    const response = await join(payload.userId, payload.mode, payload.prefs, {
      redis: redisMock,
    });
    return reply.send(response);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const leaveMatch = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const result = LeaveMatchSchema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send({
      message: "Invalid leave payload",
      errors: result.error.flatten(),
    });
  }

  const payload: LeaveMatchPayload = result.data;

  try {
    const response = await leave(payload.userId, { redis: redisMock });
    return reply.send(response);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};
