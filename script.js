
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    renderAllPosts();
    getProducts(); // Fetch API products
});

function showSection(id) {
    document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document.querySelectorAll(".nav-links button").forEach(btn => btn.classList.remove("active"));
    if (id === "home") { document.getElementById("homeBtn").classList.add("active"); }
    else { document.getElementById("myPostsBtn").classList.add("active"); renderMyPosts(); }
}

function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }
function toggleProfileMenu() { document.getElementById("profileMenu").classList.toggle("show"); }

function signup() {
    let name = document.getElementById("signupName").value;
    let email = document.getElementById("signupEmail").value;
    let password = document.getElementById("signupPassword").value;
    if (name && email && password) {
        let user = { name, email, password, posts: [] };
        localStorage.setItem("user", JSON.stringify(user));
        alert("Signup successful! Please login.");
        closeModal('signupModal');
    } else alert("All fields required!");
}

function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    let user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email === email && user.password === password) {
        alert("Login successful!");
        closeModal('loginModal');
        checkAuth();
    } else alert("Invalid credentials!");
}

function checkAuth() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        document.getElementById("authButtons").style.display = "none";
        document.getElementById("profileSection").style.display = "flex";
        document.getElementById("profileName").textContent = "👤 " + user.name;
        document.getElementById("profileEmail").textContent = user.email;
        document.getElementById("myPostsBtn").style.display = "inline-block"; // show my posts button
    }
}

function addPost() {
    let title = document.getElementById("postTitle").value;
    let desc = document.getElementById("postDesc").value;
    let img = document.getElementById("postImage").files[0];
    if (title && desc && img) {
        let reader = new FileReader();
        reader.onload = function (e) {
            let user = JSON.parse(localStorage.getItem("user"));
            let newPost = { title, desc, image: e.target.result, author: user.name };
            user.posts.push(newPost);
            localStorage.setItem("user", JSON.stringify(user));

            let allPosts = JSON.parse(localStorage.getItem("allPosts")) || [];
            allPosts.push(newPost);
            localStorage.setItem("allPosts", JSON.stringify(allPosts));

            closeModal('postModal');
            renderAllPosts();
            renderMyPosts();
        }
        reader.readAsDataURL(img);
    } else alert("Fill all fields and select image!");
}

function renderAllPosts() {
    let container = document.getElementById("postsContainer");
    container.innerHTML = "";
    let allPosts = JSON.parse(localStorage.getItem("allPosts")) || [];
    allPosts.forEach(p => {
        container.innerHTML += `
          <div class="post-card">
            <img src="${p.image}" alt="">
            <div class="post-card-content">
              <h3>${p.title}</h3>
              <p>${p.desc}</p>
              <small> Posted by: ${p.author}</small>
            </div>
          </div>`;
    });
}

function renderMyPosts() {
    let user = JSON.parse(localStorage.getItem("user"));
    let myPostsContainer = document.getElementById("myPostsContainer");
    myPostsContainer.innerHTML = "";
    if (user && user.posts.length) {
        user.posts.forEach((p, i) => {
            myPostsContainer.innerHTML += `
            <div class="post-card">
              <img src="${p.image}" alt="">
              <div class="post-card-content">
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
                <small> Your Post</small>
                <button class="delete-btn" onclick="deletePost(${i})">Delete</button>
              </div>
            </div>`;
        });
    } else {
        myPostsContainer.innerHTML = "<p style='padding:20px;'>No posts yet.</p>";
    }
}

function deletePost(i) {
    let user = JSON.parse(localStorage.getItem("user"));
    let removed = user.posts.splice(i, 1)[0];
    localStorage.setItem("user", JSON.stringify(user));

    let allPosts = JSON.parse(localStorage.getItem("allPosts")) || [];
    allPosts = allPosts.filter(p => !(p.title === removed.title && p.desc === removed.desc && p.image === removed.image));
    localStorage.setItem("allPosts", JSON.stringify(allPosts));

    renderAllPosts();
    renderMyPosts();
}

function logout() {
    localStorage.removeItem("user");
    location.reload();
}

// ✅ API fetch
function getProducts() {
    fetch("https://dummyjson.com/products")
        .then((res) => res.json())
        .then((result) => {
            const { products } = result;
            let container = document.getElementById('postsContainer');
            products.forEach(element => {
                container.innerHTML += `
            <div class="post-card">
              <img src="${element.thumbnail}" alt="">
              <div class="post-card-content">
                <h3>${element.title} - $${element.price}</h3>
                <p>${element.description}</p>
                <small> API Product</small>
              </div>
            </div>`;
            });
        });
}

window.onclick = function (e) {
    document.querySelectorAll(".modal").forEach(m => {
        if (e.target === m) { m.style.display = "none"; }
    });
}
