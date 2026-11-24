const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { validate } = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');
const { asyncHandler } = require('../../utils/http');
const service = require('./auth.service');

const router = express.Router();

// Slow down password guessing (NFR-03).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many sign-in attempts. Try again in 15 minutes.' } },
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Enter your email address.' }).trim().email('Enter a valid email address.'),
  password: z.string({ required_error: 'Enter your password.' }).min(1, 'Enter your password.'),
  shopId: z.string().uuid().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20),
  shopId: z.string().uuid().optional(),
});

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    res.json(await service.login(req.body, req.ip));
  }),
);

router.post(
  '/refresh',
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    res.json(await service.refresh(req.body));
  }),
);

router.post(
  '/logout',
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    await service.logout(req.body);
    res.status(204).end();
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await service.me(req.user));
  }),
);

module.exports = router;
