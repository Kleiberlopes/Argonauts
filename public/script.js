document.addEventListener('DOMContentLoaded', () => {
    let selectedAmount = '100';
    let selectedFrequency = 'One-Time';
    let paymentMethod = 'credit';

    // Frequency Selector
    const freqButtons = document.querySelectorAll('.freq-btn');
    freqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            freqButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedFrequency = btn.getAttribute('data-freq');
        });
    });

    // Amount Selector Buttons
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('customAmount');
    const submitBtn = document.getElementById('submitBtn');

    function updateSubmitButton() {
        submitBtn.textContent = `Complete Donation ($${Number(selectedAmount).toFixed(2)})`;
    }

    amountButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            amountButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAmount = btn.getAttribute('data-amount');
            customAmountInput.value = selectedAmount;
            updateSubmitButton();
        });
    });

    customAmountInput.addEventListener('input', (e) => {
        amountButtons.forEach(b => b.classList.remove('active'));
        selectedAmount = e.target.value || '0';
        updateSubmitButton();
    });

    // Tribute Toggle
    const tributeToggle = document.getElementById('tributeToggle');
    const tributeContent = document.getElementById('tributeContent');
    tributeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            tributeContent.classList.add('visible');
        } else {
            tributeContent.classList.remove('visible');
        }
    });

    // Payment Tabs
    const payTabs = document.querySelectorAll('.pay-tab');
    const creditPanel = document.getElementById('creditPanel');
    const achPanel = document.getElementById('achPanel');
    const paypalPanel = document.getElementById('paypalPanel');

    payTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            payTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            paymentMethod = tab.getAttribute('data-method');

            creditPanel.classList.remove('active');
            achPanel.classList.remove('active');
            paypalPanel.classList.remove('active');

            if (paymentMethod === 'credit') creditPanel.classList.add('active');
            if (paymentMethod === 'ach') achPanel.classList.add('active');
            if (paymentMethod === 'paypal') paypalPanel.classList.add('active');
        });
    });

    // Form Submission
    const donationForm = document.getElementById('donationForm');
    const successModal = document.getElementById('successModal');
    const receiptContent = document.getElementById('receiptContent');
    const closeModal = document.getElementById('closeModal');

    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            frequency: selectedFrequency,
            amount: selectedAmount,
            fundDesignation: document.getElementById('fundDesignation').value,
            isTribute: tributeToggle.checked,
            tributeType: tributeToggle.checked ? document.getElementById('tributeType').value : null,
            tributeName: tributeToggle.checked ? `${document.getElementById('tributeFirstName').value} ${document.getElementById('tributeLastName').value}` : null,
            title: document.getElementById('billingTitle').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            address1: document.getElementById('address1').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            postalCode: document.getElementById('postalCode').value,
            phone: document.getElementById('phone').value,
            paymentMethod: paymentMethod,
            timestamp: new Date().toISOString()
        };

        try {
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            const response = await fetch('/api/donate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                receiptContent.innerHTML = `
                    <div><span>Transaction ID:</span> ${result.transactionId}</div>
                    <div><span>Donor Name:</span> ${formData.firstName} ${formData.lastName}</div>
                    <div><span>Amount:</span> $${Number(formData.amount).toFixed(2)} USD (${formData.frequency})</div>
                    <div><span>Designation:</span> ${formData.fundDesignation}</div>
                    <div><span>Payment Method:</span> ${formData.paymentMethod.toUpperCase()}</div>
                    <div><span>Date:</span> ${new Date(result.timestamp).toLocaleString()}</div>
                `;
                successModal.classList.add('active');
            } else {
                alert('Error processing donation. Please try again.');
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Network error connecting to server.');
        } finally {
            submitBtn.disabled = false;
            updateSubmitButton();
        }
    });

    closeModal.addEventListener('click', () => {
        successModal.classList.remove('active');
        donationForm.reset();
        selectedAmount = '100';
        customAmountInput.value = '100';
        amountButtons[1].classList.add('active'); // reset to $100
        amountButtons[0].classList.remove('active');
        amountButtons[2].classList.remove('active');
        amountButtons[3].classList.remove('active');
        tributeContent.classList.remove('visible');
        updateSubmitButton();
    });
});
