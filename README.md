# 🔰 Humraaj 🔰

Humraaj envisions the development of a dynamic and interactive platform designed to cultivate a sense of community engagement and cooperation. By providing residents with a space for open and constructive dialogue, the platform aims to encourage the exchange of ideas and the generation of innovative solutions to address local challenges. Fostering inclusivity is a key tenet of Humraaj's mission, ensuring that all community members feel empowered to contribute their perspectives and experiences. Through this collaborative effort, Humraaj seeks to create a cohesive environment where shared progress becomes a collective endeavor, ultimately enhancing the overall well-being and development of the community.

# 🛠️ Project Structure 🛠️

The project is organized into two main components:
- `frontend/`: React-based user interface
- `backend/`: Express.js REST API server

# 🚀 Setup Instructions 🚀

## Prerequisites
1. [Node.js](https://nodejs.org/en/download) (v14 or higher)
2. [MongoDB](https://www.mongodb.com/try/download/community)
3. Git

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/ShashwatDrashan/humraaj2.0
   cd humraaj2.0
   ```

## Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/humraaj
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   The API server will run on http://localhost:5000

## Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```
   The application will open in your default browser at http://localhost:3000

# ✴️ Disclaimer ✴️

Humraaj is conceived during the "Hack KRMU 3.0" Hackathon as a project in its initial stages. At its present state, it is not intended for deployment in production environments or incorporation into any business models. Access has been restricted solely to the Hack KRMU team for evaluation purposes.

# 🔧 Development 🔧

- The backend API documentation is available at http://localhost:5000/api-docs
- For development, both frontend and backend support hot-reloading
- Use `npm run dev` instead of `npm start` for development mode with additional debugging features
