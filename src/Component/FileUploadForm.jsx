import React, { useState, useRef } from 'react';
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
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const canvasRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
  };

  const handleTermsAcceptanceChange = (isAccepted) => {
    setIsTermsAccepted(isAccepted);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      return canvas.toDataURL('image/jpeg');
    }
    throw new Error('Canvas not found for saving signature.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isTermsAccepted) {
      alert('Please accept the terms and conditions before submitting.');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (profilePic) data.append('profilePic', profilePic);

    try {
      const signatureImage = saveSignature();
      const byteString = atob(signatureImage.split(',')[1]);
      const uint8Array = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: 'image/jpeg' });
      data.append('signature', blob, 'signature.jpg');

      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.post(`${apiUrl}/submit-form`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Form submitted successfully!');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error during form submission:', error);
      alert('Failed to submit the form. Please try again.');
    }
  };

  const handleGenerateReceipt = async () => {
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
      } else {
        alert('No form data found to generate the receipt.');
      }
    } catch (error) {
      console.error('Error during receipt generation:', error);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  const startDrawing = (e) => {
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
    const canvas = canvasRef.current;
    if (!canvas?.isDrawing) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
  };


  const stopDrawing = () => {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { name: 'userName', label: 'Username' },
          { name: 'name', label: 'Full Name' },
          { name: 'company', label: 'Company Name' },
          { name: 'billing_address', label: 'Billing Address', type: 'textarea' },
          { name: 'installation_address', label: 'Installation Address', type: 'textarea' },
          { name: 'city', label: 'City' },
          { name: 'pin', label: 'PIN' },
          { name: 'state', label: 'State' },
          { name: 'mobile', label: 'Mobile' },
          { name: 'telephone', label: 'Telephone (O.)' },
          { name: 'email', label: 'E-mail ID' },
          { name: 'aadhar', label: 'Aadhar No' },
          { name: 'internet_usage', label: 'Internet Usage', type: 'dropdown', options: ['Business', 'Residential', 'Both'] },
          { name: 'gender', label: 'Gender', type: 'dropdown', options: ['Male', 'Female'] },
          { name: 'dob', label: 'Date of Birth', type: 'date' },
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
        <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-600"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Digital Signature</label>
        <canvas
          ref={canvasRef}
          width="400"
          height="150"
          onMouseDown={startDrawing}
          onTouchStart={startDrawing}
          onMouseMove={draw}
          onTouchMove={draw}
          onMouseUp={stopDrawing}
          onTouchEnd={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border border-gray-400 rounded-md"
        />

        <button
          type="button"
          onClick={clearCanvas}
          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
        >
          Clear Signature
        </button>
      </div>

      <TermsAndConditions onAcceptanceChange={handleTermsAcceptanceChange} />

      <div className="flex justify-center space-x-4">
        <button
          type="submit"
          className={`px-6 py-3 text-white rounded-md font-medium ${isTermsAccepted ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!isTermsAccepted}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={handleGenerateReceipt}
          className={`px-6 py-3 text-white rounded-md font-medium ${isSubmitted ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!isSubmitted}
        >
          Generate Receipt
        </button>
      </div>
    </form>
  );
};

export default FileUploadForm;
