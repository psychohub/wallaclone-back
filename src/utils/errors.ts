export class AppError extends Error {
    status: number;
    
    constructor(message: string, status: number = 500) {
      super(message);
      this.name = this.constructor.name;
      this.status = status;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message: string = 'Recurso no encontrado') {
      super(message, 404);
    }
  }
  
  export class BadRequestError extends AppError {
    constructor(message: string = 'Solicitud inválida') {
      super(message, 400);
    }
  }
  
  export class UnauthorizedError extends AppError {
    constructor(message: string = 'No autorizado') {
      super(message, 401);
    }
  }
  
  export class ForbiddenError extends AppError {
    constructor(message: string = 'Acceso prohibido') {
      super(message, 403);
    }
  }
  
  export class ConflictError extends AppError {
    constructor(message: string = 'Conflicto con el estado actual') {
      super(message, 409);
    }
  }