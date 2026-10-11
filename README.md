# TypingIQ — AI-Powered Intelligent Typing Analytics and Personalized Performance Optimization System

TypingIQ is a full-stack, enterprise-grade typing intelligence platform that merges real-time keystroke telemetry with machine learning to diagnose motor flaws, forecast speed trajectories, and synthesize adaptive corrective exercises.

---

## Architecture Topology

The application enforces a strict single-gateway architecture:

```
[React 19 + TypeScript Frontend]
               │
               ▼  (HTTPS / REST with JWT Bearer)
[Spring Boot 3.4 Gateway & Main Backend (Java 25)]
         │                              │
         ▼                              ▼  (Internal REST proxy)
[MongoDB Database (port 27017)] [FastAPI ML Service (Python 3.14)]
```

- **Frontend Tier (`frontend/`)**: React 19, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Lucide Icons.
- **Main Backend & Gateway Tier (`backend/`)**: Java 25, Spring Boot 3.4.3, Spring Web, Spring Security (stateless JWT), Spring Data MongoDB, Maven. **The only backend directly accessed by the frontend.**
- **AI/ML Analytics Tier (`ml-service/`)**: Python 3.14, FastAPI, scikit-learn, pandas, NumPy, joblib. Runs on internal port `8000`.
- **Database Tier**: MongoDB 8.0 / Community Server (`localhost:27017`, database: `typingiq_db`).

---

## Feature Matrix

1. **Monkeytype-Grade Typing Engine**: Smooth floating animated caret / word pointer that glides from character to character via sub-millisecond DOM bounding geometry and bezier transitions.
2. **Comprehensive Post-Test Diagnostic Report**: Instant transition upon test completion showing massive Net/Gross WPM hero cards, Accuracy %, Cadence metrics, second-by-second interactive Recharts telemetry curve, and mistyped character/bigram confusion matrices.
3. **MongoDB Native Persistence**: High-throughput document persistence storing full telemetry slices, character mistakes, and bigram error sequences.
4. **User Authentication & Authorization**: Secure registration and login using BCrypt password hashing and short-lived stateless JWT access tokens.
5. **Flexible Typing Tests**: 15, 30, and 60-second test durations with auto-adjusting timers.
6. **Difficulty Grading**: Easy (common vocabulary), Medium (syntax & capitals), and Hard (technical prose, punctuation, numbers).
7. **Executive Dashboard**: Lifetime best WPM, historical averages, accuracy metrics, daily practice streak, and recent test activity.
8. **Longitudinal Trend Analytics**: Interactive Recharts dual-axis progression graphs with 95% accuracy goal baseline.
9. **Interactive Keyboard Heatmap**: Full physical QWERTY layout color-graded by error rate with per-key diagnostic inspection.
10. **ML-Based Error Prediction**: scikit-learn Gradient Boosting Regressor predicting expected error counts and risk levels based on duration and difficulty.
11. **Performance Forecasting**: Regularized polynomial regression projecting future 10-session WPM trajectories with 95% confidence bands and insufficient-data handling.
12. **Typing Behavior Clustering**: K-Means clustering classifying typists into behavioral personas (*High-Precision Virtuoso*, *Velocity Sprinter*, *Balanced Cadence Builder*, *Developing Typist*).
13. **Personalized Recommendations**: Transparent rule + ML-assisted recommendations analyzing the mistake confusion matrix to guide finger placement.
14. **Targeted Practice Drills & Dynamic Generation**: Synthesizes custom drills directly isolating the user's highest-confusion character pairs.

---

## Privacy & Security Architecture

- **Scoped Event Capture**: Keyboard events are captured **only** inside the focused typing test container during an active timer countdown (`RUNNING` state).
- **Zero Background Keylogging**: Global document listeners are omitted. Standard login and registration inputs use isolated HTML `<input>` elements without any keystroke metrics capture.
- **Strict User Isolation**: All session, analytics, exercise, and ML endpoints enforce authorization by extracting user ID strictly from the verified JWT principal.

---

## Service Ports & Endpoints

| Service | Host / Port | Role |
|---|---|---|
| **Frontend** | `http://localhost:5173` | React 19 Client SPA (Modern Dark Aesthetic) |
| **Main Gateway** | `http://localhost:8080` | Spring Boot Main Backend & Security Gateway |
| **AI/ML Service** | `http://127.0.0.1:8000` | Internal FastAPI Analytics Engine |
| **Database** | `localhost:27017` | MongoDB (`typingiq_db`) |

---

## How to Run

### 1. MongoDB Database
Ensure MongoDB service is running on port 27017:
```powershell
Get-Service -Name *mongo*
```

### 2. Python FastAPI ML Service
```bash
cd d:/TypingIQ/ml-service
# Activate virtual environment
./venv/Scripts/activate
# Run ML service
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Spring Boot Backend
```bash
cd d:/TypingIQ/backend
mvn spring-boot:run
```

### 4. React Frontend
```bash
cd d:/TypingIQ/frontend
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## Production Deployment Guide

### 1. Database: MongoDB Atlas Setup
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Go to **Database Access** -> **Add New Database User** (choose Username & Password authentication, e.g. `typingiq_admin`).
3. Go to **Network Access** -> **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render services can connect.
4. Click **Connect** on your cluster -> choose **Drivers (Java)** -> copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/typingiq_db?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your database user credentials)*.

---

### 2. Backend & ML Service: Render Deployment

#### Option A: 1-Click Blueprint (Recommended)
1. Push this repository to your GitHub account (see GitHub section below).
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Blueprint**.
3. Select your GitHub repository. Render will automatically detect [`render.yaml`](file:///d:/TypingIQ/render.yaml).
4. Set the environment variable `SPRING_DATA_MONGODB_URI` to your MongoDB Atlas connection string.
5. Click **Apply**. Render will spin up both the Spring Boot Backend and the FastAPI ML service.

#### Option B: Manual Web Service Setup on Render

**1. FastAPI ML Service (`typingiq-ml-service`):**
- **Type**: Web Service (Docker)
- **Root Directory**: `ml-service`
- **Dockerfile Path**: `Dockerfile`
- **Port**: Automatic (Render binds `PORT=8000`)
- Note the public URL provided (e.g. `https://typingiq-ml.onrender.com`).

**2. Spring Boot Main Backend (`typingiq-backend`):**
- **Type**: Web Service (Docker)
- **Root Directory**: `backend`
- **Dockerfile Path**: `Dockerfile`
- **Environment Variables**:
  - `SPRING_DATA_MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/typingiq_db?retryWrites=true&w=majority`
  - `TYPINGIQ_ML_SERVICE_URL`: `https://typingiq-ml.onrender.com/internal/v1/ml`
  - `APP_JWT_SECRET`: `AnyRandom64HexCharOrSecureSecretKey1234567890!`
- Note the public URL provided (e.g. `https://typingiq-backend.onrender.com`).

---

### 3. Frontend: Vercel Deployment
1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New Project**.
2. Import your GitHub repository.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://typingiq-backend.onrender.com` *(your Render backend URL)*
5. Click **Deploy**. Vercel will build and deploy your app. (Client-side routing is handled by [`frontend/vercel.json`](file:///d:/TypingIQ/frontend/vercel.json)).

---

### 4. Push Project to GitHub

Run the following commands in the root directory:
```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files (node_modules, target, and dist are excluded via .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: complete TypingIQ production release with dark theme, MongoDB Atlas & Render/Vercel deployment configs"

# 4. Set branch to main
git branch -M main

# 5. Add your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push to GitHub
git push -u origin main
```
