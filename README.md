# Student Information Management System (Three-Tier Cloud)

Browser -> Netlify (frontend) -> Render (Node/Express API) -> MongoDB Atlas

## Structure
- backend/  -> Render pe deploy
- frontend/ -> Netlify pe deploy

## Step 1: MongoDB Atlas
1. cloud.mongodb.com pe free M0 cluster banao.
2. Database Access: ek user banao (username + password).
3. Network Access: 0.0.0.0/0 allow karo (Render ke IP change hote rehte hain).
4. Connect -> Drivers -> connection string copy karo.
   Database name `studentDB` string mein daalo:
   mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/studentDB?retryWrites=true&w=majority

## Step 2: Backend local test
cd backend
npm install
cp .env.example .env     (aur .env mein apni MONGODB_URI daalo)
npm start
Browser mein http://localhost:5000 kholo -> "Student API is running"

## Step 3: GitHub pe push
Poora project ek repo mein push karo (backend/ aur frontend/ dono folders).
.env file push MAT karna (.gitignore mein already hai).

## Step 4: Render pe backend deploy
1. render.com -> New -> Web Service -> apna GitHub repo chuno.
2. Root Directory: backend
3. Build Command: npm install
4. Start Command: npm start
5. Environment Variables:
   MONGODB_URI = (Atlas string)
   FRONTEND_URL = https://<tumhari-site>.netlify.app
6. Deploy hone ke baad URL milega, jaise https://student-api.onrender.com
   (Free plan pe pehli request slow ho sakti hai, server so jata hai.)

## Step 5: Frontend mein API URL lagao
frontend/config.js mein:
const API_URL = 'https://student-api.onrender.com';

## Step 6: Netlify pe frontend deploy
1. app.netlify.com -> Add new site -> Import from GitHub.
2. Base directory: frontend
3. Build command: (khali chhodo)
4. Publish directory: frontend
5. Deploy. Netlify URL mil jayega.

## Step 7: CORS update
Render mein FRONTEND_URL ko apne asli Netlify URL pe set karo, phir redeploy.

## Step 8: Testing
Add, List, Search, Update (semester 5 -> 6), Delete karke Atlas mein verify karo.

## API Endpoints
GET    /api/students            (?search=rahul)
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
