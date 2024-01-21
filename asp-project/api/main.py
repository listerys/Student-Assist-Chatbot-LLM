# uvicorn main:app --host 0.0.0.0 --port 80 --reload
from fastapi import FastAPI
import logging
import api_routers
from fastapi.middleware.cors import CORSMiddleware

#app = FastAPI()

origins = ["*"]



log = logging.getLogger(__name__)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Add routers
app.include_router(api_routers.router)


# Home page
@app.get("/")
def home():
    return {
        "message": "You are in the home page."
    }
