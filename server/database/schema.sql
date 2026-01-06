CREATE DATABASE IF NOT EXISTS church_dashboard;
USE church_dashboard;

-- News and Updates Table
CREATE TABLE news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    category ENUM('announcement', 'event', 'testimony', 'general') DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sunday Services Table
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_date DATE NOT NULL,
    service_time TIME NOT NULL,
    service_type ENUM('sunday_service', 'bible_study', 'prayer_meeting', 'special_event') DEFAULT 'sunday_service',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    leader VARCHAR(100),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteers/Service Participants Table
CREATE TABLE volunteers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT,
    volunteer_id INT,
    role ENUM('worship_leader', 'musician', 'soundman') NOT NULL,
    assigned_date DATE NOT NULL,
    status ENUM('confirmed', 'pending', 'unavailable') DEFAULT 'pending',
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE volunteer_list (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    capability VARCHAR(100),
    phone VARCHAR(20),
);

-- About Church Information
CREATE TABLE about_church (
    id INT PRIMARY KEY AUTO_INCREMENT,
    section VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0
);

-- Insert default about sections
INSERT INTO about_church (section, title, content) VALUES
('history', 'Our History', 'Share your church history here...'),
('beliefs', 'Our Beliefs', 'Share your church beliefs here...'),
('mission', 'Our Mission', 'Share your church mission here...'),
('pastors', 'Our Pastors', 'Introduce your pastoral team here...');

-- Users Table for Firebase Auth users and roles
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('admin', 'moderator', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);