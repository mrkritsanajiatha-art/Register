const API_URL = 'https://script.google.com/macros/s/AKfycby_J6xApoZivjG26hIae1QyNFVBFfAZ_SKzg-lvNn40TrgMK9ogQZgGzINY-9FtcQVE/exec';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('paymentForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');
    const slipFile = document.getElementById('slipFile');

    // Retrieve email from previous step
    const email = localStorage.getItem('applicantEmail');
    if (!email) {
        alert('ไม่พบข้อมูลการสมัคร กรุณาสมัครใหม่');
        window.location.href = 'register.html';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = slipFile.files[0];
        if (!file) {
            alert('กรุณาเลือกไฟล์สลิป');
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('ไฟล์ต้องมีขนาดไม่เกิน 5MB');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> กำลังอัปโหลด...';

        // Convert file to Base64
        const reader = new FileReader();
        reader.onload = async function() {
            const base64Data = reader.result;
            
            const payload = {
                path: 'uploadSlip',
                data: {
                    email: email,
                    filename: file.name,
                    mimeType: file.type,
                    base64: base64Data
                }
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
                    statusMessage.innerHTML = 'อัปโหลดสำเร็จ! <br>ระบบกำลังตรวจสอบข้อมูล จะแจ้งผลให้ทราบทางอีเมล';
                    
                    // Clear email from storage
                    localStorage.removeItem('applicantEmail');
                    
                    setTimeout(() => {
                        window.location.href = 'status.html';
                    }, 3000);
                } else {
                    throw new Error(result.message || 'อัปโหลดล้มเหลว');
                }
            } catch (error) {
                statusMessage.style.display = 'block';
                statusMessage.style.backgroundColor = '#FEE2E2';
                statusMessage.style.color = '#991B1B';
                statusMessage.innerText = 'เกิดข้อผิดพลาด: ' + error.message;
                
                submitBtn.disabled = false;
                submitBtn.innerText = 'ยืนยันการชำระเงิน';
            }
        };
        
        reader.readAsDataURL(file);
    });
});
