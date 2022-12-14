import { FC, useCallback, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Container,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { push, ref, update } from 'firebase/database';
import { useAnswer } from 'hooks/useAnswer';
import { db } from 'lib/firebase';
import { useForm } from 'react-hook-form';
import { Answer, Countdown, UserId } from 'types';
import { z } from 'zod';

type Props = {
  userId: UserId;
  question: Countdown['question'];
};

const AnswerForm: FC<Props> = ({ userId, question }) => {
  const Schema = useMemo(() => {
    return z.object({
      answer: z
        .number()
        .min(question.min)
        .max(question.max)
        .multipleOf(question.step),
    });
  }, [question.max, question.min, question.step]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof Schema>>({
    resolver: zodResolver(Schema),
  });

  const answer = useAnswer(userId, question);
  const submit = useCallback(
    async (data: z.input<typeof Schema>) => {
      if (answer === undefined) {
        await push(
          ref(db, 'answers'),
          Answer.parse({
            userId,
            questionId: question.id,
            answer: data.answer,
          })
        );
      } else {
        await update(
          answer.ref,
          Answer.partial().parse({ answer: data.answer })
        );
      }
    },
    [answer, question.id, userId]
  );

  return (
    <Container>
      <Typography component="p" variant="h4">
        {question.id < 0 ? '練習問題' : `第${question.id}問`}
      </Typography>
      <Typography component="p" variant="h6">
        現在の回答:{' '}
        {answer === undefined ? 'なし' : `${answer.answer}${question.unit}`}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(submit)}
        noValidate
        sx={{ mt: 1 }}
      >
        <TextField
          {...register('answer', { valueAsNumber: true })}
          error={Boolean(errors.answer)}
          helperText={errors.answer?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{question.unit}</InputAdornment>
            ),
          }}
          inputProps={{ step: question.step }}
          fullWidth
          type="number"
          margin="normal"
        />
        <Button
          variant="contained"
          type="submit"
          fullWidth
          sx={{ mt: 3, mb: 2 }}
        >
          送信
        </Button>
      </Box>
    </Container>
  );
};

export default AnswerForm;
