from pydantic import BaseModel
from typing import Optional
class Student(BaseModel):
    id: int
    name: str
    rollno: int
    standard: int
    section: str

class UpdateStudent(BaseModel):
    name: Optional[str] = None
    rollno: Optional[int] = None
    standard: Optional[int] = None
    section: Optional[str] = None