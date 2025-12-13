import { config } from "dotenv";
import { z } from "zod";

config();

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.string().default("info"),
});

export const env = EnvSchema.parse(process.env);

export type Env = typeof env;
