import { useEffect, useState } from 'react';
import { query, ref, orderByChild, onValue } from 'firebase/database';
import { db } from 'lib/firebase';
import { FromQuestion } from 'types';

export const useQuestions = (): FromQuestion[] | undefined => {
  const [questions, setQuestions] = useState<FromQuestion[] | undefined>(
    undefined
  );
  useEffect(() => {
    const unsubscribe = onValue(
      query(ref(db, '/questions'), orderByChild('id')),
      (snapshot) => {
        if (snapshot.exists()) {
          const questions: FromQuestion[] = [];
          snapshot.forEach((data) => {
            questions.push(
              FromQuestion.parse({ ref: data.ref, ...data.val() })
            );
          });
          setQuestions(questions);
        } else {
          setQuestions(undefined);
        }
      }
    );

    return unsubscribe;
  }, []);

  return questions;
};
