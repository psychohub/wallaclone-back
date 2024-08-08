export const createSlug = (name: string) => name.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
