# Event Adda 🌟

**Event Adda** is a premium, full-stack event hosting and ticketing web application. It features a stunning **Cyberpunk Obsidian & Neon Twilight** aesthetic, utilizing advanced authorization, real-time WebSocket seat updates, personalized AI recommendation features, and full containerization support.

---

## 🚀 Key Features

- **Organizers Portal**: Hosts can publish events (with 8 curated dynamic cover banners per category or custom URLs), manage registries, view analytics, and approve join requests.
- **Dynamic OTP Ticket Generation**: Approving a participant generates a unique, random 6-digit ticket OTP passcode instantly.
- **Real-Time Seat Booking Updates**: Remaining seats decrement automatically on organizer approval and push updates live via WebSockets.
- **AI Recommendation Engine**: Recommends personalized events to participants on the homepage based on interest category frequency.
- **Cyberpunk Obsidian & Neon Twilight Theme**: Clean charcoal-black background, translucent glassmorphism panels, and glowing neon twilight elements.
- **Automated Event Cancellations**: Deleting an event programmatically cascades database references (reviews, wishlists, registrations) and issues dynamic push notifications to alert all registered participants.

---

## 🛠️ Technology Stack

### Backend
- **Core**: Java 21, Spring Boot 3.3.0
- **Security**: Spring Security, JWT (JSON Web Tokens)
- **Data**: Spring Data JPA, Hibernate, MySQL 8.0
- **Real-Time**: WebSockets (STOMP / SockJS)

### Frontend
- **Core**: React 18, Vite
- **Styling**: Tailwind CSS v3 (Glassmorphism, custom dark scrolls, vibrant twilight accents)
- **Icons**: Lucide React

---

## 📦 Containerization & Deployment

Event Adda is fully dockerized for seamless setup.

### Run with Docker Compose
Make sure you have Docker installed, then execute from the root directory:
```bash
docker-compose up --build
```
- **Frontend App**: Accessible at `http://localhost:80`
- **Backend API**: Accessible at `http://localhost:8082`
- **MySQL Database**: Running on `3306`

---

## 💻 Local Manual Setup

### 1. Database Configuration
Ensure MySQL is running locally.
- Create database: `event_adda_db`
- The backend configures automatic table creation using:
  - User: `root`
  - Password: `harsh45`

### 2. Run Java Spring Boot Backend
```bash
cd eventadda-backend
mvn spring-boot:run
```
The backend server runs on `http://localhost:8082`.

### 3. Run React Frontend
```bash
cd eventadda-frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📂 Project Structure

```
c:/Users/HP/Desktop/Event Manager Application/
├── eventadda-backend/           # Spring Boot App Source
├── eventadda-frontend/          # Vite React App Source
├── docker-compose.yml           # Multi-container orchestration
└── .gitignore                   # Project-wide Git ignore rules
```
