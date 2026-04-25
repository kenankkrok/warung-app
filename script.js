// 1. Data Produk (Sesuai dengan UI)
const products = [
    { id: 1, name: 'Nasi Ayam Penyet', price: 22000, category: 'nasi', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=100&q=80' },
    { id: 2, name: 'Nasi Goreng Spesial', price: 20000, category: 'nasi', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=100&q=80' },
    { id: 3, name: 'Sayur Asem', price: 10000, category: 'sayur', image: 'https://images.unsplash.com/photo-1548943487-a2e4f43b4850?auto=format&fit=crop&w=100&q=80' },
    { id: 4, name: 'Ayam Goreng Kampung', price: 18000, category: 'ayam', image: 'https://images.unsplash.com/photo-1546069901-ba9590a1a70c?auto=format&fit=crop&w=100&q=80' },
    { id: 5, name: 'Es Teh Manis', price: 5000, category: 'minuman', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=100&q=80' }
];

// 2. State Keranjang
let cart = [
    { id: 1, quantity: 1 },
    { id: 4, quantity: 1 },
    { id: 5, quantity: 1 }
];

// 3. Fungsi Helper Format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// 4. Fungsi Render Keranjang
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
                <img src="${product.image}" alt="${product.name}" class="w-12 h-12 rounded-lg object-cover">
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

    // Update Totals
    subtotalElement.innerText = formatRupiah(total);
    badgeCount.forEach(badge => badge.innerText = totalItems);
}

// 5. Fungsi Update Quantity
window.updateQuantity = function(productId, delta) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        renderCart();
    }
};

// 6. Fungsi Tambah ke Keranjang (Untuk tombol + di menu)
window.addToCart = function(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    renderCart();
};

// 7. Fungsi Hapus Item
window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
};

// Inisialisasi awal saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});
