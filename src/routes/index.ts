import express from 'express';
import userRoutes from './UserRoute';
import cryptoRoutes from './CryptoRoute';
import portfolioRoutes from './PortfolioRoute';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/crypto', cryptoRoutes);
router.use('/portfolios', portfolioRoutes);

module.exports = router;
