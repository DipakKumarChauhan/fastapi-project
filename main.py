from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

# FastAPI app initialization
app = FastAPI()

# Static file serving and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# SQLAlchemy database configuration
DATABASES = {
    "user": "mysql+mysqlconnector://root:root@localhost/UsersDB",  # Adjust your DB credentials as needed
    "product": "mysql+mysqlconnector://root:root@localhost/ProductDB",  # Example product DB
}

user_engine = create_engine(DATABASES["user"])
product_engine = create_engine(DATABASES["product"])

UserSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=user_engine)
ProductSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=product_engine)

# Dependency to get the DB session
def get_user_db():
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to get the product DB session
def get_product_db():
    db = ProductSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models for signup and login
class User(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

# Pydantic model for product search request
class ProductSearchRequest(BaseModel):
    query: str  # The search query (e.g., product name)

# Routes

# Signup route (POST /signup)
@app.post("/signup")
async def signup(user: User, db: Session = Depends(get_user_db)):
    # Check if username or email already exists
    result = db.execute(
        text("SELECT * FROM users WHERE username = :username OR email = :email"),
        {"username": user.username, "email": user.email},
    ).fetchone()

    if result:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    # Hash password
    hashed_password = pwd_context.hash(user.password)

    # Insert into the database
    db.execute(
        text(
            "INSERT INTO users (username, email, password) VALUES (:username, :email, :password)"
        ),
        {"username": user.username, "email": user.email, "password": hashed_password},
    )
    db.commit()

    # Respond with success message
    return JSONResponse(content={"message": "User successfully registered"}, status_code=200)

# Login route (POST /login)
@app.post("/login")
async def login(login_request: LoginRequest, db: Session = Depends(get_user_db)):
    # Query the database to find the user by username
    result = db.execute(
        text("SELECT * FROM users WHERE username = :username"),
        {"username": login_request.username},
    ).fetchone()

    # If result is None or invalid password, raise an exception
    if not result:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    # Use result._mapping to access fields by name
    user_data = result._mapping  # Convert result tuple to a mapping

    # Verify password
    if not pwd_context.verify(login_request.password, user_data["password"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    # Return success message as JSON
    return JSONResponse(content={"message": "Login successful"}, status_code=200)


# Product search route (GET /search)
@app.get("/search", response_class=HTMLResponse)
async def search_product(request: Request, query: str = "", db: Session = Depends(get_product_db)):
    try:
        # Search for products by name
        result = db.execute(
            text("SELECT * FROM products WHERE name LIKE :query"),
            {"query": f"%{query}%"},
        ).fetchall()

        # Convert result rows to dictionaries using _mapping
        products = [dict(row._mapping) for row in result]

        return templates.TemplateResponse(
            "productPage.html",
            {"request": request, "products": products, "query": query},
        )
    except Exception as e:
        print(f"Error during product search: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during product search")


# Product search route (POST /search)
@app.post("/search", response_class=HTMLResponse)
async def search_product_post(search_request: ProductSearchRequest, db: Session = Depends(get_product_db)):
    # Search for products by name (via POST request body)
    result = db.execute(
        text("SELECT * FROM products WHERE name LIKE :query"),
        {"query": f"%{search_request.query}%"},
    ).fetchall()

    # If no products are found, raise an exception
    if not result:
        raise HTTPException(status_code=404, detail="No products found")

    # Convert result rows to dictionaries
    products = [
        {key: row[key] for key in row.keys()} for row in result
    ]

    return templates.TemplateResponse("productPage.html", {
        "request": search_request,
        "products": products,
        "query": search_request.query
    })

# Home page route (GET /)
@app.get("/", response_class=HTMLResponse)
def read_home(request: Request):
    return templates.TemplateResponse("page.html", {"request": request})

# Signup page route (GET /signup)
@app.get("/signup", response_class=HTMLResponse)
def signup_page(request: Request):
    return templates.TemplateResponse("signUpPage.html", {"request": request})

# Login page route (GET /login)
@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("loginPage.html", {"request": request})

# Static file handling for assets (CSS, JS)
@app.get("/static/{file_name}")
def static_file(file_name: str):
    return StaticFiles(directory="static")(file_name)