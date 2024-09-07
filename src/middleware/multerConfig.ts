import multer from 'multer';

const storage = multer.memoryStorage();

// Inicializar Multer con la configuración de almacenamiento
const upload = multer({ storage });

export default upload;
