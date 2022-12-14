import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Admin from 'components/Admin';
import CheckIn from 'components/CheckIn';
import ProjectorScreen from 'components/ProjectorScreen';
import User from 'components/User';

export const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path="user">
        <Route path=":userId" element={<User />} />
      </Route>
      <Route path="admin" element={<Admin />} />
      <Route path="screen" element={<ProjectorScreen />} />
      <Route path="/" element={<CheckIn />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
