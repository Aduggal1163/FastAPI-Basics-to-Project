from pydantic import BaseModel
from typing import Optional

class Student(BaseModel):
    id :int
    name : str
    standard : int
    section : str
    teacher_id : int

class UpdateStudent(BaseModel):
    name : Optional[str] = None
    standard : Optional[int] = None
    section : Optional[str] = None

class Teachers(BaseModel):
    id : int
    name : str
    section : str

class UpdateTeacher(BaseModel):
    name: Optional[str] = None

class Subject(BaseModel):
    id: int
    name: str

class AssignSubject(BaseModel):
    student_id:int
    subject_id:int