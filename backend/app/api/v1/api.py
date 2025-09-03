"""
Main API router for v1 endpoints.
"""
from fastapi import APIRouter

from app.api.v1 import auth, analytics, utm_links

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router)
api_router.include_router(analytics.router)
api_router.include_router(utm_links.router, tags=["utm-tracking"])
