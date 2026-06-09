from fastapi import FastAPI
import model
app = FastAPI()

list = []

@app.get("/")
def root():
    return {
        "message":"listening"
    }

@app.post("/tasks")
def create_stds(std : model.Student):
    
    list.append(std)
    return {
        "message":"student created successfully!",
        "students":std
    }

@app.get("/tasks")
def get_all_stds():
    return {
        "message":"Here is the list of all the students",
        "students":list
    }

@app.get("/tasks/{id}")
def get_stds_by_id(id : int):
    found = False
    for std in list:
        if std.id == id:
            found = True
            return {
                "message":"std found with your given id",
                "student":std
            }
    if found == False:
        return {
                "message":"unable to find std found with your given id",
            }
    
@app.post("/tasks/{id}")
def update_std(id : int, name: str):
    found = False
    for std in list:
        if std.id == id:
            found = True
            std.name = name
            return {
                "message":"std updated",
                "student":std
            }
    if found == False:
        return {
                "message":"unable to find std found with your given id",
            }
    
@app.delete("/tasks/{id}")
def delete_std(id: int):
    found = False
    for std in list:
        if std.id == id:
            found = True
            list.remove(std)
            return {
                "message":"std removed successfully!",
                "students":list
            }
    if found == False:
        return {
                "message":"unable to find std found with your given id",
            }