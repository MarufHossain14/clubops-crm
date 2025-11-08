import React from "react";
import ReactDOM from "react-dom";
import Header from "../Header";
import { X } from "lucide-react";

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  name: string;
};

const Modal = ({ children, isOpen, onClose, name }: Props) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close modal when clicking on the backdrop (not on the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl transition-all dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <Header
          name={name}
          buttonComponent={
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              onClick={onClose}
              type="button"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          }
          isSmallText
        />
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
