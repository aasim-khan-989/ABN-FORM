
import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";


// Function to handle adding documents to the PDF
const addDynamicImageToPDF = async (doc, base64Image) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;

    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      const imgWidthInMM = imgWidth * 0.264583; // Convert pixel width to mm
      const imgHeightInMM = imgHeight * 0.264583; // Convert pixel height to mm

      const A4Width = 210; // A4 width in mm (Portrait)
      const A4Height = 297; // A4 height in mm (Portrait)

      // Calculate the scaling factor to fit the image into A4 dimensions without cropping
      const widthScale = A4Width / imgWidthInMM;
      const heightScale = A4Height / imgHeightInMM;
      const scale = Math.min(widthScale, heightScale); // Ensure the image fits within A4 dimensions

      // Adjust the page size dynamically to fit the scaled image dimensions
      const scaledWidth = imgWidthInMM * scale;
      const scaledHeight = imgHeightInMM * scale;

      const pageWidth = scaledWidth > A4Width ? scaledWidth : A4Width;
      const pageHeight = scaledHeight > A4Height ? scaledHeight : A4Height;

      doc.addPage([pageWidth, pageHeight]);

      // Center the image on the new page size
      const offsetX = (pageWidth - scaledWidth) / 2;
      const offsetY = (pageHeight - scaledHeight) / 2;

      doc.addImage(
        base64Image,
        "JPEG",
        offsetX > 0 ? offsetX : 0, // Prevent negative offsets
        offsetY > 0 ? offsetY : 0,
        scaledWidth,
        scaledHeight
      );

      resolve();
    };

    img.onerror = (err) => reject(err); // Reject the promise if image loading fails
  });
};



const resizeImage = (base64Image, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let { width, height } = img;

      // Maintain aspect ratio
      const ratio = Math.min(maxWidth / width, maxHeight / height);

      width *= ratio;
      height *= ratio;

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };

    img.onerror = (err) => reject(err);
  });
};


// Function to handle adding PDFs to the document
const addPDFToDocument = async (doc, base64Data) => {
  try {
    const existingPdfBytes = atob(base64Data.split(",")[1]);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const copiedPages = await pdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => {
      const { width, height } = page.getSize();

      // Convert dimensions to mm (1 point = 0.352778 mm)
      const pageWidthInMM = width * 0.352778;
      const pageHeightInMM = height * 0.352778;

      // Add the page to the jsPDF document with the corresponding size
      doc.addPage([pageWidthInMM, pageHeightInMM]);
      doc.addImage(page, "JPEG", 0, 0, pageWidthInMM, pageHeightInMM); // Add content to fit
    });
  } catch (error) {
    console.error("Error merging PDF:", error);
  }
};

// Function to handle adding a document (image or PDF)
const addDocumentToPDF = async (doc, base64Data) => {
  try {
    if (base64Data.startsWith("data:image/")) {
      // Dynamically adjust image dimensions
      await addDynamicImageToPDF(doc, base64Data);
      // doc.addPage(); // Add a new page after the image
    } else if (base64Data.startsWith("data:application/pdf")) {
      // Add PDF pages and ensure they start from a new page
      await addPDFToDocument(doc, base64Data);
      // doc.addPage(); // Add a new page after the PDF
    } else {
      console.error("Unsupported file format:", base64Data);
    }
  } catch (error) {
    console.error("Error adding document to PDF:", error);
  }
};

export const generateReceipt = async (formData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  console.log(formData)



  // Set background color
  doc.setFillColor(204, 255, 204); // Light green color (RGB: 204, 255, 204)
  doc.rect(0, 0, 210, 297, "F"); // Full-page rectangle fill (A4 dimensions)

  // Helper function for lines
  const drawLine = (y) => doc.line(10, y, 200, y);

  // Section header generator
  const addSectionHeader = (title, y) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, 105, y, null, null, "center");
    return y + 6;
  };

  // Key-value pair generator
  const addKeyValuePair = (key, value, y, xKey = 10, xValue = 80) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${key}:`, xKey, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "N/A", xValue, y);
    return y + 6;
  };

  // Header Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RIYAZ INTERNET PVT. LTD.", 105, 15, null, null, "center");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Office: Sardar Tower, Near Ram Mandir, Osmanpura, Aurangabad - 05",
    105,
    22,
    null,
    null,
    "center"
  );
  doc.text(
    "Mob: 9225306066 | Email: riyaz@riyazinternet.com",
    105,
    27,
    null,
    null,
    "center"
  );
  doc.text(
    "Customer Care No: 7447713083 | Website: www.riyazinternet.com",
    105,
    32,
    null,
    null,
    "center"
  );
  // CAF No with ERROR in red
  doc.setFont("helvetica", "bold");
  doc.text("CAF No:", 182, 32, null, null, "right"); // CAF No in black
  
  // Set text color to red for ERROR
  doc.setTextColor(255, 0, 0);
  doc.text("NET::ERR", 200, 32, null, null, "right"); // Mimic a real error style
  
  // Reset text color to black
  doc.setTextColor(0, 0, 0);
  

  // Divider
  drawLine(35);

  // Section: Your Details
  let y = addSectionHeader("YOUR DETAILS", 42);

  const userDetails = [
    { label: "Name", value: formData.name },
    { label: "Company Name", value: formData.company },
    { label: "City", value: formData.city },
    { label: "PIN", value: formData.pin },
    { label: "State", value: formData.state },
    {
      label: "Gender",
      value: formData.gender,
      inlineLabel: "Date of Birth",
      inlineValue: formData.dob,
    },
    {
      label: "Mobile",
      value: formData.mobile,
      inlineLabel: "Telephone",
      inlineValue: formData.telephone,
    },
  ];
  
  // Loop through the details
  userDetails.forEach(({ label, value, inlineLabel, inlineValue }) => {
    y = addKeyValuePair(label, value, y, 10, 58); // Adjust the position
    if (inlineLabel) {
      y -= 5; // Align inline key-value pairs on the same line
      addKeyValuePair(inlineLabel, inlineValue, y, 120, 150); // Adjust for inline key-value
      y += 5;
    }
  });
  
  // Billing Address and Installation Address (Handle Overflow)
  const addressDetails = [
    { label: "Billing Address", value: formData.billing_address },
    { label: "Installation Address", value: formData.installation_address },
  ];
  
  addressDetails.forEach(({ label, value }) => {
    doc.setFontSize(11); // Smaller font for addresses
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 10, y);
  
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value || "N/A", 155); // Wrap text
    const lineHeight = 4; // Line spacing for smaller text
  
    // Render each line and adjust `y` accordingly
    lines.forEach((line, index) => {
      doc.text(line, 57.5, y + index * lineHeight);
    });
  
    // Update `y` position based on the number of lines rendered
    y += lines.length > 1 ? lines.length * lineHeight + 2 : lineHeight + 2;
  });
  
  doc.setFontSize(10); // Reset font size after addresses


  if (formData.profilePic) {
    doc.addImage(formData.profilePic, "JPEG", 170, 40, 30, 30);
  }

  drawLine(y);
  y += 6;



  // Section: Your Plan Preference
  y = addSectionHeader("YOUR PLAN PREFERENCE", y);

  const planDetails = [
    { label: "User Plan Name", value: formData.plan_name },
    { label: "User Plan ID", value: formData.plan_id },
    { label: "Installation Charges", value: formData.installation_charges },
    { label: "Renewal Pack Charges", value: formData.renewal_charges },
    {
      label: "No. of Static IPs",
      value: formData.ips,
      inlineLabel: "Other Charges (IF any)",
      inlineValue: formData.other_charges,
    },
  ];

  planDetails.forEach(({ label, value, inlineLabel, inlineValue }) => {
    y = addKeyValuePair(label, value, y, 10, 58);
    if (inlineLabel) {
      y -= 6; // Align inline key-value pairs
      addKeyValuePair(inlineLabel, inlineValue, y, 120, 168);
      y += 6;
    }
  });

  drawLine(y);
  y += 6;

  // Section: Payment Details
  // Section: Payment Details
  y = addSectionHeader("PAYMENT DETAILS", y);

  const paymentDetails = [
    { label: "Payment Mode", value: formData.payment_mode },
    { label: "Amount (Rs.)", value: formData.amount },
    {
      label: "Cheque/DD Bank",
      value: formData.bank,
      inlineLabel: "Branch",
      inlineValue: formData.branch,
    },
    {
      label: "Cheque/DD No.",
      value: formData.cheque_no,
      inlineLabel: "Dated",
      inlineValue: formData.dated,
    },
    { label: "PAN", value: formData.pan },
  ];

  // Adjusting the payment details for proper layout with inline pairs
  paymentDetails.forEach(({ label, value, inlineLabel, inlineValue }) => {
    y = addKeyValuePair(label, value, y, 10, 58); // Adjusted x-coordinates for labels and values
    if (inlineLabel) {
      y -= 6; // Align inline key-value pairs
      addKeyValuePair(inlineLabel, inlineValue, y, 120, 140); // Adjusted x-coordinates for inline pairs
      y += 6;
    }
  });


  // Draw a line after the "Payment Details" section
  drawLine(y);
  y += 6;
   const totalContentHeight = y; // Current total content height
  
  if (totalContentHeight >= 280) {
    doc.addPage(); // Add another page if content is too long
  }


  // Add the note
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const noteText = `
Note: All Cheques/Demand Drafts should be drawn in favor of RIYAZ INTERNET PVT. LTD., payable at Aurangabad.
I/we have carefully read the terms & conditions and technical specifications of RIYAZ INTERNET PVT. LTD. services
and agree to abide by the same. I/we confirm that the details provided in this application are correct to the best of my/our knowledge.
`;
  doc.text(noteText, 10, y, { maxWidth: 190, align: "justify" });
  y += 20; // Add spacing after the note

  // Signature section
  doc.setFont("helvetica", "bold");
  doc.text("Signature of Customer:", 10, y);
  if (formData.signature) {
    try {
      // Resize image to 150x75 pixels (you can adjust this size)
      const resizedSignature = await resizeImage(formData.signature, 150, 75);

      // Now add the resized image to the PDF
      doc.addImage(resizedSignature, "png", 80, y - 5, 40, 20); // Coordinates and size as needed
    } catch (error) {
      console.error("Error resizing the signature image:", error);
    }
  }

  // Place and Date aligned next to the signature
  doc.text("Place:", 140, y); // Place aligned to the right
  doc.text(formData.place || "N/A", 150, y);

  y += 6; // Move below the place for date
  doc.text("Date:", 140, y);
  doc.text(formData.date || "N/A", 150, y);

  y += 20; // Add spacing after signature section
  drawLine(y); // Line above the declaration section
  y += 6;

  // Render the declaration section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(
    "DECLARATION IN CASE PAYMENT IS MADE BY ENTITY OTHER THAN THE APPLICANT:",
    10,
    y
  );
  y += 8; // Spacing after header for readability

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // Label: "on behalf of"
  doc.text(
    "This is to inform that we are making the payment to RIYAZ INTERNET PVT. LTD. on behalf of:",
    10,
    y
  );
  y += 6; // Spacing below label
  doc.setFont("helvetica", "bold"); // Make value bold
  doc.text(formData.entity_payment_name || "N/A", 10, y); // Align value below label
  doc.text("_____________________", 10, y + 2); // Underline value
  y += 12; // Spacing before next label

  // Label: "individual/organization making payment"
  doc.setFont("helvetica", "normal"); // Reset to normal font for label
  doc.text(
    "Name of the individual/organization making payment in favor of RIYAZ INTERNET PVT. LTD:",
    10,
    y
  );
  y += 6; // Spacing below label
  doc.setFont("helvetica", "bold"); // Make value bold
  doc.text(formData.entity_payment_details || "N/A", 10, y); // Align value below label
  doc.text("_____________________", 10, y + 2); // Underline value
  y += 14; // Final spacing before the next section



  // Add a new page with a light green background
  doc.addPage();
  doc.setFillColor(204, 255, 204); // RGB for light green
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

  // Add the header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TERMS & CONDITIONS', 105, 15, { align: 'center' });

  // Define the terms and conditions text
  const terms = `
  1. Subject to the acceptance of the application & technical feasibility, Riyaz Internet PVT. LTD. services will be provided as soon as possible. 2. Data rates shown (downstream/upstream) are applicable only to the last mile. Riyaz Internet PVT. LTD. is not responsible for lower download/upload rates caused by accessed websites, international gateways, or media. 3. All IP addresses assigned will be dynamic. 4. Shifting of broadband connections is subject to technical feasibility and applicable charges. 5. Riyaz Internet PVT. LTD. reserves the right to disconnect services if there is sufficient evidence of misuse affecting Riyaz Internet or its network. 6. The customer is responsible for using the service only for legal purposes. 7. Riyaz Internet PVT. LTD. will exercise care in providing services but is not responsible for interruptions due to power failures, equipment malfunction, or natural calamities. 8. Riyaz Internet PVT. LTD. is not responsible for hardware/software issues or areas outside its control. 9. The company is not responsible for customers' actions or consequences resulting from its services. 10. Riyaz Internet PVT. LTD. is not liable for content accessed, transmitted, or transactions made via the internet. 11. Customers must submit a signed application with consent to agree to these terms. 12. The installation address provided by the customer must match the application form details. 13. Customers shall pay applicable charges, taxes, and levies determined by authorities. 14. Connection will be provided at the specified premises, and customers will be informed of the installation date. 15. Customers must ensure their devices are compatible with the services. Riyaz Internet is not responsible for compatibility issues arising from changes to customer hardware/software.\n 16. Riyaz Internet PVT. LTD. is not responsible for compatibility Problems due to change of hardware/software at the customer premises. The CUSTOMER have verity with Riyaz Internet PVT. LTD. and migrate to a Suitable plan (in necessary) should there be a compability problem due to change in hardware/software by the CUSTOMER Serving Time is 10 Am to 6 Pm. Billing & Payments 17. Payments should be made via cheque, DD, or Pay Order favoring Riyaz Internet PVT. LTD., Aurangabad. Outstation cheques, postal orders, and money orders are not accepted. 18. Cheques will not be accepted after the due date. 19. Service tax and other statutory levies are payable by the customer. 20. Tariffs may be revised periodically. 21. No refunds will be given for connectivity or service charges once paid. 22. Modems and wiring supplied by Riyaz Internet remain the property of the company and must not be tampered with. 23. No equipment installed by Riyaz Internet may be removed without prior written consent. 24. Customers must ensure necessary permissions are obtained for cabling. 25. Services are not guaranteed to be uninterrupted or free from harmful components. 26. Customers are responsible for password security and misuse of their facilities. 27. Power supply for service operation must be provided by the customer. 28. Connections may include promotional content; Riyaz Internet reserves the right to introduce advertisements. 29. Connections are for customer use only and must not be reassigned or resold. 30. Unauthorized hardware/software or encryption beyond permitted levels is prohibited. 31. Internet telephony must comply with government regulations. 32. Devices provided under bundled services must not be used outside Riyaz Internet's network until dues are fully paid. 33. The Customer shall not use the device supplied by Riyaz Internet under Bundled Services on any other network other than that of Riyaz Internet until all dues are fully paid. 34. If the applicant has no right or has a restrictive right to use the area abutting the CUSTOMER PREMISES, it is the applicant’s responsibility to obtain necessary permissions in writing from concerned authorities like the landlord, society, etc., permitting Riyaz Internet to lay cables to CUSTOMER PREMISES. 35. Neither Riyaz Internet nor its ASSOCIATE warrants that the service will be uninterrupted or error-free or free from viruses, worms, Trojan horses, or other harmful components. 36. The CUSTOMER understands that the internet contains unedited materials, some of which may be sexually explicit or offensive. Accessing such materials is at the CUSTOMER's own risk. Riyaz Internet or its ASSOCIATE has no control over such content and accepts no responsibility for it. 37. It is the responsibility of the CUSTOMER to ensure the provided password is kept secret, not disclosed to anyone, and changed as necessary. Riyaz Internet will not be liable for any misuse of the CUSTOMER’s facility under any circumstances. 38. The CUSTOMER is responsible for providing power supply at no charge to avail of the services of Riyaz Internet. 39. The CUSTOMER acknowledges that the connection provided by Riyaz Internet is promotional and agrees that Riyaz Internet reserves the right to introduce commercial advertisements through its services. 40. The CUSTOMER is responsible for providing power supply at no charge to avail of the services of Riyaz Internet.  41. The CUSTOMER acknowledges that the connection provided by Riyaz Internet is promotional and agrees that Riyaz Internet reserves the right to introduce commercial advertisements through its services.  42. Riyaz Internet may revise its terms of service without prior notice. By using Riyaz Internet services, customers agree to all updated terms of service, which may be accessed on request. `;
  const margin = 10; // Side margin
  const termsStartY = 25; // Start position for terms and conditions
  const lineHeight = 6; // Line height

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9); // Font size for terms

  // Render the terms and conditions
  doc.text(terms, margin, termsStartY, {
    maxWidth: doc.internal.pageSize.width - 2 * margin,
    lineHeightFactor: 1.5,
  });

  // Calculate the height of the terms and Y position for the signature
  const termsHeight = doc.getTextDimensions(terms, {
    maxWidth: doc.internal.pageSize.width - 2 * margin,
  }).h;

  // Adjust signature position further down
  let signatureY = doc.internal.pageSize.height - 60; // 60mm from the bottom of the page

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  // Add the label for the signature
  doc.text("CUSTOMER SIGNATURE:", margin, signatureY);

  // Add the signature image, if provided
  if (formData.signature) {
    const signatureImageWidth = 60; // Width of the signature image in mm
    const signatureImageHeight = 20; // Height of the signature image in mm
    const signatureImageX = margin + 45; // Position of the signature image (relative to text)
    const signatureImageY = signatureY - 3; // Place the signature image 5mm below the label

    doc.addImage(
      formData.signature,
      "JPEG",
      signatureImageX,
      signatureImageY,
      signatureImageWidth,
      signatureImageHeight
    );
  }

  // Add the footer text at the bottom of the page
  const footerY = doc.internal.pageSize.height - 20; // Position 20 units from the bottom
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20); // Large text for emphasis
  doc.text("RIYAZ INTERNET PRIVATE LTD.", doc.internal.pageSize.width / 2, footerY, {
    align: "center",
  });

  // // Save the PDF
  // doc.addPage();

  if (formData.document1) {
    await addDocumentToPDF(doc, formData.document1);
  }

  doc.setFillColor(0, 0, 0); // RGB for light green
  if (formData.document2) {
    await addDocumentToPDF(doc, formData.document2);
  }

  doc.save(`${formData.plan_id}`);
}