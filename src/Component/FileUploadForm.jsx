import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import TermsAndConditions from './TermsAndConditions';
import { generateReceipt } from '../service/generateReceipt';

const FileUploadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    company: '',
    billing_address: '',
    installation_address: '',
    city: '',
    pin: '',
    state: '',
    mobile: '',
    telephone: '',
    email: '',
    aadhar: '',
    internet_usage: '',
    gender: '',
    dob: '',
    plan_name: '',
    plan_id: '',
    installation_charges: '',
    payment_mechanism: '',
    renewal_charges: '',
    ips: '',
    other_charges: '',
    payment_mode: '',
    amount: '',
    bank: '',
    branch: '',
    cheque_no: '',
    dated: '',
    pan: '',
    entity_payment_name: '',
    entity_payment_details: '',
    date: '',
    place: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [document1, setDocument1] = useState(null);
  const [document2, setDocument2] = useState(null);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [signatureOption, setSignatureOption] = useState('draw'); // 'draw' or 'upload'
  const [signatureImage, setSignatureImage] = useState(null); // For uploaded signature

  const formatToDateMonthYear = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const canvasRef = useRef(null);

  useEffect(() => {
    const initializeServerlessBackend = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        await axios.get(`${apiUrl}/initialize`);
        console.log('Serverless backend initialized.');
      } catch (error) {
        console.error('Error initializing the serverless backend:', error);
      }
    };

    initializeServerlessBackend();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = ['dob', 'dated', 'date'].includes(name) ? formatToDateMonthYear(value) : value;
    setFormData((prevState) => ({ ...prevState, [name]: formattedValue }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
  
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Fixed canvas size for the signature
          const canvasWidth = 300; // Desired width
          const canvasHeight = 200; // Desired height
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          // Calculate the new dimensions while maintaining aspect ratio
          const aspectRatio = img.width / img.height;
          let newWidth = canvasWidth;
          let newHeight = canvasHeight;
  
          if (aspectRatio > 1) {
            // Landscape image
            newHeight = canvasWidth / aspectRatio;
          } else {
            // Portrait or square image
            newWidth = canvasHeight * aspectRatio;
          }
  
          // Set canvas dimensions
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
  
          // Draw the resized image on the canvas
          ctx.drawImage(
            img,
            0, 0, img.width, img.height, // Source rectangle
            (canvasWidth - newWidth) / 2, (canvasHeight - newHeight) / 2, // Destination position (centered)
            newWidth, newHeight // Destination dimensions
          );
  
          // Convert the canvas image to a Blob with high quality
          canvas.toBlob(
            (blob) => {
              if (name === 'profilePic') setProfilePic(blob);
              if (name === 'document1') setDocument1(blob);
              if (name === 'document2') setDocument2(blob);
              if (name === 'signatureImage') setSignatureImage(blob);
            },
            'image/jpeg', // Use JPEG for better compression
            0.9 // Quality (0.9 = 90%)
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  const handleTermsAcceptanceChange = (isAccepted) => {
    setIsTermsAccepted(isAccepted);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    if (signatureOption === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const scaleWidth = 300;
        const scaleHeight = 120;
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = scaleWidth;
        offscreenCanvas.height = scaleHeight;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx.drawImage(canvas, 0, 0, scaleWidth, scaleHeight);
        return offscreenCanvas.toDataURL('image/png'); // Returns Base64 data URL
      }
      throw new Error('Canvas not found for saving signature.');
    } else if (signatureOption === 'upload' && signatureImage) {
      return signatureImage; // Returns File object
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!isTermsAccepted) {
      alert('Please accept the terms and conditions before submitting.');
      return;
    }
  
    if (isSubmitting) return;
  
    setIsSubmitting(true);
  
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (profilePic) data.append('profilePic', profilePic, 'profilePic.jpg');
    if (document1) data.append('document1', document1, 'document1.jpg');
    if (document2) data.append('document2', document2, 'document2.jpg');
  
    try {
      const signature = saveSignature();
      if (signature) {
        if (signatureOption === 'draw') {
          // Handle drawn signature (Base64 data URL)
          const byteString = atob(signature.split(',')[1]);
          const uint8Array = new Uint8Array(byteString.length);
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([uint8Array], { type: 'image/png' });
          data.append('signature', blob, 'signature.png');
        } else if (signatureOption === 'upload' && signatureImage) {
          // Handle uploaded signature (File object)
          data.append('signature', signatureImage, 'signature.png');
        }
      }
  
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.post(`${apiUrl}/submit-form`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      alert('Form submitted successfully!');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error during form submission:', error);
      alert('Failed to submit the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateReceipt = async () => {
    if (isGeneratingReceipt) return;

    setIsGeneratingReceipt(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/get-form-data`);
      if (response.data?.length > 0) {
        const latestFormData = response.data[response.data.length - 1];
        generateReceipt(latestFormData);

        await axios.delete(`${apiUrl}/delete-form-data`, {
          data: { id: latestFormData.id },
        });

        alert('Receipt generated and form data deleted successfully.');
        setIsSubmitted(false);
      } else {
        alert('No form data found to generate the receipt.');
      }
    } catch (error) {
      console.error('Error during receipt generation:', error);
      alert('Failed to generate receipt. Please try again.');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.isDrawing = true;
  };

  const draw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas?.isDrawing) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.isDrawing = false;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg shadow-lg space-y-6"
    >
        <h2 className="text-3xl font-bold text-blue-600 text-center">RIYAZ INTERNET PVT. LTD</h2>

{/* Form Fields */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {[
    { name: 'name', label: 'Full Name' },
    { name: 'company', label: 'Company Name' },
    { name: 'billing_address', label: 'Billing Address', type: 'textarea' },
    { name: 'installation_address', label: 'Installation Address', type: 'textarea' },
    { name: 'city', label: 'City' },
    { name: 'pin', label: 'PIN' },
    { name: 'state', label: 'State' },
    { name: 'mobile', label: 'Mobile', type: "number" },
    { name: 'telephone', label: 'Telephone (O.)', type: 'number' },
    { name: 'email', label: 'E-mail ID' },
    { name: 'aadhar', label: 'Aadhar No' },
    { name: 'internet_usage', label: 'This internet connection is mainly going to be used for', type: 'dropdown', options: ['Business/Work', 'Residential', 'Both'] },
    { name: 'gender', label: 'Gender', type: 'dropdown', options: ['Male', 'Female'] },
    { name: 'dob', label: 'Date of Birth', type: 'date' },
    { name: 'plan_name', label: 'User Plan Name' },
    { name: 'plan_id', label: 'User Plan ID' },
    { name: 'installation_charges', label: 'Installation Charges (Rs.)', type: 'number' },
    { name: 'payment_mechanism', label: 'Payment Mechanism', type: 'dropdown', options: ['Prepaid', 'Postpaid'] },
    { name: 'renewal_charges', label: 'Renewal Charges (Rs.)', type: 'number' },
    { name: 'ips', label: 'No. of Static IPS' },
    { name: 'other_charges', label: 'Other Charges (if any)', type: 'number' },
    { name: 'payment_mode', label: 'Payment Mode', type: 'dropdown', options: ['Cash', 'Cheque', 'UPI'] },
    { name: 'amount', label: 'Amount (Rs.)', type: 'number' },
    { name: 'bank', label: 'Cheque / DD issued on Bank' },
    { name: 'branch', label: 'Branch' },
    { name: 'cheque_no', label: 'Cheque/DD No.' },
    { name: 'dated', label: 'Cheque/DD issued on (Dated)', type: 'date' },
    { name: 'pan', label: 'PAN (For Post Paid)' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'place', label: 'Place' },
  ].map(({ name, label, type = 'text', options }) => (
    <div key={name} className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          onChange={handleChange}
          placeholder={label}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        ></textarea>
      ) : type === 'dropdown' ? (
        <select
          name={name}
          onChange={handleChange}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          onChange={handleChange}
          placeholder={label}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        />
      )}
    </div>
  ))}
</div>

<div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          DECLARATION IN CASE PAYMENT IS MADE BY ENTITY OTHER THAN THE APPLICANT:
        </label>
        <p className="text-gray-600">
          This is to inform that we are making the payment to RIYAZ INTERNET PVT. LTD. on behalf of:
        </p>
        <input
          type="text"
          name="entity_payment_details"
          placeholder="N/A"
          onChange={handleChange}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        />
        <label className="block text-sm font-medium text-gray-700">
          Name of the individual/organization making payment in favor of RIYAZ INTERNET PVT. LTD:
        </label>
        <input
          type="text"
          name="entity_payment_name"
          placeholder="N/A"
          onChange={handleChange}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        />
      </div>
      
<div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
        <input
          name='profilePic'
          type="file"
          accept=".jpeg,.jpg,.png,"
          onChange={(e) => setProfilePic(e.target.files[0])}
          className="mt-1 block w-full text-sm text-gray-600"
        />
      </div>
<div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Document 1 (Please add only  images of Good Quality)</label>
        <input
          name='document1'
          type="file"
          accept=".jpeg,.jpg,.png,"
          onChange={(e) => setDocument1(e.target.files[0])}
          className="mt-1 block w-full text-sm text-gray-600"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Document 2 (Please add only  images of Good Quality)</label>
        <input
          name='document2'
          type="file"
          accept=".jpeg,.jpg,.png"
          onChange={(e) => setDocument2(e.target.files[0])}
          className="mt-1 block w-full text-sm text-gray-600"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Signature Option</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="signatureOption"
              value="draw"
              checked={signatureOption === 'draw'}
              onChange={() => setSignatureOption('draw')}
              className="mr-2"
            />
            Draw Signature
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="signatureOption"
              value="upload"
              checked={signatureOption === 'upload'}
              onChange={() => setSignatureOption('upload')}
              className="mr-2"
            />
            Upload Signature
          </label>
        </div>
      </div>

      {signatureOption === 'draw' && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Digital Signature</label>
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            onMouseDown={startDrawing}
            onTouchStart={startDrawing}
            onMouseMove={draw}
            onTouchMove={draw}
            onMouseUp={stopDrawing}
            onTouchEnd={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border border-gray-400 rounded-md bg-white"
            style={{ touchAction: 'none', display: 'block', margin: '0 auto' }}
          />
          <button
            type="button"
            onClick={clearCanvas}
            className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            Clear Signature
          </button>
        </div>
      )}

      {signatureOption === 'upload' && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Upload Signature</label>
          <input
            name="signatureImage"
            type="file"
            accept=".jpeg,.jpg,.png"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-600"
          />
        </div>
      )}


      {/* ... (existing terms and conditions and buttons) */}
      
      {/* Terms and Conditions */}
      <TermsAndConditions onAcceptanceChange={handleTermsAcceptanceChange} />

      {/* Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          type="submit"
          className={`px-6 py-3 text-white rounded-md font-medium ${isSubmitting || !isTermsAccepted ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          disabled={isSubmitting || !isTermsAccepted}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

        <button
          type="button"
          onClick={handleGenerateReceipt}
          className={`px-6 py-3 text-white rounded-md font-medium ${!isSubmitted || isGeneratingReceipt ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          disabled={!isSubmitted || isGeneratingReceipt}
        >
          {isGeneratingReceipt ? 'Generating...' : 'Generate Receipt'}
        </button>
      </div>
    </form>
  );
};

export default FileUploadForm;