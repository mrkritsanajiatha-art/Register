const API_URL = 'https://script.google.com/macros/s/AKfycbyex1LIs8Pl2Y_JxqDvO538GNzWOoFHsA52qvnzYZh4KDRIjbAToEcjvDaVG0icME3e/exec';

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    let currentUser = null;
    
    // We check auth from auth.js instance if initialized
    if (typeof auth !== 'undefined' && auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user.email;
                initDashboard();
            } else {
                window.location.href = 'login.html';
            }
        });
    } else {
        // Fallback to mock auth
        if (localStorage.getItem('mockAdminToken')) {
            currentUser = 'admin@test.com (Demo)';
            initDashboard();
        } else {
            window.location.href = 'login.html';
        }
    }

    function initDashboard() {
        document.getElementById('adminUserDisplay').textContent = currentUser;
        loadApplicants();
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof auth !== 'undefined' && auth) {
            auth.signOut();
        } else {
            localStorage.removeItem('mockAdminToken');
            window.location.href = 'login.html';
        }
    });

    document.getElementById('refreshBtn').addEventListener('click', loadApplicants);

    async function loadApplicants() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 30px;"><i class="ph ph-spinner ph-spin"></i> กำลังโหลดข้อมูล...</td></tr>';

        try {
            const response = await fetch(`${API_URL}?path=applicants`);
            const result = await response.json();

            if (result.status === 'success') {
                renderTable(result.data);
                updateStats(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 30px; color: red;">Error: ${error.message}</td></tr>`;
        }
    }

    function renderTable(data) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 30px;">ไม่มีข้อมูล</td></tr>';
            return;
        }

        data.forEach(item => {
            const date = new Date(item.registerDate).toLocaleDateString('th-TH');
            
            let statusColor = 'var(--color-ink-muted)';
            if (item.paymentStatus === 'Approved') statusColor = '#059669';
            if (item.paymentStatus === 'Rejected') statusColor = '#E11D48';
            if (item.paymentStatus === 'Pending Review') statusColor = 'var(--color-accent-dark)';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id || '-'}</td>
                <td>${date}</td>
                <td>${item.firstName} ${item.lastName}</td>
                <td>${item.courses}</td>
                <td style="color: ${statusColor}; font-weight: 500;">${item.paymentStatus}</td>
                <td>${item.slipUrl ? `<a href="${item.slipUrl}" target="_blank" class="btn btn-outline btn-sm">ดูสลิป</a>` : '-'}</td>
                <td class="action-btns">
                    ${item.paymentStatus === 'Pending Review' ? `
                        <button class="btn btn-primary btn-sm approve-btn" data-email="${item.email}">อนุมัติ</button>
                        <button class="btn btn-outline btn-sm reject-btn" data-email="${item.email}" style="color: #E11D48; border-color: #E11D48;">ไม่อนุมัติ</button>
                    ` : '-'}
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to new buttons
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => updateStatus(e.target.dataset.email, 'approve'));
        });
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => updateStatus(e.target.dataset.email, 'reject'));
        });
    }

    function updateStats(data) {
        document.getElementById('statTotal').textContent = data.length;
        document.getElementById('statPending').textContent = data.filter(d => d.paymentStatus === 'Pending Review').length;
        document.getElementById('statApproved').textContent = data.filter(d => d.paymentStatus === 'Approved').length;
    }

    async function updateStatus(email, action) {
        if (!confirm(`คุณแน่ใจหรือไม่ที่จะ ${action === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'} การสมัครนี้?`)) return;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ path: action, data: { email: email, adminUser: currentUser } }),
                headers: { 'Content-Type': 'text/plain' }
            });
            const result = await response.json();
            
            if(result.status === 'success') {
                alert('อัปเดตสถานะสำเร็จ');
                loadApplicants(); // Reload
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
});
