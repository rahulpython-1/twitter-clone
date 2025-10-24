# ChirpX - Full-Featured Twitter/X Clone

A modern, full-stack Twitter/X clone built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring real-time interactions, media support, monetization, and comprehensive social networking capabilities.

![ChirpX](https://img.shields.io/badge/ChirpX-v1.0.0-blue)
![Node](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-v18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v6+-green)

## Features

### Core Features
- **Authentication & Authorization**
  - JWT-based authentication
  - Email/password registration and login (own authentication system)
  - Refresh token mechanism
  - Role-based access control (user, verified, admin)

- **Tweet Management**
  - Create, read, update, delete tweets
  - 280-character limit with counter
  - Media uploads (images, videos, GIFs)
  - Polls with voting
  - Quote tweets
  - Threaded conversations
  - Scheduled tweets
  - Tweet visibility controls

- **Social Interactions**
  - Like/unlike tweets
  - Retweet/undo retweet
  - Reply to tweets
  - Mention users (@username)
  - Hashtags (#trending)
  - Bookmark tweets
  - Follow/unfollow users
  - Block/unblock users
  - Mute users

- **Real-Time Features**
  - Live notifications via Socket.IO
  - Real-time feed updates
  - Typing indicators (DM ready)
  - Online status

- **User Profiles**
  - Customizable profile (avatar, banner, bio)
  - Follower/following system
  - User statistics
  - Verified badges
  - Profile privacy settings

- **Discovery & Search**
  - Full-text search for tweets
  - User search
  - Hashtag search
  - Trending topics
  - Explore feed
  - Suggested users

- **Notifications**
  - Like notifications
  - Retweet notifications
  - Reply notifications
  - Follow notifications
  - Mention notifications

- **Lists**
  - Create and manage lists
  - Add/remove members
  - Public/private lists
  - List feeds

- **Bookmarks**
  - Save tweets for later
  - Organize by folders
  - Add notes to bookmarks

- **Admin Dashboard**
  - Platform statistics
  - User management
  - Verify users
  - Suspend/activate accounts
  - Content moderation

### UI/UX Features
- **Responsive Design**
  - Mobile-first approach
  - Desktop optimized
  - Tablet support
  - Bottom navigation for mobile

- **Dark/Light Mode**
  - System preference detection
  - Manual theme toggle
  - Persistent theme selection

- **Modern UI**
  - Tailwind CSS styling
  - Smooth animations
  - Loading states
  - Empty states
  - Error handling
  - Toast notifications

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Media storage
- **Multer** - File uploads
- **Express Validator** - Input validation
- **Express Rate Limit** - Rate limiting
- **Node-cron** - Scheduled tasks
- **Bull** - Job queue (optional)
- **Helmet** - Security headers
- **Compression** - Response compression
- **Morgan** - Logging

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Redux Toolkit** - State management
- **React Query** - Data fetching
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **React Dropzone** - File uploads
- **Date-fns** - Date formatting

## Installation

### Prerequisites
- Node.js v18 or higher
- MongoDB v6 or higher
- npm or yarn
- Cloudinary account (for media uploads)

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd twitterclonenew
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/chirpx

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: OAuth, Email, Redis, Stripe
```

4. **Start MongoDB**
```bash
# Using MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Start the backend server**
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
```bash
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file** (optional)
```bash
# client/.env
VITE_API_URL=http://localhost:5000/api
```

4. **Start the development server**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Full Stack Development

Run both servers simultaneously from the root directory:
```bash
npm run dev:full
```

## Project Structure

```
twitterclonenew/
├── client/                 # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── lib/           # Utilities and configs
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── config/                 # Backend configuration
│   ├── database.js        # MongoDB connection
│   ├── socket.js          # Socket.IO setup
│   └── cloudinary.js      # Cloudinary config
│
├── controllers/            # Route controllers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── tweet.controller.js
│   ├── notification.controller.js
│   ├── search.controller.js
│   ├── bookmark.controller.js
│   ├── list.controller.js
│   ├── monetization.controller.js
│   ├── trending.controller.js
│   └── admin.controller.js
│
├── models/                 # Mongoose models
│   ├── User.model.js
│   ├── Tweet.model.js
│   ├── Notification.model.js
│   ├── Bookmark.model.js
│   ├── List.model.js
│   ├── Message.model.js
│   ├── Conversation.model.js
│   └── Transaction.model.js
│
├── routes/                 # API routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── tweet.routes.js
│   ├── notification.routes.js
│   ├── search.routes.js
│   ├── bookmark.routes.js
│   ├── list.routes.js
│   ├── monetization.routes.js
│   ├── trending.routes.js
│   └── admin.routes.js
│
├── middleware/             # Express middleware
│   ├── auth.js            # Authentication
│   ├── errorHandler.js    # Error handling
│   ├── rateLimiter.js     # Rate limiting
│   └── validation.js      # Input validation
│
├── utils/                  # Utility functions
│   └── jwt.js             # JWT utilities
│
├── server.js              # Express server
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar
- `POST /api/users/banner` - Upload banner
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/followers` - Get followers
- `GET /api/users/:id/following` - Get following
- `GET /api/users/:username/tweets` - Get user tweets
- `PUT /api/users/settings` - Update settings
- `POST /api/users/:id/block` - Block user
- `DELETE /api/users/:id/block` - Unblock user

### Tweets
- `POST /api/tweets` - Create tweet
- `GET /api/tweets/feed` - Get feed
- `GET /api/tweets/:id` - Get tweet
- `DELETE /api/tweets/:id` - Delete tweet
- `POST /api/tweets/:id/like` - Like tweet
- `DELETE /api/tweets/:id/like` - Unlike tweet
- `POST /api/tweets/:id/retweet` - Retweet
- `DELETE /api/tweets/:id/retweet` - Undo retweet
- `GET /api/tweets/:id/replies` - Get replies
- `POST /api/tweets/:id/poll/vote` - Vote on poll

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Search
- `GET /api/search` - Search all
- `GET /api/search/users` - Search users
- `GET /api/search/tweets` - Search tweets
- `GET /api/search/hashtag/:tag` - Get tweets by hashtag

### Bookmarks
- `POST /api/bookmarks` - Add bookmark
- `GET /api/bookmarks` - Get bookmarks
- `DELETE /api/bookmarks/:id` - Delete bookmark
- `GET /api/bookmarks/folders` - Get folders

### Lists
- `POST /api/lists` - Create list
- `GET /api/lists` - Get user lists
- `GET /api/lists/:id` - Get list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `POST /api/lists/:id/members/:userId` - Add member
- `DELETE /api/lists/:id/members/:userId` - Remove member
- `GET /api/lists/:id/tweets` - Get list tweets

### Monetization
- `POST /api/monetization/enable` - Enable monetization
- `POST /api/monetization/tip` - Send tip
- `POST /api/monetization/subscribe/:userId` - Subscribe to creator
- `GET /api/monetization/earnings` - Get earnings
- `POST /api/monetization/payout` - Request payout
- `GET /api/monetization/transactions` - Get transactions

### Trending
- `GET /api/trending/topics` - Get trending topics
- `GET /api/trending/tweets` - Get trending tweets
- `GET /api/trending/users` - Get suggested users
- `GET /api/trending/explore` - Get explore feed

### Admin
- `GET /api/admin/stats` - Get platform stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/verify` - Verify user
- `PUT /api/admin/users/:id/suspend` - Suspend user
- `DELETE /api/admin/tweets/:id` - Delete tweet

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse and DDoS
- **Input Validation**: Express Validator
- **XSS Protection**: Helmet security headers
- **CORS**: Configured for specific origins
- **SQL Injection**: MongoDB parameterized queries
- **File Upload**: Size and type restrictions
- **Role-Based Access**: Admin, verified, user roles

## 🎨 UI Components

### Core Components
- `TweetCard` - Display tweet with interactions
- `TweetComposer` - Create/reply to tweets
- `Sidebar` - Main navigation
- `RightSidebar` - Trending and suggestions
- `MobileNav` - Mobile bottom navigation

### Pages
- `Home` - Main feed
- `Explore` - Discovery and search
- `Notifications` - User notifications
- `Messages` - Direct messages (UI ready)
- `Bookmarks` - Saved tweets
- `Lists` - User lists
- `Profile` - User profile
- `TweetDetail` - Single tweet view
- `Settings` - User settings
- `AdminDashboard` - Admin panel
- `Login/Register` - Authentication

## Mobile Optimization

- Responsive design for all screen sizes
- Touch-optimized interactions
- Bottom navigation bar
- Swipe gestures ready
- Optimized media loading
- Progressive Web App ready

## Deployment

### Backend Deployment (Render/Railway)

1. **Create account** on Render or Railway

2. **Create new Web Service**

3. **Connect repository**

4. **Configure environment variables** (all from .env)

5. **Build command**: `npm install`

6. **Start command**: `npm start`

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Navigate to client directory**
```bash
cd client
```

3. **Deploy**
```bash
vercel
```

4. **Set environment variables** in Vercel dashboard
```
VITE_API_URL=https://your-backend-url.com/api
```

### Database (MongoDB Atlas)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in backend environment

### Media Storage (Cloudinary)

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get API credentials
3. Update Cloudinary variables in backend environment

## Testing

```bash
# Backend tests (to be implemented)
npm test

# Frontend tests (to be implemented)
cd client && npm test
```

## Performance Optimization

- **Database Indexing**: Optimized queries
- **Lazy Loading**: Infinite scroll
- **Code Splitting**: React lazy loading
- **Image Optimization**: Cloudinary transformations
- **Caching**: React Query caching
- **Compression**: Gzip compression
- **CDN**: Cloudinary CDN for media

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Twitter/X for design inspiration
- MERN stack community
- Open source contributors

## Support

For support, email support@chirpx.com or open an issue.

## Future Enhancements

- [ ] Direct messaging system
- [ ] Voice tweets
- [ ] Spaces (audio rooms)
- [ ] AI-generated tweet suggestions
- [ ] Language translation
- [ ] Multi-account switching
- [ ] PWA with offline support
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Content recommendations AI
- [ ] Video streaming
- [ ] Stories feature
- [ ] Communities/Groups

---

Built with love using the MERN stack
