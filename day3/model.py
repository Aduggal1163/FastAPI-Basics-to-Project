from sqlalchemy import Integer,String,ForeignKey,Column
from sqlalchemy.orm import relationship

from db import Base

class Students (Base):
    __tablename__ = 'Students'
    id = Column(Integer, primary_key = True, index = True)
    name = Column(String(50), unique = True)
    standard = Column(Integer)
    section = Column(String(10) , nullable = False)

    teacher_id = Column(Integer, ForeignKey("Teachers.id"))

    teacher = relationship( # one teacher can have mul students
        "Teachers",
        back_populates = "students"
    )
    
class Teachers (Base):
    __tablename__ = 'Teachers'
    id = Column(Integer, primary_key = True, index = True)
    name = Column(String(50), unique = True)
    section = Column(String(10), nullable = False)

    students = relationship(
        "Students",
        back_populates = "teacher"
    )
