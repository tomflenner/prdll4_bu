import {
  CreateUnavailability,
  FindUnavailability,
} from "@lib/services/unavailability";
import { NextApiHandler } from "next";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

const QueryGetSchema = z.object({
  startDate: z
    .string()
    .optional()
    .transform((value) => {
      if (value && value !== "") return new Date(value);
      else return undefined;
    }),
  endDate: z
    .string()
    .optional()
    .transform((value) => {
      if (value && value !== "") return new Date(value);
      else return undefined;
    }),
});

const BodyPostSchema = z.array(
  z.object({
    startDate: z.string().transform((value) => new Date(value)),
    endDate: z.string().transform((value) => new Date(value)),
  })
);

const handler: NextApiHandler = async (req, res) => {
  const { method } = req;
  const token = await getToken({
    req,
    encryption: true,
    signingKey: process.env.JWT_SIGNING_KEY,
    encryptionKey: process.env.JWT_ENCRYPTION_KEY,
    secret: process.env.JWT_SECRET,
  });

  const userId = token?.sub;

  switch (method) {
    case "GET": {
      if (userId) {
        const { startDate, endDate } = QueryGetSchema.parse(req.query);
        const data = await FindUnavailability(userId, startDate, endDate);
        res.json(data);
        break;
      }
    }
    case "POST": {
      if (userId) {
        const listUnavailability = BodyPostSchema.parse(req.body);
        const done = await Promise.all(
          listUnavailability.map(({ startDate, endDate }) =>
            CreateUnavailability(userId, startDate, endDate)
          )
        ).then((values) => values.every(Boolean));
        res.json({
          result: done,
        });
        break;
      }
    }
    default: {
      res.json({
        result: new Date().toISOString(),
      });
    }
  }
};

export default handler;