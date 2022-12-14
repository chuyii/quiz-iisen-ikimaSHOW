import { FC } from 'react';
import { AppProvider } from 'providers/app';
import { AppRoutes } from 'routes';

const App: FC = () => {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
};

export default App;
