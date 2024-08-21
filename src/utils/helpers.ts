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
  return password.length < 6;
};
