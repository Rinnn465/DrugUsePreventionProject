console.log('🚀 Starting simple server test...');

const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/test', (req, res) => {
    console.log('✅ API test endpoint called');
    res.json({ message: 'Server is working!' });
});

app.get('/api/program', (req, res) => {
    console.log('📋 Program API called');
    res.json({ data: [] });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
}); 