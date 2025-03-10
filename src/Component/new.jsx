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

    const canvasRef = useRef(null);

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
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'profilePic') setProfilePic(files[0]);
        if (name === 'document1') setDocument1(files[0]);
        if (name === 'document2') setDocument2(files[0]);
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

        setIsSubmitting(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));
        if (profilePic) data.append('profilePic', profilePic);
        if (document1) data.append('document1', document1);
        if (document2) data.append('document2', document2);

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
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateReceipt = async () => {
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
                <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-600"
                />
            </div>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Document 1 (Please add only  images of Good Quality)</label>
                <input
                    name='document1'
                    type="file"
                    accept=".jpeg,.jpg,.png,.pdf"
                    onChange={(e) => setDocument1(e.target.files[0])}
                    className="mt-1 block w-full text-sm text-gray-600"
                />
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Document 2 (Please add only  images of Good Quality)</label>
                <input
                    name='document2'
                    type="file"
                    accept=".jpeg,.jpg,.png,.pdf"
                    onChange={(e) => setDocument2(e.target.files[0])}
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


