// ============================================================
// MAIN APP MODULE (Enhanced - Enterprise)
// ============================================================

// ... (showToast, renderAll, populateItemDropdowns, populateDeliveryDropdowns, openProfileModal ආදිය පෙර පරිදිම)

// ============================================================
// INIT EVENTS (Enhanced)
// ============================================================
function initEvents() {
    console.log('🔧 Initializing events...');

    // ... (Sidebar, Profile, Dark Mode, Language, Clear Login, Employee Modal, Item Modal, Scanner, Customer Modal ආදිය පෙර පරිදිම)

    // ==========================================================
    // PRODUCTS - Update Attributes
    // ==========================================================
    document.getElementById('updateProductAttributesBtn')?.addEventListener('click', async () => {
        if (!window.canManage('inventory')) { showToast('⛔ No permission.', 'error'); return; }
        const productCode = document.getElementById('productCode').value.trim();
        const unit = document.getElementById('productUnit').value;
        const costPrice = parseFloat(document.getElementById('productCostPrice').value) || 0;
        const taxRate = parseFloat(document.getElementById('productTaxRate').value) || 0;
        const reorderLevel = parseInt(document.getElementById('productReorderLevel').value) || 0;
        const stockAlert = document.getElementById('productStockAlert').value;

        const data = getAppData();
        const items = data.items || [];
        // Find item by product code or use first item
        let item = items.find(i => i.productCode === productCode);
        if (!item && items.length > 0) {
            // If no match, use the first item
            item = items[0];
        }
        if (!item) {
            showToast('No product found. Please add items first.', 'error');
            return;
        }

        // Update the item with attributes
        const idx = data.items.findIndex(i => i.id === item.id);
        if (idx > -1) {
            data.items[idx] = {
                ...data.items[idx],
                productCode: productCode || data.items[idx].productCode,
                unit: unit || data.items[idx].unit || 'Pcs',
                costPrice: costPrice || data.items[idx].costPrice || 0,
                taxRate: taxRate || data.items[idx].taxRate || 0,
                reorderLevel: reorderLevel || data.items[idx].reorderLevel || 0,
                stockAlert: stockAlert || data.items[idx].stockAlert || 'enabled',
                updatedAt: nowISO()
            };
            setAppData(data);
            await saveAllData();
            renderProducts();
            renderInventory();
            showToast('✅ Product attributes updated!');
        }
    });

    // ==========================================================
    // SALES - Multi-Item Cart
    // ==========================================================
    document.getElementById('salesAddToCartBtn')?.addEventListener('click', () => {
        const itemId = document.getElementById('salesCartItemSelect').value;
        const qty = parseInt(document.getElementById('salesCartQty').value) || 1;
        if (!itemId) { showToast('Select an item.', 'error'); return; }
        if (qty < 1) { showToast('Enter valid quantity.', 'error'); return; }

        const data = getAppData();
        const item = data.items.find(i => i.id === itemId);
        if (!item) { showToast('Item not found.', 'error'); return; }
        if ((item.qty || 0) < qty) {
            showToast(`Insufficient stock! Available: ${item.qty}`, 'error');
            return;
        }

        // Check if item already in cart
        const existing = salesCart.find(i => i.id === itemId);
        if (existing) {
            existing.qty += qty;
        } else {
            salesCart.push({ id: itemId, name: item.name, qty: qty, price: item.price || 0 });
        }
        renderSalesCart();
        showToast(`✅ Added ${qty} x ${item.name} to cart`);
        document.getElementById('salesCartQty').value = '1';
    });

    document.getElementById('salesClearCartBtn')?.addEventListener('click', () => {
        if (salesCart.length === 0) { showToast('Cart is empty.', 'warning'); return; }
        if (!confirm('Clear cart?')) return;
        salesCart = [];
        renderSalesCart();
        showToast('🧹 Cart cleared.');
    });

    document.getElementById('createSalesOrderBtn')?.addEventListener('click', async () => {
        if (!window.canManage('sales') && !window.canView('sales')) {
            showToast('⛔ No permission.', 'error'); return;
        }
        if (salesCart.length === 0) { showToast('Cart is empty.', 'error'); return; }

        const customerId = document.getElementById('salesCustomerSelect').value;
        const orderDate = document.getElementById('salesOrderDate').value;
        if (!customerId) { showToast('Select a customer.', 'error'); return; }

        const data = getAppData();
        const customer = data.customers.find(c => c.id === customerId);
        if (!customer) { showToast('Customer not found.', 'error'); return; }

        // Calculate total
        let total = 0;
        const orderItems = salesCart.map(item => {
            total += item.qty * item.price;
            return { id: item.id, name: item.name, qty: item.qty, price: item.price };
        });

        // Deduct stock
        let stockError = false;
        salesCart.forEach(cartItem => {
            const item = data.items.find(i => i.id === cartItem.id);
            if (item) {
                if ((item.qty || 0) >= cartItem.qty) {
                    item.qty = (item.qty || 0) - cartItem.qty;
                    item.updatedAt = nowISO();
                } else {
                    stockError = true;
                }
            }
        });

        if (stockError) {
            showToast('⚠️ Some items have insufficient stock!', 'error');
            // Revert stock changes
            await loadAllData();
            return;
        }

        if (!data.salesOrders) data.salesOrders = [];
        const order = {
            id: generateId(),
            orderNo: 'SO-' + String(data.salesOrders.length + 1).padStart(4, '0'),
            customerId: customerId,
            customerName: customer.name,
            items: orderItems,
            total: total,
            date: orderDate || nowISO(),
            createdAt: nowISO()
        };
        data.salesOrders.push(order);

        // Add to sales data
        orderItems.forEach(item => {
            data.salesData.push({
                id: generateId(),
                customer: customer.name,
                item: item.name,
                qty: item.qty,
                total: item.qty * item.price,
                date: order.date
            });
        });

        // Log
        if (!data.logs) data.logs = [];
        data.logs.push({
            id: generateId(),
            user: window.getCurrentUser()?.name || 'System',
            action: 'Sales Order Created',
            details: `Order #${order.orderNo} - ${customer.name} - ${orderItems.length} items - LKR ${formatCurrency(total)}`,
            date: nowISO()
        });

        setAppData(data);
        await saveAllData();

        // Clear cart
        salesCart = [];
        renderSalesCart();
        renderSales();
        renderDashboard();
        showToast(`✅ Order #${order.orderNo} created! Total: LKR ${formatCurrency(total)}`);
    });

    document.getElementById('salesAddCustomerBtn')?.addEventListener('click', () => {
        if (window.canManage('customers')) {
            document.getElementById('addCustomerBtn')?.click();
        } else {
            showToast('⛔ No permission.', 'error');
        }
    });

    // ==========================================================
    // DELIVERIES - Multi-Item Cart & Status
    // ==========================================================
    // Populate Delivery Cart Item dropdown
    function populateDeliveryCartItems() {
        const data = getAppData();
        const select = document.getElementById('delCartItemSelect');
        if (!select) return;
        const val = select.value;
        select.innerHTML = '<option value="">Select Item</option>' +
            (data.items || []).filter(i => i.status !== 'inactive').map(i =>
                `<option value="${i.id}">${escapeHtml(i.name)} (${i.qty||0} available)</option>`
            ).join('');
        if (val && [...select.options].some(o => o.value === val)) select.value = val;
    }

    // Call this when delivery panel opens
    document.getElementById('delCartItemSelect')?.addEventListener('focus', populateDeliveryCartItems);

    document.getElementById('delAddToCartBtn')?.addEventListener('click', () => {
        const itemId = document.getElementById('delCartItemSelect').value;
        const qty = parseInt(document.getElementById('delCartQty').value) || 1;
        if (!itemId) { showToast('Select an item.', 'error'); return; }
        if (qty < 1) { showToast('Enter valid quantity.', 'error'); return; }

        const data = getAppData();
        const item = data.items.find(i => i.id === itemId);
        if (!item) { showToast('Item not found.', 'error'); return; }
        if ((item.qty || 0) < qty) {
            showToast(`Insufficient stock! Available: ${item.qty}`, 'error');
            return;
        }

        const existing = deliveryCart.find(i => i.id === itemId);
        if (existing) {
            existing.qty += qty;
        } else {
            deliveryCart.push({ id: itemId, name: item.name, qty: qty });
        }
        renderDeliveryCart();
        showToast(`✅ Added ${qty} x ${item.name}`);
        document.getElementById('delCartQty').value = '1';
    });

    document.getElementById('delClearCartBtn')?.addEventListener('click', () => {
        if (deliveryCart.length === 0) { showToast('Cart is empty.', 'warning'); return; }
        if (!confirm('Clear delivery items?')) return;
        deliveryCart = [];
        renderDeliveryCart();
        showToast('🧹 Items cleared.');
    });

    // Update delivery submit to handle multiple items
    document.getElementById('deliverSubmitBtn')?.addEventListener('click', async () => {
        if (!window.canManage('deliveries') && !window.hasPermission('create_deliveries')) {
            showToast('⛔ No permission.', 'error'); return;
        }
        const customerId = document.getElementById('delCustomerSelect')?.value;
        const driverId = document.getElementById('delDriverSelect')?.value;
        const vehicleId = document.getElementById('delVehicleSelect')?.value;
        const status = document.getElementById('delStatusSelect')?.value || 'pending';
        const route = document.getElementById('delRoute')?.value.trim() || '';
        const notes = document.getElementById('delNotes')?.value.trim() || '';
        const scheduledDate = document.getElementById('delScheduledDate')?.value || '';

        if (!customerId) { showToast('Select a customer.', 'error'); return; }
        if (deliveryCart.length === 0) { showToast('Add at least one item.', 'error'); return; }

        const data = getAppData();
        const customer = data.customers.find(c => c.id === customerId);
        const driver = data.employees.find(e => e.id === driverId);
        const vehicle = data.vehicles.find(v => v.id === vehicleId);

        if (!customer) { showToast('Customer not found.', 'error'); return; }

        // Check stock and deduct
        let stockError = false;
        deliveryCart.forEach(cartItem => {
            const item = data.items.find(i => i.id === cartItem.id);
            if (item) {
                if ((item.qty || 0) >= cartItem.qty) {
                    item.qty = (item.qty || 0) - cartItem.qty;
                    item.updatedAt = nowISO();
                } else {
                    stockError = true;
                }
            }
        });

        if (stockError) {
            showToast('⚠️ Some items have insufficient stock!', 'error');
            await loadAllData();
            return;
        }

        const delivery = {
            id: generateId(),
            customerId: customerId,
            customerName: customer.name,
            items: deliveryCart.map(i => ({ id: i.id, name: i.name, qty: i.qty })),
            driverId: driverId,
            driverName: driver ? driver.name : '—',
            vehicleId: vehicleId,
            vehicleNo: vehicle ? vehicle.vehicleNo : '—',
            status: status,
            route: route,
            notes: notes,
            date: scheduledDate || nowISO(),
            updatedAt: nowISO()
        };
        data.deliveries.push(delivery);

        // Log
        if (!data.logs) data.logs = [];
        data.logs.push({
            id: generateId(),
            user: window.getCurrentUser()?.name || 'System',
            action: 'Delivery Created',
            details: `${customer.name} - ${delivery.items.length} items - Status: ${status}`,
            date: nowISO()
        });

        setAppData(data);
        await saveAllData();

        // Clear cart and form
        deliveryCart = [];
        renderDeliveryCart();
        document.getElementById('delRoute').value = '';
        document.getElementById('delNotes').value = '';
        document.getElementById('delStatusSelect').value = 'pending';
        populateDeliveryDropdowns();

        renderDeliveries();
        renderDashboard();
        showToast(`✅ Delivery created for ${customer.name}! (${delivery.items.length} items)`);
    });

    document.getElementById('refreshDeliveriesBtn')?.addEventListener('click', () => {
        renderDeliveries();
        showToast('🔄 Refreshed.');
    });

    // ==========================================================
    // FINANCE - Check Details Toggle
    // ==========================================================
    document.getElementById('financePaymentMethod')?.addEventListener('change', function() {
        const chequeDetails = document.getElementById('chequeDetails');
        if (this.value === 'cheque') {
            chequeDetails.style.display = 'block';
        } else {
            chequeDetails.style.display = 'none';
        }
    });

    document.getElementById('addFinanceBtn')?.addEventListener('click', async () => {
        if (!window.canManage('finance')) { showToast('⛔ No permission.', 'error'); return; }
        const type = document.getElementById('financeType').value;
        const amount = parseFloat(document.getElementById('financeAmount').value);
        const category = document.getElementById('financeCategory').value;
        const desc = document.getElementById('financeDesc').value.trim();
        const paymentMethod = document.getElementById('financePaymentMethod').value;
        const budgetInput = document.getElementById('financeBudget').value.trim();

        // Cheque details
        const chequeNo = document.getElementById('financeChequeNo').value.trim();
        const bankName = document.getElementById('financeBankName').value.trim();
        const chequeDate = document.getElementById('financeChequeDate').value;
        const chequeAmount = parseFloat(document.getElementById('financeChequeAmount').value) || amount;

        if (!amount || amount <= 0) { showToast('Enter valid amount.', 'error'); return; }
        if (!desc) { showToast('Enter description.', 'error'); return; }
        if (paymentMethod === 'cheque' && !chequeNo) {
            showToast('Enter cheque number.', 'error'); return;
        }

        const data = getAppData();
        if (!data.budget) data.budget = { monthly: 0, category: {} };
        if (budgetInput !== '') data.budget.category[category] = parseFloat(budgetInput) || 0;

        const entry = {
            id: generateId(),
            type,
            amount,
            category,
            desc,
            paymentMethod,
            chequeNo: paymentMethod === 'cheque' ? chequeNo : '',
            bankName: paymentMethod === 'cheque' ? bankName : '',
            chequeDate: paymentMethod === 'cheque' ? chequeDate : '',
            chequeAmount: paymentMethod === 'cheque' ? chequeAmount : 0,
            date: nowISO()
        };
        data.finance.push(entry);

        setAppData(data);
        await saveAllData();
        renderFinance();

        // Clear form
        document.getElementById('financeAmount').value = '';
        document.getElementById('financeDesc').value = '';
        document.getElementById('financeBudget').value = '';
        document.getElementById('financeChequeNo').value = '';
        document.getElementById('financeBankName').value = '';
        document.getElementById('financeChequeDate').value = '';
        document.getElementById('financeChequeAmount').value = '';
        document.getElementById('financePaymentMethod').value = 'cash';
        document.getElementById('chequeDetails').style.display = 'none';

        showToast(`✅ ${type} recorded.`);
    });

    document.getElementById('clearFinanceBtn')?.addEventListener('click', () => {
        document.getElementById('financeAmount').value = '';
        document.getElementById('financeDesc').value = '';
        document.getElementById('financeBudget').value = '';
        document.getElementById('financeChequeNo').value = '';
        document.getElementById('financeBankName').value = '';
        document.getElementById('financeChequeDate').value = '';
        document.getElementById('financeChequeAmount').value = '';
        document.getElementById('financePaymentMethod').value = 'cash';
        document.getElementById('chequeDetails').style.display = 'none';
        showToast('🧹 Finance form cleared.');
    });

    // ==========================================================
    // PRODUCTS - Populate item dropdown for attributes
    // ==========================================================
    // When product panel opens, populate the product code field
    document.querySelector('.nav-item[data-panel="products"]')?.addEventListener('click', () => {
        const data = getAppData();
        const items = data.items || [];
        const productCodeInput = document.getElementById('productCode');
        if (productCodeInput && !productCodeInput.value) {
            const nextCode = items.length + 1;
            productCodeInput.value = 'PRD-' + String(nextCode).padStart(4, '0');
        }
        // Populate product dropdown with items
        const select = document.getElementById('productItemSelect');
        // Not needed as we're using the first item
    });

    // ==========================================================
    // PURCHASING - Existing events
    // ==========================================================
    // ... (Supplier, PO events පෙර පරිදිම)

    console.log('✅ All enhanced events initialized!');
}

// ... (init, createDefaultAdmin ආදිය පෙර පරිදිම)

document.addEventListener('DOMContentLoaded', init);
