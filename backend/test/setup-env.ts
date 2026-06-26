// Runs before any test file is loaded. AppModule validates required env vars
// (via Joi) as soon as it's imported, so placeholders must exist before that
// import happens. The real MongoDB URI is swapped in inside beforeAll, before
// the Nest testing module is compiled.
process.env.MONGODB_URI ??= 'mongodb://localhost:27017/teamboard-e2e-placeholder';
process.env.JWT_SECRET ??= 'e2e-test-secret-key-not-for-production';
process.env.JWT_EXPIRES_IN ??= '1h';
