document.addEventListener("DOMContentLoaded", () => {
    const cartItemsElement = document.getElementById("cart-items");
    const subtotalElement = document.getElementById("subtotal");
    const cartCountElement = document.getElementById("cart-count");

    const updateCartCount = () => {
        fetch('/cart')
            .then(response => response.json())
            .then(cart => {
                const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
                if (cartCountElement) {
                    cartCountElement.textContent = totalItems;
                }
            });
    };

    const renderCart = () => {
        if (!cartItemsElement) return;

        fetch('/cart')
            .then(response => response.json())
            .then(cart => {
                cartItemsElement.innerHTML = "";

                if (cart.length === 0) {
                    cartItemsElement.innerHTML = "<p>Your cart is empty.</p>";
                    subtotalElement.textContent = "$0.00";
                    return;
                }

                let subtotal = 0;

                cart.forEach((item, index) => {
                    subtotal += item.price * item.quantity;

                    const cartItem = document.createElement("div");
                    cartItem.className = "flex items-center justify-between border-b pb-4 mb-4";

                    cartItem.innerHTML = `
                        <div class="flex items-center space-x-4">
                            <input type="checkbox" class="item-checkbox" data-index="${item.id}" ${item.selected ? 'checked' : ''}>
                            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                            <div>
                                <h3 class="text-lg font-bold">${item.name}</h3>
                                <div class="flex items-center space-x-2">
                                    <button class="decrease-quantity text-gray-600 hover:text-gray-800" data-index="${item.id}">−</button>
                                    <span class="quantity">${item.quantity}</span>
                                    <button class="increase-quantity text-gray-600 hover:text-gray-800" data-index="${item.id}">+</button>
                                </div>
                                <p class="text-gray-600">$${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                        <button class="text-red-600 hover:text-red-800 font-medium remove-item" data-index="${item.id}">
                            Remove
                        </button>
                    `;

                    cartItemsElement.appendChild(cartItem);
                });

                subtotalElement.textContent = `$${subtotal.toFixed(2)}`;

                document.querySelectorAll(".increase-quantity").forEach(button => {
                    button.addEventListener("click", e => {
                        const id = e.target.dataset.index;
                        const item = cart.find(item => item.id == id);
                        fetch(`/cart/update/${item.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ quantity: item.quantity + 1 }),
                        })
                            .then(() => renderCart());
                    });
                });

                document.querySelectorAll(".decrease-quantity").forEach(button => {
                    button.addEventListener("click", e => {
                        const id = e.target.dataset.index;
                        const item = cart.find(item => item.id == id);
                        if (item.quantity > 1) {
                            fetch(`/cart/update/${item.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ quantity: item.quantity - 1 }),
                            })
                                .then(() => renderCart());
                        } else {
                            fetch(`/cart/remove/${item.id}`, { method: 'DELETE' })
                                .then(() => renderCart());
                        }
                    });
                });

                document.querySelectorAll(".remove-item").forEach(button => {
                    button.addEventListener("click", e => {
                        const id = e.target.dataset.index;
                        fetch(`/cart/remove/${id}`, { method: 'DELETE' })
                            .then(() => renderCart());
                    });
                });

                document.querySelectorAll(".item-checkbox").forEach(checkbox => {
                    checkbox.addEventListener("change", () => {
                        const id = checkbox.dataset.index;
                        const item = cart.find(item => item.id == id);
                        fetch(`/cart/update/${item.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ selected: checkbox.checked }),
                        });
                    });
                });
            });
    };

    renderCart();
    updateCartCount();
});