import { HomePage } from '@pages/home';
import { PostsPage } from '@pages/posts';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="posts" element={<PostsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
