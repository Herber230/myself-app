import { HomePage } from '@presentation/pages/home';
import { PostsPage } from '@presentation/pages/posts';
import { ThemeProvider } from '@presentation/theming';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="posts" element={<PostsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
