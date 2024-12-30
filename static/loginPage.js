document.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the form from submitting traditionally

    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;

    try {
        const response = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            // Handle errors from the backend
            const errorData = await response.json();
            alert(`Login failed: ${errorData.detail}`);
            return;
        }

        const data = await response.json();
        alert("Login successful!");

        // Redirect to the homepage
        window.location.href = "/home/dipak/project/templates/page.html";
    } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred. Please try again later.");
    }
});
