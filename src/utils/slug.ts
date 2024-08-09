import Anuncio from "../models/Anuncio";

export const createSlug = async (name: string) => {
	let slug = name.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
	const exists = await slugExists(slug);
	if (exists) {
		const randomNumber = Math.floor(Math.random() * 1000000000);
		slug = await createSlug(`${name} ${randomNumber}`);
	}
	return slug;
};

const slugExists = async (slug: string) => {
	return await Anuncio.findOne({ slug: slug });
};
