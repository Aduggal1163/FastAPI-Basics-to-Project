from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine,sessionLocal
from sqlalchemy.orm import Session
from typing import Annotated

import schema
import model

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

model.Base.metadata.create_all(bind=engine)

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]

@app.post("/students",status_code = status.HTTP_201_CREATED)
async def create_student(student : schema.Student, db : db_dependency):
    existed = db.query(model.Student).filter(model.Student.id == student.id).first()
    if(existed):
        raise HTTPException(
            status_code = 400,
            detail = "Student with same id found"
        )
    newStudent = model.Student(
        id = student.id,
        name = student.name,
        rollno = student.rollno,
        standard = student.standard,
        section = student.section
    )
    db.add(newStudent)
    db.commit()
    db.refresh(newStudent)
    return newStudent

@app.get("/students",status_code=status.HTTP_200_OK)
async def get_all_students(db : db_dependency):
    students = db.query(model.Student).all()
    if(len(students) < 1):
        raise HTTPException(
            status_code = 404,
            detail = "No student is found"
        )
    return students

@app.get("/students/{student_id}",status_code = status.HTTP_200_OK)
async def get_student_by_id(student_id : int, db: db_dependency):
    student = db.query(model.Student).filter(model.Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code = 404,
            detail = "No student is found"
        )
    return student

@app.patch("/students/{student_id}",status_code = status.HTTP_200_OK)
async def update_student_by_id(student_id: int, data: schema.UpdateStudent,db:db_dependency):
    student = db.query(model.Student).filter(model.Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code = 404,
            detail = "No student is found"
        )
    if data.name is not None:
        student.name = data.name
    if data.rollno is not None:
        student.rollno = data.rollno
    if data.standard is not None:
        student.standard = data.standard
    if data.section is not None:
        student.section = data.section    
    db.commit()
    db.refresh(student)
    return student

@app.delete("/students/{student_id}",status_code = status.HTTP_200_OK)
async def delete_student_by_id(student_id : int, db:db_dependency):
    student = db.query(model.Student).filter(model.Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code = 404,
            detail = "No student is found"
        )
    db.delete(student)
    db.commit()
    return {
        "message":"student removed!",
        "students":db.query(model.Student).all()
    }