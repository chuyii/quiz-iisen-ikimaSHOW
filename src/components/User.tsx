import { FC, useMemo } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useQuestionWithCountdown } from 'hooks/useQuestionWithCountdown';
import { useRating } from 'hooks/useRating';
import { Navigate, useParams } from 'react-router-dom';
import { UserId } from 'types';
import AnswerForm from 'components/AnswerForm';

const User: FC = () => {
  const { userId: rawUserId } = useParams();
  const userId = useMemo(() => {
    const parseResult = UserId.safeParse(rawUserId);
    if (parseResult.success) {
      return parseResult.data;
    }
  }, [rawUserId]);

  const rating = useRating(userId);
  const { timeLeft, question } = useQuestionWithCountdown();

  if (userId === undefined) return <Navigate to="/" replace />;

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
        <Typography component="h1" variant="h4">
          {userId}
        </Typography>
        {rating && (
          <>
            <Typography component="p" variant="h6">
              score: {rating.score}
            </Typography>
            <Typography component="p" variant="h6">
              rank: {rating.rank}
              {rating.isTie && 'タイ'}
            </Typography>
          </>
        )}
        {question === undefined ? (
          <Typography component="p" variant="h6">
            現在回答は受け付けていません
          </Typography>
        ) : timeLeft === 0 ? (
          <Typography component="p" variant="h6">
            {question.id < 0 ? '練習問題' : `問題${question.id}`}
            の回答は締め切りました
          </Typography>
        ) : (
          <>
            <Typography component="p" variant="h6">
              残り時間: {timeLeft}秒
            </Typography>
            <AnswerForm {...{ userId, question }} />
          </>
        )}
      </Box>
    </Container>
  );
};

export default User;
