// Import các chức năng cần thiết từ SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

// Hàm lấy trạng thái cảnh báo từ Firebase và cập nhật ngay trên giao diện
async function checkAndUpdateAlertStatus() {
    const dbRef = ref(database, 'sensors/canhbao/data/data'); // Đường dẫn Firebase đến trạng thái cảnh báo
    const alertSwitch = document.getElementById('canhbao-button'); // Lấy switch cảnh báo
    const sensorDistanceElement = document.getElementById('sensor-distance'); // Phần tử cảm biến khoảng cách

    // Lấy dữ liệu trạng thái cảnh báo từ Firebase
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const alertEnabled = snapshot.val(); // Lấy giá trị trạng thái từ Firebase

            // Cập nhật trạng thái của switch
            alertSwitch.checked = alertEnabled; // Đặt trạng thái switch dựa trên giá trị từ Firebase

            // Cập nhật hiển thị/ẩn cảm biến khoảng cách
            if (alertEnabled) {
                sensorDistanceElement.style.display = "block"; // Hiển thị cảm biến khoảng cách
                getDistanceData("sensors/distance/data/data"); // Lấy dữ liệu cảm biến khi bật
            } else {
                sensorDistanceElement.style.display = "none"; // Ẩn cảm biến khoảng cách
            }
        } else {
            console.error("Không có dữ liệu cảnh báo.");
        }
    }, (error) => {
        console.error("Lỗi khi lấy dữ liệu cảnh báo từ Firebase: ", error);
    });

    // Lắng nghe sự thay đổi của switch từ người dùng
    alertSwitch.addEventListener('change', () => {
        const newStatus = alertSwitch.checked ? 1 : 0; // Chuyển trạng thái switch thành 1 (bật) hoặc 0 (tắt)
        set(dbRef, newStatus); // Cập nhật trạng thái vào Firebase
    });
}

// Hàm cập nhật trạng thái và hành động của switch
// Hàm cập nhật trạng thái và hành động của switch
function updateDeviceSwitch(path, elementId, deviceName) {
    const dbRef = ref(database, path);  // Lấy tham chiếu đến đường dẫn trong Firebase
    const switchElement = document.getElementById(elementId);  // Lấy phần tử switch (checkbox)

    // Lấy trạng thái từ Firebase và cập nhật trạng thái switch
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const state = snapshot.val();  // Trạng thái thiết bị từ Firebase

            // Cập nhật trạng thái của switch dựa vào giá trị từ Firebase
            switchElement.checked = (state === 1);  // Nếu state là 1, switch bật (checked), nếu không, tắt (unchecked)
        } else {
            console.error(`Không thể tải trạng thái của ${deviceName}`);
        }
    }, (error) => {
        console.error(error);  // Xử lý lỗi khi lấy dữ liệu
    });

    // Lắng nghe sự thay đổi trạng thái của switch (checkbox) khi người dùng thay đổi
    switchElement.addEventListener('change', () => {
        const newState = switchElement.checked ? 1 : 0;  // Kiểm tra trạng thái mới của switch
        set(dbRef, newState)  // Gửi trạng thái mới lên Firebase
            .then(() => {
                console.log(`Đã cập nhật trạng thái của ${deviceName} thành ${newState === 1 ? 'Bật' : 'Tắt'}`);
            })
            .catch((error) => {
                console.error(`Lỗi khi cập nhật trạng thái của ${deviceName}:`, error);
                // Khôi phục lại trạng thái của switch nếu có lỗi
                switchElement.checked = !switchElement.checked;
            });
    });
}




// Put data khi đảo cảnh báo 
function toggleAlert() {
    alertEnabled = !alertEnabled; // Đảo trạng thái cảnh báo

    const alertButton = document.getElementById('canhbao-button');
    const sensorDistanceElement = document.getElementById('sensor-distance'); // Phần tử cảm biến khoảng cách

    // Cập nhật trạng thái của nút
    if (alertEnabled) {
        alertButton.textContent = "Chế độ chống trộm đang : Bật";
        sensorDistanceElement.style.display = "block"; // Hiển thị cảm biến khoảng cách
        getDistanceData("sensors/distance/data/data"); // Lấy dữ liệu cảm biến khi cảnh báo bật

        // Cập nhật giá trị của API canhbao = 1 (cảnh báo bật)
        const dbRef = ref(database, 'sensors/canhbao/data/data'); // Đường dẫn đến API canhbao
        set(dbRef, 1); // Gửi yêu cầu cập nhật giá trị của canhbao thành 1 (bật cảnh báo)
    } else {
        alertButton.textContent = "Chế độ chống trộm đang : Tắt";
        sensorDistanceElement.style.display = "none"; // Ẩn cảm biến khoảng cách

        // Cập nhật giá trị của API canhbao = 0 (cảnh báo tắt)
        const dbRef = ref(database, 'sensors/canhbao/data/data'); // Đường dẫn đến API canhbao
        set(dbRef, 0); // Gửi yêu cầu cập nhật giá trị của canhbao thành 0 (tắt cảnh báo)
    }
}

// Hàm lấy dữ liệu cảm biến khoảng cách và hiển thị cảnh báo chống trộm
function getDistanceData(path) {
    return new Promise((resolve, reject) => {
        const dbRef = ref(database, path);

        onValue(
            dbRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const distance = snapshot.val(); // Lấy giá trị khoảng cách từ cảm biến
                    const isDanger = distance < 5; // Kiểm tra nếu khoảng cách < 5 cm, tức là có vật thể gần
                    resolve({ distance, isDanger }); // Trả về dữ liệu và trạng thái
                } else {
                    resolve({ distance: null, isDanger: false }); // Không có dữ liệu, trạng thái mặc định an toàn
                }
            },
            (error) => {
                console.error("Lỗi khi lấy dữ liệu khoảng cách:", error);
                reject(error); // Xử lý lỗi
            }
        );
    });
}

// Lấy dữ liệu cảm biến
function getSensorData(paths) {
    const dbRefs = paths.map(path => ref(database, path)); // Tạo danh sách các tham chiếu
    return Promise.all(dbRefs.map(dbRef => get(dbRef))) // Đọc dữ liệu đồng thời
        .then((snapshots) => {
            // Trả về dữ liệu từ các snapshot
            return snapshots.map((snapshot, index) => {
                if (snapshot.exists()) {
                    return { path: paths[index], data: snapshot.val() }; // Trả về dữ liệu
                } else {
                    return { path: paths[index], data: null }; // Không có dữ liệu
                }
            });
        })
        .catch((error) => {
            console.error("Lỗi khi lấy dữ liệu:", error);
            throw error; // Ném lỗi để xử lý ở nơi gọi hàm
        });
}

// Updata vào div cảnh báo cảm biến
function updateUIWithSensorStates(sensorStates) {
    const fireSystemAlert = document.getElementById("sensor-fire-system");
    let alertText = "";

    console.log(sensorStates);

    // Kiểm tra các trạng thái cảm biến và xây dựng thông báo
    if (sensorStates.co && sensorStates.gas && sensorStates.fire) {
        alertText = "Phát hiện nguy hiểm: Nồng độ khí CO và khí Gas vượt mức, Phát hiện có Cháy!";
        fireSystemAlert.className = "alert alert-danger"; // Cảnh báo nguy hiểm
    } else if (sensorStates.co && sensorStates.gas) {
        alertText = "Phát hiện nguy hiểm: Nồng độ khí CO và khí Gas vượt mức!";
        fireSystemAlert.className = "alert alert-danger"; // Cảnh báo nguy hiểm
    } else if (sensorStates.co && sensorStates.fire) {
        alertText = "Phát hiện nguy hiểm: Nồng độ khí CO vượt mức, Phát hiện có Cháy!";
        fireSystemAlert.className = "alert alert-danger"; // Cảnh báo nguy hiểm
    } else if (sensorStates.gas && sensorStates.fire) {
        alertText = "Phát hiện nguy hiểm: khí Gas vượt mức, Phát hiện có Cháy!";
        fireSystemAlert.className = "alert alert-danger"; // Cảnh báo nguy hiểm
    } else if (sensorStates.co) {
        alertText = "Phát hiện nguy hiểm: Nồng độ khí CO vượt mức!";
        fireSystemAlert.className = "alert alert-danger"; // Cảnh báo nguy hiểm
    } else if (sensorStates.gas) {
        alertText = "Phát hiện nguy hiểm: Nồng độ khí Gas vượt mức!";
        fireSystemAlert.className = "alert alert-danger"; // Cảnh báo nguy hiểm
    } else if (sensorStates.fire) {
        alertText = "Phát hiện nguy hiểm: Phát hiện có Cháy!";
        fireSystemAlert.className = "alert alert-danger"; // Cảnh báo nguy hiểm
    } else {
        alertText = "Hệ thống an toàn.";
        fireSystemAlert.className = "alert alert-success"; // Màu xanh cho an toàn
    }

    // Hiển thị thông báo trong id sensor-fire-system
    fireSystemAlert.textContent = alertText;
    fireSystemAlert.style.display = "block"; // Hiển thị thông báo
}

// Updata vào div cảnh báo trộm
async function updateDistanceSensorUI() {
    try {
        const distanceData = await getDistanceData("sensors/distance/data/data");

        // Xử lý dữ liệu lấy được
        const element = document.getElementById("sensor-distance");
        if (distanceData.distance !== null) {
            // Kiểm tra trạng thái nguy hiểm
            const status = distanceData.isDanger ? "Có trộm" : "Bình thường";

            // Cập nhật nội dung cảnh báo
            element.textContent = `Cảm biến khoảng cách: ${status}`;

            // Cập nhật màu sắc cảnh báo
            element.className = distanceData.isDanger
                ? "alert alert-danger"  // Màu đỏ nếu có trộm
                : "alert alert-success"; // Màu xanh nếu bình thường
        } else {
            // Nếu không có dữ liệu
            element.textContent = "Cảm biến khoảng cách: Chưa có dữ liệu";
            element.className = "alert alert-warning"; // Màu vàng nếu chưa có dữ liệu
        }

    } catch (error) {
        console.error("Lỗi khi cập nhật giao diện cảm biến khoảng cách:", error);
    }
}


// Lấy dữ liệu cảm biến và hiển thị
document.addEventListener("DOMContentLoaded", () => {

    // Đường dẫn cảm biến
    const sensorPaths = [
        "sensors/co/data/data",
        "sensors/gas/data/data",
        "sensors/fire/data/data"
    ];

    // Lấy dữ liệu cảm biến 
    getSensorData(sensorPaths).then((results) => {
        const sensorStates = { co: 0, gas: 0, fire: 0 };

        results.forEach((result) => {
            if (result.data !== null) {
                if (result.path.includes("co")) {
                    sensorStates.co = result.data;
                } else if (result.path.includes("gas")) {
                    sensorStates.gas = result.data;
                } else if (result.path.includes("fire")) {
                    sensorStates.fire = result.data;
                }
            }
        });

        // Cập dữ liệu các cảm biến 
        updateUIWithSensorStates(sensorStates);
    });

    // Cập nhật trạng thái nút điều khiển
    updateDeviceSwitch("/sensors/quat/data/data", "fan-button", "Quạt");
    updateDeviceSwitch("/sensors/bom/data/data", "pump-button", "Bơm");
    updateDeviceSwitch("/sensors/chuong/data/data", "bell-button", "Chuông");

    // Cập nhật chống trộm
    updateDistanceSensorUI();
    // Cập nhật nút chống trộm
    checkAndUpdateAlertStatus();

    // Đảo canhbao 
    document.getElementById('canhbao-button').addEventListener('click', toggleAlert);

});



