let classMap = {};

document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    fetchClassesAndStudents();
    fetchSubjects();
    fetchDropdownData();
    fetchAssignedTeachers();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
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

async function fetchClassesAndStudents() {
    const token = localStorage.getItem('token');
    try {
        const [classResponse, studentResponse] = await Promise.all([
            fetch('http://localhost:5000/api/admin/classes', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:5000/api/admin/students/grouped-by-class', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);
        
        const classes = await classResponse.json();
        const studentsByClass = await studentResponse.json();
        
        classMap = Object.fromEntries(classes.map(cls => [cls.id, cls.name]));
        updateClassDropdown(classes);
        renderClassesAndStudents(classes, studentsByClass);
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal mengambil data kelas dan siswa.');
    }
}

async function fetchSubjects() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:5000/api/admin/subjects', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const subjects = await response.json();
        const subjectList = document.getElementById('subject-list');
        subjectList.innerHTML = subjects.map(sub => `<li>${sub.name}</li>`).join('');
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal mengambil daftar pelajaran.');
    }
}

function updateClassDropdown(classes) {
    const classSelect = document.getElementById('class-select');
    classSelect.innerHTML = '<option value="">Pilih Kelas</option>' +
        classes.map(cls => `<option value="${cls.id}">${cls.name}</option>`).join('');
}

function renderClassesAndStudents(classes, studentsByClass) {
    const classContainer = document.getElementById('class-student-list');

    // Gabungkan semua siswa dari semua kelas ke dalam satu array dengan informasi kelas
    let students = [];
    classes.forEach(cls => {
        (studentsByClass[cls.id] || []).forEach(student => {
            students.push({
                nis: student.nis,
                name: student.name,
                class_name: cls.name
            });
        });
    });

    // Urutkan siswa berdasarkan kelas
    students.sort((a, b) => a.class_name.localeCompare(b.class_name));

    // Buat tampilan tabel
    let tableHTML = `
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>NIS</th>
                    <th>Nama</th>
                    <th>Kelas</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(s => `
                    <tr>
                        <td>${s.nis}</td>
                        <td>${s.name}</td>
                        <td>${s.class_name}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    classContainer.innerHTML = tableHTML;
}


async function addClass() {
    const className = document.getElementById('class-name').value;
    if (!className) return alert('Nama kelas tidak boleh kosong');
    
    try {
        const response = await fetch('http://localhost:5000/api/admin/classes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name: className })
        });
        alert((await response.json()).message);
        fetchClassesAndStudents();
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menambahkan kelas.');
    }
}

async function addStudent() {
    const name = document.getElementById('student-name').value;
    const nis = document.getElementById('student-nis').value;
    const classId = document.getElementById('class-select').value;
    if (!name || !nis || !classId) return alert('Mohon isi semua field!');
    
    try {
        const response = await fetch('http://localhost:5000/api/admin/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, nis, class_id: classId })
        });
        alert((await response.json()).message);
        fetchClassesAndStudents();
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menambahkan siswa.');
    }
}

async function fetchDropdownData() {
    const token = localStorage.getItem('token');
    try {
        const [classRes, subjectRes, teacherRes] = await Promise.all([
            fetch('http://localhost:5000/api/admin/classes', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('http://localhost:5000/api/admin/subjects', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('http://localhost:5000/api/admin/teachers', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        updateDropdown('teacher-class-select', await classRes.json(), 'id', 'name', 'Pilih Kelas');
        updateDropdown('subject-select', await subjectRes.json(), 'id', 'name', 'Pilih Mata Pelajaran');
        updateDropdown('teacher-select', await teacherRes.json(), 'id', 'username', 'Pilih Guru');
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal mengambil data dropdown.');
    }
}

function updateDropdown(elementId, data, valueField, textField, placeholder) {
    const select = document.getElementById(elementId);
    select.innerHTML = `<option value="">${placeholder}</option>` +
        data.map(item => `<option value="${item[valueField]}">${item[textField]}</option>`).join('');
}

async function fetchAssignedTeachers() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:5000/api/admin/teachers-schedule', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        updateAssignedTeachersTable(await response.json());
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal mengambil daftar guru mengajar.');
    }
}

function updateAssignedTeachersTable(data) {
    const tableBody = document.getElementById('assigned-teachers-body');
    
    // Kelompokkan data berdasarkan guru
    const groupedData = {};
    data.forEach(item => {
        if (!groupedData[item.teacher_name]) {
            groupedData[item.teacher_name] = [];
        }
        groupedData[item.teacher_name].push(item);
    });

    let tableHTML = '';
    let rowIndex = 1;

    for (const [teacher, schedules] of Object.entries(groupedData)) {
        // rowspan untuk nama guru (hanya di baris pertama dalam grup)
        tableHTML += schedules.map((schedule, index) => `
            <tr>
                ${index === 0 ? `<td rowspan="${schedules.length}">${rowIndex++}</td><td rowspan="${schedules.length}">${teacher}</td>` : ''}
                <td>${schedule.class_name}</td>
                <td>${schedule.subject_name}</td>
                <td>${schedule.teaching_day}</td>
                <td>${schedule.start_time}</td>
                <td>${schedule.duration} Menit</td>
            </tr>
        `).join('');
    }

    tableBody.innerHTML = tableHTML;
}

async function assignTeacher() {
    const teacher_id = document.getElementById('teacher-select').value;
    const class_id = document.getElementById('teacher-class-select').value;
    const subject_id = document.getElementById('subject-select').value;
    const teaching_day = document.getElementById('day-select').value;
    const start_time = document.getElementById('start-time').value;
    const duration = document.getElementById('duration-select').value;

    if (!teacher_id || !class_id || !subject_id || !teaching_day || !start_time || !duration) {
        alert('Mohon isi semua field!');
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:5000/api/admin/assign-teacher', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ teacher_id, class_id, subject_id, teaching_day, start_time, duration })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Guru berhasil ditetapkan!');
            fetchAssignedTeachers(); // Refresh daftar
        } else {
            alert(data.message || 'Terjadi kesalahan.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menetapkan guru.');
    }
}

async function addSubject() {
    const subjectName = document.getElementById('subject-name').value;
    const token = localStorage.getItem('token');

    if (!subjectName) {
        alert('Nama mata pelajaran tidak boleh kosong');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/admin/subjects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: subjectName })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Mata pelajaran berhasil ditambahkan!');
            fetchSubjects(); // Refresh daftar mata pelajaran
        } else {
            alert(data.message || 'Gagal menambahkan mata pelajaran.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menambahkan mata pelajaran.');
    }
}


