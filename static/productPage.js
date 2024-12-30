// document.querySelector(".search-bar").addEventListener("submit", async (event) => {
//     event.preventDefault(); // Prevent default form submission

//     const query = document.querySelector('input[name="query"]').value;

//     try {
//         const response = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(query)}`, {
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json"
//             }
//         });

//         if (!response.ok) {
//             // Handle errors from the backend
//             const errorData = await response.json();
//             alert(`Error: ${errorData.detail}`);
//             return;
//         }

//         const product = await response.json();

//         if (!product) {
//             // If no product is found
//             document.querySelector(".product-container").innerHTML = `
//                 <h2>Product Details</h2>
//                 <p>Product not found.</p>
//             `;
//         } else {
//             // Display product details
//             document.querySelector(".product-container").innerHTML = `
//                 <h2>Product Details</h2>
//                 <p><strong>Product:</strong> ${product.name}</p>
//                 <p><strong>Description:</strong> ${product.description}</p>
//                 <p><strong>Category:</strong> ${product.category}</p>
//                 <p><strong>Price:</strong> $${product.price}</p>
//             `;
//         }
//     } catch (error) {
//         console.error("Error fetching product:", error);
//         alert("An error occurred. Please try again later.");
//     }
// });

// productPage.js

// Function to handle search functionality
document.querySelector('.search-bar').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get the search query
    const query = document.querySelector('input[name="query"]').value;

    if (!query.trim()) {
        alert('Please enter a search term.');
        return;
    }

    try {
        // Fetch product data from the FastAPI backend
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error('Failed to fetch product data.');
        }

        const productData = await response.json();

        // Update the UI with the fetched product data
        updateProductDetails(productData);
    } catch (error) {
        console.error('Error fetching product data:', error);
        alert('An error occurred while fetching product data. Please try again later.');
    }
});

// Function to update the product container with fetched data
function updateProductDetails(productData) {
    const productContainer = document.querySelector('.product-container');

    if (!productData || Object.keys(productData).length === 0) {
        productContainer.innerHTML = '<h2>Product Details</h2><p>No products found for the given search term.</p>';
        return;
    }

    productContainer.innerHTML = `
        <h2>Product Details</h2>
        <p><strong>Product:</strong> ${productData.product_name}</p>
        <p><strong>Description:</strong> ${productData.description}</p>
        <p><strong>Price:</strong> $${productData.price}</p>
    `;
}
