import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables:');
  console.log('PORT:', process.env.PORT);
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
});