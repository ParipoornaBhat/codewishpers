import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"

export const functionRouter = createTRPCRouter({
  fn1: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] ** 2),
  fn2: publicProcedure.input(z.tuple([z.number(), z.number()])).mutation(({ input }) => input[0] + input[1]),
  fn3: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] ** 3),
  fn4: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] * 2),
  fn5: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] / 2),
  fn6: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => Math.sqrt(input[0])),
  fn7: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] % 2 === 0),
  fn8: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] % 2 !== 0),
  fn9: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] > 0),
  fn10: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] * 10),
  fn11: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => -input[0]),
  fn12: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => Math.abs(input[0])),
  fn13: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] + 1),
  fn14: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] - 1),
  fn15: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] * 0.1),
  fn16: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] ** 4),
  fn17: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => Math.log10(input[0])),
  fn18: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => Math.round(input[0])),
  fn19: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => Math.floor(input[0])),
  fn20: publicProcedure.input(z.tuple([z.number()])).mutation(({ input }) => input[0] < 0),
})
