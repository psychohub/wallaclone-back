import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createAnuncio, getAnuncios, getAnunciosUsuario, getAnuncio, deleteAnuncio } from '../controllers/anuncioController';
import Anuncio from '../models/Anuncio';
import Usuario from '../models/Usuario';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  jest.setTimeout(30000); 
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Anuncio Controller', () => {
  beforeEach(async () => {
    await Anuncio.deleteMany({});
    await Usuario.deleteMany({});
  });

  

  // Pruebas para createAnuncio
  describe('createAnuncio', () => {
    it('debería crear un nuevo anuncio', async () => {
      const usuario = await Usuario.create({
        nombre: 'UsuarioDePrueba',
        email: 'usuario@prueba.com',
        contraseña: 'password',
        fechaRegistro: new Date(),
        anunciosFavoritos: []
      });

      const userIdAsString = (usuario._id as mongoose.Types.ObjectId).toString();

      const mockFile = {
        filename: 'imagen.jpg',
        path: 'path/to/imagen.jpg',
      };

      const mockRequest = {
        body: {
          nombre: 'Anuncio de Prueba',
          descripcion: 'Descripción de prueba',
          tipoAnuncio: 'venta',
          precio: 100,
          tags: ['tag1', 'tag2'],
        },
        file: mockFile,
        userId: userIdAsString,
      } as unknown as Request;

      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson,
      };

      await createAnuncio(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalled();
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData.anuncio).toHaveProperty('nombre', 'Anuncio de Prueba');
      expect(responseData.anuncio).toHaveProperty('slug');
      expect(responseData.anuncio).toHaveProperty('autor');
      expect((responseData.anuncio.autor as Types.ObjectId).toString()).toBe(userIdAsString);

      const anuncioCreado = await Anuncio.findOne({ nombre: 'Anuncio de Prueba' });
      expect(anuncioCreado).not.toBeNull();
      expect((anuncioCreado!.autor as Types.ObjectId).toString()).toBe(userIdAsString);
      expect(anuncioCreado!.imagen).toBe('/images/imagen.jpg');
    });

    it('debería devolver un error si faltan campos requeridos', async () => {
      const usuario = await Usuario.create({
        nombre: 'UsuarioDePrueba',
        email: 'usuario@prueba.com',
        contraseña: 'password',
        fechaRegistro: new Date(),
        anunciosFavoritos: []
      });

      const userIdAsString = (usuario._id as mongoose.Types.ObjectId).toString();

      const mockRequest = {
        body: {
          descripcion: 'Descripción de prueba',
          tipoAnuncio: 'venta',
          precio: 100,
          tags: ['tag1', 'tag2'],
        },
        file: {
          filename: 'imagen.jpg',
          path: 'path/to/imagen.jpg',
        },
        userId: userIdAsString,
      } as unknown as Request;

      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson,
      };

      await createAnuncio(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Faltan campos requeridos',
      }));
    });

    it('debería devolver un error si el usuario no está autenticado', async () => {
      const mockRequest = {
        body: {
          nombre: 'Anuncio de Prueba',
          descripcion: 'Descripción de prueba',
          tipoAnuncio: 'venta',
          precio: 100,
          tags: ['tag1', 'tag2'],
        },
        file: {
          filename: 'imagen.jpg',
          path: 'path/to/imagen.jpg',
        },
      } as unknown as Request; // No se proporciona userId

      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson,
      };

      await createAnuncio(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Usuario no autenticado',
      }));
    });
  });

  // Pruebas para getAnuncios
  describe('getAnuncios', () => {
    it('debería obtener una lista vacía de anuncios', async () => {
      const mockRequest = {
        query: {}
      } as unknown as Request;
      
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnuncios(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        anuncios: [],
        total: 0,
        page: 1,
        totalPages: 0
      });
    });

    it('debería obtener anuncios con paginación', async () => {
      const usuario = new Usuario({
        nombre: 'UsuarioDePrueba', 
        email: 'usuario@prueba.com',
        contraseña: 'password'
      });
      await usuario.save();
    
      const anuncios = [
        { 
          nombre: 'Anuncio 1', 
          descripcion: 'Descripción 1', 
          imagen: 'imagen1.jpg', 
          precio: 100, 
          tipoAnuncio: 'venta', 
          autor: usuario._id, 
          slug: 'anuncio-1',
          fechaPublicacion: new Date() 
        },
        { 
          nombre: 'Anuncio 2', 
          descripcion: 'Descripción 2', 
          imagen: 'imagen2.jpg', 
          precio: 200, 
          tipoAnuncio: 'búsqueda', 
          autor: usuario._id, 
          slug: 'anuncio-2',
          fechaPublicacion: new Date() 
        },
        { 
          nombre: 'Anuncio 3', 
          descripcion: 'Descripción 3', 
          imagen: 'imagen3.jpg', 
          precio: 150, 
          tipoAnuncio: 'venta', 
          autor: usuario._id, 
          slug: 'anuncio-3',
          fechaPublicacion: new Date() 
        }
      ];
      await Anuncio.insertMany(anuncios);
    
      const mockRequest = {
        query: { page: '1', limit: '2' }
      } as unknown as Request;
      
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };
    
      await getAnuncios(mockRequest, mockResponse as Response);
    
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData.anuncios.length).toBe(2);
      expect(responseData.total).toBe(3);
      expect(responseData.totalPages).toBe(2);
      responseData.anuncios.forEach((anuncio: any) => {
        expect(anuncio).toHaveProperty('autor');
        expect(anuncio.autor).toHaveProperty('nombre', 'UsuarioDePrueba');
      });
    });

    it('debería manejar errores', async () => {
      jest.spyOn(Anuncio, 'countDocuments').mockImplementationOnce(() => {
        throw new Error('Error de base de datos');
      });

      const mockRequest = {
        query: {}
      } as unknown as Request;
      
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnuncios(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ 
          message: 'Error en el servidor', 
          error: 'Error de base de datos'
        })
      );
    });

    it('debería filtrar anuncios por nombre', async () => {
      const usuario = new Usuario({
        nombre: 'UsuarioDePrueba', 
        email: 'usuario@prueba.com',
        contraseña: 'password'
      });
      await usuario.save();

      const anuncios = [
        { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, slug: 'anuncio-1', fechaPublicacion: new Date() },
        { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, slug: 'anuncio-2', fechaPublicacion: new Date() },
      ];
      await Anuncio.insertMany(anuncios);

      const mockRequest = {
        query: { nombre: 'Anuncio 1', page: '1', limit: '2' }
      } as unknown as Request;
      
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnuncios(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData.anuncios.length).toBe(1);
      expect(responseData.anuncios[0].nombre).toBe('Anuncio 1');
    });

    it('debería filtrar anuncios por rango de precio', async () => {
      const usuario = new Usuario({
        nombre: 'UsuarioDePrueba', 
        email: 'usuario@prueba.com',
        contraseña: 'password'
      });
      await usuario.save();

      const anuncios = [
        { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, slug: 'anuncio-1', fechaPublicacion: new Date() },
        { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, slug: 'anuncio-2', fechaPublicacion: new Date() },
      ];
      await Anuncio.insertMany(anuncios);

      const mockRequest = {
        query: { minPrecio: '150', page: '1', limit: '2' }
      } as unknown as Request;
      
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnuncios(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData.anuncios.length).toBe(1);
      expect(responseData.anuncios[0].precio).toBe(200);
    });

    it('debería filtrar anuncios por tag', async () => {
      const usuario = new Usuario({
        nombre: 'UsuarioDePrueba', 
        email: 'usuario@prueba.com',
        contraseña: 'password'
      });
      await usuario.save();

      const anuncios = [
        { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', tags: ['tag1'], autor: usuario._id, slug: 'anuncio-1', fechaPublicacion: new Date() },
        { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', tags: ['tag2'], autor: usuario._id, slug: 'anuncio-2', fechaPublicacion: new Date() },
      ];
      await Anuncio.insertMany(anuncios);

      const mockRequest = {
        query: { tag: 'tag1', page: '1', limit: '2' }
      } as unknown as Request;
      
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnuncios(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData.anuncios.length).toBe(1);
      expect(responseData.anuncios[0].tags).toContain('tag1');
    });
  });

  // Pruebas para getAnunciosUsuario
  describe('getAnunciosUsuario', () => {
    it('debería obtener los anuncios de un usuario específico', async () => {
      const usuario = new Usuario({
        nombre: 'UsuarioDePrueba', 
        email: 'usuario@prueba.com',
        contraseña: 'password'
      });
      await usuario.save();

      const anuncios = [
        { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, slug: 'anuncio-1', fechaPublicacion: new Date() },
        { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, slug: 'anuncio-2', fechaPublicacion: new Date() },
      ];
      await Anuncio.insertMany(anuncios);

      const mockRequest = {
        params: { nombreUsuario: 'UsuarioDePrueba' },
        query: { page: '1', limit: '10' }
      } as unknown as Request;
      
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnunciosUsuario(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData.anuncios.length).toBe(2);
      expect(responseData.total).toBe(2);
      expect(responseData.page).toBe(1);
      expect(responseData.totalPages).toBe(1);
    });

    it('debería manejar el caso de usuario no encontrado', async () => {
      const mockRequest = {
        params: { nombreUsuario: 'UsuarioInexistente' },
        query: {}
      } as unknown as Request;
      
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnunciosUsuario(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('debería filtrar anuncios de usuario por nombre', async () => {
      const usuario = new Usuario({
        nombre: 'UsuarioDePrueba', 
        email: 'usuario@prueba.com',
        contraseña: 'password'
      });
      await usuario.save();

      const anuncios = [
        { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, slug: 'anuncio-1', fechaPublicacion: new Date('2023-01-01') },
        { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, slug: 'anuncio-2', fechaPublicacion: new Date('2023-02-01') },
      ];
      await Anuncio.insertMany(anuncios);

      const mockRequest = {
        params: { nombreUsuario: 'UsuarioDePrueba' },
        query: { nombre: 'Anuncio 1', page: '1', limit: '10' }
      } as unknown as Request;
      
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnunciosUsuario(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData.anuncios.length).toBe(1);
      expect(responseData.anuncios[0].nombre).toBe('Anuncio 1');
    });

    it('debería ordenar anuncios de usuario', async () => {
      const usuario = new Usuario({
        nombre: 'UsuarioDePrueba', 
        email: 'usuario@prueba.com',
        contraseña: 'password'
      });
      await usuario.save();

      const anuncios = [
        { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, slug: 'anuncio-1', fechaPublicacion: new Date('2023-01-01') },
        { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, slug: 'anuncio-2', fechaPublicacion: new Date('2023-02-01') },
      ];
      await Anuncio.insertMany(anuncios);

      const mockRequest = {
        params: { nombreUsuario: 'UsuarioDePrueba' },
        query: { sort: 'asc', page: '1', limit: '10' }
      } as unknown as Request;
      
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnunciosUsuario(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData.anuncios.length).toBe(2);
      expect(responseData.anuncios[0].nombre).toBe('Anuncio 1');
      expect(responseData.anuncios[1].nombre).toBe('Anuncio 2');
    });
  });

  // Pruebas para getAnuncio
  describe('getAnuncio', () => {
    it('debería obtener un anuncio por su slug', async () => {
      const usuario = new Usuario({
        nombre: 'UsuarioDePrueba',
        email: 'usuario@prueba.com',
        contraseña: 'password'
      });
      await usuario.save();

      const anuncio = await Anuncio.create({
        nombre: 'Anuncio de Prueba',
        descripcion: 'Descripción de prueba',
        imagen: 'imagen.jpg',
        precio: 100,
        tipoAnuncio: 'venta',
        autor: usuario._id,
        slug: 'anuncio-de-prueba',
        fechaPublicacion: new Date()
      });

      const mockRequest = {
        params: { slug: 'anuncio-de-prueba' }
      } as unknown as Request;

      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnuncio(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData.result).toHaveProperty('nombre', 'Anuncio de Prueba');
      expect(responseData.result).toHaveProperty('slug', 'anuncio-de-prueba');
    });

    it('debería manejar el caso de anuncio no encontrado', async () => {
      const mockRequest = {
        params: { slug: 'anuncio-inexistente' }
      } as unknown as Request;

      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await getAnuncio(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200); // Aquí puedes ajustar según cómo manejes este caso en el controlador
      expect(mockJson).toHaveBeenCalledWith({ result: null });
    });
  });

  // Pruebas para deleteAnuncio
  describe('deleteAnuncio', () => {
    it('debería eliminar un anuncio si el usuario es el propietario', async () => {
      const usuario = await Usuario.create({
        nombre: 'UsuarioDePrueba',
        email: 'usuario@prueba.com',
        contraseña: 'password',
      });

      const anuncio = await Anuncio.create({
        nombre: 'Anuncio a eliminar',
        descripcion: 'Descripción del anuncio a eliminar',
        imagen: 'imagen.jpg',
        precio: 100,
        tipoAnuncio: 'venta',
        autor: usuario._id,
        slug: 'anuncio-a-eliminar',
      });

      const userIdAsString = (usuario._id as mongoose.Types.ObjectId).toString();

      const mockRequest = {
        params: { anuncioId: (anuncio._id as mongoose.Types.ObjectId).toString() },
        userId: userIdAsString,
      } as unknown as Request;

      const mockSend = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ send: mockSend });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        send: mockSend,
      };

      await deleteAnuncio(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith('Anuncio eliminado correctamente');

      const anuncioEliminado = await Anuncio.findById(anuncio._id);
      expect(anuncioEliminado).toBeNull();
    });

    it('debería devolver un error si el usuario no es el propietario', async () => {
      const usuario1 = await Usuario.create({
        nombre: 'UsuarioDePrueba1',
        email: 'usuario1@prueba.com',
        contraseña: 'password',
      });

      const usuario2 = await Usuario.create({
        nombre: 'UsuarioDePrueba2',
        email: 'usuario2@prueba.com',
        contraseña: 'password',
      });

      const anuncio = await Anuncio.create({
        nombre: 'Anuncio a eliminar',
        descripcion: 'Descripción del anuncio a eliminar',
        imagen: 'imagen.jpg',
        precio: 100,
        tipoAnuncio: 'venta',
        autor: usuario1._id,
        slug: 'anuncio-a-eliminar',
      });

      const userIdAsString = (usuario2._id as mongoose.Types.ObjectId).toString();

      const mockRequest = {
        params: { anuncioId: (anuncio._id as mongoose.Types.ObjectId).toString() },
        userId: userIdAsString,
      } as unknown as Request;

      const mockSend = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ send: mockSend });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        send: mockSend,
      };

      await deleteAnuncio(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401); 
      expect(mockSend).toHaveBeenCalledWith('No autorizado para eliminar este anuncio');

      const anuncioNoEliminado = await Anuncio.findById(anuncio._id);
      expect(anuncioNoEliminado).not.toBeNull();
    });
  });
});
