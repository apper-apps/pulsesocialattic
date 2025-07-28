import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { NotificationProvider } from "@/contexts/NotificationContext";
import "@/index.css";
import Layout from "@/components/organisms/Layout";
import HomePage from "@/components/pages/HomePage";
import SettingsPage from "@/components/pages/SettingsPage";
import ProfilePage from "@/components/pages/ProfilePage";
import PostDetailPage from "@/components/pages/PostDetailPage";

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
        />
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;