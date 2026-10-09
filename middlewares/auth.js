import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'mi_secreto_super_seguro_para_jose_123');

export const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Token no proporcionado o inválido");
      error.status = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    const error = new Error("Token inválido o expirado");
    error.status = 401;
    next(error);
  }
};

export const permitir = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      const error = new Error("Acceso denegado: rol insuficiente");
      error.status = 403;
      return next(error);
    }
    next();
  };
};

export const exigirMfa = (req, res, next) => {
  if (!req.user || req.user.mfa !== true) {
    const error = new Error("Se requiere autenticación multifactor (MFA)");
    error.status = 401;
    return next(error);
  }
  next();
};
