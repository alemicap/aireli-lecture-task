import express from 'express';
import routes from './routes'; // Imports the router you just updated

const app = express();

// Crucial: Middleware to parse incoming JSON payloads from req.body
app.use(express.json());

// Mount the routes. 
// Using '/api/auth' as a prefix means the full URL will be POST /api/auth/register
app.use('/api/auth', routes);

// Assuming your server.ts handles the app.listen() part, you likely export app here:
export default app;