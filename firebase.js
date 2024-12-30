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

// Hàm lấy dữ liệu cảm biến và hiển thị kèm tên cảm biến
function getSensorData(path, elementId, sensorName) {
    const dbRef = ref(database, path);
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById(elementId).textContent = `${sensorName}: ${data}`;
        } else {
            document.getElementById(elementId).textContent = `${sensorName}: No data available`;
        }
    }, (error) => {
        console.error(error);
        document.getElementById(elementId).textContent = "Error retrieving data.";
    });
}

// Hàm cập nhật trạng thái và hành động của nút
function updateDeviceButton(path, elementId, deviceName) {
    const dbRef = ref(database, path);
    const button = document.getElementById(elementId);

    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const state = snapshot.val();
            if (state === "true") {
                button.textContent = `Turn ${deviceName} Off`;
                button.onclick = () => set(dbRef, "false"); // Hàm tắt thiết bị
                button.className = "w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300";
            } else {
                button.textContent = `Turn ${deviceName} On`;
                button.onclick = () => set(dbRef, "true"); // Hàm bật thiết bị
                button.className = "w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300";
            }
        } else {
            button.textContent = `Error loading ${deviceName} status`;
            button.onclick = null;
        }
    }, (error) => {
        console.error(error);
        button.textContent = "Error retrieving data.";
    });
}

// Lấy dữ liệu cảm biến và hiển thị
document.addEventListener("DOMContentLoaded", () => {
    getSensorData("sensors/co/data", "sensor-co", "CO Sensor");
    getSensorData("sensors/gas/data", "sensor-gas", "Gas Sensor");
    getSensorData("sensors/fire/data", "sensor-fire", "Fire Sensor");

    // Cập nhật trạng thái nút
    updateDeviceButton("/sensors/quat/data/data", "fan-button", "Fan");
    updateDeviceButton("/sensors/bom/data/data", "pump-button", "Pump");
});
