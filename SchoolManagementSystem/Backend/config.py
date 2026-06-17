import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:Abhishekduggal%402@localhost:3306/fastapi")
SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY_")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
except ValueError:
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
