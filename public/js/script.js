document.addEventListener("DOMContentLoaded", () => {
    // Hamburger Menu Toggle
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });
    }

    // Product Grid and Sorting
    const productGrid = document.getElementById("product-grid");
    const sortDropdown = document.getElementById("sort");

    // Ensure currentCategory is defined
    if (typeof currentCategory === "undefined" || !currentCategory) {
        console.error("currentCategory is not defined or invalid");
        productGrid.innerHTML = "<p>Error: Category not specified.</p>";
        return;
    }

    // Fetch the product data from the server
    fetch(`/products?category=${currentCategory}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((products) => {
            if (!products || !Array.isArray(products)) {
                throw new Error(`No products found for category: ${currentCategory}`);
            }

            // Function to populate the product grid
            const populateGrid = (productsToRender) => {
                productGrid.innerHTML = ""; // Clear existing content
                productsToRender.forEach((product) => {
                    const productCard = document.createElement("div");
                    productCard.className = "border rounded-lg p-4 shadow-md cursor-pointer";
                    productCard.dataset.name = product.name;
                    productCard.dataset.price = product.price;

                    // Create product card HTML
                    productCard.innerHTML = `
                        <a href="product-details.html?id=${product.id}&category=${currentCategory}" class="block">
                            <img src="${product.image}" alt="${product.name}" class="w-full h-32 object-cover rounded-md mb-2">
                            <h3 class="text-xl font-bold text-gray-800">${product.name}</h3>
                            <p class="text-gray-600">Price: $${product.price.toFixed(2)}</p>
                            <p class="text-gray-500">${product.description}</p>
                        </a>
                    `;

                    // Append the card to the product grid
                    productGrid.appendChild(productCard);
                });
            };

            // Initial population of the grid
            populateGrid(products);

            // Add sorting functionality
            if (sortDropdown) {
                sortDropdown.addEventListener("change", () => {
                    const sortBy = sortDropdown.value;

                    // Sort products based on the selected criterion
                    const sortedProducts = [...products].sort((a, b) => {
                        if (sortBy === "name") {
                            return a.name.localeCompare(b.name);
                        } else if (sortBy === "price") {
                            return a.price - b.price;
                        }
                        return 0; // Default no sorting
                    });

                    // Re-render the grid with sorted products
                    populateGrid(sortedProducts);
                });
            }
        })
        .catch((error) => {
            console.error("Error loading products:", error);
            productGrid.innerHTML = `<p>Error loading products: ${error.message}</p>`;
        });
});