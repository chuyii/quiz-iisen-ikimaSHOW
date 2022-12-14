import { FC, useCallback, useMemo, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import {
  set,
  query,
  ref,
  orderByChild,
  serverTimestamp,
  get,
  equalTo,
} from 'firebase/database';
import { useQuestionWithCountdown } from 'hooks/useQuestionWithCountdown';
import { useQuestions } from 'hooks/useQuestions';
import { db } from 'lib/firebase';
import QRCode from 'react-qr-code';
import { FromAnswer, FromQuestion, Question, ToCountdown } from 'types';

type STATE =
  | { state: '' }
  | { state: 'OPEN'; question: FromQuestion }
  | { state: 'ANSWER'; question: FromQuestion }
  | { state: 'RESULT'; question: FromQuestion; answers: FromAnswer[] }
  | { state: 'FINAL_RESULT' };

const ProjectorScreen: FC = () => {
  const [state, setState] = useState<STATE>({ state: '' });
  const questions = useQuestions();

  const qr = useMemo(
    () => <QRCode value={new URL(window.location.href).origin} />,
    []
  );

  const { timeLeft, setTimeLeft } = useQuestionWithCountdown();

  const start = useCallback(() => {
    if (state.state !== '') return;
    if (questions === undefined) return;
    setState({ state: 'OPEN', question: questions[0] });
  }, [questions, state.state]);

  const answerStart = useCallback(async () => {
    if (state.state !== 'OPEN') return;
    await set(
      ref(db, 'countdown'),
      ToCountdown.parse({
        startAt: serverTimestamp(),
        question: Question.partial().parse({
          id: state.question.id,
          seconds: state.question.seconds,
          min: state.question.min,
          max: state.question.max,
          step: state.question.step,
          unit: state.question.unit,
        }),
      })
    );
    setState({ state: 'ANSWER', question: state.question });
    setTimeLeft(state.question.seconds);
  }, [setTimeLeft, state]);

  const calcResult = useCallback(async () => {
    if (state.state !== 'ANSWER') return;
    if (questions === undefined) return;
    const snapshot = await get(
      query(
        ref(db, `/answers`),
        orderByChild('questionId'),
        equalTo(state.question.id)
      )
    );
    if (snapshot.exists()) {
      const answers: FromAnswer[] = [];
      snapshot.forEach((data) => {
        answers.push(FromAnswer.parse({ ref: data.ref, ...data.val() }));
      });
      setState({ state: 'RESULT', question: state.question, answers });
    } else {
      setState({ state: 'RESULT', question: state.question, answers: [] });
    }
  }, [questions, state]);

  const nextQuestion = useCallback(() => {
    if (state.state !== 'RESULT') return;
    if (questions === undefined) return;
    const currentIndex = questions.findIndex(
      (question) => question.id === state.question.id
    );
    if (currentIndex === questions.length - 1) return;
    setState({ state: 'OPEN', question: questions[currentIndex + 1] });
  }, [questions, state]);

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
        {state.state === 'OPEN' ? (
          <>
            <Typography component="h1" variant="h4">
              {state.question.id < 0 ? '練習問題' : `第${state.question.id}問`}
            </Typography>
            <Typography component="p" variant="h5">
              {state.question.text}
            </Typography>
            <Typography component="p" variant="h5">
              最小値: {state.question.min}
            </Typography>
            <Typography component="p" variant="h5">
              最大値: {state.question.max}
            </Typography>
            <Typography component="p" variant="h5">
              きざみ: {state.question.step}
            </Typography>
            <Button variant="contained" onClick={answerStart}>
              開始
            </Button>
            <Box sx={{ mt: 3 }}>{qr}</Box>
          </>
        ) : state.state === 'ANSWER' ? (
          <>
            <Typography component="h1" variant="h4">
              {state.question.id < 0 ? '練習問題' : `第${state.question.id}問`}
              -回答期間
            </Typography>
            <Typography component="p" variant="h5">
              {state.question.text}
            </Typography>
            <Typography component="p" variant="h5">
              最小値: {state.question.min}
            </Typography>
            <Typography component="p" variant="h5">
              最大値: {state.question.max}
            </Typography>
            <Typography component="p" variant="h5">
              きざみ: {state.question.step}
            </Typography>
            {timeLeft > 0 ? (
              <Typography component="p" variant="h5">
                残り時間: {timeLeft}秒
              </Typography>
            ) : (
              <Button variant="contained" onClick={calcResult}>
                集計
              </Button>
            )}
            <Box sx={{ mt: 3 }}>{qr}</Box>
          </>
        ) : state.state === 'RESULT' ? (
          <>
            <Typography component="h1" variant="h4">
              {state.question.id < 0 ? '練習問題' : `第${state.question.id}問`}
              -結果発表
            </Typography>
            <Typography component="p" variant="h5">
              {state.question.text}
            </Typography>
            <Typography component="p" variant="h5">
              最小値: {state.question.min}
            </Typography>
            <Typography component="p" variant="h5">
              最大値: {state.question.max}
            </Typography>
            <Typography component="p" variant="h5">
              きざみ: {state.question.step}
            </Typography>
            {state.answers.map((answer) => (
              <Typography component="p" variant="h5" key={answer.ref.key}>
                {`${answer.userId}: ${answer.answer}`}
              </Typography>
            ))}
            <Button variant="contained" onClick={nextQuestion}>
              次の問題へ
            </Button>
          </>
        ) : state.state === 'FINAL_RESULT' ? (
          <>
            <Typography component="h1" variant="h4">
              最終結果
            </Typography>
          </>
        ) : (
          <>
            <Typography component="h1" variant="h4">
              待機
            </Typography>
            <Typography component="p" variant="h5">
              開始までしばらくお待ちください
            </Typography>
            <Button variant="contained" onClick={start}>
              開始
            </Button>
            <Box sx={{ mt: 3 }}>{qr}</Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default ProjectorScreen;
