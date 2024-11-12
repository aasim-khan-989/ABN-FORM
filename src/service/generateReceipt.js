// services/generateReceipt.js
import jsPDF from 'jspdf';

export const generateReceipt = (formData, profilePic, signature) => {
  const doc = new jsPDF();

  // Adding the title
  doc.setFontSize(20);
  doc.text('Receipt', 14, 20);

  // Customer details (front page)
  doc.setFontSize(12);
  doc.text(`Name: ${formData.name}`, 14, 30);
  doc.text(`Company: ${formData.company}`, 14, 40);
  doc.text(`Billing Address: ${formData.billing_address}`, 14, 50);
  doc.text(`Installation Address: ${formData.installation_address}`, 14, 60);
  doc.text(`City: ${formData.city}`, 14, 70);
  doc.text(`PIN: ${formData.pin}`, 14, 80);
  doc.text(`State: ${formData.state}`, 14, 90);
  doc.text(`Mobile: ${formData.mobile}`, 14, 100);
  doc.text(`Telephone: ${formData.telephone}`, 14, 110);
  doc.text(`Email: ${formData.email}`, 14, 120);

  // Adding the profile picture if available
  if (profilePic) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imgData = reader.result;
      doc.addImage(imgData, 'JPEG', 160, 30, 30, 30); // x, y, width, height
      doc.save('receipt.pdf');
    };
    reader.readAsDataURL(profilePic);
  }

  // Adding the signature if available
  if (signature) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imgData = reader.result;
      doc.addImage(imgData, 'JPEG', 160, 70, 40, 20); // Adjust position for signature
      doc.save('receipt.pdf');
    };
    reader.readAsDataURL(signature);
  }

  // Adding terms and conditions on the back page
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Terms and Conditions', 14, 20);
  doc.setFontSize(10);
  doc.text('1. This is a demo receipt for the service.', 14, 30);
  doc.text('2. The billing address and installation address are subject to confirmation.', 14, 40);
  doc.text('3. Payment terms are as per the agreement.', 14, 50);
  doc.text('4. Any disputes will be handled as per the company policy.', 14, 60);
  doc.text('5. This receipt is valid for a limited time.', 14, 70);

  // Saving the generated PDF
  doc.save('receipt.pdf');
};
