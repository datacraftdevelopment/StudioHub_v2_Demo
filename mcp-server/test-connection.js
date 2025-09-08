#!/usr/bin/env node

import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create an agent that accepts self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function testConnection() {
  console.log('Testing FileMaker connection...\n');
  
  // Check environment variables
  const requiredVars = ['STUDIOHUB_HOST', 'STUDIOHUB_USERNAME', 'STUDIOHUB_PASSWORD'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.log('\nPlease create a .env file with:');
    console.log('STUDIOHUB_HOST=your-filemaker-server.com');
    console.log('STUDIOHUB_USERNAME=your-api-username');
    console.log('STUDIOHUB_PASSWORD=your-secure-password');
    console.log('STUDIOHUB_DATABASE=StudioHub (optional, defaults to StudioHub)');
    console.log('STUDIOHUB_SSL_VERIFY=false (optional, defaults to false)');
    return;
  }
  
  const config = {
    host: process.env.STUDIOHUB_HOST,
    database: process.env.STUDIOHUB_DATABASE || 'StudioHub',
    username: process.env.STUDIOHUB_USERNAME,
    password: process.env.STUDIOHUB_PASSWORD,
    sslVerify: process.env.STUDIOHUB_SSL_VERIFY === 'true'
  };
  
  console.log('Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  Username: ${config.username}`);
  console.log(`  SSL Verify: ${config.sslVerify}`);
  console.log('');
  
  const authUrl = `https://${config.host}/fmi/data/v1/databases/${config.database}/sessions`;
  
  try {
    console.log('Attempting to authenticate...');
    const response = await axios.post(authUrl, {}, {
      auth: {
        username: config.username,
        password: config.password
      },
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: config.sslVerify ? undefined : httpsAgent,
      timeout: 10000
    });
    
    console.log('✅ Authentication successful!');
    console.log(`  Token: ${response.data.response.token.substring(0, 20)}...`);
    
    // Test getting layouts
    const layoutsUrl = `https://${config.host}/fmi/data/v1/databases/${config.database}/layouts`;
    console.log('\nFetching available layouts...');
    
    const layoutsResponse = await axios.get(layoutsUrl, {
      headers: {
        'Authorization': `Bearer ${response.data.response.token}`,
        'Content-Type': 'application/json'
      },
      httpsAgent: config.sslVerify ? undefined : httpsAgent,
      timeout: 10000
    });
    
    console.log('✅ Layouts retrieved successfully!');
    console.log('  Available layouts:');
    layoutsResponse.data.response.layouts.forEach(layout => {
      console.log(`    - ${layout.name}`);
    });
    
  } catch (error) {
    console.error('❌ Connection failed!');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${error.response.data?.messages?.[0]?.message || error.message}`);
    } else if (error.request) {
      console.error(`  No response received: ${error.message}`);
      console.error('  Check if the host is correct and accessible');
    } else {
      console.error(`  Error: ${error.message}`);
    }
  }
}

testConnection();