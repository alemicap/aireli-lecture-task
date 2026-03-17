import { Router } from 'express';
import { registerUser } from './controllers/auth.controllers'; // Matched your exact filename

const router = Router();

// Define the POST route for /register
router.post('/register', registerUser);

// As you build out the app, you can add your other routes here too:
// import { getProducts } from './controllers/products.controllers';
// router.get('/products', getProducts);

export default router;