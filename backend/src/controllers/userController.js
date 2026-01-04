import { UserRepository } from '../repositories/UserRepository.js';

const userRepository = new UserRepository();

export const search = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { email: 'Email is required' }
      });
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user: user.toArray() }
    });
  } catch (error) {
    next(error);
  }
};



