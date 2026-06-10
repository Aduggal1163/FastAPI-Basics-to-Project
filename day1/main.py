from fastapi import FastAPI,HTTPException
import model
app = FastAPI()

students = []

@app.get("/")
def root():
    return {
        "message":"listening"
    }

@app.post("/students")
def create_stds(std : model.Student):
    for student in students:
        if student.id == std.id:
            raise HTTPException (
                status_code = 400,
                detail = "student with same id already exists"
            )
    students.append(std)
    return {
        "message":"student created successfully!",
        "students":std
    }

@app.get("/students")
def get_all_stds():
    return {
        "message":"Here is the list of all the students",
        "students":students
    }

@app.get("/students/{student_id}")
def get_stds_by_id(student_id : int):
    for std in students:
        if std.id == student_id:
            return {
                "message":"std found with your given id",
                "student":std
            }
    raise HTTPException(
        status_code = 404,
        detail = "student not found",
    )

  

@app.patch("/students/{student_id}")
def update_std(student_id: int, data: model.UpdateStudent):
    for std in students:
        if std.id == student_id:

            if data.name is not None:
                std.name = data.name

            if data.rollno is not None:
                std.rollno = data.rollno

            if data.standard is not None:
                std.standard = data.standard

            if data.section is not None:
                std.section = data.section

            return {
                "message": "student updated",
                "student": std
            }

    raise HTTPException(
        status_code=404,
        detail="student not found"
    )
    
@app.delete("/students/{student_id}")
def delete_std(student_id: int):
    for std in students:
        if std.id == student_id:
            students.remove(std)
            return {
                "message":"std removed successfully!",
                "students":students
            }
    raise HTTPException(
        status_code = 404,
        detail = "unable to find std found with your given id",
    )