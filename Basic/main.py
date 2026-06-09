from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {
        "message":"Hello World!"
    }

@app.get("/items/{item_id}")
async def getitemid(item_id : int):
    return {
        "message":"item is fetched successfuly!",
        "item_id":item_id
    }

from enum import Enum

class modelName(str,Enum):
    alex = "alex"
    brandy = "brandy"
    carlie = "carlie"

@app.get("/model/{model_name}")
async def model_name(model_name : modelName):
    if model_name.value == "alex":
        return {"message":"Alex has been choosen"}
    elif model_name.value == "brandy":
        return {"message":"Brandy has been choosen"}
    return {"message":"carlie has been choosen"}

from pydantic import BaseModel
class Item(BaseModel):
    name : str
    desc : str
    price : int | None = None
    tax : float

@app.post("/item/")
async def createItem(item : Item):
    return {"Item": item}