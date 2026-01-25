from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, EmailStr, Field, validator
from supabase import create_client, Client
from sqlalchemy import create_engine, Column, String, BigInteger, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import re


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Faltan las credenciales de Supabase en el archivo .env")

if not DATABASE_URL:
    raise ValueError("Falta DATABASE_URL en el archivo .env")


if ENVIRONMENT == "production":
    ALLOWED_ORIGINS = [
        "https://fiva-waitlist.vercel.app",
        "https://fiva-waitlist-page-production.up.railway.app",
        "https://www.fivadata.com", 
        "https://fivadata.com" 
    ]
    TRUSTED_HOSTS = [
        "fiva-waitlist.vercel.app",
        "fiva-waitlist-page-production.up.railway.app",
        "www.fivadata.com",          
        "fivadata.com"          
    ]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    TRUSTED_HOSTS = ["localhost", "127.0.0.1"]

# Configuración de SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelo de la tabla (ACTUALIZADO CON PHONE)
class WaitlistDB(Base):
    __tablename__ = "waitlist"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)  # NUEVO CAMPO
    company_name = Column(String(255), nullable=False)
    company_niche = Column(String(255), nullable=False)
    company_size = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'))

# Configurar rate limiter
limiter = Limiter(key_func=get_remote_address)


# Inicializar FastAPI
app = FastAPI(
    title="Waitlist API",
    description="API para gestionar waitlist de empresas con seguridad mejorada",
    version="2.1.0",
    docs_url="/docs" if ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if ENVIRONMENT == "development" else None
)

# Registrar rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600
)


app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=TRUSTED_HOSTS + ["*"] if ENVIRONMENT == "development" else TRUSTED_HOSTS
)

@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Modelo Pydantic (ACTUALIZADO CON PHONE)
class WaitlistEntry(BaseModel):
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=20)  # NUEVO CAMPO
    company_name: str = Field(..., min_length=2, max_length=255)
    company_niche: str = Field(..., min_length=2, max_length=255)
    company_size: str = Field(..., min_length=1, max_length=50)

    @validator('email')
    def validate_email(cls, v):
        if not v or len(v) > 255:
            raise ValueError('Email inválido')
        disposable_domains = ['tempmail.com', 'throwaway.email', '10minutemail.com']
        domain = v.split('@')[1].lower()
        if domain in disposable_domains:
            raise ValueError('No se permiten emails temporales')
        return v.lower().strip()

    @validator('phone')
    def validate_phone(cls, v):
        # Limpiar el teléfono de espacios y caracteres especiales
        cleaned = re.sub(r'[^\d+]', '', v)
        # Validar formato básico (puede ajustarse según necesidades)
        if not re.match(r'^\+?[\d]{7,15}$', cleaned):
            raise ValueError('Número de teléfono inválido')
        return cleaned

    @validator('company_name', 'company_niche')
    def validate_text_fields(cls, v):
        if not re.match(r'^[a-zA-Z0-9\s\-\.,áéíóúÁÉÍÓÚñÑ&()]+$', v):
            raise ValueError('El campo contiene caracteres no permitidos')
        cleaned = v.strip()
        if not cleaned:
            raise ValueError('El campo no puede estar vacío')
        return cleaned

    @validator('company_size')
    def validate_company_size(cls, v):
        # ACTUALIZADO CON "No aplica"
        valid_sizes = ['1-10', '11-50', '51-200', '201-500', '500+', 'No aplica']
        if v not in valid_sizes:
            raise ValueError(f'Tamaño de empresa debe ser uno de: {", ".join(valid_sizes)}')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "email": "contacto@empresa.com",
                "phone": "+573001234567",
                "company_name": "Mi Empresa SAS",
                "company_niche": "Tecnología",
                "company_size": "11-50"
            }
        }

@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        print("Tablas verificadas/creadas exitosamente")
        print(f"Entorno: {ENVIRONMENT}")
        print(f"Orígenes permitidos: {ALLOWED_ORIGINS}")
    except Exception as e:
        print(f"Error al crear tablas: {str(e)}")

@app.get("/")
@limiter.limit("30/minute")
async def root(request: Request):
    return {
        "message": "Waitlist API activa con seguridad mejorada",
        "version": "2.1.0",
        "environment": ENVIRONMENT,
        "endpoints": {
            "POST /waitlist": "Registrar en waitlist (5 req/min por IP)",
            "GET /health": "Verificar estado del servicio",
            "GET /waitlist/count": "Obtener total de registros"
        }
    }

@app.get("/health")
@limiter.limit("60/minute")
async def health_check(request: Request):
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {
            "status": "healthy",
            "database": "connected",
            "pooler": "transaction mode",
            "environment": ENVIRONMENT
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Error de conexión con la base de datos"
        )

@app.post("/waitlist", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def add_to_waitlist(entry: WaitlistEntry, request: Request):
    """Agregar una empresa a la waitlist"""
    db = SessionLocal()
    try:
        existing = db.query(WaitlistDB).filter(WaitlistDB.email == entry.email).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este email ya está registrado en la waitlist"
            )
        
        # Crear nuevo registro (ACTUALIZADO CON PHONE)
        new_entry = WaitlistDB(
            email=entry.email,
            phone=entry.phone,
            company_name=entry.company_name,
            company_niche=entry.company_niche,
            company_size=entry.company_size
        )
        
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        
        return {
            "message": "Registrado exitosamente en la waitlist",
            "data": {
                "id": new_entry.id,
                "email": new_entry.email,
                "phone": new_entry.phone,
                "company_name": new_entry.company_name,
                "created_at": new_entry.created_at.isoformat()
            }
        }
    
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este email ya está registrado en la waitlist"
        )
    except Exception as e:
        db.rollback()
        print(f"Error al insertar en base de datos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al procesar la solicitud. Por favor intenta nuevamente."
        )
    finally:
        db.close()

@app.get("/waitlist/count")
@limiter.limit("20/minute")
async def get_waitlist_count(request: Request):
    db = SessionLocal()
    try:
        count = db.query(WaitlistDB).count()
        return {
            "total_registrations": count,
            "message": f"Hay {count} empresas en la waitlist"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener estadísticas"
        )
    finally:
        db.close()

@app.get("/waitlist/recent")
@limiter.limit("10/minute")
async def get_recent_entries(request: Request, limit: int = 10):
    if ENVIRONMENT == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Endpoint no disponible en producción"
        )
    
    if limit > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El límite máximo es 50 registros"
        )
    
    db = SessionLocal()
    try:
        entries = db.query(WaitlistDB).order_by(WaitlistDB.created_at.desc()).limit(limit).all()
        return {
            "count": len(entries),
            "entries": [
                {
                    "id": e.id,
                    "email": e.email,
                    "phone": e.phone,
                    "company_name": e.company_name,
                    "company_niche": e.company_niche,
                    "company_size": e.company_size,
                    "created_at": e.created_at.isoformat()
                }
                for e in entries
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener registros recientes"
        )
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
