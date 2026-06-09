from pydantic import BaseModel

class Student(BaseModel):
    id: int
    name: str
    rollno: int
    standard: int
    section: str
