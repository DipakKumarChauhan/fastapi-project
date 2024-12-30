// document.querySelector('form').addEventListener('submit', async (event) => {
//     event.preventDefault(); // Prevent default form submission

//     const username = document.getElementById('username').value;
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     //const confirmPassword = document.getElementById('confirm_password').value;

//     // Optional: Check if passwords match before sending request
//     // if (password !== confirmPassword) {
//     //     alert("Passwords do not match. Please check and try again.");
//     //     return;
//     // }

//     try {
//         const response = await fetch('http://localhost:8000/signup', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 username: username,
//                 email: email,
//                 password: password
//             })
//         });

//         if (!response.ok) {
//             // Handle errors from the backend
//             const errorData = await response.json();
//             alert(`Error: ${errorData.detail}`);
//             return;
//         }

//         // Successful signup
//         alert('Signup successful! Redirecting to login page...');
//         window.location.href = '/login';
//     } catch (error) {
//         console.error('Error during signup:', error);
//         alert('An error occurred. Please try again later.');
//     }
// });


// signUpPage.js

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.querySelector(".signup-form");

    // Handle form submission
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Gather form data
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Validate form data (basic validation)
        if (!username || !email || !password) {
            alert("All fields are required!");
            return;
        }

        // Create payload
        const payload = {
            username: username,
            email: email,
            password: password,
        };

        try {
            // Send POST request to FastAPI backend
            const response = await fetch("/signup_post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message); // Display success message
                window.location.href = "//home/dipak/project/templates/loginPage.html"; // Redirect to login page
            } else {
                const errorData = await response.json();
                alert(errorData.detail || "An error occurred during signup.");
            }
        } catch (error) {
            console.error("Error during signup:", error);
            alert("Failed to sign up. Please try again later.");
        }
    });
});
