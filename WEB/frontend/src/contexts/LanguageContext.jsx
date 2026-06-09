import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    home: "Home",
    courses: "Courses",
    myCourses: "My Courses",
    dashboard: "Dashboard",
    profile: "Profile",
    adminPanel: "Admin Panel",
    adminDashboard: "Admin Dashboard",
    manageCourses: "Manage Courses",
    manageUsers: "Manage Users",
    login: "Login",
    register: "Register",
    logout: "Logout",
    // Home Page
    heroTitle: "Unlock Your Potential with",
    heroDesc: "Join thousands of students learning cutting-edge technologies. Our premium courses are structured to guide you from absolute beginner to production-ready professional.",
    getStartedFree: "Get Started Free",
    browseCourses: "Browse All Courses",
    activeStudents: "Active Students",
    expertCourses: "Expert Courses",
    successRate: "Success Rate",
    featuredTracks: "Featured Learning Tracks",
    featuredDesc: "Kickstart your cloud, frontend, and backend career today.",
    selfPaced: "Self-Paced",
    viewDetails: "View Details",
    noCourses: "No courses available. Log in as admin to create your first course!",
    // Login / Register
    welcomeBack: "Welcome Back",
    signinToDashboard: "Sign in to your learning dashboard",
    email: "Email Address",
    password: "Password",
    fullname: "Full Name",
    confirmPassword: "Confirm Password",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    registerHere: "Register here",
    loginHere: "Login here",
    signin: "Sign In",
    signup: "Sign Up",
    // Dashboard
    welcomeHeader: "Welcome back",
    dashboardDesc: "Here is a quick overview of your learning track and milestones.",
    completedLessons: "Completed Lessons",
    completionRate: "Completion Rate",
    courseTracking: "Course Tracking Chart",
    academicStatus: "Academic Status",
    allCourses: "All Courses",
    resumeStudy: "Resume Study",
    noEnrolledCourses: "You have not enrolled in any learning courses yet.",
    viewCatalog: "View Catalog",
    // Course Detail
    backToCatalog: "Back to Catalog",
    syllabusOverview: "Syllabus Overview",
    noLessonsUploaded: "No lessons have been uploaded to this course yet.",
    getAccess: "Get Access",
    getAccessDesc: "Register in this course to unlock complete lecture videos, syllabus progress, and course documentation.",
    enrollCourse: "Enroll in Course",
    courseSyllabus: "Course Syllabus",
    completed: "Completed",
    markCompleted: "Mark Completed",
    noVideo: "No Video Available for this Lesson",
    selectLesson: "Select a lesson from the playlist to begin learning.",
    // Roster / Enrollments
    roster: "Roster",
    lessonsCount: "Lessons",
    registeredStudents: "Registered Students",
    enrolledAt: "Enrollment Date",
    noStudentsEnrolled: "No students enrolled in this course.",
    // Profile
    profileSettings: "My Profile Settings",
    profileSettingsDesc: "Manage your login credentials, avatar image, and personal particulars.",
    editAccountInfo: "Edit Account Info",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    saveProfileDetails: "Save Profile Details",
    updatePassword: "Update Password",
  },
  vi: {
    home: "Trang chủ",
    courses: "Khóa học",
    myCourses: "Khóa học của tôi",
    dashboard: "Bảng điều khiển",
    profile: "Hồ sơ cá nhân",
    adminPanel: "Khu vực Admin",
    adminDashboard: "Báo cáo Admin",
    manageCourses: "Quản lý khóa học",
    manageUsers: "Quản lý học viên",
    login: "Đăng nhập",
    register: "Đăng ký",
    logout: "Đăng xuất",
    // Home Page
    heroTitle: "Khai mở tiềm năng của bạn với",
    heroDesc: "Tham gia cùng hàng ngàn học viên đang làm chủ các công nghệ mới nhất. Các khóa học cao cấp của chúng tôi được thiết kế chi tiết để dẫn dắt bạn từ con số 0 đến lập trình viên chuyên nghiệp.",
    getStartedFree: "Bắt đầu miễn phí",
    browseCourses: "Khám phá khóa học",
    activeStudents: "Học viên hoạt động",
    expertCourses: "Khóa học chuyên sâu",
    successRate: "Tỷ lệ thành công",
    featuredTracks: "Lộ trình học nổi bật",
    featuredDesc: "Bắt đầu sự nghiệp Cloud, Frontend và Backend của bạn ngay hôm nay.",
    selfPaced: "Tự học",
    viewDetails: "Xem chi tiết",
    noCourses: "Chưa có khóa học nào. Hãy đăng nhập tài khoản admin để tạo khóa học đầu tiên!",
    // Login / Register
    welcomeBack: "Chào mừng trở lại",
    signinToDashboard: "Đăng nhập vào bảng điều khiển học tập của bạn",
    email: "Địa chỉ Email",
    password: "Mật khẩu",
    fullname: "Họ và tên",
    confirmPassword: "Xác nhận mật khẩu",
    dontHaveAccount: "Chưa có tài khoản?",
    alreadyHaveAccount: "Đã có tài khoản?",
    registerHere: "Đăng ký tại đây",
    loginHere: "Đăng nhập tại đây",
    signin: "Đăng nhập",
    signup: "Đăng ký",
    // Dashboard
    welcomeHeader: "Chào mừng trở lại",
    dashboardDesc: "Dưới đây là tổng quan nhanh về lộ trình học tập và các cột mốc của bạn.",
    completedLessons: "Bài học đã hoàn thành",
    completionRate: "Tỷ lệ hoàn thành",
    courseTracking: "Biểu đồ tiến độ khóa học",
    academicStatus: "Trạng thái học tập",
    allCourses: "Tất cả khóa học",
    resumeStudy: "Tiếp tục học",
    noEnrolledCourses: "Bạn chưa đăng ký khóa học nào.",
    viewCatalog: "Xem danh mục",
    // Course Detail
    backToCatalog: "Quay lại danh mục",
    syllabusOverview: "Tổng quan chương trình học",
    noLessonsUploaded: "Khóa học này chưa có bài học nào được đăng tải.",
    getAccess: "Tham gia học",
    getAccessDesc: "Đăng ký khóa học này để mở khóa toàn bộ video bài giảng, theo dõi tiến độ và nhận tài liệu hướng dẫn.",
    enrollCourse: "Đăng ký học ngay",
    courseSyllabus: "Giáo trình khóa học",
    completed: "Đã hoàn thành",
    markCompleted: "Đánh dấu hoàn thành",
    noVideo: "Bài học này hiện không có video",
    selectLesson: "Chọn một bài học từ danh sách để bắt đầu học tập.",
    // Roster / Enrollments
    roster: "Danh sách học viên",
    lessonsCount: "Bài học",
    registeredStudents: "Học viên đã đăng ký",
    enrolledAt: "Ngày đăng ký",
    noStudentsEnrolled: "Chưa có học viên nào đăng ký khóa học này.",
    // Profile
    profileSettings: "Thiết lập tài khoản",
    profileSettingsDesc: "Quản lý thông tin đăng nhập, ảnh đại diện và thông tin cá nhân của bạn.",
    editAccountInfo: "Chỉnh sửa thông tin cá nhân",
    changePassword: "Đổi mật khẩu",
    currentPassword: "Mật khẩu hiện tại",
    newPassword: "Mật khẩu mới",
    confirmNewPassword: "Xác nhận mật khẩu mới",
    saveProfileDetails: "Lưu thay đổi",
    updatePassword: "Cập nhật mật khẩu",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'vi');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'vi' ? 'en' : 'vi'));
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
