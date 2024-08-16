import { Request, Response } from 'express';
import mongoose, { Model, Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getAnuncios, uploadImages, getAnunciosUsuario, editAnuncio   } from '../controllers/anuncioController';
import Anuncio, { IAnuncio } from '../models/Anuncio';
import Usuario, { IUsuario } from '../models/Usuario';
import * as anuncioUtils from '../utils/anuncio';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors';

// Definir el tipo del modelo de Anuncio
type AnuncioModel = Model<IAnuncio, {}, {}>

// Extender el tipo Document con IAnuncio
interface IAnuncioDocument extends IAnuncio, Document {}

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

  describe('editAnuncio', () => {
    it('debería actualizar un anuncio exitosamente', async () => {
      const usuario = await Usuario.create({
        nombre: 'UsuarioDePrueba',
        email: 'usuario@prueba.com',
        contraseña: 'password'
      });
    
      const anuncio = await (Anuncio as AnuncioModel).create({
        nombre: 'Anuncio Original',
        descripcion: 'Descripción original',
        imagen: 'imagen-original.jpg',
        precio: 100,
        tipoAnuncio: 'venta',
        autor: usuario._id,
        fechaPublicacion: new Date()
      });

      const id = (anuncio._id as mongoose.Types.ObjectId).toString();
      const mockRequest = {
        params: { id },
        body: {
          nombre: 'Anuncio Actualizado',
          imagen: 'imagen-actualizada.jpg',
          descripcion: 'Descripción actualizada',
          tipoAnuncio: 'venta',
          precio: 150,
          tags: ['nuevo', 'tecnología']
        },
        
        userId: (anuncio._id as mongoose.Types.ObjectId).toString()
      } as unknown as Request;
    
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      jest.spyOn(anuncioUtils, 'isOwner').mockResolvedValue(true);
    
      await editAnuncio(mockRequest, mockResponse as Response);
    
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Anuncio actualizado exitosamente',
        anuncio: expect.objectContaining({
          nombre: 'Anuncio Actualizado',
          imagen: 'imagen-actualizada.jpg',
          descripcion: 'Descripción actualizada',
          precio: 150,
          tags: ['nuevo', 'tecnología']
        })
      }));
    });


    it('debería retornar un error si el usuario no está autenticado', async () => {
      const anuncio: IAnuncio = new Anuncio({
        nombre: 'Anuncio Original',
        descripcion: 'Descripción original',
        imagen: 'imagen-original.jpg',
        precio: 100,
        tipoAnuncio: 'venta',
        fechaPublicacion: new Date()
      });
      await anuncio.save();

      const id = (anuncio._id as mongoose.Types.ObjectId).toString();
      const mockRequest = {
        params: { id },
        body: {
          nombre: 'Anuncio Actualizado',
          imagen: 'imagen-actualizada.jpg',
          descripcion: 'Descripción actualizada',
          tipoAnuncio: 'venta',
          precio: 150,
          tags: ['nuevo', 'tecnología']
        },
        userId: undefined
      } as unknown as Request;

      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse: Partial<Response> = {
        status: mockStatus,
        json: mockJson
      };

      await editAnuncio(mockRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Usuario no autenticado'
      });
    });

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
      { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, fechaPublicacion: new Date() },
      { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, fechaPublicacion: new Date() },
      { nombre: 'Anuncio 3', descripcion: 'Descripción 3', imagen: 'imagen3.jpg', precio: 150, tipoAnuncio: 'venta', autor: usuario._id, fechaPublicacion: new Date() },
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
      { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, fechaPublicacion: new Date() },
      { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, fechaPublicacion: new Date() },
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
      { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, fechaPublicacion: new Date() },
      { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, fechaPublicacion: new Date() },
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
      { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', tags: ['tag1'], autor: usuario._id, fechaPublicacion: new Date() },
      { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', tags: ['tag2'], autor: usuario._id, fechaPublicacion: new Date() },
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



  describe('getAnunciosUsuario', () => {
    it('debería obtener los anuncios de un usuario específico', async () => {
      const usuario = new Usuario({
        nombre: 'UsuarioDePrueba', 
        email: 'usuario@prueba.com',
        contraseña: 'password'
      });
      await usuario.save();

      const anuncios = [
        { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, fechaPublicacion: new Date() },
        { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, fechaPublicacion: new Date() },
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
        { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, fechaPublicacion: new Date() },
        { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, fechaPublicacion: new Date() },
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
        { nombre: 'Anuncio 1', descripcion: 'Descripción 1', imagen: 'imagen1.jpg', precio: 100, tipoAnuncio: 'venta', autor: usuario._id, fechaPublicacion: new Date('2023-01-01') },
        { nombre: 'Anuncio 2', descripcion: 'Descripción 2', imagen: 'imagen2.jpg', precio: 200, tipoAnuncio: 'búsqueda', autor: usuario._id, fechaPublicacion: new Date('2023-02-01') },
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
});

});
