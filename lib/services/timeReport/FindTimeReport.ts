import { prisma } from "@lib/prisma";
import { z } from "zod";

const FindTimeReport = z
  .function()
  .args(
    z.string(),
    z.date().optional(),
    z.date().optional(),
    z.boolean().optional()
  )
  .implement(async (userId, startDate = new Date(1970), endDate, validated) => {
    return prisma.timeReport
      .findMany({
        where: {
          userId,
          validated,
          OR: [
            {
              startDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              endDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              AND: [
                {
                  startDate: {
                    lte: startDate,
                  },
                },
                {
                  endDate: {
                    gte: endDate,
                  },
                },
              ],
            },
          ],
        },
        include: {
          workScheduleTasks: true,
          internalWorks: true,
          extraItems: true,
          user: {
            select: {
              id: true,
              username: true,
              password: false,
              full_name: true,
              role: true,
              active: true,
            },
          },
        },
        orderBy: [
          {
            endDate: "desc",
          },
          {
            startDate: "desc",
          },
        ],
      })
      .catch(() => []);
  });

export default FindTimeReport;
