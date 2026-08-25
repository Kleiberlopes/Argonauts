const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to process donation
app.post('/api/donate', (req, res) => {
    const donationData = req.body;
    console.log('Received donation:', donationData);
    
    // Simulate transaction processing
    const transactionId = 'MDA-' + Math.floor(100000000 + Math.random() * 900000000);
    
    res.json({
        success: true,
        message: 'Donation processed successfully!',
        transactionId: transactionId,
        timestamp: new Date().toISOString(),
        data: donationData
    });
});

app.listen(PORT, () => {
    console.log(`MD Anderson Donation Portal clone running at http://localhost:${PORT}`);
});
