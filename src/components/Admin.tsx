import { FC, useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  ref,
  remove,
  push,
  onValue,
  query,
  orderByChild,
} from 'firebase/database';
import { db } from 'lib/firebase';
import { useFieldArray, useForm } from 'react-hook-form';
import { Question } from 'types';
import { z } from 'zod';

const Schema = z.object({ questions: Question.array() });
// eslint-disable-next-line no-redeclare
type Schema = z.infer<typeof Schema>;

const Admin: FC = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(Schema),
  });
  const {
    fields,
    append,
    remove: fremove,
  } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    const unsubscribe = onValue(
      query(ref(db, `/questions`), orderByChild('id')),
      (snapshot) => {
        if (snapshot.exists()) {
          fremove();
          snapshot.forEach((data) => {
            append(Question.parse(data.val()));
          });
        }
      }
    );

    return unsubscribe;
  }, [append, fremove]);

  const submit = useCallback(async (data: Schema) => {
    await remove(ref(db, '/questions'));
    const { questions } = data;
    for (const question of questions) {
      await push(ref(db, '/questions'), question);
    }
  }, []);

  return (
    <Container component="main">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Admin
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(submit)}
          noValidate
          sx={{ mt: 1 }}
        >
          {fields.map((field, index) => (
            <Grid container spacing={1} key={index}>
              <Grid item xs={2}>
                <TextField
                  {...register(`questions.${index}.id`, {
                    valueAsNumber: true,
                  })}
                  error={Boolean(errors.questions?.[index]?.id)}
                  helperText={errors.questions?.[index]?.id?.message}
                  fullWidth
                  label="ID"
                  type="number"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={10}>
                <TextField
                  {...register(`questions.${index}.text`)}
                  error={Boolean(errors.questions?.[index]?.text)}
                  helperText={errors.questions?.[index]?.text?.message}
                  fullWidth
                  label="問題文"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  {...register(`questions.${index}.seconds`, {
                    valueAsNumber: true,
                  })}
                  error={Boolean(errors.questions?.[index]?.seconds)}
                  helperText={errors.questions?.[index]?.seconds?.message}
                  fullWidth
                  label="回答時間"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">秒</InputAdornment>
                    ),
                  }}
                  type="number"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  {...register(`questions.${index}.min`, {
                    valueAsNumber: true,
                  })}
                  error={Boolean(errors.questions?.[index]?.min)}
                  helperText={errors.questions?.[index]?.min?.message}
                  fullWidth
                  label="最小値"
                  type="number"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  {...register(`questions.${index}.max`, {
                    valueAsNumber: true,
                  })}
                  error={Boolean(errors.questions?.[index]?.max)}
                  helperText={errors.questions?.[index]?.max?.message}
                  fullWidth
                  label="最大値"
                  type="number"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  {...register(`questions.${index}.step`, {
                    valueAsNumber: true,
                  })}
                  error={Boolean(errors.questions?.[index]?.step)}
                  helperText={errors.questions?.[index]?.step?.message}
                  fullWidth
                  label="きざみ"
                  type="number"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  {...register(`questions.${index}.unit`)}
                  error={Boolean(errors.questions?.[index]?.unit)}
                  helperText={errors.questions?.[index]?.unit?.message}
                  fullWidth
                  label="単位"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  onClick={() => fremove(index)}
                  fullWidth
                  sx={{ mt: 3, mb: 2 }}
                >
                  削除
                </Button>
              </Grid>
            </Grid>
          ))}
          <Button
            variant="contained"
            onClick={() =>
              append({
                id: 0,
                text: '',
                seconds: 30,
                min: 0,
                max: 0,
                step: 1,
                unit: '',
              })
            }
            fullWidth
            sx={{ mt: 1, mb: 1 }}
          >
            追加
          </Button>
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mt: 1, mb: 3 }}
          >
            送信
          </Button>
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={3}>
            <Button
              variant="contained"
              onClick={async () => {
                await remove(ref(db, '/questions'));
                console.log('all questions were deleted');
              }}
              fullWidth
              sx={{ mt: 1, mb: 1 }}
            >
              delete questions
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              onClick={async () => {
                await remove(ref(db, '/answers'));
                console.log('all answers were deleted');
              }}
              fullWidth
              sx={{ mt: 1, mb: 1 }}
            >
              delete answers
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              onClick={async () => {
                await remove(ref(db, '/ratings'));
                console.log('all ratings were deleted');
              }}
              fullWidth
              sx={{ mt: 1, mb: 1 }}
            >
              delete ratings
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              onClick={async () => {
                await remove(ref(db, '/countdown'));
                console.log('countdown was deleted');
              }}
              fullWidth
              sx={{ mt: 1, mb: 1 }}
            >
              delete countdown
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Admin;
