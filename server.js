const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const loginController = require('./controllers/loginController'); // Import controller
const session = require('express-session');
const app = express();
const port = 3000; // Cổng máy chủ


// Cấu hình session
app.use(session({
    secret: 'admin-vip-pro-dzai', // Mật khẩu bảo mật cho session
    resave: false,
    saveUninitialized: true
}));


// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDn3UrBsYNCz8FG3KTeiDHrDAek1n1TDa0",
    authDomain: "cccc-eca90.firebaseapp.com",
    databaseURL: "https://cccc-eca90-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "cccc-eca90",
    storageBucket: "cccc-eca90.firebasestorage.app",
    messagingSenderId: "971065035328",
    appId: "1:971065035328:web:ffecaef755af4276f5ada5",
    measurementId: "G-XY6DTMR25X"
};

// Khởi tạo Firebase
const appFirebase = initializeApp(firebaseConfig);
const database = getDatabase(appFirebase);

// Lưu database vào locals để có thể sử dụng trong controller
app.locals.database = database;

// Middleware để parse dữ liệu POST từ form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để parse dữ liệu form (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Middleware để parse dữ liệu JSON (nếu bạn sử dụng JSON thay vì form)
app.use(express.json());

// Kiểm tra trạng thái đăng nhập
function isLoggedIn(req, res, next) {
    // Kiểm tra nếu người dùng đã đăng nhập (có thể lưu trạng thái trong session hoặc app.locals)
    if (!req.session || !req.session.isLoggedIn) {
        // Nếu chưa đăng nhập, chuyển hướng về trang login
        return res.redirect('/');
    }
    next();
}

// Route cho trang login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Gửi tệp login.html
});

// Route xử lý đăng nhập sử dụng controller
app.post('/login', loginController.checkLogin);

// Route cho trang chính (home) sau khi đăng nhập thành công
// Kiểm tra trạng thái đăng nhập trước khi cho phép truy cập vào trang /home
app.get('/home', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html')); // Gửi tệp home.html
});

// Lắng nghe cổng
app.listen(port, () => {
    console.log(`Server đang chạy trên http://localhost:${port}`);
});
