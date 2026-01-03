# Dayflow HRMS - Human Resource Management System

A comprehensive, modern HRMS built with Next.js 16, TypeScript, and PostgreSQL. This system provides complete employee management, attendance tracking, leave management, payroll processing, and notification features.

## 🚀 Features

### 👥 **User Management**
- **Multi-role Authentication**: Employee, HR Officer, and Admin roles
- **Secure Login/Signup**: JWT-based authentication with password visibility toggle
- **Employee Profiles**: Complete employee information management
- **Role-based Access Control**: Different permissions for different user roles
- **Employee ID Generation**: Automatic unique employee ID assignment

### 📊 **Dashboard**
- **Real-time Analytics**: Employee cards and attendance overview
- **Quick Actions**: Easy access to common tasks
- **Notification Center**: Integrated notification bell with unread count
- **Role-based Views**: Different dashboards for employees vs HR/admin

### ⏰ **Attendance Management**
- **Check-in/Check-out**: Daily attendance tracking
- **Attendance Status**: Present, Absent, Half-day, Leave status
- **Monthly/Yearly Views**: Comprehensive attendance reports
- **Bulk Attendance**: HR can manage attendance for multiple employees
- **Attendance Alerts**: Automatic notifications for irregular attendance

### 🏖️ **Leave Management**
- **Leave Applications**: Online leave request submission
- **Leave Types**: Paid, Sick, and Unpaid leave categories
- **Approval Workflow**: HR approval/rejection system
- **Leave Balance Tracking**: Automatic leave balance calculation
- **Leave History**: Complete leave record for each employee
- **Email Notifications**: Automatic notifications for leave status changes

### 💰 **Payroll Management**
- **Salary Calculation**: Auto-calculation of net salary (Gross - Deductions)
- **Payroll Generation**: Monthly payroll processing
- **Payslip Generation**: Digital payslip creation and download
- **Salary Structure Management**: Configurable salary components
- **Payroll Reports**: Comprehensive payroll analytics
- **Payroll Notifications**: Automatic notifications when payroll is published

### 📁 **File Management**
- **Document Upload**: Profile pictures and employee documents
- **File Storage**: Local file storage with UUID naming
- **Document Management**: View, download, and delete documents
- **File Type Validation**: Support for images, PDFs, Word docs, text files
- **File Size Limits**: 5MB maximum file size
- **Company Logo Upload**: Brand customization for company settings

### 🔔 **Notification System**
- **Real-time Notifications**: Polling-based notification updates
- **Notification Types**: Leave status, payroll published, approval requests, system alerts
- **Unread Count Tracking**: Visual notification badges
- **Notification Management**: Mark as read, delete notifications
- **Bulk Actions**: Mark all notifications as read
- **Persistent Storage**: Database-backed notification system

### 📈 **Reporting & Analytics**
- **Data Export**: CSV export for attendance, leave, and payroll data
- **Comprehensive Reports**: Detailed analytics for HR decision-making
- **Search & Filtering**: Advanced search capabilities across all modules
- **Data Visualization**: Clear presentation of HR metrics

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern utility-first CSS framework
- **Radix UI**: Accessible UI components
- **Lucide React**: Beautiful icon library

### **Backend**
- **Next.js API Routes**: Server-side API endpoints
- **PostgreSQL**: Robust relational database
- **Drizzle ORM**: Modern TypeScript ORM
- **JWT Authentication**: Secure token-based authentication
- **bcryptjs**: Password hashing

### **Development Tools**
- **ESLint**: Code quality and linting
- **Vitest**: Testing framework
- **Drizzle Kit**: Database management tools
- **TypeScript**: Static type checking

## 📋 Database Schema

### **Core Tables**
- **users**: Employee information and authentication
- **attendance**: Daily attendance records
- **leaves**: Leave requests and approvals
- **payrolls**: Monthly payroll records
- **notifications**: System notifications
- **employee_documents**: File attachments
- **salary_structures**: Employee salary configurations
- **audit_logs**: System activity tracking
- **sessions**: User session management

### **Key Features**
- **UUID Primary Keys**: Secure unique identifiers
- **Foreign Key Constraints**: Data integrity
- **Indexes**: Optimized query performance
- **JSON Fields**: Flexible data storage
- **Timestamp Tracking**: Created/updated timestamps

## 🔐 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication tokens
- **Role-based Access**: Permission-based feature access
- **Input Validation**: Comprehensive form validation
- **SQL Injection Protection**: ORM-based database queries
- **File Upload Security**: File type and size validation
- **Session Management**: Secure session handling

## 🎯 User Roles & Permissions

### **Employee**
- View personal profile
- Manage own attendance (check-in/check-out)
- Apply for leave
- View own payroll records
- Upload personal documents
- Receive notifications

### **HR Officer**
- All employee permissions
- Manage employee profiles
- Approve/reject leave requests
- Generate payroll
- View all attendance records
- Manage company settings
- Export reports

### **Admin**
- All HR permissions
- User management (create/edit/delete users)
- System configuration
- Database management access
- Full system analytics

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive tablet layouts
- **Desktop Experience**: Full-featured desktop interface
- **Cross-Browser Compatibility**: Works on all modern browsers

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/DeepGoyani/odoo-gcet.git
   cd odoo-gcet/gcet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Configure your database URL and other environment variables
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### **Environment Variables**

```env
DATABASE_URL=postgresql://username:password@localhost:5432/hrms_db
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

## 🧪 Testing

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **Test Coverage**: Comprehensive test suite
- **Testing Library**: React Testing Library integration

## 📁 Project Structure

```
gcet/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard
│   ├── employees/         # Employee management
│   ├── attendance/        # Attendance tracking
│   ├── leave/             # Leave management
│   ├── payroll/           # Payroll system
│   ├── notifications/     # Notification center
│   └── settings/          # Settings page
├── components/            # Reusable components
│   ├── ui/               # UI component library
│   └── ...               # Feature components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── db/               # Database configuration
│   └── ...               # Other utilities
├── public/                # Static assets
└── types/                 # TypeScript type definitions
```

## 🎨 UI Components

### **Core Components**
- **NotificationBell**: Real-time notification center
- **FileUpload**: Drag-and-drop file upload
- **DocumentList**: Document management interface
- **PasswordInput**: Password field with visibility toggle
- **Toast**: Notification toast system

### **UI Library**
- **Button**: Customizable button component
- **Input**: Form input fields
- **Card**: Content containers
- **DataTable**: Data display tables
- **Sidebar**: Navigation sidebar
- **TopBar**: Application header
- **StatusBadge**: Status indicators

## 🔧 Custom Hooks

- **useSalaryCalculation**: Reactive salary calculations
- **useNotificationTrigger**: Notification system integration
- **useToastListener**: Toast notification management

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### **Employees**
- `GET /api/users` - List all users
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user

### **Attendance**
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/me` - Personal attendance

### **Leave**
- `GET /api/leaves` - List leave requests
- `POST /api/leaves` - Apply for leave
- `POST /api/leaves/[id]/approve` - Approve leave
- `POST /api/leaves/[id]/reject` - Reject leave

### **Payroll**
- `GET /api/payroll` - List payroll records
- `POST /api/payroll` - Generate payroll
- `GET /api/payroll/me` - Personal payroll

### **Notifications**
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/[id]` - Mark as read
- `DELETE /api/notifications/[id]` - Delete notification

### **File Upload**
- `POST /api/uploads` - Upload file
- `DELETE /api/uploads/[id]` - Delete file

### **Export**
- `GET /api/export/attendance` - Export attendance data
- `GET /api/export/leave` - Export leave data

## 🌟 Key Features Highlight

### **Auto-Calculation System**
- **Salary Calculation**: Net salary = Gross salary - Deductions
- **Real-time Updates**: Instant recalculation on form changes
- **Visual Feedback**: Formula display and read-only fields

### **Notification System**
- **Polling-based**: 30-second interval updates
- **Rich Notifications**: Links, payloads, and actions
- **Management Features**: Mark as read, delete, bulk operations

### **File Management**
- **Secure Upload**: Type and size validation
- **Local Storage**: No external dependencies
- **Document Management**: Complete CRUD operations

### **Authentication**
- **Password Visibility**: Eye icon toggle for better UX
- **Role-based Access**: Secure permission system
- **Session Management**: Secure token handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

## 🔄 Version History

- **v0.1.0** - Initial release with core HRMS functionality
  - User authentication and management
  - Attendance tracking system
  - Leave management workflow
  - Payroll processing
  - Notification system
  - File upload capabilities
  - Export functionality
  - Responsive design

---

**Built with ❤️ using Next.js, TypeScript, and PostgreSQL**
