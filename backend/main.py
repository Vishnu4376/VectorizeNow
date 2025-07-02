#http://localhost:5173/
from fastapi import FastAPI, Request, Response
from starlette.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware 
import json

from app.schema import schema 

app = FastAPI()

origins = [
    "http://localhost:5173",  # This is frontend's URL
    "http://127.0.0.1:5173",  
    "http://localhost:8000",  # For GraphiQL interface
    "http://127.0.0.1:8000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        
    allow_credentials=True,       
    allow_methods=["*"],         
    allow_headers=["*"],         
)

app.mount("/static", StaticFiles(directory="static"), name="static")

graphql_app = schema

@app.get("/")
async def read_root():
    return {"message": "Welcome to Ecosight Technologies SVG Converter API!"}

@app.post("/graphql")
async def graphql_endpoint(request: Request):
    if request.headers.get("content-type") == "application/json":
        data = await request.json()
    else:
        return JSONResponse({"errors": [{"message": "Unsupported Media Type"}]}, status_code=415)

    query = data.get("query")
    variables = data.get("variables")
    operation_name = data.get("operationName")

    result = graphql_app.execute(
        query,
        variables=variables,
        operation_name=operation_name,
        context_value={"request": request} 
    )

    response_content = {}
    status_code = 200 

    if result.errors:
        response_content["errors"] = [error.formatted for error in result.errors]
        status_code = 400 

    if result.data:
        response_content["data"] = result.data

    return JSONResponse(response_content, status_code=status_code)

@app.options("/graphql")
async def graphql_options():
    """
    Handles CORS preflight OPTIONS requests for the /graphql endpoint.
    The CORSMiddleware should apply the necessary headers, and this route
    simply ensures a 200 OK response for the preflight.
    """
    return Response(status_code=200)