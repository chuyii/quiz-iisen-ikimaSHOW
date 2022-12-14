import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from 'lib/firebase';
import { FromCountdown } from 'types';

export const useQuestionWithCountdown = (): {
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  question: FromCountdown['question'] | undefined;
} => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [question, setQuestion] = useState<
    FromCountdown['question'] | undefined
  >(undefined);
  useEffect(() => {
    let serverTimeOffset = 0;
    const unsubscribe1 = onValue(
      ref(db, '.info/serverTimeOffset'),
      (snapshot) => {
        serverTimeOffset = snapshot.val() as number;
      }
    );
    let timer: ReturnType<typeof setInterval>;
    const unsubscribe2 = onValue(ref(db, '/countdown'), (snapshot) => {
      if (snapshot.exists()) {
        const val = FromCountdown.parse(snapshot.val());
        const startAt = val.startAt;
        clearInterval(timer);
        timer = setInterval(() => {
          const timeLeft =
            val.question.seconds * 1000 -
            (Date.now() + serverTimeOffset - startAt);
          if (timeLeft < 0) {
            setTimeLeft(0);
            clearInterval(timer);
          } else {
            const seconds = Math.ceil(timeLeft / 1000);
            timeLeft !== seconds && setTimeLeft(seconds);
            question?.id !== val.question.id && setQuestion(val.question);
          }
        }, 100);
      } else {
        setTimeLeft(0);
        setQuestion(undefined);
      }
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
      clearInterval(timer);
    };
  }, [question]);

  return { timeLeft, setTimeLeft, question };
};
