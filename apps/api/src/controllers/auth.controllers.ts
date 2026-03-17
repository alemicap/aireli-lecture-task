import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PlatformUser } from "@enterprise-commerce/core/platform/types"
import { createUser } from "../models/User"

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // 1. Basic input validation
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    // 2. Prepare user data, omitting 'id' as our createUser function expects Omit<PlatformUser, 'id'>
    const newUser: Omit<PlatformUser, 'id'> = {
      email,
      password,
      // Add any other default fields required by PlatformUser here
    };

    // 3. Save the user to the database
    const createdUser = await createUser(newUser);

    // 4. Generate a JWT token for the newly registered user
    // Note: Always store your JWT secret securely in environment variables (e.g., process.env.JWT_SECRET)
    const secret = process.env.JWT_SECRET || 'your_development_secret_key'; 
    const token = jwt.sign(
      { id: createdUser.id, email: createdUser.email }, 
      secret, 
      { expiresIn: '24h' }
    );

    // 5. Sanitize the response (never send the hashed password back to the client)
    const { password: _, ...userResponse } = createdUser;

    // 6. Send success response
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Error registering user:', error);
    
    // Handle specific database errors (like a duplicate email constraint) if needed
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'A user with this email already exists.' });
      return;
    }

    res.status(500).json({ error: 'An internal server error occurred during registration.' });
  }
};