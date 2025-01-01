document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    const category = params.get("category");

    const productName = document.getElementById("product-name");
    const productDescription = document.getElementById("product-description");
    const productPrice = document.getElementById("product-price");
    const productImage = document.getElementById("product-image");
    const addToCartButton = document.getElementById("add-to-cart");
    const cartCountElement = document.getElementById("cart-count");
    const backButton = document.getElementById("back-button");

    const updateCartCount = () => {
        fetch('/cart')
            .then(response => response.json())
            .then(cart => {
                cartCountElement.textContent = cart.length;
            });
    };

    if (category) {
        backButton.href = `${category}.html`;
    } else {
        backButton.href = "homepage.html";
    }

    fetch(`/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            productName.textContent = product.name;
            productDescription.textContent = product.description;
            productPrice.textContent = `$${product.price.toFixed(2)}`;
            productImage.src = product.image;

            addToCartButton.addEventListener("click", () => {
                fetch('/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId: product.id }),
                })
                    .then(response => response.json())
                    .then(() => {
                        updateCartCount();
                        alert(`${product.name} added to cart!`);
                    });
            });
        })
        .catch(error => {
            console.error("Error fetching product details:", error);
            productName.textContent = "Error loading product.";
        });

    updateCartCount();
});