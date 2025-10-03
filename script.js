let isLoggedIn = false;
let currentUser = null;
let userAds = [];

window.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
    loadProducts();
    setupEventListeners();
});

function checkLoginStatus() {
    const savedUser = localStorage.getItem('olx_user');
    const savedAds = localStorage.getItem('olx_ads');

    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        showUserProfile();
    }

    if (savedAds) {
        userAds = JSON.parse(savedAds);
    }
}

function showUserProfile() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('profileSection').style.display = 'flex';
    document.getElementById('userProfile').textContent = `Welcome, ${currentUser.name}!`;
}

function showAuthButtons() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('profileSection').style.display = 'none';
}

function showSignup() {
    document.getElementById('signupModal').style.display = 'flex';
}

function showSignin() {
    document.getElementById('signinModal').style.display = 'flex';
}

function showMyProfile() {
    updateProfileModal();
    document.getElementById('profileModal').style.display = 'flex';
}

function showSellForm() {
    if (!isLoggedIn) {
        showSignin();
        return;
    }
    document.getElementById('sellModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('signupModal').style.display = 'none';
    document.getElementById('signinModal').style.display = 'none';
    document.getElementById('profileModal').style.display = 'none';
    document.getElementById('sellModal').style.display = 'none';
    document.getElementById('productDetailModal').style.display = 'none';

    document.getElementById('signupForm').reset();
    document.getElementById('signinForm').reset();
    document.getElementById('sellForm').reset();
}

function updateProfileModal() {
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('totalAds').textContent = userAds.length;

    const adsList = document.getElementById('myAdsList');
    if (userAds.length === 0) {
        adsList.innerHTML = '<p>No ads posted yet.</p>';
    } else {
        let adsHTML = '';
        userAds.forEach(ad => {
            adsHTML += `
                <div class="ad-item" style="border: 1px solid #e2e8f0; padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem;">
                    <h4>${ad.title}</h4>
                    <p>$${ad.price}</p>
                    <button onclick="deleteAd(${ad.id})" style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">Delete</button>
                </div>
            `;
        });
        adsList.innerHTML = adsHTML;
    }
}

function deleteAd(adId) {
    userAds = userAds.filter(ad => ad.id !== adId);
    localStorage.setItem('olx_ads', JSON.stringify(userAds));
    updateProfileModal();
    loadProducts();
}

function logout() {
    localStorage.removeItem('olx_user');
    currentUser = null;
    isLoggedIn = false;
    showAuthButtons();
    loadProducts();
}

function setupEventListeners() {
    document.getElementById('signupForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        if (!name || !email || !password) {
            return;
        }

        currentUser = { name, email, password };
        localStorage.setItem('olx_user', JSON.stringify(currentUser));
        isLoggedIn = true;

        closeModal();
        showUserProfile();
    });

    document.getElementById('signinForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;

        if (!email || !password) {
            return;
        }

        const name = email.split('@')[0];
        currentUser = { name, email, password };
        localStorage.setItem('olx_user', JSON.stringify(currentUser));
        isLoggedIn = true;

        closeModal();
        showUserProfile();
    });

    document.getElementById('sellForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('adTitle').value;
        const price = document.getElementById('adPrice').value;
        const description = document.getElementById('adDescription').value;
        const image = document.getElementById('adImage').value;

        if (!title || !price || !description) {
            return;
        }

        const newAd = {
            id: Date.now(),
            title,
            price: parseFloat(price),
            description,
            thumbnail: image || 'https://via.placeholder.com/200x200?text=No+Image',
            category: 'user-posted',
            rating: 5,
            isUserAd: true
        };

        userAds.push(newAd);
        localStorage.setItem('olx_ads', JSON.stringify(userAds));

        closeModal();
        loadProducts();
    });

    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

function loadProducts() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('productsContainer');

    loading.style.display = 'block';
    container.innerHTML = '';

    fetch('https://dummyjson.com/products?limit=20')
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';

            const allProducts = [...userAds, ...data.products];
            displayProducts(allProducts);
        })
        .catch(error => {
            loading.style.display = 'none';

            if (userAds.length > 0) {
                displayProducts(userAds);
            } else {
                container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #64748b;">Unable to load products. Please check your internet connection.</p>';
            }
        });
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');

    let html = '';
    products.forEach((product, index) => {
        const stars = '★'.repeat(Math.floor(product.rating || 5));
        const isUserAd = product.isUserAd || false;
        const cardClass = isUserAd ? 'product-card user-ad' : 'product-card';

        html += `
            <div class="${cardClass}" onclick="showProductDetail(${index})">
                <img src="${product.thumbnail}" alt="${product.title}" class="product-image" onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">
                
                <div class="product-meta">
                    <div class="product-rating">${stars} ${product.rating || 5}</div>
                    <div class="product-category">${product.category}</div>
                </div>
                
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-price">$${product.price}</div>
                
                <div class="product-actions" onclick="event.stopPropagation()">
                    <button class="contact-btn" onclick="contactSeller('${product.title}')">Contact</button>
                    <button class="save-btn" onclick="saveProduct(${product.id || index})">♡ Save</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    window.currentProducts = products;
}

function showProductDetail(productIndex) {
    const product = window.currentProducts[productIndex];
    if (!product) return;

    document.getElementById('productDetailTitle').textContent = product.title;
    document.getElementById('productDetailImg').src = product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image';
    document.getElementById('productDetailName').textContent = product.title;
    document.getElementById('productDetailPrice').textContent = `$${product.price}`;

    const rating = product.rating || 5;
    const stars = '★'.repeat(Math.floor(rating));
    document.getElementById('productDetailRating').textContent = `${stars} ${rating}`;

    document.getElementById('productDetailCategory').textContent = product.category;
    document.getElementById('productDetailDesc').textContent = product.description;

    const specsContainer = document.getElementById('productDetailSpecs');
    let specsHTML = '<h4 style="margin-bottom: 1rem; color: #1e293b;">Specifications</h4>';

    if (product.brand) {
        specsHTML += `<div class="spec-item"><span class="spec-label">Brand:</span><span class="spec-value">${product.brand}</span></div>`;
    }
    if (product.stock !== undefined) {
        const stockStatus = product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Limited Stock' : 'Out of Stock';
        specsHTML += `<div class="spec-item"><span class="spec-label">Stock:</span><span class="spec-value">${product.stock} units (${stockStatus})</span></div>`;
    }
    if (product.discountPercentage) {
        specsHTML += `<div class="spec-item"><span class="spec-label">Discount:</span><span class="spec-value">${product.discountPercentage}% off</span></div>`;
    }
    if (product.weight) {
        specsHTML += `<div class="spec-item"><span class="spec-label">Weight:</span><span class="spec-value">${product.weight}kg</span></div>`;
    }
    if (product.dimensions) {
        const dim = product.dimensions;
        specsHTML += `<div class="spec-item"><span class="spec-label">Dimensions:</span><span class="spec-value">${dim.width} x ${dim.height} x ${dim.depth} cm</span></div>`;
    }

    specsContainer.innerHTML = specsHTML;

    window.currentDetailProduct = product;

    document.getElementById('productDetailModal').style.display = 'flex';
}

function contactSellerDetail() {
    const product = window.currentDetailProduct;
    if (product) {
        console.log('Contact seller for product:', product.title);
    }
}

function saveProductDetail() {
    const product = window.currentDetailProduct;
    if (product) {
        console.log('Product saved:', product.title);
    }
}

function contactSeller(productTitle) {
    console.log('Contact seller for:', productTitle);
}

function saveProduct(productId) {
    console.log('Product saved:', productId);
}

window.showSignup = showSignup;
window.showSignin = showSignin;
window.showMyProfile = showMyProfile;
window.showSellForm = showSellForm;
window.closeModal = closeModal;
window.logout = logout;
window.deleteAd = deleteAd;
window.contactSeller = contactSeller;
window.saveProduct = saveProduct;
window.showProductDetail = showProductDetail;
window.contactSellerDetail = contactSellerDetail;
window.saveProductDetail = saveProductDetail;
