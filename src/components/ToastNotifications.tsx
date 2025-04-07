'use client';  // Isso é necessário para que funcione no Next.js 13+ com App Router

import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Funções de notificação de sucesso e erro com estilos personalizados
const successToast = (message: string): void => {
  const toastOptions: ToastOptions = {
    position: "bottom-right",
    autoClose: 2000, // tempo em milissegundos
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };
  toast.success(message, toastOptions);
};

const errorToast = (message: string): void => {
  const toastOptions: ToastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };
  toast.error(message, toastOptions);
};

const ToastNotifications: React.FC = () => {
  return (
    <>
      <ToastContainer />
    </>
  );
};

export { ToastNotifications, successToast, errorToast };
