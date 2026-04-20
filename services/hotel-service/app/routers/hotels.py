from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from bson import ObjectId
from datetime import datetime
from app.core.database import db

router = APIRouter()

HOTELS = [
    {"name":"Grand Velas Riviera Maya","description":"Resort de ultra lujo frente al mar Caribe con servicio todo incluido premium y spa de clase mundial","location":{"city":"Playa del Carmen","country":"Mexico","address":"Carretera Cancun-Tulum Km 62"},"stars":5,"price_per_night":8500.0,"images":["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],"services":["Todo incluido","Spa","5 Restaurantes","Playa privada","Alberca infinita","Butler service"],"rooms_available":20,"rating":4.9,"reviews_count":842},
    {"name":"W Mexico City","description":"Hotel boutique de diseño vanguardista en el corazón de Polanco con vistas panorámicas a la ciudad","location":{"city":"Ciudad de Mexico","country":"Mexico","address":"Campos Eliseos 252, Polanco"},"stars":5,"price_per_night":4200.0,"images":["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"],"services":["Rooftop bar","Spa","Restaurante","Gimnasio","WiFi","Valet parking"],"rooms_available":15,"rating":4.8,"reviews_count":621},
    {"name":"Rosewood San Miguel de Allende","description":"Hotel colonial de lujo en el centro histórico de San Miguel con arquitectura del siglo XVIII restaurada","location":{"city":"San Miguel de Allende","country":"Mexico","address":"Nemesio Diez 11, Centro"},"stars":5,"price_per_night":6800.0,"images":["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"],"services":["Spa","Restaurante gourmet","Alberca","Tours culturales","WiFi","Bar"],"rooms_available":12,"rating":4.9,"reviews_count":415},
    {"name":"Hyatt Ziva Cancun","description":"Resort todo incluido en la zona hotelera de Cancún con acceso directo a la playa y múltiples albercas","location":{"city":"Cancun","country":"Mexico","address":"Blvd Kukulcan Km 6.5"},"stars":5,"price_per_night":5200.0,"images":["https://images.unsplash.com/photo-1540541338537-dc0a0d2b0f74?w=800"],"services":["Todo incluido","4 Albercas","Deportes acuáticos","5 Restaurantes","Spa","Kids club"],"rooms_available":45,"rating":4.7,"reviews_count":1203},
    {"name":"Hacienda de los Sueños","description":"Hacienda del siglo XVII convertida en hotel boutique entre viñedos y montañas del Valle de Guadalupe","location":{"city":"Valle de Guadalupe","country":"Mexico","address":"Carretera Ensenada-Tecate Km 88"},"stars":4,"price_per_night":3800.0,"images":["https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800"],"services":["Catas de vino","Spa","Restaurante farm-to-table","Alberca","WiFi","Tours de viñedos"],"rooms_available":8,"rating":4.8,"reviews_count":289},
    {"name":"Hotel Xcaret Mexico","description":"Resort eco-temático con acceso ilimitado a todos los parques Xcaret, Xel-Há y más en la Riviera Maya","location":{"city":"Playa del Carmen","country":"Mexico","address":"Carretera Chetumal-Puerto Juarez Km 282"},"stars":5,"price_per_night":7200.0,"images":["https://images.unsplash.com/photo-1601701119533-fde05e2eb93f?w=800"],"services":["Acceso a parques","Todo incluido","Spa","Teatro","Albercas infinitas","Cenotes privados"],"rooms_available":30,"rating":4.9,"reviews_count":967},
    {"name":"NH Collection Monterrey","description":"Hotel moderno de negocios en el centro financiero de Monterrey con vistas a la Sierra Madre","location":{"city":"Monterrey","country":"Mexico","address":"Av. Constitución 300, Centro"},"stars":4,"price_per_night":1800.0,"images":["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],"services":["Centro de negocios","Gimnasio","Restaurante","Bar","WiFi","Estacionamiento"],"rooms_available":28,"rating":4.5,"reviews_count":445},
    {"name":"Camino Real Oaxaca","description":"Hotel colonial en un convento del siglo XVI declarado Patrimonio de la Humanidad en el centro de Oaxaca","location":{"city":"Oaxaca","country":"Mexico","address":"Calle 5 de Mayo 300, Centro"},"stars":5,"price_per_night":3200.0,"images":["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],"services":["Alberca en claustro","Restaurante","Bar","WiFi","Tours gastronómicos","Spa"],"rooms_available":16,"rating":4.7,"reviews_count":378},
    {"name":"Eco Hotel Papaya Playa","description":"Hotel eco-chic en Tulum con bungalows frente al mar, sin electricidad hasta las 10am para conectar con la naturaleza","location":{"city":"Tulum","country":"Mexico","address":"Carretera Tulum-Boca Paila Km 4.5"},"stars":4,"price_per_night":2800.0,"images":["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"],"services":["Playa privada","Yoga","Restaurante orgánico","Bar","Cenote privado","Tours de naturaleza"],"rooms_available":10,"rating":4.6,"reviews_count":334},
    {"name":"Hotel Parador San Javier","description":"Hotel boutique en una hacienda jesuita del siglo XVII en Guanajuato, con jardines y capilla original","location":{"city":"Guanajuato","country":"Mexico","address":"Paseo de la Presa 92"},"stars":4,"price_per_night":1600.0,"images":["https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800"],"services":["Jardines históricos","Restaurante","Bar","WiFi","Tours culturales","Capilla"],"rooms_available":14,"rating":4.5,"reviews_count":256},
    {"name":"Live Aqua Urban Resort","description":"Hotel de diseño minimalista en la Zona Rosa de CDMX con spa galáctico y experiencias sensoriales únicas","location":{"city":"Ciudad de Mexico","country":"Mexico","address":"Paseo de la Reforma 26, Juárez"},"stars":5,"price_per_night":3600.0,"images":["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"],"services":["Spa galáctico","Restaurante","Bar Sky","Alberca","Gimnasio","WiFi"],"rooms_available":22,"rating":4.8,"reviews_count":589},
    {"name":"Hotel Misión Loreto","description":"Hotel histórico frente al Mar de Cortés en Loreto, Baja California Sur, ideal para aventura y naturaleza","location":{"city":"Loreto","country":"Mexico","address":"Blvd Lopez Mateos s/n, Loreto"},"stars":3,"price_per_night":980.0,"images":["https://images.unsplash.com/photo-1540541338537-dc0a0d2b0f74?w=800"],"services":["Vista al mar","Kayak","Snorkel","Restaurante","WiFi","Tours de ballenas"],"rooms_available":18,"rating":4.3,"reviews_count":198},
]

def to_dict(h):
    h["id"] = str(h["_id"])
    del h["_id"]
    return h

@router.get("/seed")
async def seed():
    count = await db.hotels.count_documents({})
    if count == 0:
        for h in HOTELS:
            hc = h.copy()
            hc["created_at"] = datetime.utcnow()
            await db.hotels.insert_one(hc)
    return {"message": f"Hoteles: {await db.hotels.count_documents({})}"}

@router.get("/")
async def list_hotels(city: Optional[str]=Query(None), min_price: Optional[float]=Query(None), max_price: Optional[float]=Query(None), min_stars: Optional[int]=Query(None), skip: int=0, limit: int=50):
    query = {}
    if city: query["location.city"] = {"$regex": city, "$options": "i"}
    if min_stars: query["stars"] = {"$gte": min_stars}
    if min_price or max_price:
        pq = {}
        if min_price: pq["$gte"] = min_price
        if max_price: pq["$lte"] = max_price
        query["price_per_night"] = pq
    hotels = await db.hotels.find(query).skip(skip).limit(limit).to_list(length=limit)
    return [to_dict(h) for h in hotels]

@router.get("/{hotel_id}")
async def get_hotel(hotel_id: str):
    if not ObjectId.is_valid(hotel_id): raise HTTPException(400, "ID invalido")
    hotel = await db.hotels.find_one({"_id": ObjectId(hotel_id)})
    if not hotel: raise HTTPException(404, "Hotel no encontrado")
    return to_dict(hotel)

@router.post("/", status_code=201)
async def create_hotel(data: dict):
    data["created_at"] = datetime.utcnow()
    data.setdefault("rating", 0.0)
    data.setdefault("reviews_count", 0)
    result = await db.hotels.insert_one(data)
    created = await db.hotels.find_one({"_id": result.inserted_id})
    return to_dict(created)

@router.put("/{hotel_id}")
async def update_hotel(hotel_id: str, data: dict):
    if not ObjectId.is_valid(hotel_id): raise HTTPException(400, "ID invalido")
    data.pop("_id", None)
    data.pop("id", None)
    await db.hotels.update_one({"_id": ObjectId(hotel_id)}, {"$set": data})
    updated = await db.hotels.find_one({"_id": ObjectId(hotel_id)})
    if not updated: raise HTTPException(404, "Hotel no encontrado")
    return to_dict(updated)

@router.delete("/{hotel_id}", status_code=204)
async def delete_hotel(hotel_id: str):
    if not ObjectId.is_valid(hotel_id): raise HTTPException(400, "ID invalido")
    await db.hotels.delete_one({"_id": ObjectId(hotel_id)})
