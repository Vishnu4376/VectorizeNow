import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

// Define the GraphQL mutation for uploading an image
const UPLOAD_IMAGE_MUTATION = gql`
  mutation UploadImage($imageData: String!) {
    uploadImage(imageData: $imageData) {
      id
      svgCode
    }
  }
`;

function App() {
  const [selectedFile, setSelectedFile] = useState(null); // State to store the selected image file object
  const [base64Image, setBase64Image] = useState(''); // State to store the base64 encoded image string for upload
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // State to store the data URL for image preview
  const [svgResult, setSvgResult] = useState(''); // State to store the received SVG code
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages

  // useMutation hook from Apollo Client to execute the GraphQL mutation
  const [uploadImage] = useMutation(UPLOAD_IMAGE_MUTATION, {
    onCompleted: (data) => {
      // This callback runs when the mutation is successful
      setLoading(false);
      setError(null);
      if (data && data.uploadImage && data.uploadImage.svgCode) {
        setSvgResult(data.uploadImage.svgCode);
        console.log('SVG received:', data.uploadImage.svgCode);
      } else {
        setError('No SVG code received from the server.');
      }
    },
    onError: (apolloError) => {
      // This callback runs if there's an error with the GraphQL request
      setLoading(false);
      console.error('GraphQL Error:', apolloError);
      setError(`Error: ${apolloError.message}`);
    },
  });

  // Handler for when a file is selected
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null); // Clear previous errors
      setSvgResult(''); // Clear previous SVG result

      // Convert the selected file to base64 for upload and data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result will be in the format "data:image/png;base64,iVBORw..."
        setImagePreviewUrl(reader.result); // Use full data URL for preview
        const base64String = reader.result.split(',')[1]; // Get only the base64 part for upload
        setBase64Image(base64String);
        console.log('Image converted to base64 for upload and preview.');
      };
      reader.onerror = (readerError) => {
        console.error('FileReader error:', readerError);
        setError('Failed to read file.');
        setImagePreviewUrl(null);
        setBase64Image('');
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    } else {
      setSelectedFile(null);
      setBase64Image('');
      setImagePreviewUrl(null);
      setSvgResult('');
    }
  };

  // Handler for the upload button click
  const handleUpload = async () => {
    if (!base64Image) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setSvgResult(''); // Clear previous SVG
    setError(null); // Clear previous errors

    try {
      // Execute the mutation with the base64 image data
      await uploadImage({ variables: { imageData: base64Image } });
    } catch (e) {
      // Errors are primarily handled by onError callback of useMutation,
      // but this catch block can handle network errors before Apollo processes them.
      console.error('Upload initiation error:', e);
      setError(`Failed to initiate upload: ${e.message}`);
      setLoading(false);
    }
  };

  // Handler for downloading the SVG file
  const handleDownloadSvg = () => {
    if (svgResult) {
      const blob = new Blob([svgResult], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated_image.svg'; // Default filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the object URL
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl max-w-xl w-full text-center transform transition-all duration-300 hover:scale-105">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-4">
          VectorizeNow
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Image to SVG Converter
          <span className="block text-sm text-gray-500">(StarVector Simulation)</span>
        </p>

        <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
          <label htmlFor="file-upload" className="cursor-pointer">
            <input
              id="file-upload"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              className="hidden" // Hide the default file input
            />
            <div className="flex flex-col items-center justify-center p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8"
                />
              </svg>
              <p className="text-gray-600 text-base">
                {selectedFile ? (
                  <span className="font-semibold text-blue-600">{selectedFile.name}</span>
                ) : (
                  <>
                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG or JPEG (max 5MB)</p>
            </div>
          </label>

          {imagePreviewUrl && (
            <div className="mt-4 p-2 border border-gray-200 rounded-md bg-white">
              <h2 className="text-md font-semibold text-gray-700 mb-2">Image Preview:</h2>
              <img
                src={imagePreviewUrl}
                alt="Selected Preview"
                className="max-w-full h-auto rounded-md object-contain mx-auto border border-gray-300"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !selectedFile}
          className={`w-full py-3 px-6 rounded-full text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center
            ${loading || !selectedFile ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Converting...
            </>
          ) : (
            'Convert to SVG'
          )}
        </button>

        {error && (
          <p className="mt-4 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200">{error}</p>
        )}

        {svgResult && (
          <div className="mt-8 p-4 bg-white border border-gray-200 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Generated SVG:</h2>
            <div
              className="w-full max-w-full h-auto border border-dashed border-gray-400 p-2 bg-white flex items-center justify-center overflow-hidden rounded-md"
              style={{ minHeight: '200px' }}
              dangerouslySetInnerHTML={{ __html: svgResult }}
            />
            <div className="mt-4 text-left">
              <h3 className="text-md font-medium text-gray-700 mb-2">SVG Code:</h3>
              <textarea
                readOnly
                value={svgResult}
                className="w-full h-40 p-3 text-sm font-mono bg-gray-100 border border-gray-300 rounded-md resize-y overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <button
                  onClick={() => {
                    document.execCommand('copy'); // Fallback for clipboard API in some environments
                    navigator.clipboard.writeText(svgResult)
                      .then(() => alert('SVG code copied to clipboard!'))
                      .catch(err => console.error('Failed to copy SVG: ', err));
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  <span>Copy SVG Code</span>
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Download SVG</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
