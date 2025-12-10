const express = require('express');
const path = require('path');
const itemRoutes = require('./routes/item.route');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, '../public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test Route - API Status Page
app.get('/api/test', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Status</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          background: rgba(0, 20, 20, 0.8);
          border: 2px solid #00ff88;
          border-radius: 16px;
          padding: 40px 60px;
          text-align: center;
          box-shadow: 0 0 40px rgba(0, 255, 136, 0.2),
                      inset 0 0 60px rgba(0, 255, 136, 0.05);
        }
        .title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #00ff88;
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 16px;
          text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        }
        .subtitle {
          font-size: 1rem;
          color: #a0a0a0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: #00ff88;
          border-radius: 4px;
          color: #000;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="title">API IS LIVE</h1>
        <p class="subtitle">Your server is running smoothly <span class="check">✓</span></p>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// API Routes
app.use('/api/items', itemRoutes);

// Serve the main UI page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 Not Found handler - must be last
app.use((req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Page Not Found</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          overflow: hidden;
        }
        .container {
          text-align: center;
          z-index: 1;
        }
        .glitch {
          font-size: 8rem;
          font-weight: 900;
          color: #ff0055;
          text-shadow: 
            0 0 10px #ff0055,
            0 0 10px rgba(255, 0, 85, 0.5);
          letter-spacing: 10px;
        }
        .title {
          font-size: 2rem;
          color: #ffffff;
          margin-top: 20px;
          text-transform: uppercase;
          letter-spacing: 8px;
          animation: slideIn 0.5s ease-out;
        }
        .subtitle {
          font-size: 1rem;
          color: #888;
          margin-top: 16px;
          max-width: 400px;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          margin-top: 30px;
          padding: 14px 40px;
          background: transparent;
          border: 2px solid #ff0055;
          color: #ff0055;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 3px;
          border-radius: 50px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .btn:hover {
          background: #ff0055;
          color: #000;
          box-shadow: 0 0 30px rgba(255, 0, 85, 0.5);
        }
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ff0055;
          border-radius: 50%;
          opacity: 0.3;
          animation: float 15s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }
        .path {
          color: #ff0055;
          font-family: monospace;
          background: rgba(255, 0, 85, 0.1);
          padding: 8px 16px;
          border-radius: 8px;
          margin-top: 20px;
          display: inline-block;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    </head>
    <body>
      <div class="particles">
        <div class="particle" style="left: 5%; animation-delay: 0s;"></div>
        <div class="particle" style="left: 15%; animation-delay: 2s;"></div>
        <div class="particle" style="left: 25%; animation-delay: 4s;"></div>
        <div class="particle" style="left: 35%; animation-delay: 1s;"></div>
        <div class="particle" style="left: 45%; animation-delay: 3s;"></div>
        <div class="particle" style="left: 55%; animation-delay: 5s;"></div>
        <div class="particle" style="left: 65%; animation-delay: 2.5s;"></div>
        <div class="particle" style="left: 75%; animation-delay: 1.5s;"></div>
        <div class="particle" style="left: 85%; animation-delay: 4.5s;"></div>
        <div class="particle" style="left: 95%; animation-delay: 3.5s;"></div>
        <div class="particle" style="left: 10%; animation-delay: 6s;"></div>
        <div class="particle" style="left: 30%; animation-delay: 7s;"></div>
        <div class="particle" style="left: 50%; animation-delay: 8s;"></div>
        <div class="particle" style="left: 70%; animation-delay: 9s;"></div>
        <div class="particle" style="left: 90%; animation-delay: 10s;"></div>
      </div>
      <div class="container">
        <div class="glitch">404</div>
        <h1 class="title">Page Not Found</h1>
        <p class="subtitle">The page you're looking for doesn't exist or has been moved to another dimension.</p>
        <div class="path">Requested: ${req.path}</div>
        <br>
        <a href="/api/test" class="btn">Go Home</a>
      </div>
    </body>
    </html>
  `;
  res.status(404).send(html);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/items`);
});
