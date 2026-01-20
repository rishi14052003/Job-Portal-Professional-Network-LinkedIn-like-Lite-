# Workaholic - Professional Job Portal & Networking Platform

A modern, feature-rich job portal that bridges the gap between talented professionals and forward-thinking companies. Built with cutting-edge technology and designed for seamless user experience.

## 🌟 About Workaholic

Workaholic isn't just another job board—it's a comprehensive professional networking platform where careers are built and companies find their perfect matches. Whether you're a freelancer looking for exciting projects or a company seeking top talent, Workaholic streamlines the entire process with elegance and efficiency.

## ✨ Key Features

### For Professionals & Freelancers
- **Smart Profile Management**: Showcase your skills, experience, and portfolio
- **Intelligent Job Discovery**: Find opportunities that match your expertise
- **Seamless Applications**: Apply to jobs with just a few clicks
- **Application Tracking**: Monitor your application status in real-time
- **Professional Networking**: Connect with companies and fellow professionals

### For Companies & Recruiters
- **Effortless Job Posting**: Create and manage job listings with ease
- **Talent Discovery**: Access a pool of qualified professionals
- **Application Management**: Review and respond to applications efficiently
- **Company Branding**: Build your employer brand with customizable profiles
- **Analytics Dashboard**: Track recruitment metrics and insights

## 🛠 Tech Stack

### Frontend (React 18)
- **React 18** with modern hooks and patterns
- **Redux Toolkit** for state management
- **React Router** for seamless navigation
- **Lucide React** for beautiful icons
- **Axios** for API communication
- **Tailwind CSS** for responsive design

### Backend (Node.js & Express)
- **Node.js** with ES6 modules
- **Express 5** for robust API development
- **MySQL 2** for database operations
- **JWT** for secure authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Database
- **MySQL** with optimized schema design
- **Connection pooling** for performance
- **Prepared statements** for security

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Job-Portal-Professional-Network-LinkedIn-like-Lite-
   ```

2. **Backend Setup**
   ```bash
   cd job-portal-be
   npm install
   
   # Configure your database
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd job-portal-fe
   npm install
   
   # Configure API endpoint
   echo "REACT_APP_BASE_URL=http://localhost:5000" > .env
   
   # Start the frontend
   npm start
   ```

4. **Database Setup**
   ```bash
   # Import the database schema
   mysql -u root -p < database-setup.sql
   ```

## 📁 Project Structure

```
Job-Portal-Professional-Network-LinkedIn-like-Lite-/
├── job-portal-be/                 # Backend API Server
│   ├── controllers/               # Business logic
│   ├── routes/                    # API endpoints
│   ├── middleware/                # Authentication & validation
│   ├── config/                    # Database configuration
│   ├── server.js                  # Main server file
│   └── .env                       # Environment variables
├── job-portal-fe/                 # React Frontend
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page components
│   │   ├── redux/                 # State management
│   │   ├── utils/                 # Utility functions
│   │   └── assets/                # Static assets
│   └── public/                    # Public files
├── database-setup.sql              # MySQL schema
└── README.md                      # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=workaholic

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```env
REACT_APP_BASE_URL=http://localhost:5000
```

## 🎯 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/:email` - Get user details
- `PUT /api/users/update` - Update user profile

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs/create` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/:id/applications` - Get job applications

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured for allowed origins
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Prepared statements throughout

## 🎨 UI/UX Highlights

- **Responsive Design**: Works seamlessly on all devices
- **Modern Interface**: Clean, intuitive user experience
- **Real-time Updates**: Live status updates for applications
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized for speed and efficiency

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Express.js** for the robust backend framework
- **MySQL** for the reliable database system
- **Open Source Community** for the incredible tools and libraries

## 📞 Support & Contact

Have questions or need help? We're here for you:

- **Email**: support@workaholic.com
- **GitHub Issues**: [Report bugs here](issues)
- **Documentation**: [Check our wiki](wiki)

---

**Built with ❤️ by passionate developers who believe in creating meaningful connections between talent and opportunity.**

*Your career journey starts here. Let's build something amazing together!*
