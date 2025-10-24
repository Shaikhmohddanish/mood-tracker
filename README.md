# DailyMood - Mood Tracking App

A complete mood tracking application built with Next.js, MongoDB, and modern React patterns.

## Features

- 🔐 **Authentication System** - JWT-based auth with MongoDB
- 😊 **Mood Tracking** - Log daily emotions with notes
- 📊 **Statistics & Analytics** - View trends, streaks, and patterns
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Clean interface with Tailwind CSS
- ⚡ **Real-time Updates** - Optimistic UI with error handling

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **UI**: React + TypeScript + Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner

## Mood Types

- 😊 Happy
- 😐 Neutral  
- 😢 Sad
- 😤 Stressed
- 🤩 Excited
- 😴 Tired

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification

### Moods (Authenticated)
- `GET /api/moods` - List moods (with pagination & filters)
- `POST /api/moods` - Create mood entry
- `GET /api/moods/[id]` - Get specific mood
- `PUT /api/moods/[id]` - Update mood
- `DELETE /api/moods/[id]` - Delete mood
- `GET /api/moods/stats` - Get statistics

## Database Schema

### User
```javascript
{
  username: String (unique, 3-20 chars)
  email: String (unique, lowercase)
  password: String (hashed with bcrypt)
  createdAt: Date
  updatedAt: Date
}
```

### Mood
```javascript
{
  userId: ObjectId (ref: User)
  mood: String (enum: happy|neutral|sad|stressed|excited|tired)
  note: String (optional, max 300 chars)
  date: Date (normalized to start of day UTC)
  createdAt: Date
  updatedAt: Date
}
```

## Statistics Features

- **Current Streak**: Consecutive days with mood entries
- **Longest Streak**: Personal best streak
- **Last 30 Days**: Activity calendar view
- **Mood Distribution**: Pie chart of emotional patterns
- **Weekly Activity**: Bar chart of active days per week
- **Entry Frequency**: Line chart over time

## Getting Started

1. **Clone and install**:
   ```bash
   git clone <repo>
   cd dailymood-auth
   npm install --legacy-peer-deps
   ```

2. **Environment setup**:
   ```bash
   # .env
   MONGODB_URL="mongodb+srv://..."
   JWT_SECRET="your-super-secret-jwt-key"
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Seed test data** (optional):
   ```bash
   node scripts/seed.mjs
   # Creates test user: test@example.com / password123
   ```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   └── moods/         # Mood CRUD + stats
│   ├── dashboard/         # Protected dashboard page
│   ├── login/            # Login page
│   └── signup/           # Registration page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── MoodForm.tsx      # Add/edit mood form
│   ├── MoodCard.tsx      # Individual mood display
│   ├── MoodSelect.tsx    # Mood picker dropdown
│   ├── MoodCharts.tsx    # Statistics visualizations
│   └── StatsSummary.tsx  # Key metrics cards
├── hooks/
│   ├── useMoods.ts       # Mood CRUD operations
│   └── useStats.ts       # Statistics fetching
├── lib/
│   ├── models/           # Mongoose schemas
│   ├── auth.ts           # JWT helpers
│   ├── db.ts             # MongoDB connection
│   ├── api.ts            # API client
│   ├── schemas.ts        # Zod validation
│   └── format.ts         # Date & mood utilities
└── scripts/
    └── seed.mjs          # Test data generator
```

## Key Features Detail

### Authentication
- Secure JWT-based auth with 7-day expiration
- Password hashing with bcrypt (12 salt rounds)
- Token verification middleware for protected routes
- Automatic logout on invalid tokens

### Mood Management
- One mood entry per user per day (enforced by unique index)
- Rich text notes (up to 300 characters)
- Date normalization to UTC start-of-day
- Optimistic UI updates with error rollback

### Data Validation
- Frontend: React Hook Form + Zod schemas
- Backend: Mongoose validation + Zod parsing
- Consistent error handling across all endpoints

### Performance
- MongoDB indexes for efficient queries
- Cached database connections in development
- Optimistic updates for instant UI feedback
- Background statistics refresh

## Development Notes

### Database Indexes
- `{ userId: 1, date: 1 }` - Unique constraint + query optimization
- `{ userId: 1, createdAt: -1 }` - Recent moods ordering

### Error Handling
- Standardized API responses: `{ ok: boolean, data?, error? }`
- User-friendly error messages
- Console logging for debugging
- Toast notifications for user feedback

### Security Considerations
- Input validation on both client and server
- SQL injection protection via Mongoose
- Password complexity requirements
- JWT expiration and verification

## Testing

### Manual Testing
1. Register a new account
2. Login and verify dashboard loads
3. Add mood entries for different days
4. Edit and delete entries
5. View statistics and charts
6. Test form validation
7. Verify streaks calculation

### API Testing
Use the provided `api-tests.http` file with tools like REST Client or Postman.

## Future Enhancements

- [ ] Email verification for new accounts
- [ ] Password reset functionality
- [ ] Export mood data (CSV/JSON)
- [ ] Mood reminders/notifications
- [ ] Multi-language support
- [ ] Social features (sharing insights)
- [ ] Advanced analytics (monthly/yearly views)
- [ ] Mobile app (React Native)

## License

MIT License - feel free to use this project as a learning resource or starting point for your own mood tracking app!# mood-tracker
# mood-tracker
# mood-tracker
# mood-tracker
# mood-tracker
