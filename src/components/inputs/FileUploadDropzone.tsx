
export type FileUploadState = 'empty' | 'dragging' | 'uploaded' | 'error';

export interface FileUploadDropzoneProps {
  label?: string;
  description?: string;
  supportedFormats?: string;
  maxSizeText?: string;
  state?: FileUploadState;
  fileName?: string;
  error?: string;
  onBrowsePress?: () => void;
  className?: string;
}

const stateClasses: Record<FileUploadState, string> = {
  empty: 'border-gray-300 bg-white',
  dragging: 'border-blue-700 bg-indigo-50',
  uploaded: 'border-green-500 bg-green-50',
  error: 'border-red-500 bg-red-50',
};

const stateIcons: Record<FileUploadState, string> = {
  empty: '📁',
  dragging: '📁',
  uploaded: '✅',
  error: '⚠️',
};

export function FileUploadDropzone({
  label,
  description = 'Drag and drop files here or',
  supportedFormats = 'PDF, JPG, PNG',
  maxSizeText = 'Max file size: 10MB',
  state = 'empty',
  fileName,
  error,
  onBrowsePress,
  className = '',
}: FileUploadDropzoneProps) {
  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>}
      <div
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px]
          ${stateClasses[state]}`}
      >
        <span className="text-3xl mb-3">{stateIcons[state]}</span>
        {state === 'uploaded' && fileName ? (
          <p className="text-sm font-medium text-gray-900 text-center">{fileName}</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 text-center mb-2">{description}</p>
            <button
              type="button"
              className="text-sm font-semibold text-blue-700 hover:underline mb-3"
              onClick={onBrowsePress}
            >
              browse
            </button>
            <div className="flex flex-row items-center gap-2">
              <span className="text-xs text-gray-400">{supportedFormats}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{maxSizeText}</span>
            </div>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
