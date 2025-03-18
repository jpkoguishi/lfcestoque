import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  produtoNome: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  produtoNome
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Fundo semi-transparente */}
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      {/* Modal */}
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full relative z-10">
        <h2 className="text-xl font-semibold text-gray-800">Confirmar Exclusão</h2>
        <p className="mt-2 text-gray-600">Tem certeza que deseja excluir o produto <strong>{produtoNome}</strong>?</p>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
