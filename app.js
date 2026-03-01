// التهيئة وقواعد البيانات المحلية
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let currentCustomerIndex = -1; // لتتبع الزبون الحالي المفتوح

// دالة التبديل بين التبويبات
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    element.classList.add('active');

    // تحديث البيانات عند فتح التبويبة
    if(tabId === 'inventory') renderInventory();
    if(tabId === 'customers') renderCustomers();
    if(tabId === 'statistics') renderStatistics();
}

// تحديث الفهرسة (القائمة المنسدلة التلقائية للمواد)
function updateDatalist() {
    const dl = document.getElementById('inventory-options');
    dl.innerHTML = '';
    inventory.forEach(item => {
        dl.innerHTML += `<option value="${item.name}">الكمية المتاحة: ${item.qty}</option>`;
    });
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
    updateDatalist(); // تحديث الفهرسة دائماً مع المخزون
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
    currentCustomerIndex = index;
    const cust = customers[index];
    document.getElementById('detail-cust-name').innerText = cust.name;
    document.getElementById('detail-cust-balance').innerText = cust.balance;
    openModal('modal-customer-details');
}

// ----------------- دوال الدين والتسديد والبيع (الجديدة) -----------------

// إضافة صف مادة جديد للديون أو البيع المباشر
function addItemRow(containerId) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" list="inventory-options" placeholder="اسم المادة" class="item-name-input" onchange="updateRowPrice(this, '${containerId}')">
        <input type="number" placeholder="العدد" class="item-qty-input" oninput="calculateSaleTotal('${containerId}')">
        <span class="item-price" style="display:none;">0</span>
    `;
    container.appendChild(row);
}

// جلب سعر المادة تلقائياً من المخزون
function updateRowPrice(inputElem, containerId) {
    const itemName = inputElem.value;
    const item = inventory.find(i => i.name === itemName);
    const priceSpan = inputElem.parentElement.querySelector('.item-price');
    if(item) {
        priceSpan.innerText = item.sellPrice;
    } else {
        priceSpan.innerText = '0';
    }
    calculateSaleTotal(containerId);
}

// حساب الناتج الكلي في نافذة البيع المباشر
function calculateSaleTotal(containerId) {
    if(containerId !== 'sale-items-container') return;
    let total = 0;
    const rows = document.getElementById(containerId).querySelectorAll('.item-row');
    rows.forEach(row => {
        const price = parseFloat(row.querySelector('.item-price').innerText) || 0;
        const qty = parseFloat(row.querySelector('.item-qty-input').value) || 0;
        total += (price * qty);
    });
    document.getElementById('sale-total').innerText = total;
}

// فتح نافذة البيع المباشر
function openDirectSaleModal() {
    document.getElementById('sale-name').value = '';
    document.getElementById('sale-phone').value = '';
    document.getElementById('sale-items-container').innerHTML = '';
    document.getElementById('sale-total').innerText = '0';
    addItemRow('sale-items-container');
    openModal('modal-direct-sale');
}

// حفظ البيع المباشر
function saveDirectSale() {
    const name = document.getElementById('sale-name').value || 'زبون نقدي';
    const rows = document.getElementById('sale-items-container').querySelectorAll('.item-row');
    
    let totalSale = 0;
    let valid = true;

    rows.forEach(row => {
        const itemName = row.querySelector('.item-name-input').value;
        const qty = parseFloat(row.querySelector('.item-qty-input').value);
        if(!itemName || !qty) return;

        const itemIndex = inventory.findIndex(i => i.name === itemName);
        if(itemIndex === -1) {
            alert(`المادة ${itemName} غير موجودة في المخزون`);
            valid = false;
            return;
        }
        if(inventory[itemIndex].qty < qty) {
            alert(`الكمية غير كافية للمادة ${itemName} (المتاح: ${inventory[itemIndex].qty})`);
            valid = false;
            return;
        }
        
        inventory[itemIndex].qty -= qty;
        totalSale += (inventory[itemIndex].sellPrice * qty);
    });

    if(!valid || totalSale === 0) return;

    // حفظ في الإحصائيات
    let stats = JSON.parse(localStorage.getItem('statistics')) || [];
    stats.push({ type: 'بيع مباشر', customer: name, total: totalSale, date: new Date().toLocaleDateString('ar-IQ') });
    
    localStorage.setItem('statistics', JSON.stringify(stats));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    renderInventory();
    alert(`تم البيع بنجاح! الإجمالي: ${totalSale} د.ع`);
    closeModal('modal-direct-sale');
}

// فتح نافذة الدين
function openDebtModal() {
    document.getElementById('debt-items-container').innerHTML = '';
    addItemRow('debt-items-container');
    document.getElementById('debt-date').valueAsDate = new Date();
    openModal('modal-debt');
}

// حفظ الدين ومشاركة واتساب
function saveDebt() {
    const rows = document.getElementById('debt-items-container').querySelectorAll('.item-row');
    let totalDebt = 0;
    let invoiceText = `قائمة اليوم%0A`;
    let valid = true;

    rows.forEach(row => {
        const name = row.querySelector('.item-name-input').value;
        const qty = parseFloat(row.querySelector('.item-qty-input').value);
        if(!name || !qty) return;

        const itemIndex = inventory.findIndex(i => i.name === name);
        if(itemIndex === -1) {
            alert(`المادة ${name} غير موجودة`);
            valid = false; return;
        }
        if(inventory[itemIndex].qty < qty) {
            alert(`الكمية غير كافية للمادة ${name}`);
            valid = false; return;
        }
        
        inventory[itemIndex].qty -= qty;
        totalDebt += (inventory[itemIndex].sellPrice * qty);
        invoiceText += `- ${name} (العدد: ${qty})%0A`;
    });

    if(!valid || totalDebt === 0) return;

    customers[currentCustomerIndex].balance = parseFloat(customers[currentCustomerIndex].balance) + totalDebt;
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('customers', JSON.stringify(customers));
    
    renderInventory();
    renderCustomers();
    
    const newBalance = customers[currentCustomerIndex].balance;
    invoiceText += `-----------------%0Aالباقي الكلي: ${newBalance} د.ع`;
    
    const phone = customers[currentCustomerIndex].phone;
    window.open(`https://wa.me/964${phone}?text=${invoiceText}`, '_blank');
    
    closeModal('modal-debt');
    closeModal('modal-customer-details');
}

// فتح نافذة التسديد
function openPaymentModal() {
    document.getElementById('payment-current-balance').innerText = customers[currentCustomerIndex].balance;
    document.getElementById('payment-amount').value = '';
    document.getElementById('payment-note').value = '';
    openModal('modal-payment');
}

// حفظ التسديد ومشاركة واتساب
function savePayment() {
    const amount = parseFloat(document.getElementById('payment-amount').value);
    const note = document.getElementById('payment-note').value || 'لا توجد ملاحظات';
    
    if(!amount || amount <= 0) return alert('الرجاء إدخال مبلغ صحيح');

    customers[currentCustomerIndex].balance = parseFloat(customers[currentCustomerIndex].balance) - amount;
    localStorage.setItem('customers', JSON.stringify(customers));
    renderCustomers();
    
    const dateStr = new Date().toLocaleDateString('ar-IQ');
    const newBalance = customers[currentCustomerIndex].balance;
    const phone = customers[currentCustomerIndex].phone;
    
    const text = `تم تسديد مبلغ: ${amount} د.ع%0Aملاحظة: ${note}%0Aالتاريخ: ${dateStr}%0Aالباقي الحالي: ${newBalance} د.ع`;
    window.open(`https://wa.me/964${phone}?text=${text}`, '_blank');
    
    closeModal('modal-payment');
    closeModal('modal-customer-details');
}

// ----------------- دوال الإحصائيات والإعدادات -----------------
function renderStatistics() {
    const list = document.getElementById('statistics-list');
    let stats = JSON.parse(localStorage.getItem('statistics')) || [];
    list.innerHTML = '';
    if(stats.length === 0) {
        list.innerHTML = '<p class="empty-msg">لا توجد مبيعات حتى الآن.</p>';
        return;
    }
    stats.forEach(stat => {
        list.innerHTML += `
            <div class="card">
                <div class="card-info">
                    <h4>${stat.customer} - ${stat.type}</h4>
                    <p>التاريخ: ${stat.date} | الإجمالي: <strong>${stat.total}</strong> د.ع</p>
                </div>
            </div>
        `;
    });
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function exportData() {
    const data = { inventory, customers, statistics: JSON.parse(localStorage.getItem('statistics')) || [] };
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
            if(data.statistics) localStorage.setItem('statistics', JSON.stringify(data.statistics));
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
