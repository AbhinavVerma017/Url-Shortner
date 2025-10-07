# URL Shortener

A modern, Bitly-inspired URL shortener built with Node.js, Express, MongoDB, and a beautiful responsive frontend.

## Features

- 🚀 **Fast URL Shortening** - Create short links instantly
- 📊 **Analytics Dashboard** - Track clicks and link performance
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Modern UI** - Clean, professional interface inspired by Bitly
- 💾 **Local Storage** - Recent links saved in browser
- 🔗 **Click Tracking** - Monitor link usage and engagement
- 📋 **Copy to Clipboard** - One-click copying with visual feedback

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   BASE_URL=http://localhost:5000
   PORT=5000
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and visit `http://localhost:5000`

## Usage

1. **Shorten URLs**: Paste any long URL into the input field and click "Shorten"
2. **Copy Links**: Click the "Copy" button to copy your short URL to clipboard
3. **View Analytics**: Check the analytics section to see your link statistics
4. **Recent Links**: View and manage your recently created links

## API Endpoints

- `POST /shorten` - Create a new short URL
- `GET /:shortId` - Redirect to original URL

## Project Structure

```
src/
├── controllers/     # Route controllers
├── models/         # Database models
├── routes/         # API routes
├── config/         # Database configuration
├── app.js          # Express app configuration
└── server.js       # Server entry point

public/
├── css/           # Stylesheets
├── js/            # Frontend JavaScript
└── index.html     # Main HTML file
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Features in Detail

### Modern UI/UX
- Gradient hero section with call-to-action
- Card-based layout for features and analytics
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading states and visual feedback

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

### Analytics
- Click tracking for each shortened URL
- Recent links history
- Visual statistics dashboard
- Local storage for offline functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.


# Url-Shortner
