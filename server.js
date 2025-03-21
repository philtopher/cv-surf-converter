const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Set up PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cv_transformer',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Configure file storage for uploaded CVs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '.')));

// API Routes

// Upload and convert CV
app.post('/api/convert', upload.single('cv'), async (req, res) => {
  try {
    const { userId, jobDescription, targetRole } = req.body;
    const cvPath = req.file.path;
    
    // Read CV content
    const cvContent = fs.readFileSync(cvPath, 'utf8');
    
    // In a real application, perform the actual CV transformation here
    // For this example, we'll just add the target role to the CV
    const transformedCvContent = `${targetRole.toUpperCase()} CV\n\n${cvContent}`;
    
    // Save the transformed CV
    const transformedCvPath = path.join(__dirname, 'uploads', `transformed-${Date.now()}.txt`);
    fs.writeFileSync(transformedCvPath, transformedCvContent);
    
    // Save to database
    const query = `
      INSERT INTO converted_cvs (user_id, cv_path, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id, created_at
    `;
    const values = [userId || 1, transformedCvPath];
    const result = await pool.query(query, values);
    
    res.json({
      id: result.rows[0].id,
      content: transformedCvContent,
      timestamp: result.rows[0].created_at,
      targetRole: targetRole,
      cvPath: transformedCvPath
    });
  } catch (error) {
    console.error('Error converting CV:', error);
    res.status(500).json({ error: 'Error converting CV' });
  }
});

// Get job description from URL
app.post('/api/fetch-job-description', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    
    const response = await axios.get(url);
    const jobDescription = response.data;
    
    res.json({ jobDescription });
  } catch (error) {
    console.error('Error fetching job description:', error);
    res.status(500).json({ error: 'Error fetching job description' });
  }
});

// Get all converted CVs for a user
app.get('/api/conversions', async (req, res) => {
  try {
    const userId = req.query.userId || 1;
    
    const query = `
      SELECT * FROM converted_cvs
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    
    const conversions = result.rows.map(row => {
      let content = '';
      try {
        content = fs.readFileSync(row.cv_path, 'utf8');
      } catch (err) {
        console.error(`Error reading CV file: ${row.cv_path}`, err);
        content = 'Error reading CV content';
      }
      
      return {
        id: row.id,
        userId: row.user_id,
        timestamp: row.created_at,
        cvPath: row.cv_path,
        content,
        targetRole: content.split('\n')[0].replace(' CV', '')
      };
    });
    
    res.json(conversions);
  } catch (error) {
    console.error('Error fetching conversions:', error);
    res.status(500).json({ error: 'Error fetching conversions' });
  }
});

// Get a specific conversion
app.get('/api/conversions/:id', async (req, res) => {
  try {
    const conversionId = req.params.id;
    
    const query = 'SELECT * FROM converted_cvs WHERE id = $1';
    const result = await pool.query(query, [conversionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversion not found' });
    }
    
    const conversion = result.rows[0];
    let content = '';
    try {
      content = fs.readFileSync(conversion.cv_path, 'utf8');
    } catch (err) {
      console.error(`Error reading CV file: ${conversion.cv_path}`, err);
      content = 'Error reading CV content';
    }
    
    res.json({
      id: conversion.id,
      userId: conversion.user_id,
      timestamp: conversion.created_at,
      cvPath: conversion.cv_path,
      content,
      targetRole: content.split('\n')[0].replace(' CV', '')
    });
  } catch (error) {
    console.error('Error fetching conversion:', error);
    res.status(500).json({ error: 'Error fetching conversion' });
  }
});

// Delete a conversion
app.delete('/api/conversions/:id', async (req, res) => {
  try {
    const conversionId = req.params.id;
    
    // Get the CV path before deleting the record
    const selectQuery = 'SELECT cv_path FROM converted_cvs WHERE id = $1';
    const selectResult = await pool.query(selectQuery, [conversionId]);
    
    if (selectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversion not found' });
    }
    
    const cvPath = selectResult.rows[0].cv_path;
    
    // Delete from database
    const deleteQuery = 'DELETE FROM converted_cvs WHERE id = $1';
    await pool.query(deleteQuery, [conversionId]);
    
    // Delete the file
    try {
      fs.unlinkSync(cvPath);
    } catch (err) {
      console.error(`Error deleting file: ${cvPath}`, err);
      // Continue even if file deletion fails
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting conversion:', error);
    res.status(500).json({ error: 'Error deleting conversion' });
  }
});

// Submit a data deletion request
app.post('/api/deletion-request', async (req, res) => {
  try {
    const { userEmail, reason } = req.body;
    
    // Get user ID based on email (in a real app)
    const userId = 1; // Placeholder
    
    const query = `
      INSERT INTO deletion_requests (user_id, request_date, status)
      VALUES ($1, NOW(), 'pending')
      RETURNING id
    `;
    const result = await pool.query(query, [userId]);
    
    res.status(201).json({
      id: result.rows[0].id,
      message: 'Deletion request submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting deletion request:', error);
    res.status(500).json({ error: 'Error submitting deletion request' });
  }
});

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
