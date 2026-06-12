from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from db import engine,SessionLocal
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
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]

@app.post("/students",status_code = status.HTTP_201_CREATED)
async def create_student(student : schema.Student, db : db_dependency):
    existed = db.query(model.Students).filter(model.Students.id == student.id).first()
    if existed:
        raise HTTPException(
            status_code = 400,
            detail = "Student with id already exists"
        )
    
    teacher = db.query(model.Teachers).filter(model.Teachers.id == student.teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    new_student = model.Students(
        id = student.id,
        name = student.name,
        standard = student.standard,
        section = student.section,
        teacher_id = student.teacher_id
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student



@app.get("/students",status_code = status.HTTP_200_OK)
async def get_students(db : db_dependency):
    students = db.query(model.Students).all()
    if len(students) < 1:
        raise HTTPException(
            status_code = 404,
            detail = "No student found"
        )
    return students

@app.get("/students/{student_id}", status_code = status.HTTP_200_OK)
async def get_student_by_id(student_id : int, db: db_dependency):
    student = db.query(model.Students).filter(model.Students.id == student_id).first()
    if student is None:
        raise HTTPException(
            status_code = 404,
            detail = "No student found"
        )
    return student

@app.patch("/students/{student_id}",status_code = status.HTTP_200_OK)
async def update_student_by_id(student_id : int, data : schema.UpdateStudent, db: db_dependency):
    student = db.query(model.Students).filter(model.Students.id == student_id).first()
    if student is None:
        raise HTTPException(
            status_code = 404,
            detail = "No student found"
        )
    if data.name is not None:
        student.name = data.name
    if data.standard is not None:
        student.standard = data.standard
    if data.section is not None:
        student.section = data.section
    
    db.commit()
    db.refresh(student)
    return student

@app.delete("/students/{student_id}",status_code = status.HTTP_200_OK)
async def delete_student_by_id(student_id : int, db: db_dependency):
    student = db.query(model.Students).filter(model.Students.id == student_id).first()
    if student is None:
        raise HTTPException(
            status_code = 404,
            detail = "No student found"
        )
    db.delete(student)
    db.commit()
    return {
        "message":"student deleted successfully",
        "students":db.query(model.Students).all()
    }


# TEACHERS

@app.post("/teachers",status_code = status.HTTP_201_CREATED)
async def create_teacher(teacher : schema.Teachers, db : db_dependency):
    existed = db.query(model.Teachers).filter(model.Teachers.id == teacher.id).first()
    if existed:
        raise HTTPException(
            status_code = 400,
            detail = "Teacher with id already exists"
        )
    new_teacher = model.Teachers(
        id = teacher.id,
        name = teacher.name,
        section = teacher.section
    )
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    return new_teacher

@app.get("/teachers",status_code = status.HTTP_200_OK)
async def get_teachers(db : db_dependency):
    teachers = db.query(model.Teachers).all()
    if len(teachers) < 1:
        raise HTTPException(
            status_code = 404,
            detail = "No teachers found"
        )
    return teachers

@app.get("/teachers/{teacher_id}", status_code = status.HTTP_200_OK)
async def get_teacher_by_id(teacher_id : int, db: db_dependency):
    teachers = db.query(model.Teachers).filter(model.Teachers.id == teacher_id).first()
    if teachers is None:
        raise HTTPException(
            status_code = 404,
            detail = "No teachers found"
        )
    return teachers

@app.patch("/teachers/{teacher_id}",status_code = status.HTTP_200_OK)
async def update_teacher_by_id(teacher_id : int, data : schema.UpdateTeacher, db: db_dependency):
    teachers = db.query(model.Teachers).filter(model.Teachers.id == teacher_id).first()
    if teachers is None:
        raise HTTPException(
            status_code = 404,
            detail = "No teachers found"
        )
    if data.name is not None:
        teachers.name = data.name
    
    db.commit()
    db.refresh(teachers)
    return teachers

@app.delete("/teachers/{teacher_id}",status_code = status.HTTP_200_OK)
async def delete_teacher_by_id(teacher_id : int, db: db_dependency):
    teachers = db.query(model.Teachers).filter(model.Teachers.id == teacher_id).first()
    if teachers is None:
        raise HTTPException(
            status_code = 404,
            detail = "No teachers found"
        )
    db.delete(teachers)
    db.commit()
    return {
        "message":"teachers deleted successfully",
        "teachers":db.query(model.Teachers).all()
    }

@app.get("/teachers/{teacher_id}/students",status_code=status.HTTP_200_OK)
async def get_students_of_teacher(teacher_id : int , db: db_dependency):
    teacher = db.query(model.Teachers).filter(model.Teachers.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code = 404,
            detail = "No teachers found"
        )
    return {
        "teacher_id" : teacher_id,
        "teacher_name" : teacher.name,
        "students" : teacher.students
    }

@app.post("/subjects",status_code=status.HTTP_201_CREATED)
async def create_subject(subject : schema.Subject, db: db_dependency):
    existed = db.query(model.Subjects).filter(model.Subjects.id == subject.id).first()
    if existed:
        raise HTTPException(
            status_code=400,
            detail='subject with this id already exists'
        )
    new_subject = model.Subjects(
        id = subject.id,
        name = subject.name
    )

    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)

    return new_subject

@app.post("/assign-subject",status_code=status.HTTP_201_CREATED)
async def assign_subject(data : schema.AssignSubject, db: db_dependency):
    student = db.query(model.Students).filter(model.Students.id == data.student_id).first()
    if not student:
        raise HTTPException(
            404,
            "Student not found"
        )
    
    subject = db.query(model.Subjects).filter(model.Subjects.id == data.subject_id).first()
    if not subject:
        raise HTTPException(
            404,
            "Subject not found"
        )
    if subject in student.subjects:
        raise HTTPException(
            status_code=400,
            detail='subject already included'
        )
    student.subjects.append(subject)

    db.commit()
    
    return {
        "message":"Subject assigned successfully"
    }

@app.get("/students/{student_id}/subjects",status_code=status.HTTP_200_OK)
async def get_student_subjects(student_id : int, db: db_dependency):
    student = db.query(model.Students).filter(model.Students.id == student_id).first()
    if not student:
        raise HTTPException(
            404,
            "Student not found"
        )
    
    if len(student.subjects) == 0:
        raise HTTPException(
            404,
            "No subject is assigned"
        )

    return {
        "student_name" : student.name,
        "subjects" : student.subjects
    }