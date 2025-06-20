from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import List
import asyncio
import aiohttp
import socket
import ssl
from urllib.parse import urlparse
import time

app = FastAPI()

# Eingabemodell für die API
class URLList(BaseModel):
    urls: List[HttpUrl]


# IP-Adresse ermitteln über DNS
def resolve_ip(url: str) -> str:
    parsed = urlparse(url)
    hostname = parsed.hostname
    if hostname:
        try:
            return socket.gethostbyname(hostname)
        except socket.gaierror:
            return "Unbekannt"
    return "Ungültig"


# SSL-Zertifikat prüfen
def check_ssl_cert(url: str) -> bool:
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                return bool(cert)
    except Exception:
        return False


# Einzelne URL asynchron prüfen
async def check_url(url: str) -> dict:
    try:
        async with aiohttp.ClientSession() as session:
            start_time = time.time()
            async with session.get(url, timeout=10, allow_redirects=True) as response:
                end_time = time.time()
                response_time = int((end_time - start_time) * 1000)  # in ms

                return {
                    "url": url,
                    "status_code": response.status,
                    "response_time": response_time,
                    "ssl_valid": check_ssl_cert(url),
                    "redirect": str(response.url) != url,
                    "ip": resolve_ip(url)
                }
    except Exception as e:
        return {
            "url": url,
            "status_code": None,
            "response_time": None,
            "ssl_valid": False,
            "redirect": False,
            "ip": "Fehler",
            "error": str(e)
        }


# POST-Endpunkt zur URL-Liste
@app.post("/check-urls")
async def check_urls(data: URLList):
    try:
        tasks = []
        for url in data.urls:
            tasks.append(check_url(str(url)))  # wichtig: HttpUrl in String umwandeln

        results = await asyncio.gather(*tasks)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
