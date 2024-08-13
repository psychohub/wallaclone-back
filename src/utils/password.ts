import bcrypt from 'bcrypt';

export const hashPassword = async (unhashedPassword: string) => {
	const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(unhashedPassword, salt);
	return hashedPassword;
};

export const comparePasswords = async (password: string, hashedPassword: string) => {
	return await bcrypt.compare(password, hashedPassword);
};
