from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, validator
from supabase import create_client, Client
from sqlalchemy import create_engine, Column, String, BigInteger, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from dotenv import load_dotenv
import os
import re


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Faltan las credenciales de Supabase en el archivo .env")

if not DATABASE_URL:
    raise ValueError("Falta DATABASE_URL en el archivo .env")


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


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

# Modelo de la tabla
class WaitlistDB(Base):
    __tablename__ = "waitlist"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    company_niche = Column(String(255), nullable=False)
    company_size = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'))

# Inicializar FastAPI
app = FastAPI(
    title="Waitlist API",
    description="API para gestionar waitlist de empresas con Transaction Pooler",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class WaitlistEntry(BaseModel):
    email: EmailStr
    company_name: str = Field(..., min_length=2, max_length=255)
    company_niche: str = Field(..., min_length=2, max_length=255)
    company_size: str = Field(..., min_length=1, max_length=50)

    @validator('company_name', 'company_niche')
    def validate_text_fields(cls, v):
        # Evitar caracteres especiales maliciosos
        if not re.match(r'^[a-zA-Z0-9\s\-\.,áéíóúÁÉÍÓÚñÑ]+$', v):
            raise ValueError('El campo contiene caracteres no permitidos')
        return v.strip()

    @validator('company_size')
    def validate_company_size(cls, v):
        valid_sizes = ['1-10', '11-50', '51-200', '201-500', '500+']
        if v not in valid_sizes:
            raise ValueError(f'Tamaño de empresa debe ser uno de: {", ".join(valid_sizes)}')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "email": "contacto@empresa.com",
                "company_name": "Mi Empresa SAS",
                "company_niche": "Tecnología",
                "company_size": "11-50"
            }
        }


@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas verificadas/creadas exitosamente")
    except Exception as e:
        print(f"❌ Error al crear tablas: {str(e)}")

# Rutas de la API
@app.get("/")
async def root():
    return {
        "message": "Waitlist API activa con Transaction Pooler",
        "version": "1.0.0",
        "database": "PostgreSQL con Transaction Pooling",
        "endpoints": {
            "POST /waitlist": "Registrar en waitlist",
            "GET /health": "Verificar estado del servicio",
            "GET /waitlist/count": "Obtener total de registros"
        }
    }

@app.get("/health")
async def health_check():
    """Verificar que el servicio y la base de datos están funcionando"""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {
            "status": "healthy",
            "database": "connected",
            "pooler": "transaction mode"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error de conexión con la base de datos: {str(e)}"
        )

@app.post("/waitlist", status_code=status.HTTP_201_CREATED)
async def add_to_waitlist(entry: WaitlistEntry):
    """Agregar una empresa a la waitlist"""
    db = SessionLocal()
    try:
        # Verificar si el email ya existe
        existing = db.query(WaitlistDB).filter(WaitlistDB.email == entry.email).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este email ya está registrado en la waitlist"
            )
        
        # Crear nuevo registro
        new_entry = WaitlistDB(
            email=entry.email,
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
async def get_waitlist_count():
    """Obtener el número total de registros en la waitlist"""
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
async def get_recent_entries(limit: int = 10):
    """Obtener los registros más recientes"""
    db = SessionLocal()
    try:
        entries = db.query(WaitlistDB).order_by(WaitlistDB.created_at.desc()).limit(limit).all()
        return {
            "count": len(entries),
            "entries": [
                {
                    "id": e.id,
                    "email": e.email,
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

# (Para desarrollo local)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)