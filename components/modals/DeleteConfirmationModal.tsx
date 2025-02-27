"use client";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
        <h3 className='text-lg font-semibold mb-2'>Delete Listing</h3>
        <p className='text-gray-600 mb-4'>
          Are you sure you want to delete this listing? This action cannot be
          undone.
        </p>
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg'
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
