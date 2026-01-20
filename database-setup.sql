-- =====================================================
-- Workaholic Job Portal - Database Setup Script
-- =====================================================
-- This script creates the complete database structure
-- for the Workaholic job portal application.
-- =====================================================

-- Create the main database
CREATE DATABASE IF NOT EXISTS workaholic 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the workaholic database
USE workaholic;

-- =====================================================
-- USER AUTHENTICATION TABLES
-- =====================================================

-- User login credentials table
-- Stores authentication information for all users
CREATE TABLE IF NOT EXISTS user_login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_user_email (user_email),
    INDEX idx_created_at (created_at)
);

-- User details table
-- Stores comprehensive profile information
CREATE TABLE IF NOT EXISTS user_details (
    user_id INT PRIMARY KEY,
    name VARCHAR(255),
    age INT,
    role ENUM('freelancer', 'company', 'admin') DEFAULT NULL,
    company_name VARCHAR(255),
    location VARCHAR(255),
    companies JSON, -- Stores array of companies for freelancers
    details_completed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key relationship
    FOREIGN KEY (user_id) REFERENCES user_login(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_role (role),
    INDEX idx_company_name (company_name),
    INDEX idx_location (location),
    INDEX idx_details_completed (details_completed)
);

-- Freelancer specific details table
-- Extended information for freelancer profiles
CREATE TABLE IF NOT EXISTS freelancer_details (
    user_id INT PRIMARY KEY,
    name VARCHAR(255),
    skills_json JSON, -- Stores array of skills
    experience TEXT,
    portfolio_url VARCHAR(500),
    hourly_rate DECIMAL(10,2),
    availability_status ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key relationship
    FOREIGN KEY (user_id) REFERENCES user_login(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_availability (availability_status),
    INDEX idx_hourly_rate (hourly_rate)
);

-- =====================================================
-- JOB MANAGEMENT TABLES
-- =====================================================

-- Job postings table
-- Core table for all job listings
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    company_id INT,
    company_name VARCHAR(255),
    user_email VARCHAR(255) NOT NULL, -- Email of the poster
    job_type ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship') DEFAULT 'full-time',
    salary_range VARCHAR(100),
    experience_level ENUM('entry', 'mid', 'senior', 'executive') DEFAULT 'mid',
    remote_work TINYINT(1) DEFAULT 0,
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    application_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_company_id (company_id),
    INDEX idx_user_email (user_email),
    INDEX idx_location (location),
    INDEX idx_job_type (job_type),
    INDEX idx_experience_level (experience_level),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    -- Full-text search index
    FULLTEXT idx_job_search (title, description)
);

-- Job applications table
-- Tracks all job applications
CREATE TABLE IF NOT EXISTS job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL, -- Applicant email
    cover_letter TEXT,
    resume_url VARCHAR(500),
    expected_salary DECIMAL(10,2),
    availability_date DATE,
    status ENUM('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key relationships
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_job_id (job_id),
    INDEX idx_user_email (user_email),
    INDEX idx_status (status),
    INDEX idx_applied_at (applied_at),
    
    -- Unique constraint to prevent duplicate applications
    UNIQUE KEY unique_application (job_id, user_email)
);

-- =====================================================
-- COMPANY MANAGEMENT TABLES
-- =====================================================

-- Company profiles table
-- Detailed information about companies
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size ENUM('1-10', '11-50', '51-200', '201-500', '500+'),
    website VARCHAR(500),
    description TEXT,
    logo_url VARCHAR(500),
    headquarters VARCHAR(255),
    founded_year INT,
    company_type ENUM('startup', 'sme', 'enterprise', 'agency') DEFAULT 'sme',
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key relationship
    FOREIGN KEY (user_id) REFERENCES user_login(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_company_name (company_name),
    INDEX idx_industry (industry),
    INDEX idx_verification_status (verification_status),
    INDEX idx_company_type (company_type)
);

-- =====================================================
-- ADDITIONAL FEATURE TABLES
-- =====================================================

-- Saved jobs table
-- Users can save jobs for later
CREATE TABLE IF NOT EXISTS saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    job_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key relationship
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_email (user_email),
    INDEX idx_job_id (job_id),
    
    -- Unique constraint to prevent duplicate saves
    UNIQUE KEY unique_save (user_email, job_id)
);

-- Messages table
-- In-app messaging between users and companies
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_email VARCHAR(255) NOT NULL,
    receiver_email VARCHAR(255) NOT NULL,
    job_id INT,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    message_type ENUM('inquiry', 'application_followup', 'offer', 'general') DEFAULT 'general',
    is_read TINYINT(1) DEFAULT 0,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key relationship
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_sender (sender_email),
    INDEX idx_receiver (receiver_email),
    INDEX idx_job_id (job_id),
    INDEX idx_is_read (is_read),
    INDEX idx_sent_at (sent_at)
);

-- Notifications table
-- User notifications system
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('application_update', 'message', 'job_recommendation', 'system') DEFAULT 'system',
    related_id INT, -- Can be job_id, application_id, etc.
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_user_email (user_email),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active jobs with company details
CREATE OR REPLACE VIEW active_jobs_with_company AS
SELECT 
    j.id,
    j.title,
    j.description,
    j.location,
    j.company_name,
    j.job_type,
    j.salary_range,
    j.experience_level,
    j.remote_work,
    j.application_count,
    j.created_at,
    c.industry,
    c.company_size,
    c.company_type
FROM jobs j
LEFT JOIN companies c ON j.company_id = c.user_id
WHERE j.status = 'active'
ORDER BY j.created_at DESC;

-- View for user applications with job details
CREATE OR REPLACE VIEW user_applications_detail AS
SELECT 
    ja.id as application_id,
    ja.user_email,
    ja.job_id,
    ja.status as application_status,
    ja.applied_at,
    j.title as job_title,
    j.company_name,
    j.location,
    j.salary_range,
    j.job_type
FROM job_applications ja
JOIN jobs j ON ja.job_id = j.id
ORDER BY ja.applied_at DESC;

-- =====================================================
-- SAMPLE DATA (Optional - for development)
-- =====================================================

-- Insert sample admin user (password: admin123)
-- Note: Remove this in production!
INSERT IGNORE INTO user_login (id, user_email, password) VALUES 
(1, 'admin@workaholic.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT IGNORE INTO user_details (user_id, name, role, details_completed) VALUES 
(1, 'System Administrator', 'admin', 1);

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Create composite indexes for common queries
CREATE INDEX idx_jobs_location_type ON jobs(location, job_type, status);
CREATE INDEX idx_applications_status_date ON job_applications(status, applied_at);
CREATE INDEX idx_messages_unread ON messages(receiver_email, is_read, sent_at);

-- =====================================================
-- TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Trigger to update application count when new application is submitted
DELIMITER //
CREATE TRIGGER update_application_count
    AFTER INSERT ON job_applications
    FOR EACH ROW
BEGIN
    UPDATE jobs 
    SET application_count = application_count + 1 
    WHERE id = NEW.job_id;
END//
DELIMITER ;

-- Trigger to update application count when application is withdrawn
DELIMITER //
CREATE TRIGGER decrease_application_count
    AFTER UPDATE ON job_applications
    FOR EACH ROW
BEGIN
    IF OLD.status != 'withdrawn' AND NEW.status = 'withdrawn' THEN
        UPDATE jobs 
        SET application_count = GREATEST(application_count - 1, 0) 
        WHERE id = NEW.job_id;
    END IF;
END//
DELIMITER ;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Display setup completion message
SELECT 'Workaholic Database Setup Complete!' as message;
SELECT 'Total tables created:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'workaholic';

-- Show created tables
SELECT TABLE_NAME as 'Created Tables:', TABLE_COMMENT as 'Description'
FROM information_schema.tables 
WHERE table_schema = 'workaholic' 
ORDER BY TABLE_NAME;
