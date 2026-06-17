from pydantic import BaseModel,ConfigDict
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
    teacher_id : Optional[int] = None

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

class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "student"
    student_id: Optional[int] = None
    teacher_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    student_id: Optional[int] = None
    teacher_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

class UpdateUser(BaseModel):
    role: Optional[str] = None
    student_id: Optional[int] = None
    teacher_id: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str # in most token_type="Bearer"

class Login(BaseModel):
    username:str
    password:str