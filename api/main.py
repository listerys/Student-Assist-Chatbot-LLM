# uvicorn main:app --host 0.0.0.0 --port 80 --reload
from fastapi import FastAPI
import logging
import api_routers


log = logging.getLogger(__name__)
app = FastAPI()

# Add routers
app.include_router(api_routers.router)


# Home page
@app.get("/")
def home():
    return {
        "message": "You are in the home page."
    }
