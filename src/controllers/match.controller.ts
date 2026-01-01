import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  JoinMatchSchema,
  LeaveMatchSchema,
  FeedbackSchema,
  MarkMatchEndSchema,
} from "../schemas/match.schema";
import { join, leave, submitFeedback, markMatchEnd } from "../services/match";
import * as redis from "../clients/redis";

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
      redis: redis,
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
    const response = await leave(payload.userId, { redis: redis });
    return reply.send(response);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const submitMatchFeedback = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const result = FeedbackSchema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send({
      message: "Invalid feedback payload",
      errors: result.error.flatten(),
    });
  }

  try {
    const response = await submitFeedback(result.data, { redis: redis });
    return reply.send(response);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const markMatchAsEnded = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const result = MarkMatchEndSchema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send({
      message: "Invalid payload",
      errors: result.error.flatten(),
    });
  }

  const { matchId, userId, reason } = result.data;

  try {
    const response = await markMatchEnd(matchId, userId, reason, {
      redis: redis,
    });
    return reply.send(response);
  } catch (error: any) {
    if (error.message === "Match not found") {
      return reply.status(404).send({ message: "Match not found" });
    }
    request.log.error(error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};
