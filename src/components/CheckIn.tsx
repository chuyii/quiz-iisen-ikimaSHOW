import { FC, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { UserId } from 'types';
import { z } from 'zod';

const Schema = z.object({ userId: UserId });

const CheckIn: FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof Schema>>({
    resolver: zodResolver(Schema),
  });

  const submit = useCallback(
    (data: z.input<typeof Schema>) => {
      navigate(`/user/${data.userId}`);
    },
    [navigate]
  );

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Check In
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(submit)}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            {...register('userId')}
            label="ユーザー名"
            error={Boolean(errors.userId)}
            helperText={errors.userId?.message}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          >
            Check In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CheckIn;
