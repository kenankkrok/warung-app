
// ==========================================
// 1. KONFIGURASI API & STATE GLOBAL
// ==========================================
const API_BASE_URL = "https://warung-api.kenankkrok.workers.dev"; 

let products = [];
let cart = [];

// Membaca data dari penyimpanan browser (Local Storage)
let favorites = JSON.parse(localStorage.getItem('warung_favs')) || [];
let myHistory = JSON.parse(localStorage.getItem('warung_history')) || [];

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

// ==========================================
// 2. FETCH DATA & FILTER KATEGORI
// ==========================================
async function loadMenu() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/menu`);
        if (!response.ok) throw new Error('Gagal mengambil data menu');
        products = await response.json();
        filterCategory('semua'); 
    } catch (error) {
        document.getElementById('menu-container').innerHTML = '<div class="col-span-3 text-center py-8 text-red-500">Gagal memuat menu. Pastikan API berjalan.</div>';
    }
}

window.filterCategory = function(category) {
    // Styling Tombol Kategori
    document.querySelectorAll('.cat-btn').forEach(btn => {
        if (btn.dataset.cat === category) {
            btn.className = 'cat-btn w-full min-w-[80px] bg-brand-600 text-white p-3 rounded-2xl flex flex-col items-center shadow-md transition';
        } else {
            btn.className = 'cat-btn w-full min-w-[80px] bg-white text-gray-600 hover:bg-brand-50 p-3 rounded-2xl flex flex-col items-center shadow-sm transition';
        }
    });

    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;
    menuContainer.innerHTML = ''; 

    // Logika Filter (Termasuk fitur Favorit)
    const filteredProducts = category === 'semua' 
        ? products 
        : category === 'favorit'
            ? products.filter(p => favorites.includes(p.id))
            : products.filter(p => p.category === category);

    if (filteredProducts.length === 0) {
        menuContainer.innerHTML = `<div class="col-span-3 text-center py-10 text-gray-400"><i class="fa-solid fa-box-open text-3xl mb-3"></i><br>Tidak ada menu di kategori ini.</div>`;
        return;
    }

    // Render Produk dengan Tombol Favorit
    filteredProducts.forEach(product => {
        const isFav = favorites.includes(product.id);
        const heartClass = isFav ? 'text-red-500 fa-solid' : 'text-white fa-regular';
        
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition relative group';
        card.innerHTML = `
            <button onclick="toggleFavorite(${product.id})" class="absolute top-6 right-6 bg-black/30 hover:bg-black/50 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center transition z-10">
                <i class="${heartClass} fa-heart drop-shadow-md"></i>
            </button>
            
            <img src="${product.image || 'https://via.placeholder.com/400'}" alt="${product.name}" class="w-full h-32 object-cover rounded-xl mb-3">
            <h4 class="font-semibold text-sm">${product.name}</h4>
            <p class="text-[10px] text-gray-500 mb-2 capitalize">${product.category}</p>
            <div class="flex justify-between items-center mt-2">
                <span class="font-bold text-brand-900">${formatRupiah(product.price)}</span>
                <button onclick="addToCart(${product.id})" class="bg-brand-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-brand-800 transition">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        `;
        menuContainer.appendChild(card);
    });
};

// Fungsi Mengubah Status Favorit
window.toggleFavorite = function(id) {
    const index = favorites.indexOf(id);
    if (index > -1) favorites.splice(index, 1);
    else favorites.push(id);
    
    localStorage.setItem('warung_favs', JSON.stringify(favorites));
    
    // Refresh tampilan sesuai kategori yang sedang aktif
    const activeBtn = document.querySelector('.cat-btn.bg-brand-600');
    const activeCat = activeBtn ? activeBtn.dataset.cat : 'semua';
    filterCategory(activeCat);
};

// ==========================================
// 3. LOGIKA KERANJANG BELANJA
// ==========================================
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const badgeCount = document.querySelectorAll('.cart-badge');
    const subtotalElement = document.getElementById('cart-subtotal');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    let total = 0; let totalItems = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            total += product.price * item.quantity;
            totalItems += item.quantity;
            cartContainer.innerHTML += `
                <div class="flex items-center gap-3">
                    <img src="${product.image}" class="w-12 h-12 rounded-lg object-cover">
                    <div class="flex-1">
                        <h4 class="text-sm font-semibold">${product.name}</h4>
                        <p class="text-xs text-gray-500">${formatRupiah(product.price)}</p>
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                        <button onclick="updateQuantity(${product.id}, -1)" class="w-6 h-6 rounded bg-gray-100 text-gray-600">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${product.id}, 1)" class="w-6 h-6 rounded bg-gray-100 text-gray-600">+</button>
                    </div>
                    <button onclick="removeFromCart(${product.id})" class="text-gray-400 hover:text-red-500 ml-2"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            `;
        }
    });
    subtotalElement.innerText = formatRupiah(total);
    badgeCount.forEach(badge => badge.innerText = totalItems);
}

window.updateQuantity = function(id, delta) {
    const index = cart.findIndex(i => i.id === id);
    if (index > -1) { cart[index].quantity += delta; if (cart[index].quantity <= 0) cart.splice(index, 1); renderCart(); }
};

window.addToCart = function(id) {
    const index = cart.findIndex(i => i.id === id);
    if (index > -1) cart[index].quantity += 1; else cart.push({ id: id, quantity: 1 });
    renderCart();
};

window.removeFromCart = function(id) {
    cart = cart.filter(i => i.id !== id); renderCart();
};

// ==========================================
// 4. CHECKOUT & SIMPAN KE RIWAYAT PESANAN
// ==========================================
window.processCheckout = async function() {
    if (cart.length === 0) return alert('Keranjang kosong!');
    const customerName = prompt("Siapa nama Anda (atas nama pesanan)?");
    if (!customerName) return;

    const btn = document.getElementById('btn-checkout');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...'; btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/checkout`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_name: customerName, cart: cart })
        });
        const result = await response.json();

        if (response.ok) {
            // Hitung Total untuk riwayat
            let totalOrder = 0;
            cart.forEach(item => {
                const p = products.find(x => x.id === item.id);
                if(p) totalOrder += p.price * item.quantity;
            });

            // Simpan ke Riwayat Pesanan HP Pelanggan
            myHistory.unshift({
                id: result.order_id,
                date: new Date().toLocaleString('id-ID'),
                total: totalOrder,
                status: 'Diproses'
            });
            localStorage.setItem('warung_history', JSON.stringify(myHistory));

            alert(`Berhasil! Nomor Antrean: ${result.order_id.split('-')[0]}`);
            cart = []; renderCart(); loadHistory(); // Refresh riwayat
        } else alert(`Gagal: ${result.error}`);
    } catch (error) { alert('Kesalahan jaringan.'); } 
    finally { btn.innerHTML = 'Proses Pesanan <i class="fa-solid fa-chevron-right ml-2 text-xs"></i>'; btn.disabled = false; }
};

// ==========================================
// 5. MODAL & UI CONTROL
// ==========================================
window.openModal = function(id) {
    document.getElementById(id).classList.remove('hidden');
    if(id === 'modal-pesanan') loadHistory();
}
window.closeModal = function(id) {
    document.getElementById(id).classList.add('hidden');
}

function loadHistory() {
    const container = document.getElementById('history-container');
    container.innerHTML = '';
    
    if(myHistory.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-6">Belum ada riwayat pesanan.</p>';
        return;
    }

    myHistory.forEach(order => {
        container.innerHTML += `
            <div class="border border-gray-100 rounded-xl p-4 mb-3 bg-gray-50">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold text-gray-500">Order #${order.id.split('-')[0].toUpperCase()}</span>
                    <span class="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded font-semibold">${order.status}</span>
                </div>
                <div class="flex justify-between items-end">
                    <span class="text-xs text-gray-400">${order.date}</span>
                    <span class="font-bold text-brand-900">${formatRupiah(order.total)}</span>
                </div>
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', loadMenu);
