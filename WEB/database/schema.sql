-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `online_learning_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `online_learning_system`;

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS `progress`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `users`;

-- Users Table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fullname` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'student') NOT NULL DEFAULT 'student',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses Table
CREATE TABLE `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `thumbnail` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lessons Table
CREATE TABLE `lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `video_url` VARCHAR(255) DEFAULT NULL,
  `lesson_order` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX `idx_lessons_course` (`course_id`),
  UNIQUE KEY `uq_course_lesson_order` (`course_id`, `lesson_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollments Table
CREATE TABLE `enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_user_course` (`user_id`, `course_id`),
  INDEX `idx_enrollments_user` (`user_id`),
  INDEX `idx_enrollments_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Progress Table
CREATE TABLE `progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `lesson_id` INT NOT NULL,
  `completed` TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_user_lesson` (`user_id`, `lesson_id`),
  INDEX `idx_progress_user` (`user_id`),
  INDEX `idx_progress_lesson` (`lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Seed Admin User
-- Password: 'adminpassword123' (will be hashed with bcrypt when creating backend logic, but this is default seed)
-- In production, the backend register endpoint or a database setup script hashes it.
-- Let's put a pre-hashed bcrypt password for default admin: $2a$10$7R4x1D.hQjB36dJ9uT8H.egmHq366tO2N5v5Z5C5nF.j1w8P/yUOi (hash of 'admin123')
INSERT INTO `users` (`fullname`, `email`, `password`, `role`) VALUES
('System Administrator', 'admin@lms.com', '$2a$10$dC9seuhlDqlIEASoHCE2JOk0KZy591horvd.hvmT.5Uud48vwtjEu', 'admin'),
('John Student', 'student@lms.com', '$2a$10$dC9seuhlDqlIEASoHCE2JOk0KZy591horvd.hvmT.5Uud48vwtjEu', 'student');

-- Insert Sample Courses
INSERT INTO `courses` (`id`, `title`, `description`, `thumbnail`) VALUES
(1, 'Introduction to AWS Cloud Computing', 'Learn the basics of cloud computing with Amazon Web Services (AWS). This course covers core services like EC2, S3, RDS, IAM, and VPC. You will understand how to design and deploy scalable architectures.', '/uploads/aws-intro.jpg'),
(2, 'Mastering React 19 & modern Web UI', 'Build high-performance web applications using React 19, custom CSS components, Bootstrap 5 integration, Context API, and chart components.', '/uploads/react19.jpg'),
(3, 'NodeJS & Express Production Guide', 'A deep dive into building production-ready API backends using NodeJS, ExpressJS, MySQL databases, JWT-based security, input validations, and error handling.', '/uploads/node-guide.jpg');

-- Insert Sample Lessons
INSERT INTO `lessons` (`course_id`, `title`, `content`, `video_url`, `lesson_order`) VALUES
(1, 'What is Cloud Computing?', 'Cloud computing is the delivery of computing services—including servers, storage, databases, networking, software, analytics, and intelligence—over the Internet to offer faster innovation, flexible resources, and economies of scale. In this lesson, we will explore the deployment models (Public, Private, Hybrid) and service models (IaaS, PaaS, SaaS).', 'https://www.youtube.com/embed/mxT2ipTgGE4', 1),
(1, 'Introduction to AWS EC2 Instances', 'Amazon Elastic Compute Cloud (Amazon EC2) is a web service that provides secure, resizable compute capacity in the cloud. It is designed to make web-scale cloud computing easier for developers. We will cover security groups, key pairs, and instance types.', 'https://www.youtube.com/embed/Ia-UEYYR44s', 2),
(1, 'Understanding AWS VPC & Networking', 'Amazon Virtual Private Cloud (Amazon VPC) lets you provision a logically isolated section of the Amazon Web Services (AWS) cloud where you can launch AWS resources in a virtual network that you define. Learn about subnets, route tables, and gateways.', 'https://www.youtube.com/embed/g2JOHLHh4rI', 3),

(2, 'What is New in React 19?', 'React 19 introduces major features like Server Actions, Document Metadata support, the new `use` hook, and enhanced compiler-driven performance optimizations. Let us write our first React 19 function components.', 'https://www.youtube.com/embed/8124kv-63QI', 1),
(2, 'State Management via Context API', 'Context provides a way to pass data through the component tree without having to pass props down manually at every level. In this lesson, we will build a responsive theme manager and authenticating context wrapper.', 'https://www.youtube.com/embed/5LrDIWkK-To', 2),

(3, 'Setting up ExpressJS Server & MySQL connection', 'Learn how to set up an Express application from scratch, define routes, configure environment variables using dotenv, and establish connection pooling with the mysql2 client.', 'https://www.youtube.com/embed/Oe421EPjeBE', 1);
