import React, { useState } from 'react';
import axios from 'axios';
import { generateReceipt } from '../service/generateReceipt';

const FileUploadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
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
    use_for: '',
    plan_name: '',
    installation_charges: '',
    renewal_charges: '',
    plan_id: '',
    payment_mechanism: '',
    ips: '',
    other_charges: '',
    payment_mode: '',
    amount: '',
    bank: '',
    cheque_no: '',
    date: '',
    branch: '',
    pan: '',
  });

  const [profilePic, setProfilePic] = useState(null);
  const [signature, setSignature] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (field === 'profilePic') {
      setProfilePic(file);
    } else if (field === 'signature') {
      setSignature(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (profilePic) data.append('profilePic', profilePic);
    if (signature) data.append('signature', signature);

    try {
      const response = await axios.post('http://localhost:3000/submit-form', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Form submitted successfully!');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form');
    }
  };

  // Function to handle the PDF generation
  const handleGeneratePDF = () => {
    generateReceipt(formData, profilePic, signature); // Call the function to generate PDF
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700">Your Details</h2>
      
      <div className="space-y-4">
        {[
          { name: "name", label: "Full Name" },
          { name: "company", label: "Company Name" },
          { name: "billing_address", label: "Billing Address", type: "textarea" },
          { name: "installation_address", label: "Installation Address", type: "textarea" },
          { name: "city", label: "City" },
          { name: "pin", label: "PIN" },
          { name: "state", label: "State" },
          { name: "mobile", label: "Mobile" },
          { name: "telephone", label: "Telephone" },
          { name: "email", label: "Email" },
          { name: "aadhar", label: "Aadhar (Optional)" },
          { name: "use_for", label: "Use For" },
          { name: "plan_name", label: "Plan Name" },
          { name: "installation_charges", label: "Installation Charges", type: "number" },
          { name: "renewal_charges", label: "Renewal Charges", type: "number" },
          { name: "plan_id", label: "Plan ID" },
          { name: "payment_mechanism", label: "Payment Mechanism" },
          { name: "ips", label: "IPS" },
          { name: "other_charges", label: "Other Charges", type: "number" },
          { name: "payment_mode", label: "Payment Mode" },
          { name: "amount", label: "Amount", type: "number" },
          { name: "bank", label: "Bank" },
          { name: "cheque_no", label: "Cheque No." },
          { name: "date", label: "Date", type: "date" },
          { name: "branch", label: "Branch" },
          { name: "pan", label: "PAN" },
        ].map(({ name, label, type = "text" }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            {type === "textarea" ? (
              <textarea
                name={name}
                onChange={handleChange}
                placeholder={label}
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              ></textarea>
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

      <h3 className="text-xl font-medium text-gray-700">Upload Files</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'profilePic')}
            className="mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="signature" className="block text-sm font-medium text-gray-700">Signature</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'signature')}
            className="mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Submit
        </button>
        {/* Generate PDF Button */}
        <button
          type="button"
          onClick={handleGeneratePDF}
          className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition duration-200"
        >
          Generate PDF
        </button>
      </div>
    </form>
  );
};

export default FileUploadForm;
