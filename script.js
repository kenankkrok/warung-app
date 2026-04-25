// ==========================================
// 1. KONFIGURASI API
// ==========================================
// GANTI URL INI DENGAN URL CLOUDFLARE WORKER ANDA!
// Contoh: "https://warung-api.username-anda.workers.dev"
const API_BASE_URL = "https://warung-api.kenankkrok.workers.dev"; 

// State Global
let products = [];
let cart = [];

// ==========================================
// 2. FUNGSI UTILITAS
// ==========================================
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// ==========================================
// 3. KOMUNIKASI DENGAN API (FETCH DATA)
// ==========================================

// Mengambil data menu dari Database via API
async function loadMenu() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/menu`);
        if (!response.ok) throw new Error('Gagal mengambil data menu');
        
        products = await response.json();
        renderMenuCards(); // Tampilkan ke layar setelah data ditarik
    } catch (error) {
        console.error("Error loading menu:", error);
        alert("Gagal memuat menu. Pastikan API Worker sudah berjalan.");
    }
}

// Menampilkan produk ke HTML secara dinamis
function renderMenuCards() {
    const menuContainer = document.getElementById('menu-container');
    // Jika Anda belum menambahkan ID ini di index.html, kita harus menambahkannya nanti
    if (!menuContainer) return; 

    menuContainer.innerHTML = ''; // Kosongkan container

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition';
        card.innerHTML = `
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
}

// ==========================================
// 4. LOGIKA KERANJANG BELANJA
// ==========================================

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const badgeCount = document.querySelectorAll('.cart-badge');
    const subtotalElement = document.getElementById('cart-subtotal');
    
    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            total += product.price * item.quantity;
            totalItems += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center gap-3';
            itemElement.innerHTML = `
                <img src="${product.image || 'https://via.placeholder.com/100'}" alt="${product.name}" class="w-12 h-12 rounded-lg object-cover">
                <div class="flex-1">
                    <h4 class="text-sm font-semibold">${product.name}</h4>
                    <p class="text-xs text-gray-500">${formatRupiah(product.price)}</p>
                </div>
                <div class="flex items-center gap-2 text-sm">
                    <button onclick="updateQuantity(${product.id}, -1)" class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${product.id}, 1)" class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">+</button>
                </div>
                <button onclick="removeFromCart(${product.id})" class="text-gray-400 hover:text-red-500 ml-2 transition">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            `;
            cartContainer.appendChild(itemElement);
        }
    });

    subtotalElement.innerText = formatRupiah(total);
    badgeCount.forEach(badge => badge.innerText = totalItems);
}

window.updateQuantity = function(productId, delta) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;
        if (cart[itemIndex].quantity <= 0) cart.splice(itemIndex, 1);
        renderCart();
    }
};

window.addToCart = function(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    renderCart();
};

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
};

// ==========================================
// 5. PROSES CHECKOUT KE DATABASE API
// ==========================================

window.processCheckout = async function() {
    if (cart.length === 0) {
        alert('Keranjang Anda masih kosong!');
        return;
    }

    const customerName = prompt("Siapa nama Anda (atas nama pesanan)?");
    if (!customerName) return; // Batal jika nama kosong

    const checkoutBtn = document.getElementById('btn-checkout');
    const originalText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
    checkoutBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_name: customerName,
                cart: cart
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Berhasil! Nomor Antrean Anda: ${result.order_id.split('-')[0]}`); // Menampilkan potongan awal UUID
            cart = []; // Kosongkan keranjang setelah berhasil
            renderCart();
        } else {
            alert(`Gagal memproses pesanan: ${result.error}`);
        }
    } catch (error) {
        console.error("Checkout error:", error);
        alert('Terjadi kesalahan jaringan saat memproses pesanan.');
    } finally {
        // Kembalikan tombol ke kondisi semula
        checkoutBtn.innerHTML = originalText;
        checkoutBtn.disabled = false;
    }
};

// Inisialisasi saat web dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadMenu(); // Panggil API untuk ambil menu
});
