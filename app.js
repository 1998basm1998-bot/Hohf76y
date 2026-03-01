// التهيئة وقواعد البيانات المحلية
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];

// دالة التبديل بين التبويبات
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    element.classList.add('active');

    // تحديث البيانات عند فتح التبويبة
    if(tabId === 'inventory') renderInventory();
    if(tabId === 'customers') renderCustomers();
}

// ----------------- إدارة المخزون -----------------
function renderInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    inventory.forEach((item, index) => {
        list.innerHTML += `
            <div class="card">
                <div class="card-info">
                    <h4>${item.name}</h4>
                    <p>الكمية: <strong>${item.qty}</strong> | السعر: ${item.sellPrice} د.ع</p>
                </div>
                <div class="card-actions">
                    <button class="btn-secondary" onclick="editItem(${index})"><i class="fas fa-pen"></i></button>
                    <button class="btn-danger" onclick="deleteItem(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

function saveItem() {
    const id = document.getElementById('item-id').value;
    const name = document.getElementById('item-name').value;
    const buyPrice = document.getElementById('item-buy-price').value;
    const sellPrice = document.getElementById('item-sell-price').value;
    const qty = document.getElementById('item-qty').value;

    if (!name || !qty) return alert('الرجاء إدخال اسم المادة والكمية');

    const newItem = { name, buyPrice, sellPrice, qty };

    if (id) {
        inventory[id] = newItem; // تعديل
    } else {
        inventory.push(newItem); // إضافة جديدة
    }

    localStorage.setItem('inventory', JSON.stringify(inventory));
    closeModal('modal-add-item');
    renderInventory();
    
    // تصفير الحقول
    document.getElementById('item-id').value = '';
    document.getElementById('item-name').value = '';
    document.getElementById('item-buy-price').value = '';
    document.getElementById('item-sell-price').value = '';
    document.getElementById('item-qty').value = '';
}

function editItem(index) {
    const item = inventory[index];
    document.getElementById('item-id').value = index;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-buy-price').value = item.buyPrice;
    document.getElementById('item-sell-price').value = item.sellPrice;
    document.getElementById('item-qty').value = item.qty;
    openModal('modal-add-item');
}

function deleteItem(index) {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        inventory.splice(index, 1);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        renderInventory();
    }
}

// ----------------- إدارة الزبائن -----------------
function renderCustomers(filter = '') {
    const list = document.getElementById('customers-list');
    list.innerHTML = '';
    customers.filter(c => c.name.includes(filter)).forEach((cust, index) => {
        list.innerHTML += `
            <div class="card" onclick="openCustomerDetails(${index})">
                <div class="card-info">
                    <h4>${cust.name}</h4>
                    <p>+964${cust.phone} | ${cust.address}</p>
                </div>
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="btn-secondary" onclick="editCustomer(${index})"><i class="fas fa-pen"></i></button>
                    <button class="btn-danger" onclick="deleteCustomer(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

function searchCustomers() {
    const term = document.getElementById('search-customer').value;
    renderCustomers(term);
}

function saveCustomer() {
    const id = document.getElementById('cust-id').value;
    const name = document.getElementById('cust-name').value;
    let phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;

    if (!name || !phone) return alert('الرجاء إدخال الاسم والرقم');
    if(phone.startsWith('0')) phone = phone.substring(1); // إزالة الصفر إذا وجد

    const newCustomer = { name, phone, address, balance: 0 };

    if (id) {
        // الحفاظ على الرصيد القديم عند التعديل
        newCustomer.balance = customers[id].balance;
        customers[id] = newCustomer;
    } else {
        customers.push(newCustomer);
    }

    localStorage.setItem('customers', JSON.stringify(customers));
    closeModal('modal-add-customer');
    renderCustomers();
    
    document.getElementById('cust-id').value = '';
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cust-address').value = '';
}

function editCustomer(index) {
    const cust = customers[index];
    document.getElementById('cust-id').value = index;
    document.getElementById('cust-name').value = cust.name;
    document.getElementById('cust-phone').value = cust.phone;
    document.getElementById('cust-address').value = cust.address;
    openModal('modal-add-customer');
}

function deleteCustomer(index) {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        customers.splice(index, 1);
        localStorage.setItem('customers', JSON.stringify(customers));
        renderCustomers();
    }
}

function openCustomerDetails(index) {
    const cust = customers[index];
    document.getElementById('detail-cust-name').innerText = cust.name;
    document.getElementById('detail-cust-balance').innerText = cust.balance;
    openModal('modal-customer-details');
}

// ----------------- دوال النوافذ والإعدادات -----------------
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// النسخ الاحتياطي
function exportData() {
    const data = { inventory, customers };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup_makhzan.json';
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(data.inventory) localStorage.setItem('inventory', JSON.stringify(data.inventory));
            if(data.customers) localStorage.setItem('customers', JSON.stringify(data.customers));
            alert('تم استعادة النسخة بنجاح! سيتم تحديث الصفحة.');
            location.reload();
        } catch(err) {
            alert('خطأ في الملف');
        }
    };
    reader.readAsText(file);
}

// تحميل البيانات عند بدء التشغيل
window.onload = () => {
    renderInventory();
    renderCustomers();
};
