from pydantic import BaseModel

class Student(BaseModel):
    id: int
    name: str
    rollno: int
    standard: int
    section: str

class UpdateStudent(BaseModel):
    name: str  | None = None
    rollno: int | None = None
    standard: int | None = None
    section: str | None = None