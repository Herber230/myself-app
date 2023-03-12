import { ThemeProvider } from '@presentation/theming';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function Loading() {
  return <h1>Loading...</h1>;
}

const routes = [
  {
    index: true,
    page: lazy(() => import('@presentation/pages/home')),
  },
  {
    path: 'about-repo',
    page: lazy(() => import('@presentation/pages/about-repo')),
  },
  {
    path: 'blog',
    page: lazy(() => import('@presentation/pages/blog')),
  },
  {
    path: 'career',
    page: lazy(() => import('@presentation/pages/career')),
  },
  {
    path: 'cv',
    page: lazy(() => import('@presentation/pages/curriculum-vitae')),
  },
  {
    path: 'tech-radar',
    page: lazy(() => import('@presentation/pages/tech-radar')),
  },
];

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {routes.map(({ index, path, page: Page }) => (
            <Route
              key={`route-${path ?? 'index'}`}
              index={index}
              path={path}
              element={
                <Suspense fallback={<Loading />}>
                  <Page />
                </Suspense>
              }
            />
          ))}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
