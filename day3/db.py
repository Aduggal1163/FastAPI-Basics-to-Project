from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base

URL = 'mysql+pymysql://root:Abhishekduggal%402@localhost:3306/fastapi'

engine = create_engine(URL)

SessionLocal = sessionmaker(bind=engine);

Base = declarative_base()