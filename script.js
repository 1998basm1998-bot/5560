document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. نظام تسجيل الدخول ---
    const loginBtn = document.getElementById('btn-login');
    const passwordInput = document.getElementById('login-password');
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const loginError = document.getElementById('login-error');

    loginBtn.addEventListener('click', () => {
        if (passwordInput.value === '1001') {
            loginScreen.style.display = 'none';
            mainApp.style.display = 'flex';
            updateDashboard();
            renderClients();
        } else {
            loginError.style.display = 'block';
        }
    });

    // --- 2. التنقل بين الصفحات (الراوتر) ---
    const navButtons = document.querySelectorAll('.nav-btn[data-target]');
    const views = document.querySelectorAll('.view-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // إزالة التفعيل من كل الأزرار والصفحات
            navButtons.forEach(b => b.classList.remove('active'));
            views.forEach(v => v.classList.remove('active-view'));
            
            // تفعيل الزر والصفحة المطلوبة
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-target')).classList.add('active-view');
        });
    });

    window.logout = function() {
        mainApp.style.display = 'none';
        loginScreen.style.display = 'flex';
        passwordInput.value = '';
        loginError.style.display = 'none';
    }

    // --- 3. العمليات الحسابية التلقائية في صفحة الفاتورة ---
    const purchaseInput = document.getElementById('purchase-price');
    const saleInput = document.getElementById('sale-price');
    const profitInput = document.getElementById('profit-amount');
    const interestInput = document.getElementById('interest-rate');
    const downPaymentInput = document.getElementById('down-payment');
    const remainingInput = document.getElementById('remaining-amount');
    const monthlyInput = document.getElementById('monthly-installment');
    const durationInput = document.getElementById('duration-months');

    function calculateInvoice() {
        let purchase = parseFloat(purchaseInput.value) || 0;
        let sale = parseFloat(saleInput.value) || 0;
        let downPayment = parseFloat(downPaymentInput.value) || 0;
        let monthly = parseFloat(monthlyInput.value) || 0;

        // حساب الربح والفائدة
        let profit = sale - purchase;
        profitInput.value = profit > 0 ? profit : 0;
        
        let interest = purchase > 0 ? (profit / purchase) * 100 : 0;
        interestInput.value = interest.toFixed(2);

        // حساب الباقي والمدة
        let remaining = sale - downPayment;
        remainingInput.value = remaining > 0 ? remaining : 0;

        if (monthly > 0 && remaining > 0) {
            let duration = remaining / monthly;
            durationInput.value = duration.toFixed(1) + " شهر تقريباً";
        } else {
            durationInput.value = "0";
        }
    }

    // ربط الحسابات بتغيير القيم في الحقول
    [purchaseInput, saleInput, downPaymentInput, monthlyInput].forEach(input => {
        input.addEventListener('input', calculateInvoice);
    });

    // --- 4. إدارة البيانات (LocalStorage) حفظ الفاتورة ---
    const btnSaveInvoice = document.getElementById('btn-save-invoice');
    
    btnSaveInvoice.addEventListener('click', () => {
        const clientName = document.getElementById('client-name').value;
        const clientPhone = document.getElementById('client-phone').value;
        const itemType = document.getElementById('item-type').value;
        const remaining = remainingInput.value;
        const monthly = monthlyInput.value;

        if (!clientName || !clientPhone) {
            alert('يرجى إدخال اسم العميل ورقم الهاتف');
            return;
        }

        const newInvoice = {
            id: Date.now(),
            name: clientName,
            phone: clientPhone,
            item: itemType,
            purchase: purchaseInput.value,
            sale: saleInput.value,
            remaining: remaining,
            monthly: monthly
        };

        // جلب البيانات القديمة أو إنشاء مصفوفة جديدة
        let clients = JSON.parse(localStorage.getItem('mutayyam_clients')) || [];
        clients.push(newInvoice);
        localStorage.setItem('mutayyam_clients', JSON.stringify(clients));

        alert('تم حفظ الفاتورة بنجاح!');
        
        // مشاركة واتساب
        let whatsappMsg = `مرحباً ${clientName}، تم تسجيل قسط جديد بقيمة ${monthly} د.ع لصنف (${itemType}). الباقي في الذمة: ${remaining} د.ع. \nمع تحيات: المتيم للأقساط.`;
        window.open(`https://wa.me/${clientPhone}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');

        // تحديث الواجهات
        updateDashboard();
        renderClients();
        
        // تفريغ الحقول
        document.getElementById('client-name').value = '';
        document.getElementById('item-type').value = '';
    });

    // --- 5. عرض العملاء وكشف الحساب ---
    function renderClients() {
        const clientsList = document.getElementById('clients-list');
        let clients = JSON.parse(localStorage.getItem('mutayyam_clients')) || [];
        clientsList.innerHTML = '';

        clients.forEach((client, index) => {
            const card = document.createElement('div');
            card.className = 'client-card';
            card.innerHTML = `
                <div>
                    <h4>${index + 1}. ${client.name}</h4>
                    <p>الموبايل: ${client.phone}</p>
                    <p>الصنف: ${client.item} | الباقي: <span class="text-danger">${client.remaining} د.ع</span></p>
                </div>
                <div class="client-actions">
                    <button class="btn btn-success" onclick="payInstallment(${client.id})">تسديد</button>
                    <button class="btn btn-warning" onclick="editClient(${client.id})">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteClient(${client.id})">حذف</button>
                </div>
            `;
            clientsList.appendChild(card);
        });
    }

    function updateDashboard() {
        let clients = JSON.parse(localStorage.getItem('mutayyam_clients')) || [];
        let totalCapital = 0;
        let totalProfit = 0;

        clients.forEach(client => {
            totalCapital += parseFloat(client.purchase) || 0;
            totalProfit += (parseFloat(client.sale) || 0) - (parseFloat(client.purchase) || 0);
        });

        document.getElementById('total-capital').innerText = totalCapital.toLocaleString() + ' د.ع';
        document.getElementById('total-profit').innerText = totalProfit.toLocaleString() + ' د.ع';
    }

    // --- 6. دوال الأزرار الثلاثة (تسديد، تعديل، حذف) ---
    window.payInstallment = function(id) {
        alert('سيتم فتح نافذة التسديد لهذا العميل.');
        // يمكن التوسعة هنا لإضافة سجل الدفعات
    };

    window.editClient = function(id) {
        alert('ميزة التعديل قيد التطوير وستفتح بيانات العميل قريباً.');
    };

    window.deleteClient = function(id) {
        let pass = prompt("أدخل الرقم السري لتأكيد الحذف:");
        if (pass === '1001') {
            let clients = JSON.parse(localStorage.getItem('mutayyam_clients')) || [];
            clients = clients.filter(c => c.id !== id);
            localStorage.setItem('mutayyam_clients', JSON.stringify(clients));
            renderClients();
            updateDashboard();
            alert('تم الحذف بنجاح');
        } else {
            alert('الرقم السري خاطئ، تم إلغاء الحذف.');
        }
    };
});
