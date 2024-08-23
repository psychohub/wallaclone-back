// Lista de contraseñas comunes que no deben ser permitidas
const commonPasswords = [
  'Password1!',
  'Welcome123!',
  'Qwerty@123',
  'Admin@123',
  'Letmein!23',
  'Pa$$w0rd',
  'Hello@123',
  'Summer@2023',
  'ChangeMe!',
  'Abcdef@1',
  'Passw0rd!',
  'Master!123',
  'Welcome@123',
  'Winter!2023',
  'Spring@2023',
  'Autumn!123',
  'Example@123',
  'Temp@1234',
  'Admin!2023',
  'Default@1',
];

//De un objeto devuelve un array con las claves de aquellos valores que sean undefined
export const checkUndefined = (data: { [key: string]: string | undefined }): string[] => {
  let isUndefined: string[] = [];
  for (let key in data) {
    if (data[key] === undefined) {
      isUndefined.push(key);
    }
  }
  return isUndefined;
};

export const isValidName = (name: string): Boolean => {
  return !/^[a-zA-Z0-9_-]+$/.test(name);
};

export const isValidPassword = (password: string): Boolean => {
  if (password.length < 8) {
    return false;
  }

  // Verifica si contiene al menos una letra mayúscula
  const hasUpperCase = /[A-Z]/.test(password);

  // Verifica si contiene al menos una letra minúscula
  const hasLowerCase = /[a-z]/.test(password);

  // Verifica si contiene al menos un número
  const hasNumber = /[0-9]/.test(password);

  // Verifica si contiene al menos un carácter especial
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Verifica si la contraseña está en la lista de contraseñas comunes
  const isCommonPassword = commonPasswords.includes(password.toLowerCase());

  // Verifica que la contraseña cumpla con todos los requisitos
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && !isCommonPassword;
};
