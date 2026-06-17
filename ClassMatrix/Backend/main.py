from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from db import engine,SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Annotated

import schema
import model

from fastapi.security import OAuth2PasswordRequestForm

from auth import (
get_password_hash,
authenticate_user,
create_access_token,
get_current_user
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

model.Base.metadata.create_all(bind=engine)

# Programmatic migrations to add role, student_id, and teacher_id to Users table if not present
try:
    with engine.connect() as conn:
        res = conn.execute(text("SHOW COLUMNS FROM Users LIKE 'role'")).fetchone()
        if not res:
            # We must add role, student_id, teacher_id
            conn.execute(text("ALTER TABLE Users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'student'"))
            conn.execute(text("ALTER TABLE Users ADD COLUMN student_id INT NULL"))
            conn.execute(text("ALTER TABLE Users ADD COLUMN teacher_id INT NULL"))
            
            # Try to add foreign key constraints
            try:
                conn.execute(text("ALTER TABLE Users ADD CONSTRAINT fk_user_student FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE SET NULL"))
            except Exception as e:
                print("FK Student constraint warning:", e)
            try:
                conn.execute(text("ALTER TABLE Users ADD CONSTRAINT fk_user_teacher FOREIGN KEY (teacher_id) REFERENCES Teachers(id) ON DELETE SET NULL"))
            except Exception as e:
                print("FK Teacher constraint warning:", e)
except Exception as err:
    print("Database migration error / skipped:", err)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]
user_dependency = Annotated[
    model.Users,
    Depends(
        get_current_user
    )
]

@app.get("/public-stats", status_code=status.HTTP_200_OK)
async def get_public_stats(db: db_dependency):
    students_count = db.query(model.Students).count()
    teachers_count = db.query(model.Teachers).count()
    subjects_count = db.query(model.Subjects).count()
    return {
        "students": students_count,
        "teachers": teachers_count,
        "subjects": subjects_count
    }

@app.post("/students",status_code = status.HTTP_201_CREATED)
async def create_student(student : schema.Student, db : db_dependency, user: user_dependency):
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
async def get_students(db : db_dependency, user: user_dependency):
    if user.role != "admin":
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Admin access required"
        )
    students = db.query(model.Students).all()
    if len(students) < 1:
        raise HTTPException(
            status_code = 404,
            detail = "No student found"
        )
    return students

@app.get("/students/{student_id}", status_code = status.HTTP_200_OK)
async def get_student_by_id(student_id : int, db: db_dependency, user: user_dependency):
    if user.role == "student" and user.student_id != student_id:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Access denied"
        )
    elif user.role == "teacher":
        student = db.query(model.Students).filter(model.Students.id == student_id).first()
        if not student or student.teacher_id != user.teacher_id:
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail = "Access denied"
            )
            
    student = db.query(model.Students).filter(model.Students.id == student_id).first()
    if student is None:
        raise HTTPException(
            status_code = 404,
            detail = "No student found"
        )
    return student

@app.patch("/students/{student_id}",status_code = status.HTTP_200_OK)
async def update_student_by_id(student_id : int, data : schema.UpdateStudent, db: db_dependency, user: user_dependency):
    student = db.query(model.Students).filter(model.Students.id == student_id).first()
    if student is None:
        raise HTTPException(
            status_code = 404,
            detail = "No student found"
        )
    if user.role == "student":
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Students are not authorized to update student profiles"
        )
    elif user.role == "teacher":
        if student.teacher_id != user.teacher_id:
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail = "Teachers can only update students of their own class"
            )
    if data.name is not None:
        student.name = data.name
    if data.standard is not None:
        student.standard = data.standard
    if data.section is not None:
        student.section = data.section
    if data.teacher_id is not None:
        # Validate that the teacher exists
        teacher = db.query(model.Teachers).filter(model.Teachers.id == data.teacher_id).first()
        if not teacher:
            raise HTTPException(
                status_code=404,
                detail=f"Teacher with ID {data.teacher_id} not found"
            )
        student.teacher_id = data.teacher_id
    
    db.commit()
    db.refresh(student)
    return student

@app.delete("/students/{student_id}",status_code = status.HTTP_200_OK)
async def delete_student_by_id(student_id : int, db: db_dependency, user: user_dependency):
    if user.role != "admin":
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Only administrators can delete student records"
        )
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
async def create_teacher(teacher : schema.Teachers, db : db_dependency, user: user_dependency):
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
async def get_teachers(db : db_dependency, user: user_dependency):
    if user.role == "student":
        student_rec = db.query(model.Students).filter(model.Students.id == user.student_id).first()
        if not student_rec:
            raise HTTPException(
                status_code = 404,
                detail = "Student record not found"
            )
        teachers = db.query(model.Teachers).filter(model.Teachers.section == student_rec.section).all()
    elif user.role == "teacher" or user.role == "admin":
        teachers = db.query(model.Teachers).all()
    else:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Access denied"
        )
    if len(teachers) < 1:
        raise HTTPException(
            status_code = 404,
            detail = "No teachers found"
        )
    return teachers

@app.get("/teachers/{teacher_id}", status_code = status.HTTP_200_OK)
async def get_teacher_by_id(teacher_id : int, db: db_dependency, user: user_dependency):
    if user.role == "student":
        student_rec = db.query(model.Students).filter(model.Students.id == user.student_id).first()
        if not student_rec or student_rec.teacher_id != teacher_id:
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail = "Access denied"
            )
    elif user.role == "teacher" and user.teacher_id != teacher_id:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Access denied"
        )
        
    teachers = db.query(model.Teachers).filter(model.Teachers.id == teacher_id).first()
    if teachers is None:
        raise HTTPException(
            status_code = 404,
            detail = "No teachers found"
        )
    return teachers

@app.patch("/teachers/{teacher_id}",status_code = status.HTTP_200_OK)
async def update_teacher_by_id(teacher_id : int, data : schema.UpdateTeacher, db: db_dependency, user: user_dependency):
    if user.role != "admin":
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Only administrators can update teacher profiles"
        )
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
async def delete_teacher_by_id(teacher_id : int, db: db_dependency, user: user_dependency):
    if user.role != "admin":
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Only administrators can delete teacher profiles"
        )
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
async def get_students_of_teacher(teacher_id : int , db: db_dependency, user: user_dependency):
    if user.role == "student":
        student_rec = db.query(model.Students).filter(model.Students.id == user.student_id).first()
        if not student_rec or student_rec.teacher_id != teacher_id:
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail = "Access denied"
            )
    elif user.role == "teacher" and user.teacher_id != teacher_id:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Access denied"
        )
        
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
async def create_subject(subject : schema.Subject, db: db_dependency, user: user_dependency):
    if user.role != "admin":
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Only administrators can create subjects"
        )
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


@app.get("/subjects", status_code=status.HTTP_200_OK)
async def get_subjects(db: db_dependency, user: user_dependency):
    subjects = db.query(model.Subjects).all()
    if len(subjects) < 1:
        raise HTTPException(
            status_code=404,
            detail="No subjects found"
        )
    return subjects


@app.post("/assign-subject",status_code=status.HTTP_201_CREATED)
async def assign_subject(data : schema.AssignSubject, db: db_dependency, user: user_dependency):
    if user.role == "student":
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Students cannot assign subjects"
        )
        
    student = db.query(model.Students).filter(model.Students.id == data.student_id).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )
        
    if user.role == "teacher":
        if student.teacher_id != user.teacher_id:
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail = "Teachers can only assign subjects to students of their own class"
            )
            
    subject = db.query(model.Subjects).filter(model.Subjects.id == data.subject_id).first()
    if not subject:
        raise HTTPException(
            status_code = 404,
            detail= "Subject not found"
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
async def get_student_subjects(student_id : int, db: db_dependency, user: user_dependency):
    if user.role == "student" and user.student_id != student_id:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Access denied"
        )
    elif user.role == "teacher":
        student = db.query(model.Students).filter(model.Students.id == student_id).first()
        if not student or student.teacher_id != user.teacher_id:
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail = "Access denied"
            )
            
    student = db.query(model.Students).filter(model.Students.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code = 404,
            detail = "Student not found"
        )
    
    if len(student.subjects) == 0:
        raise HTTPException(
            status_code = 404,
            detail = "No subject is assigned"
        )

    return {
        "student_name" : student.name,
        "subjects" : student.subjects
    }

@app.post(
"/register",
response_model=schema.UserOut
)
async def register(
user:schema.UserCreate,
db:db_dependency
):

    existed = (
        db.query(
            model.Users
        )
        .filter(
            model.Users.username
            == user.username
        )
        .first()
    )

    if existed:
        raise HTTPException(
            400,
            "username exists"
        )

    # Validate role linkage
    role_to_save = user.role or "student"
    student_id_val = user.student_id
    teacher_id_val = user.teacher_id

    if role_to_save == "student":
        if student_id_val is not None:
            student_rec = db.query(model.Students).filter(model.Students.id == student_id_val).first()
            if not student_rec:
                raise HTTPException(404, f"Student record with ID {student_id_val} not found")
            # Ensure student ID is not already claimed
            claimed = db.query(model.Users).filter(model.Users.student_id == student_id_val).first()
            if claimed:
                raise HTTPException(400, f"Student record with ID {student_id_val} is already linked to a user account")
        teacher_id_val = None # Ensure it is null
    elif role_to_save == "teacher":
        if teacher_id_val is not None:
            teacher_rec = db.query(model.Teachers).filter(model.Teachers.id == teacher_id_val).first()
            if not teacher_rec:
                raise HTTPException(404, f"Teacher record with ID {teacher_id_val} not found")
            # Ensure teacher ID is not already claimed
            claimed = db.query(model.Users).filter(model.Users.teacher_id == teacher_id_val).first()
            if claimed:
                raise HTTPException(400, f"Teacher record with ID {teacher_id_val} is already linked to a user account")
        student_id_val = None # Ensure it is null
    elif role_to_save == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Public registration as admin is not permitted"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role specified"
        )

    new_user = model.Users(
        username=user.username,
        hashed_password=get_password_hash(user.password),
        role=role_to_save,
        student_id=student_id_val,
        teacher_id=teacher_id_val
    )

    db.add(
        new_user
    )

    db.commit()

    db.refresh(
        new_user
    )

    return new_user


@app.post("/login")
async def login(db: db_dependency, form:OAuth2PasswordRequestForm=Depends()):
    user = (
        authenticate_user(
            form.username,
            form.password,
            db
        )
    )

    if not user:
        raise HTTPException(
    status_code=401,
    detail="Invalid credentials"
)

    token = (
        create_access_token(
            {
                "sub":
                user.username
            }
        )
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role,
        "student_id": user.student_id,
        "teacher_id": user.teacher_id
    }


# ADMIN PANEL USER MANAGEMENT
@app.get("/users", status_code=status.HTTP_200_OK)
async def get_users(db: db_dependency, current_user: user_dependency):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return db.query(model.Users).all()


@app.patch("/users/{user_id}", status_code=status.HTTP_200_OK)
async def update_user(user_id: int, data: schema.UpdateUser, db: db_dependency, current_user: user_dependency):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    target_user = db.query(model.Users).filter(model.Users.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if data.role is not None:
        target_user.role = data.role
    if data.student_id is not None:
        # Check that student exists
        if data.student_id != 0:
            student_rec = db.query(model.Students).filter(model.Students.id == data.student_id).first()
            if not student_rec:
                raise HTTPException(404, f"Student record with ID {data.student_id} not found")
            target_user.student_id = data.student_id
            target_user.teacher_id = None
        else:
            target_user.student_id = None
            
    if data.teacher_id is not None:
        # Check that teacher exists
        if data.teacher_id != 0:
            teacher_rec = db.query(model.Teachers).filter(model.Teachers.id == data.teacher_id).first()
            if not teacher_rec:
                raise HTTPException(404, f"Teacher record with ID {data.teacher_id} not found")
            target_user.teacher_id = data.teacher_id
            target_user.student_id = None
        else:
            target_user.teacher_id = None
            
    db.commit()
    db.refresh(target_user)
    return target_user


@app.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: int, db: db_dependency, current_user: user_dependency):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    target_user = db.query(model.Users).filter(model.Users.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
        
    db.delete(target_user)
    db.commit()
    return {"message": "User deleted successfully"}