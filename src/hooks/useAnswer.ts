import { useEffect, useState } from 'react';
import { query, ref, orderByChild, equalTo, onValue } from 'firebase/database';
import { db } from 'lib/firebase';
import { Countdown, FromAnswer, UserId } from 'types';

export const useAnswer = (
  userId: UserId,
  question: Countdown['question']
): FromAnswer | undefined => {
  const [answer, setAnswer] = useState<FromAnswer | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = onValue(
      query(ref(db, '/answers'), orderByChild('userId'), equalTo(userId)),
      (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((data) => {
            const answer = FromAnswer.parse({ ref: data.ref, ...data.val() });
            if (answer.questionId === question.id) setAnswer(answer);
          });
        }
      }
    );

    return unsubscribe;
  }, [question.id, userId]);

  return answer;
};
