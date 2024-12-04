# Chatify

Chatify is a real-time chat application built using **Vite**, **React**, and **MongoDB**. It allows users to create accounts, interact with other users, send text messages, files, and emojis, and enjoy a smooth, responsive messaging experience.

## Features

- **User Authentication**: Users can create an account and log in to the platform.
- **Real-time Messaging**: Send and receive real-time text messages, file attachments, and emojis.
- **Online Presence Indicator**: Users can see who's online via a green indicator on their avatar.
- **Custom Avatars**: Each user has a unique, randomly generated avatar with a different color by default.
- **Logout**: Users can log out from their session at any time.

## Tech Stack

- **Frontend**: React with Vite for fast development and hot module replacement (HMR).
- **Backend**: MongoDB for storing user data and messages.
- **Styling**: Tailwind CSS for responsive and customizable UI components.

## Installation & Setup

To run the project locally, follow these steps:

### Prerequisites

- **Node.js** (version 16 or higher)
- **MongoDB** instance (local or cloud-based)

### 1. Clone the repository

```bash
git clone https://github.com/MohammadhRimaz/Chatify.git
cd chatify
```

### 2. Install dependencies

npm install

- **Dependencies:**  
  "autoprefixer": "^10.4.20",  
  "axios": "^1.7.7",  
  "lodash": "^4.17.21",  
  "postcss": "^8.4.49",  
  "react": "^18.3.1",  
  "react-dom": "^18.3.1",  
  "tailwindcss": "^3.4.15"  

### 3. Configure MongoDB

- Checkout this Link: https://www.mongodb.com/resources/products/fundamentals/create-database

### 4. Run the app

client> npm run dev  
api> nodemon index.js  
