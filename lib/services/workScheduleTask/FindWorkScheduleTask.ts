import { prisma } from "@lib/prisma";
import { z } from "zod";

const FindScheduleTask = z
  .function()
  .args(z.string().optional(), z.date().optional(), z.date().optional())
  .implement(async (workScheduleId, startDate, endDate) => {
    return prisma.workScheduleTask
      .findMany({
        where: {
          workScheduleId,
          startDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          schedule: true,
          users: true,
        },
        orderBy: {
          startDate: "asc",
        },
      })
      .catch(() => []);
  });

export default FindScheduleTask;
