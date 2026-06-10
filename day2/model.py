from sqlalchemy import Integer,String,Column
from database import Base

class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer,primary_key = True, index = True)
    name = Column(String(50),unique = True)
    rollno = Column(Integer, nullable = False)
    standard = Column(Integer)
    section = Column(String(10))