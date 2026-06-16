from sqlalchemy import Integer,String,ForeignKey,Column
from sqlalchemy.orm import relationship

from db import Base

class StudentSubjects(Base):
    __tablename__ = 'Student_Subject'
    student_id = Column(Integer,ForeignKey("Students.id"), primary_key = True)
    subject_id = Column(Integer,ForeignKey("Subjects.id"), primary_key = True) 

class Students (Base):
    __tablename__ = 'Students'
    id = Column(Integer, primary_key = True, index = True)
    name = Column(String(50), unique = True)
    standard = Column(Integer)
    section = Column(String(10) , nullable = False)

    teacher_id = Column(Integer, ForeignKey("Teachers.id",ondelete="RESTRICT")) #it means if teacher has std it cant be deleted because it says.u have assigned students

    teacher = relationship(
        'Teachers',
        back_populates='students'
    )

    subjects = relationship(
        "Subjects",
        secondary="Student_Subject",
        back_populates="students"
    )
    
class Teachers (Base):
    __tablename__ = 'Teachers'
    id = Column(Integer, primary_key = True, index = True)
    name = Column(String(50), unique = True)
    section = Column(String(10), nullable = False)


    students = relationship(
        'Students',
        back_populates='teacher',
    )

class Subjects (Base):
    __tablename__ = 'Subjects'
    id = Column(Integer, primary_key = True, index = True)
    name = Column(String(50),unique = True)

    students = relationship(
        'Students',
        secondary='Student_Subject',
        back_populates='subjects'
    )

class Users (Base):
    __tablename__ = 'Users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)