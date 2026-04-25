let cart = [];

function addToCart(name, price) {
  cart.push({ name, price });
  updateCart();
}

function updateCart() {
  document.getElementById("cart-count").innerText = cart.length;

  let itemsHTML = "";
  let total = 0;

  cart.forEach(item => {
    itemsHTML += `
      <div class="cart-item">
        <span>${item.name}</span>
        <span>Rp ${item.price}</span>
      </div>
    `;
    total += item.price;
  });

  document.getElementById("cart-items").innerHTML = itemsHTML;
  document.getElementById("total").innerText = total;
}

function toggleCart() {
  document.getElementById("cart-panel").classList.toggle("active");
}

function checkout() {
  let text = "Pesanan saya:%0A";

  cart.forEach(item => {
    text += `- ${item.name} (Rp ${item.price})%0A`;
  });

  let total = cart.reduce((sum, i) => sum + i.price, 0);
  text += `%0ATotal: Rp ${total}`;

  window.open("https://wa.me/628123456789?text=" + text);
}
