import type { DatabaseReference, serverTimestamp } from 'firebase/database';
import { z } from 'zod';

export const Question = z.object({
  id: z.number().int(),
  text: z
    .string()
    .trim()
    .min(1)
    .refine((val) => new TextEncoder().encode(val).length < 128, {
      message: '文字数が多すぎます',
    }),
  seconds: z.number().int().positive(),
  min: z.number(),
  max: z.number(),
  step: z.number(),
  unit: z
    .string()
    .trim()
    .refine((val) => new TextEncoder().encode(val).length < 32, {
      message: '文字数が多すぎます',
    }),
});
// eslint-disable-next-line no-redeclare
export type ToQuestion = z.infer<typeof Question>;

// https://github.com/colinhacks/zod/issues/384
const DatabaseReferenceSchema = z.custom<DatabaseReference>();
// TODO: 本当はバリデーションしたいが DatabaseReference は
//       interface なのでどうしたものか

export const FromQuestion = z
  .object({
    ref: DatabaseReferenceSchema,
  })
  .merge(Question);
// eslint-disable-next-line no-redeclare
export type FromQuestion = z.infer<typeof FromQuestion>;

// eslint-disable-next-line no-redeclare
export type Question = ToQuestion | FromQuestion;

export const UserId = z
  .string()
  .min(1)
  .refine((val) => val === val.trim(), {
    message: '前後に余計な空白が含まれています',
  })
  .refine((val) => new TextEncoder().encode(val).length < 64, {
    message: '文字数が多すぎます',
  });
// eslint-disable-next-line no-redeclare
export type UserId = z.infer<typeof UserId>;

export const Answer = z.object({
  userId: UserId,
  questionId: Question.shape.id,
  answer: z.number(),
});
// eslint-disable-next-line no-redeclare
export type ToAnswer = z.infer<typeof Answer>;

export const FromAnswer = z
  .object({
    ref: DatabaseReferenceSchema,
  })
  .merge(Answer);
// eslint-disable-next-line no-redeclare
export type FromAnswer = z.infer<typeof FromAnswer>;

// eslint-disable-next-line no-redeclare
export type Answer = ToAnswer | FromAnswer;

export const Rating = z.object({
  userId: UserId,
  score: z.number(),
  rank: z.number().int().positive(),
  isTie: z.boolean(),
});
// eslint-disable-next-line no-redeclare
export type ToRating = z.infer<typeof Rating>;

export const FromRating = z
  .object({
    ref: DatabaseReferenceSchema,
  })
  .merge(Rating);
// eslint-disable-next-line no-redeclare
export type FromRating = z.infer<typeof FromRating>;

// eslint-disable-next-line no-redeclare
export type Score = ToRating | FromRating;

const CountdownBase = z.object({
  question: Question.omit({ text: true }),
});

const ServerTimestampSchema = z.custom<ReturnType<typeof serverTimestamp>>();

export const ToCountdown = CountdownBase.merge(
  z.object({
    startAt: ServerTimestampSchema,
  })
);
// eslint-disable-next-line no-redeclare
export type ToCountdown = z.infer<typeof ToCountdown>;

export const FromCountdown = CountdownBase.merge(
  z.object({
    startAt: z.number(),
  })
);
// eslint-disable-next-line no-redeclare
export type FromCountdown = z.infer<typeof FromCountdown>;

export type Countdown = ToCountdown | FromCountdown;
