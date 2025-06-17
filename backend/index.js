// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import resumeRoutes from './routes/resume.js';
import pdf from 'pdf-parse';
import authRoutes from './routes/auth.js';

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('⚠️ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database Connection Configuration
const connectDB = async () => {
  try {
    // Validate MongoDB URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connection options for improved stability
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Attempt connection
    await mongoose.connect(process.env.MONGODB_URI, connectionOptions);

    console.log('✅ MongoDB Connection Successful');
    console.log('Connection Details:');
    console.log(`- Host: ${mongoose.connection.host}`);
    console.log(`- Database Name: ${mongoose.connection.db.databaseName}`);
    console.log(`- Ready State: ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error Details:', error.message);
    
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to Database
connectDB();

// MongoDB Connection Event Listeners
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Connection Error:', err);
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB Reconnected Successfully');
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
    },
    model: "gemini-1.5-flash",
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
    ],
});

// Test routes
app.get('/', (req, res) => {
    console.log('Root route hit');
    res.send('Resume Analysis Backend is running');
});

app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Test endpoint working!' });
});

// Gemini API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        console.log('Chat endpoint hit with body:', req.body);
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Generated response:', text);
        res.json({ response: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Something went wrong',
            details: error.message 
        });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(isConnected ? 200 : 500).json({
    status: isConnected ? 'Healthy' : 'Disconnected',
    mongoDBStatus: mongoose.connection.readyState,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
});

// Handle 404
app.use((req, res) => {
    console.log('404 - Route not found:', req.path);
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('\nAvailable endpoints:');
    console.log(`1. GET  http://localhost:${PORT}/      -> Test server`);
    console.log(`2. GET  http://localhost:${PORT}/test  -> Test endpoint`);
    console.log(`3. POST http://localhost:${PORT}/api/chat -> Gemini AI chat`);
    console.log(`4. GET  http://localhost:${PORT}/health -> Health check`);
    console.log('\nTo test the chat endpoint in Postman:');
    console.log('1. Set method to POST');
    console.log('2. Use URL: http://localhost:5000/api/chat');
    console.log('3. Set Headers: Content-Type: application/json');
    console.log('4. Set Body (raw JSON):');
    console.log('   {');
    console.log('      "prompt": "Who is Virat Kohli?"');
    console.log('   }');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

// Keep the process running
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Prevent the process from exiting on unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add this near the top of the file
try {
  // Attempt to override pdf-parse initialization
  const originalPdfParse = pdf;
  pdf = (dataBuffer) => {
    // Remove or mock any file system operations
    return originalPdfParse(dataBuffer);
  };
} catch (error) {
  console.error('PDF Parse initialization error:', error);
}