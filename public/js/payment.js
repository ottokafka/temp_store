
// Initialize Stripe with your publishable key
const stripe = Stripe(
    'pk_test_51QazeqE305zKX3iEFxLtCKxLBgYO3MDNRlP0ZGi8KBoO4GqDwgSoVytZFDyvux10Z0BEnDuoBaklz1YWDQz9vaoW008KZrGGXz'
);

let elements; // Define elements globally

// Shipping Regions
const eastMalaysia = ["Sabah", "Sarawak", "Labuan"];
const westMalaysia = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
    "Pahang", "Pulau Pinang", "Perak", "Perlis", "Selangor",
    "Terengganu", "Kuala Lumpur", "Putrajaya"
];

// Populate States
const stateSelect = document.getElementById("state");
[...eastMalaysia, ...westMalaysia].forEach(state => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
});

// Cart Data
const cart = [
    { name: "Batik Tote Bag", price: 50.00, quantity: 1 },
    { name: "Rattan Handbag", price: 75.00, quantity: 2 }
];

// Render Cart Summary and Shipping
function renderCartSummary() {
    const cartSummary = document.getElementById("cart-summary");
    const shippingCostElement = document.getElementById("shipping-cost");
    const totalCostElement = document.getElementById("total-cost");

    let subtotal = 0;
    cartSummary.innerHTML = "";

    // Calculate subtotal and render cart items
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        cartSummary.innerHTML += `
            <div class="flex justify-between">
                <span>${item.name} x ${item.quantity}</span>
                <span>RM${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });

    // Determine shipping cost
    const selectedState = stateSelect.value;
    let shippingCost = 0;

    if (eastMalaysia.includes(selectedState)) {
        shippingCost = 10; // RM10 for East Malaysia
    } else if (westMalaysia.includes(selectedState)) {
        shippingCost = 5; // RM5 for West Malaysia
    }

    // Update shipping and total
    shippingCostElement.textContent = `RM${shippingCost.toFixed(2)}`;
    totalCostElement.textContent = `RM${(subtotal + shippingCost).toFixed(2)}`;
}

// Attach event listener to state dropdown
stateSelect.addEventListener("change", renderCartSummary);
// Initialize Stripe Payment Element
async function initializePaymentElement() {
    try {
        console.log("Fetching clientSecret from backend...");
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart,
                customerDetails: {
                    email: document.getElementById("email").value,
                    name: `${document.getElementById("first-name").value} ${document.getElementById("last-name").value}`,
                    phone: document.getElementById("phone").value,
                    address: {
                        line1: document.getElementById("address").value,
                        state: document.getElementById("state").value,
                    },
                },
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch client secret");
        }

        const { clientSecret } = await response.json();
        console.log("Received clientSecret:", clientSecret);

        // Initialize Stripe Elements with the clientSecret
        elements = stripe.elements({ clientSecret });

        // Create and mount the Payment Element
        const paymentElement = elements.create('payment', { layout: 'accordion' });
        paymentElement.mount('#payment-element');
        console.log("Payment Element mounted");

        // Enable the "Pay Now" button
        document.getElementById("pay-button").disabled = false;
    } catch (error) {
        console.error("Error initializing payment element:", error);
        const errorElement = document.getElementById("confirm-errors");
        errorElement.textContent = "Unable to load payment options.";
        errorElement.classList.add("text-red-600");
    }
}
// Handle Pay Now button
document.getElementById("pay-button").addEventListener("click", async (e) => {
    e.preventDefault();

    try {
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: 'http://localhost:3000/success', // Redirect to the success page
                payment_method_data: {
                    billing_details: {
                        name: `${document.getElementById("first-name").value} ${document.getElementById("last-name").value}`,
                        email: document.getElementById("email").value,
                        phone: document.getElementById("phone").value,
                        address: {
                            line1: document.getElementById("address").value,
                            state: document.getElementById("state").value,
                        },
                    },
                },
            },
        });

        if (error) {
            const errorElement = document.getElementById("confirm-errors");
            errorElement.textContent = error.message;
            errorElement.classList.add("text-red-600");
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        const errorElement = document.getElementById("confirm-errors");
        errorElement.textContent = "Error processing payment.";
        errorElement.classList.add("text-red-600");
    }
});

// Initialize page
renderCartSummary();
initializePaymentElement();

