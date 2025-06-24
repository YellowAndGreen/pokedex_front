import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CategoryList from './components/CategoryList';
import CategoryDetail from './components/CategoryDetail';
import AnalyticsPage from './components/AnalyticsPage';
import LoginPage from './components/LoginPage';
import TagPage from './components/TagPage'; // Import TagPage
import { CategoryProvider } from './contexts/CategoryContext';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        {' '}
        {/* AuthProvider moved here, inside HashRouter */}
        <CategoryProvider>
          <Layout>
            <Routes>
              <Route path='/' element={<CategoryList />} />
              <Route path='/categories' element={<Navigate to='/' replace />} />
              <Route path='/categories/:categoryId' element={<CategoryDetail />} />
              <Route path='/tags/:tagName' element={<TagPage />} /> {/* Add TagPage route */}
              <Route path='/species' element={<AnalyticsPage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </Layout>
        </CategoryProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
