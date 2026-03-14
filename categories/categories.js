const params = new URLSearchParams(window.location.search);
const selectedCategory = params.get('categories'); // URL looks like: categories.html?cat=Tech
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGO7efu1Qi0f5ZWlgSja3Dkz7zoeJT0XJOx3J8zt9T4EXUiuWlOEinfa_wZt76Pdrx6w/exec';

async function loadCategoryPage() {
    try {
        // 1. Fetch products and reviews at the same time
        const [prodResponse, sheetResponse] = await Promise.all([
            fetch('../products.json'),
            fetch(GOOGLE_SCRIPT_URL)
        ]);

        const products = await prodResponse.json();
        const allReviewsData = await sheetResponse.json();
        const productContainer = document.getElementById('products');
        const specialOffersContainer = document.getElementById('special-offers');
        const categoryName = document.getElementById('category-name');
        

        const categoryNameHtml = `${selectedCategory} category`

        categoryName.innerHTML = categoryNameHtml;

        // 2. Filter products by category

        const filteredProducts = products.filter(item => 
            item.categories === selectedCategory
        );

        // 4. Build the HTML (Re-using your grid logic)
        const productsHtml = filteredProducts
        .filter(item=> item.specialOffer === false)
        .map(item => `
            <div class="product-container">
                <a href="../product_page/product_page.html?id=${item.id}">
                    <img src="../photos/products/${item.id}/1.png" alt="${item.name}">
                    <div class="product-name">${item.name}</div>
                    <div id="prices">
                        <div class="product-price-before">${item.priceBefore}dh</div>
                        <div class="product-price-after">${item.priceAfter}dh</div>
                    </div>
                    <button>order now</button>
                    <div class="product-rate">
                        ${generateStarsHtml(item.id, allReviewsData)}
                    </div>
                </a>
            </div>
        `).join('');

        const specialOfferHtml = filteredProducts
        .filter(item=> item.specialOffer === true)
        .map(item => `
            <div class="offer-item">
                    <a href="../product_page/product_page.html?id=${item.id}" target="_blank">
                        <img src="../photos/products/${item.id}/1.png" alt="${item.id}">
                        <div class="offer-name">${item.name}</div>
                        <div id="prices">
                            <div class="product-price-before">${item.priceBefore}dh</div>
                            <div class="product-price-after">${item.priceAfter}dh</div>
                        </div>
                        <div class="offer-discount">${((1-(item.priceAfter)/(item.priceBefore)) * 100).toFixed(0)}%</div>
                        <div class="product-rate">
                            ${generateStarsHtml(item.id, allReviewsData)}
                        </div>
                    </a>
                </div>
            `).join('');

        if(specialOfferHtml === ""){
            document.getElementById('specialoffersh2').style.display = "none";
        }
        

        productContainer.innerHTML = productsHtml;
        specialOffersContainer.innerHTML = specialOfferHtml;

        if (filteredProducts.length === 0) {
            document.body.innerHTML = `<div class="error-msg" style="position: relative; margin-top: 10px;">No products found in "${selectedCategory}" category</div>`;
            return;
        }

    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// Re-using your star logic
function generateStarsHtml(id, allReviews) {
    const productReviews = allReviews.filter(rev => String(rev.id) === String(id));
    if (productReviews.length === 0) {
        return `<div class="stars-outer"><div class="stars-inner" style="width: 0%"></div></div><div class="rateProductValue">(0)</div>`;
    }
    const rateSum = productReviews.reduce((acc, curr) => acc + (parseFloat(curr.rate) || 0), 0);
    const rateAv = (rateSum / productReviews.length).toFixed(1);
    const starPercentage = (rateAv / 5) * 100;

    return `
        <div class="stars-outer"><div class="stars-inner" style="width: ${starPercentage}%"></div></div>
        <div class="rateProductValue">(${rateAv}/5)</div>
    `;
}

loadCategoryPage();