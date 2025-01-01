const { getDatabase, ref, get } = require('firebase/database');

// Hàm kiểm tra tài khoản và mật khẩu
async function checkLogin(req, res) {
    const { email, password } = req.body;
    console.log('Đang kiểm tra tài khoản:', email);

    const dbRefTk = ref(req.app.locals.database, 'admin/tk ');
    const dbRefMk = ref(req.app.locals.database, 'admin/mk ');

    try {
        // Lấy tài khoản từ Firebase
        const snapshotTk = await get(dbRefTk);
        if (snapshotTk.exists()) {
            const storedEmail = String(snapshotTk.val()).trim();
            console.log("Tài khoản từ Firebase:", storedEmail);

            if (storedEmail === String(email).trim()) {
                console.log("Email khớp, kiểm tra mật khẩu...");

                // Lấy mật khẩu từ Firebase
                const snapshotMk = await get(dbRefMk);
                if (snapshotMk.exists()) {
                    const storedPassword = String(snapshotMk.val()).trim();
                    console.log("Mật khẩu từ Firebase:", storedPassword);

                    if (storedPassword === String(password).trim()) {
                        console.log("Đăng nhập thành công!");

                        // Lưu trạng thái đăng nhập vào session
                        req.session.isLoggedIn = true; // Lưu trạng thái đăng nhập

                        return res.status(200).json({ message: 'Đăng nhập thành công!' });
                    } else {
                        console.log("Sai mật khẩu!");
                        return res.status(401).json({ message: 'Mật khẩu không đúng!' });
                    }
                } else {
                    console.log("Không có mật khẩu trong Firebase!");
                    return res.status(404).json({ message: 'Không có mật khẩu trong Firebase!' });
                }
            } else {
                console.log("Email không khớp!");
                return res.status(401).json({ message: 'Tài khoản không đúng!' });
            }
        } else {
            console.log("Không tìm thấy tài khoản trong Firebase!");
            return res.status(404).json({ message: 'Không có tài khoản trong Firebase!' });
        }
    } catch (error) {
        console.error("Lỗi khi kiểm tra tài khoản/mật khẩu:", error);
        return res.status(500).json({ message: 'Lỗi khi kiểm tra tài khoản/mật khẩu.' });
    }
}

module.exports = {
    checkLogin
};