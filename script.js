const STORAGE_KEY = "student-management-data";
let students = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentsTable");
const mercyBody = document.getElementById("mercyTable");
const message = document.getElementById("formMessage");

function average(grades) {
  return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
}

function letterGrade(avg) {
  if (avg >= 90) return "A";
  if (avg >= 80) return "B";
  if (avg >= 70) return "C";
  if (avg >= 60) return "D";
  if (avg >= 50) return "E";
  return "F";
}

function finalResult(student) {
  return average(student.grades) >= 50 && student.attendance >= 75
    ? "ناجح"
    : "يحتاج مراجعة";
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function render() {
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("passedStudents").textContent =
    students.filter(student => finalResult(student) === "ناجح").length;
  document.getElementById("reviewStudents").textContent =
    students.filter(student => finalResult(student) !== "ناجح").length;

  if (students.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="8" class="empty">لا توجد بيانات حتى الآن. أضف أول طالب من النموذج بالأعلى.</td></tr>';
  } else {
    tableBody.innerHTML = students.map(student => {
      const avg = average(student.grades);
      const result = finalResult(student);
      return `<tr>
        <td>${student.id}</td>
        <td>${escapeHTML(student.name)}</td>
        <td>${student.grades.join(" / ")}</td>
        <td>${student.attendance}%</td>
        <td>${avg.toFixed(2)}</td>
        <td><span class="pill grade">${letterGrade(avg)}</span></td>
        <td><span class="pill ${result === "ناجح" ? "pass" : "review"}">${result}</span></td>
        <td><button class="delete-btn" data-delete="${student.id}">حذف</button></td>
      </tr>`;
    }).join("");
  }

  const struggling = students.filter(student => {
    const avg = average(student.grades);
    return avg >= 40 && avg <= 49;
  }).map(student => ({
    name: student.name,
    grades: student.grades.map(grade => Math.min(grade + 5, 100))
  }));

  if (struggling.length === 0) {
    mercyBody.innerHTML = '<tr><td colspan="3" class="empty">لا يوجد طلاب تنطبق عليهم شروط الرأفة.</td></tr>';
    document.getElementById("mercyAverage").textContent = "0.00";
  } else {
    mercyBody.innerHTML = struggling.map(student => `
      <tr><td>${escapeHTML(student.name)}</td>
      <td>${student.grades.join(" / ")}</td>
      <td>${average(student.grades).toFixed(2)}</td></tr>
    `).join("");
    const mercyAverage = struggling.reduce((sum, student) => sum + average(student.grades), 0) / struggling.length;
    document.getElementById("mercyAverage").textContent = mercyAverage.toFixed(2);
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const id = Number(document.getElementById("studentId").value);
  const name = document.getElementById("studentName").value.trim();
  const grades = [1, 2, 3].map(number => Number(document.getElementById(`grade${number}`).value));
  const attendance = Number(document.getElementById("attendance").value);

  if (students.some(student => student.id === id)) {
    message.textContent = "رقم الجلوس مستخدم بالفعل. أدخل رقمًا آخر.";
    message.style.color = "#be123c";
    return;
  }
  if (!name || grades.some(grade => grade < 0 || grade > 100) || attendance < 0 || attendance > 100) {
    message.textContent = "تأكد من إدخال الاسم والدرجات والحضور بشكل صحيح (من 0 إلى 100).";
    message.style.color = "#be123c";
    return;
  }

  students.push({ id, name, grades, attendance });
  save();
  render();
  form.reset();
  message.textContent = "تمت إضافة الطالب بنجاح.";
  message.style.color = "#047857";
});

tableBody.addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  const id = Number(button.dataset.delete);
  students = students.filter(student => student.id !== id);
  save();
  render();
});

document.getElementById("clearAll").addEventListener("click", () => {
  if (!students.length) return;
  if (confirm("هل أنت متأكد من مسح جميع بيانات الطلاب؟")) {
    students = [];
    save();
    render();
    message.textContent = "تم مسح جميع البيانات.";
  }
});

render();
