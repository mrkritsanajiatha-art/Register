const API_URL = 'https://script.google.com/macros/s/AKfycbyex1LIs8Pl2Y_JxqDvO538GNzWOoFHsA52qvnzYZh4KDRIjbAToEcjvDaVG0icME3e/exec';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');

    // Check if course parameter exists in URL and pre-check it
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course');
    if(courseId) {
        const checkbox = document.getElementById(`course${courseId}`);
        if(checkbox) checkbox.checked = true;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ensure at least one course is selected
        const selectedCourses = Array.from(document.querySelectorAll('input[name="courses"]:checked')).map(cb => cb.value);
        if (selectedCourses.length === 0) {
            alert('กรุณาเลือกอย่างน้อย 1 หลักสูตร');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> กำลังบันทึกข้อมูล...';
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            province: document.getElementById('province').value,
            organization: document.getElementById('organization').value,
            position: document.getElementById('position').value,
            package: document.getElementById('package').value,
            courses: selectedCourses
        };

        const payload = {
            path: 'register',
            data: formData
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain' }
            });
            const result = await response.json();

            if (result.status === 'success') {
                statusMessage.style.display = 'block';
                statusMessage.style.backgroundColor = '#D1FAE5';
                statusMessage.style.color = '#065F46';
                statusMessage.innerText = 'สมัครสำเร็จ! กำลังพาไปยังหน้าชำระเงิน...';
                
                // Save email to local storage for payment page
                localStorage.setItem('applicantEmail', formData.email);
                
                setTimeout(() => {
                    window.location.href = 'payment.html';
                }, 1500);
            } else {
                throw new Error(result.message || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            statusMessage.style.display = 'block';
            statusMessage.style.backgroundColor = '#FEE2E2';
            statusMessage.style.color = '#991B1B';
            statusMessage.innerText = 'เกิดข้อผิดพลาด: ' + error.message;
            
            submitBtn.disabled = false;
            submitBtn.innerText = 'ยืนยันการสมัครและดำเนินการชำระเงิน';
        }
    });
});
