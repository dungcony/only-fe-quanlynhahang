import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ToastProvider } from '@/components/ui/Toast';
import '@/mock/mockStorage';
import { resetToDefaultData } from '@/mock/mockStorage';
import './index.css';

// gắn hàm reset dữ liệu mẫu vào đối tượng window để dễ dàng kiểm thử trong console
if (typeof window !== 'undefined') {
  (window as unknown as { resetDemoData: () => void }).resetDemoData = () => {
    resetToDefaultData();
    window.location.reload();
  };
}

// khởi tạo client quản lý cache và query state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
