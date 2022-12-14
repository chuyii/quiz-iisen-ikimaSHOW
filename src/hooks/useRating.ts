import { useEffect, useState } from 'react';
import { query, ref, orderByChild, equalTo, onValue } from 'firebase/database';
import { db } from 'lib/firebase';
import { FromRating } from 'types';

export const useRating = (
  userId: FromRating['userId'] | undefined
): FromRating | undefined => {
  const [rating, setRating] = useState<FromRating | undefined>(undefined);
  useEffect(() => {
    if (userId === undefined) return;

    const unsubscribe = onValue(
      query(ref(db, `/ratings`), orderByChild('userId'), equalTo(userId)),
      (snapshot) => {
        if (snapshot.exists()) {
          // 配列を用意しているが、1つしか入らないことを想定
          const scores: FromRating[] = [];
          snapshot.forEach((data) => {
            scores.push(FromRating.parse({ ref: data.ref, ...data.val() }));
          });
          setRating(scores[0]);
        } else {
          // 存在しない場合・削除された場合
          setRating(undefined);
        }
      }
    );

    return unsubscribe;
  }, [userId]);

  return rating;
};
