# 🏨 HotelBook - Sistema de Reservas de Hoteles

Sistema completo de reservas con arquitectura de microservicios.

## Inicio rápido

```bash
docker-compose up --build
```

Abre: **http://localhost:3000**

## Credenciales de prueba

Regístrate en `/registro` con cualquier correo. Elige rol "Administrador" para acceder al panel de admin.

## Servicios

| Servicio | Puerto |
|----------|--------|
| Frontend | 3000 |
| User Service | 8000 |
| Hotel Service | 8001 |
| Booking Service | 8002 |
| Payment Service | 8003 |
| API Gateway | 80 |

## Tecnologías

- Python FastAPI + PostgreSQL + MongoDB
- React 18
- Docker + Kubernetes + Helm
- GitHub Actions CI/CD
- DigitalOcean Container Registry
