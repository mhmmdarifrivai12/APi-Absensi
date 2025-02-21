document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    fetchAssignedClasses();
    document.getElementById('attendance-date').valueAsDate = new Date(); // Isi tanggal otomatis

    document.getElementById('class-select').addEventListener('change', function () {
        fetchStudents();
        fetchAttendanceHistory();
    });

    document.getElementById('attendance-form').addEventListener('submit', submitAttendance);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'guru') {
        alert('Akses ditolak!');
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    alert('Anda telah logout.');
    window.location.href = 'index.html';
}

function fetchAssignedClasses() {
    const token = localStorage.getItem('token');

    fetch('http://localhost:5000/api/teacher/assigned-classes', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        const classSelect = document.getElementById('class-select');
        classSelect.innerHTML = '<option value="">Pilih Kelas</option>';

        data.forEach(item => {
            let option = document.createElement('option');
            option.value = item.class_id;
            option.textContent = `${item.class_name} - ${item.subject_name}`;
            option.dataset.subjectId = item.subject_id || '';
            classSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching classes:', error));
}

function fetchStudents() {
    const token = localStorage.getItem('token');
    const classId = document.getElementById('class-select').value;
    
    if (!classId) return;

    fetch(`http://localhost:5000/api/teacher/students/${classId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        const studentList = document.getElementById('student-list');
        studentList.innerHTML = '';

        if (data.length === 0) {
            studentList.innerHTML = '<tr><td colspan="3">Tidak ada siswa dalam kelas ini.</td></tr>';
            return;
        }

        data.forEach(student => {
            let row = document.createElement('tr');

            let nameCell = document.createElement('td');
            nameCell.textContent = student.name;
            row.appendChild(nameCell);

            let nisCell = document.createElement('td');
            nisCell.textContent = student.nis;
            row.appendChild(nisCell);

            let statusCell = document.createElement('td');
            let selectStatus = document.createElement('select');
            selectStatus.innerHTML = `
                <option value="">Pilih Status</option>
                <option value="hadir">Hadir</option>
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
                <option value="alpha">Alpha</option>
            `;
            selectStatus.dataset.studentId = student.id;
            statusCell.appendChild(selectStatus);
            row.appendChild(statusCell);

            studentList.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching students:', error));
}

function fetchAttendanceHistory() {
    const classId = document.getElementById('class-select').value;

    if (!classId) return;

    fetch(`http://localhost:5000/api/teacher/attendance-history/${classId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => response.json())
    .then(data => {
        const historyContainer = document.getElementById('attendance-history');
        historyContainer.innerHTML = '';

        if (Object.keys(data).length === 0) {
            historyContainer.innerHTML = '<tr><td colspan="4">Tidak ada riwayat absensi.</td></tr>';
            return;
        }

        Object.entries(data).forEach(([dateKey, records]) => {
            const [date, day] = dateKey.split(" (");

            let dateRow = document.createElement('tr');
            let dateCell = document.createElement('td');
            dateCell.colSpan = 4;
            dateCell.style.fontWeight = "bold";
            dateCell.style.textAlign = "center";
            dateCell.textContent = `${date} (${day.replace(")", "")})`;
            dateRow.appendChild(dateCell);
            historyContainer.appendChild(dateRow);

            records.forEach(record => {
                let row = document.createElement('tr');

                row.innerHTML = `
                    <td>${date}</td>
                    <td>${day.replace(")", "")}</td>
                    <td>${record.student_name}</td>
                    <td>${record.status}</td>
                `;

                historyContainer.appendChild(row);
            });
        });
    })
    .catch(error => console.error('Error fetching attendance history:', error));
}

async function submitAttendance(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    const classId = document.getElementById('class-select').value;
    const date = document.getElementById('attendance-date').value;
    const subjectId = document.getElementById('class-select').selectedOptions[0].dataset.subjectId;

    if (!classId || !date || !subjectId) {
        alert('Harap isi semua kolom yang diperlukan.');
        return;
    }

    let attendanceData = [];

    document.querySelectorAll('#student-list select').forEach(select => {
        if (select.value) {
            attendanceData.push({
                student_id: select.dataset.studentId,
                subject_id: subjectId,
                class_id: classId,
                date,
                status: select.value
            });
        }
    });

    if (attendanceData.length === 0) {
        alert('Pilih minimal satu siswa untuk diabsen.');
        return;
    }

    console.log('📤 Data yang dikirim ke server:', JSON.stringify({ attendance: attendanceData }, null, 2));

    try {
        const response = await fetch('http://localhost:5000/api/teacher/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ attendance: attendanceData })
        });

        const data = await response.json();
        console.log('📥 Response dari server:', response, data);

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mencatat absensi.');
        }

        alert('Absensi berhasil dicatat!');
        fetchAttendanceHistory(); // Refresh data absensi
    } catch (error) {
        console.error('❌ Error submitting attendance:', error);
        alert(`Error: ${error.message}`);
    }
}
