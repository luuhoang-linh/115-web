// Import các chức năng cần thiết từ SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Biến điều khiển trạng thái cảnh báo
let alertEnabled = await checkAlertStatusFromFirebase();

// Hàm lấy giá trị của cảnh báo từ Firebase và cập nhật biến alertEnabled
async function checkAlertStatusFromFirebase() {
    const dbRef = ref(database, 'sensors/canhbao/data/data'); // Đường dẫn đến API canhbao
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const value = snapshot.val(); // Lấy giá trị từ Firebase

            // Nếu giá trị = 1, bật cảnh báo, nếu giá trị = 0, tắt cảnh báo
            alertEnabled = value;
            updateAlertButton();
        } else {
            console.error("Không có dữ liệu cảnh báo.");
        }
    }, (error) => {
        console.error("Lỗi khi lấy dữ liệu cảnh báo từ Firebase: ", error);
    });
}

// Hàm cập nhật nút cảnh báo và các phần tử liên quan
function updateAlertButton() {
    const alertButton = document.getElementById('canhbao-button');
    const alertElement = document.getElementById('alert-distance'); // Phần tử cảnh báo
    const sensorDistanceElement = document.getElementById('sensor-distance'); // Phần tử cảm biến khoảng cách

    // Cập nhật trạng thái của nút cảnh báo
    if (alertEnabled) {
        alertButton.textContent = "Chế độ chống trộm đang : Bật";
        alertElement.style.display = "block"; // Hiển thị cảnh báo
        sensorDistanceElement.style.display = "block"; // Hiển thị cảm biến khoảng cách
        getDistanceData("sensors/distance/data/data", "sensor-distance"); // Lấy dữ liệu cảm biến khi cảnh báo bật
    } else {
        alertButton.textContent = "Chế độ chống trộm đang : Tắt";
        alertElement.style.display = "none"; // Ẩn cảnh báo
        sensorDistanceElement.style.display = "none"; // Ẩn cảm biến khoảng cách
    }
}


// Hàm bật/tắt cảnh báo
function toggleAlert() {
    alertEnabled = !alertEnabled; // Đảo trạng thái cảnh báo

    const alertButton = document.getElementById('canhbao-button');
    const alertElement = document.getElementById('alert-distance'); // Phần tử cảnh báo
    const sensorDistanceElement = document.getElementById('sensor-distance'); // Phần tử cảm biến khoảng cách

    // Cập nhật trạng thái của nút
    if (alertEnabled) {
        alertButton.textContent = "Chế độ chống trộm đang : Bật";
        alertElement.style.display = "block"; // Hiển thị cảnh báo
        sensorDistanceElement.style.display = "block"; // Hiển thị cảm biến khoảng cách
        getDistanceData("sensors/distance/data/data", "sensor-distance"); // Lấy dữ liệu cảm biến khi cảnh báo bật

        // Cập nhật giá trị của API canhbao = 1 (cảnh báo bật)
        const dbRef = ref(database, 'sensors/canhbao/data/data'); // Đường dẫn đến API canhbao
        set(dbRef, 1); // Gửi yêu cầu cập nhật giá trị của canhbao thành 1 (bật cảnh báo)
    } else {
        alertButton.textContent = "Chế độ chống trộm đang : Tắt";
        alertElement.style.display = "none"; // Ẩn cảnh báo
        sensorDistanceElement.style.display = "none"; // Ẩn cảm biến khoảng cách

        // Cập nhật giá trị của API canhbao = 0 (cảnh báo tắt)
        const dbRef = ref(database, 'sensors/canhbao/data/data'); // Đường dẫn đến API canhbao
        set(dbRef, 0); // Gửi yêu cầu cập nhật giá trị của canhbao thành 0 (tắt cảnh báo)
    }
}


// Hàm lấy dữ liệu cảm biến khoảng cách và hiển thị cảnh báo chống trộm
function getDistanceData(path, elementId) {
    if (!alertEnabled) return; // Nếu cảnh báo không bật thì không lấy dữ liệu

    const dbRef = ref(database, path);
    onValue(dbRef, (snapshot) => {
        const element = document.getElementById(elementId);
        if (snapshot.exists()) {
            const distance = snapshot.val(); // Lấy giá trị khoảng cách từ cảm biến

            // Kiểm tra nếu khoảng cách < 5 cm, tức là có vật thể gần
            const status = distance < 5 ? "Có trộm" : "Bình thường";

            // Cập nhật trạng thái và gắn lớp CSS
            element.textContent = `Cảm biến khoảng cách: ${status}`;
            if (distance < 5) {
                element.className = "alert alert-danger"; // Cảnh báo: Có trộm
            } else {
                element.className = "alert alert-success"; // Cảnh báo: Bình thường
            }

            // Cập nhật cảnh báo
            updateAlert("distance", distance < 5 ? 1 : 0);
        } else {
            element.textContent = "Cảm biến khoảng cách: Chưa có dữ liệu";
            element.className = "alert alert-warning"; // Cảnh báo: Chưa có dữ liệu
        }
    }, (error) => {
        console.error(error);
        const element = document.getElementById(elementId);
        element.textContent = "Lỗi khi lấy dữ liệu.";
        element.className = "alert alert-danger"; // Cảnh báo: Lỗi khi lấy dữ liệu
    });
}

// Hàm cập nhật cảnh báo
function updateAlert(sensorName, state) {
    const alertElement = document.getElementById(`alert-${sensorName}`);

    // Hiển thị cảnh báo nếu trạng thái là 1
    if (state == 1) {
        alertElement.style.display = "block";
    } else {
        alertElement.style.display = "none";
    }
}

// Hàm cập nhật trạng thái và hành động của nút
function updateDeviceButton(path, elementId, deviceName) {
    const dbRef = ref(database, path);
    const button = document.getElementById(elementId);

    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const state = snapshot.val();
            if (state == 1) {
                button.textContent = `Thiết bị ${deviceName} đang ở chế độ : Bật`;
                button.onclick = () => set(dbRef, 0); // Hàm tắt thiết bị
                button.className = "w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300";
            } else {
                button.textContent = `Thiết bị ${deviceName} đang ở chế độ : Tắt`;
                button.onclick = () => set(dbRef, 1); // Hàm bật thiết bị
                button.className = "w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300";
            }
        } else {
            button.textContent = `Lỗi khi tải trạng thái ${deviceName}`;
            button.onclick = null;
        }
    }, (error) => {
        console.error(error);
        button.textContent = "Lỗi khi lấy dữ liệu.";
    });
}

// Lấy dữ liệu cảm biến và hiển thị
document.addEventListener("DOMContentLoaded", () => {
    getSensorData("sensors/co/data/data", "sensor-co", "Cảm biến phát hiện khí CO");
    getSensorData("sensors/gas/data/data", "sensor-gas", "Cảm biến phát hiện khí Gas");
    getSensorData("sensors/fire/data/data", "sensor-fire", "Cảm biến phát hiện Lửa");

    // Cập nhật trạng thái nút điều khiển
    updateDeviceButton("/sensors/quat/data/data", "fan-button", "Quạt");
    updateDeviceButton("/sensors/bom/data/data", "pump-button", "Bơm");
    updateDeviceButton("/sensors/chuong/data/data", "bell-button", "Chuông");

    // Cập nhật dữ liệu cảm biến khoảng cách nếu cảnh báo được bật
    getDistanceData("sensors/distance/data/data", "sensor-distance");
    // Cập nhật nút điều khiển chông trộm
    updateAlertButton();
});

// Lắng nghe sự kiện click vào nút để bật/tắt cảnh báo
document.getElementById('canhbao-button').addEventListener('click', toggleAlert);

// Hàm lấy dữ liệu cảm biến và hiển thị cảnh báo
function getSensorData(path, elementId, sensorName) {
    const dbRef = ref(database, path);
    onValue(dbRef, (snapshot) => {
        const element = document.getElementById(elementId);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const status = data == 1 ? "Vượt mức cho phép" : "Bình thường";

            // Cập nhật trạng thái và gắn lớp CSS
            element.textContent = `${sensorName}: ${status}`;
            if (data == 1) {
                element.className = "alert alert-danger"; // Cảnh báo: Vượt mức cho phép
            } else {
                element.className = "alert alert-success"; // Cảnh báo: Bình thường
            }

            console.log(sensorName)
            // Cập nhật cảnh báo
            if (sensorName == "Cảm biến phát hiện khí CO") {
                updateAlert("co", data);
            } else if (sensorName == "Cảm biến phát hiện khí Gas") {
                updateAlert("gas", data);
            } else if (sensorName == "Cảm biến phát hiện Lửa") {
                updateAlert("fire", data);
            }
        } else {
            element.textContent = `${sensorName}: Chưa có dữ liệu`;
            element.className = "alert alert-warning"; // Cảnh báo: Chưa có dữ liệu
        }
    }, (error) => {
        console.error(error);
        const element = document.getElementById(elementId);
        element.textContent = "Lỗi khi lấy dữ liệu.";
        element.className = "alert alert-danger"; // Cảnh báo: Lỗi khi lấy dữ liệu
    });
}
