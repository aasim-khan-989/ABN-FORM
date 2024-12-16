import React, { useState } from 'react';

const TermsAndConditions = ({ onAcceptanceChange }) => {
    const [isChecked, setIsChecked] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCheckboxChange = () => {
        const newCheckedState = !isChecked;
        setIsChecked(newCheckedState);
        setIsExpanded(newCheckedState);
        if (onAcceptanceChange) onAcceptanceChange(newCheckedState);
    };

    const handleProceedClick = (event) => {
        // Prevent form submission if inside a <form>
        event.preventDefault();
        if (isChecked) {
            alert('Terms accepted');
        }
    };

    return (
        <div className="terms-container p-4">
            <h2 className="text-lg font-bold mb-4">TERMS & CONDITIONS</h2>

            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="toggleTerms"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                />
                <label htmlFor="toggleTerms" className="text-sm font-medium">
                    I have read and agree to the Terms & Conditions
                </label>
            </div>

            {isExpanded && (
               <div className="text-sm mb-4 border p-4 rounded bg-gray-100">
               <p className="mb-4">
                   Applicants are required to read the following terms & conditions before signing the application for broadband services.
               </p>

               {/* Terms content */}
               <div className="text-sm mb-4">
                   <h3 className="font-semibold">GENERAL</h3>
                   <p>1. Subject to the acceptance of the application & technical feasibility, Riyaz Internet PVT. LTD. will commence services as soon as possible.</p>
                   <p>2. The data rates shown as downstream or upstream are applicable only to the last mile. Riyaz Internet PVT. LTD. shall not be responsible for lesser download or upload data rates caused by the accessed website status, the International gateway, or the media.</p>
                   <p>3. All IP addresses assigned will be dynamic.</p>
                   <p>4. Shifting of broadband connections is subject to technical feasibility and would be done upon payment of applicable shifting charges.</p>

                   <h3 className="font-semibold">RIGHT TO TERMINATE SERVICE</h3>
                   <p>5. Riyaz Internet PVT. LTD. reserves the right to disconnect service to any customer if there is sufficient evidence of the customer using the service in a manner that would adversely impact Riyaz Internet PVT. LTD. or its network.</p>
                   <p>6. The customer shall be responsible for using the service only for legal and appropriate purposes.</p>

                   <h3 className="font-semibold">DISCLAIMER</h3>
                   <p>7. Riyaz Internet PVT. LTD. will exercise reasonable care in providing services but is not responsible for interruptions due to power failures, equipment malfunction, or natural calamities.</p>
                   <p>8. Riyaz Internet PVT. LTD. is not responsible for subscribed computer hardware and software or for areas of the internet not under Riyaz Internet PVT. LTD.’s control. It does not warrant privacy, security, or efficiency of the internet.</p>
                   <p>9. Riyaz Internet PVT. LTD. is not responsible for the actions taken by its customers or others as a result of its services.</p>
                   <p>10. Riyaz Internet PVT. LTD. is not responsible for material that any person (including household members of the subscriber) may receive or transmit via the internet, nor for anything bought or sold via the internet or for any other result.</p>

                   <h3 className="font-semibold">SERVICE ACTIVATION</h3>
                   <p>11. The customer shall submit an application duly signed along with a consent to agree to these terms and conditions to Riyaz Internet PVT. LTD. directly or through any associate.</p>
                   <p>12. The address of the customer premises, where the customer desires to have Riyaz Internet PVT. LTD. installed, is given in the relevant column of the application form, duly completed and signed by the customer.</p>
                   <p>13. Along with connectivity charges, the customer shall pay applicable taxes, duties, and levies as determined by authorities.</p>
                   <p>14. Riyaz Internet PVT. LTD. will provide the connection at the customer premises indicated in the application form and will also notify the customer of the scheduled installation date.</p>
                   <p>15. The customer shall ensure the compatibility of computers for the installation and running of the internet package before purchase. Neither Riyaz Internet PVT. LTD. nor its associates will provide customer advisory services.</p>
                   <p>16. Riyaz Internet PVT. LTD. is not responsible for compatibility issues due to changes in hardware/software at the customer's premises. The customer may verify compatibility with Riyaz Internet PVT. LTD. and migrate to a suitable plan if necessary.</p>
                   <p>16. Riyaz Internet PVT. LTD. is not responsible for compatibility problems due to changes in hardware/software at the customer premises. The customer must verify with Riyaz Internet PVT. LTD. and migrate to a suitable plan if necessary. Service hours are 10 AM to 6 PM.</p>

                   <h3 className="font-semibold">BILLING & PAYMENTS</h3>
                   <p>18. Cheque return charges will be Rs. 750 per cheque. If a customer's cheque is dishonored more than 3 times in a year, cheque payment will be withdrawn. Riyaz Internet PVT. LTD. reserves the right to proceed legally as it deems fit.</p>
                   <p>19. Payment modes accepted include cheque/DD/Payorder, payable to Riyaz Internet PVT. LTD., Aurangabad.</p>
                   <p>20. Outstation cheques, postal orders, and money orders will not be accepted. Cash can be paid at counters between 10 AM to 6 PM.</p>
                   <p>21. Cheques will not be accepted after the due date.</p>
                   <p>22. Service tax/other statutory levies as applicable will be payable by the customer.</p>
                   <p>23. Riyaz Internet PVT. LTD. may revise the tariff for services at its discretion.</p>
                   <p>24. No refund claims for connectivity and service charges will be entertained.</p>

                   <h3 className="font-semibold">OWNERSHIP OF EQUIPMENT</h3>
                   <p>25. The title to all modems and wiring provided by Riyaz Internet PVT. LTD. remains with Riyaz Internet PVT. LTD. The customer has no lien, charge, or encumbrance on the equipment.</p>
                   <p>26. No equipment installed by Riyaz Internet PVT. LTD. may be removed from the customer premises without written consent from Riyaz Internet PVT. LTD.</p>

                   <h3 className="font-semibold">OWNED BY CUSTOMER</h3>
                   <p>27. Ownership of the PC/device by the customer in bundled offerings is governed by the agreement signed with the financial institution.</p>

                   <h3 className="font-semibold">SHIFTING OF BROADBAND CONNECTION LOCATION</h3>
                   <p>28. Riyaz Internet PVT. LTD. connections are location-specific and provided only at the location indicated by the customer in the application form.</p>
                   <p>29. Shifting the location of the connection is subject to technical and economic feasibility. The customer must pay relocation charges in advance.</p>
                   <p>30. Riyaz Internet PVT. LTD. will not guarantee or undertake transfers if feasibility reports indicate non-viability.</p>

                   <h3 className="font-semibold">PROHIBITORY CLAUSES</h3>
                   <p>31. The Riyaz Internet PVT. LTD. connection is for the customer’s use only and is non-transferable or resalable.</p>
                   <p>32. The customer may not use unlawful hardware/software and must provide access to connected equipment for inspection if required. Unlawful encryption equipment or equipment requiring authority permission must be approved before use.</p>
                   <p>33. IP telephony must comply with the Government of India’s guidelines:</p>
                   <p>a) PC to PC: within or outside India.</p>
                   <p>b) PC in India to telephone outside India.</p>
                   <p>c) IP-based H.323/SIP terminates connected directly to ISPs within or outside India. Other forms are not permitted.</p>
                   <p>34. The customer may not connect unauthorized devices to the service without written permission from Riyaz Internet PVT. LTD.</p>
                   <p>35. The customer may not use devices supplied by Riyaz Internet under bundled services on other networks until all dues are fully paid.</p>

                   <h3 className="font-semibold">LIABILITIES AND RESPONSIBILITIES OF CUSTOMER</h3>
                   <p>36. If the customer has restricted rights to the area near their premises, it is the customer's responsibility to obtain permission for Riyaz Internet to lay cables.</p>
                   <p>37. Riyaz Internet or its associates do not warrant uninterrupted, error-free service free of viruses, worms, trojans, or other harmful components.</p>
                   <p>38. The customer acknowledges the presence of unedited internet content and accesses such material at their own risk.</p>
                   <p>39. The customer must keep passwords secure and not share them. Riyaz Internet is not liable for misuse of the customer’s facility under any circumstances.</p>
                   <p>40. The customer is responsible for providing a power supply at no charge to avail of Riyaz Internet's service.</p>
                   <p>41. The customer agrees that the connection is promotional, and Riyaz Internet reserves the right to introduce commercial advertisements through the services.</p>
                   <p>42. Riyaz Internet may revise its terms of service without prior notice. Continued use implies acceptance of updated terms.</p>

                   {/* Add remaining terms here in the same format */}
               </div>

           
              
           </div>
            )}

            {/* <button
                className={`mt-4 px-4 py-2 text-white rounded ${isChecked ? 'bg-blue-500' : 'bg-gray-400 cursor-not-allowed'}`}
                disabled={!isChecked}
                onClick={handleProceedClick}
            >
                Proceed
            </button> */}
        </div>
    );
};

export default TermsAndConditions;
