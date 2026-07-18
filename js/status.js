const API_URL = 'https://script.google.com/macros/s/AKfycby_J6xApoZivjG26hIae1QyNFVBFfAZ_SKzg-lvNn40TrgMK9ogQZgGzINY-9FtcQVE/exec';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('searchForm');
    const searchBtn = document.getElementById('searchBtn');
    const emailInput = document.getElementById('searchEmail');
    const resultBox = document.getElementById('resultBox');
    const errorMsg = document.getElementById('errorMsg');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        if (!email) return;

        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
        errorMsg.style.display = 'none';
        resultBox.style.display = 'none';

        try {
            const response = await fetch(`${API_URL}?path=application&email=${encodeURIComponent(email)}`);
            let result = await response.json();

            if (result.status === 'success') {
                document.getElementById('resName').textContent = result.data.name;
                document.getElementById('resCourses').textContent = result.data.courses;
                
                const statusSpan = document.getElementById('resStatus');
                statusSpan.textContent = result.data.paymentStatus;
                
                // Update badge color
                statusSpan.className = 'status-badge';
                if (result.data.paymentStatus === 'Approved') {
                    statusSpan.classList.add('status-approved');
                    statusSpan.textContent = 'อนุมัติแล้ว';
                } else if (result.data.paymentStatus === 'Rejected') {
                    statusSpan.classList.add('status-rejected');
                    statusSpan.textContent = 'ไม่ผ่าน / ต้องแก้ไข';
                } else {
                    statusSpan.classList.add('status-pending');
                    statusSpan.textContent = 'รอตรวจสอบ';
                }
                
                resultBox.style.display = 'block';
            } else {
                errorMsg.textContent = result.message;
                errorMsg.style.display = 'block';
            }
        } catch (error) {
            errorMsg.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
            errorMsg.style.display = 'block';
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = 'ค้นหา';
        }
    });
});
