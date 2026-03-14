const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGO7efu1Qi0f5ZWlgSja3Dkz7zoeJT0XJOx3J8zt9T4EXUiuWlOEinfa_wZt76Pdrx6w/exec';

function generateStarsHtml(productId, allReviews) {
    const productReviews = allReviews.filter(rev => rev.productId === productId || rev.id === productId);

    if (productReviews.length === 0) {
        return `<div class="stars-outer"><div class="stars-inner" style="width: 0%"></div></div>
                <div class="rateProductValue">(0)</div>`;
    }

    const rateSum = productReviews.reduce((acc, curr) => acc + (parseFloat(curr.rate) || 0), 0);
    const rateAv = (rateSum / productReviews.length).toFixed(1);
    const starPercentage = (rateAv / 5) * 100;

    return `
        <div class="stars-outer">
            <div class="stars-inner" style="width: ${starPercentage}%"></div>
        </div>
        <div class="rateProductValue">(${rateAv}/5)</div>
    `;
}

async function loadProducts() {
    try {
        const [prodResponse, sheetResponse] = await Promise.all([
            fetch('../products.json'),
            fetch(GOOGLE_SCRIPT_URL)
        ]);

        const products = await prodResponse.json();
        const allReviewsData = await sheetResponse.json();

        const productContainer = document.getElementById('products');
        const specialOffersContainer = document.getElementById('special-offers');
        const sliderContainer0 = document.getElementsByClassName('all-sliders')[0];
        const sliderContainer1 = document.getElementsByClassName('all-sliders')[1];
        const categories = document.getElementById('categories-container-ul');

        //categories man json file
        const rawCategories = products.map(item => item.categories).filter(removeItem => removeItem !=='Other');
        const uniqueCategories = [...new Set(rawCategories)].sort();
        uniqueCategories.push('Other');
        categories.innerHTML = uniqueCategories
          .map(item => `
            <a href="../categories/categories.html?categories=${item}">
            <li>${item}</li>
            </a>`)
          .join('');

        // siled photos man json
        const sliderHtml = products.map(item => `
            <div class="slide">
                <img src="../photos/products/${item.id}/1.png" alt="${item.id}">
            </div>
        `).join('');

        //koula product b img name rate price...
        const productsHtml = products
            .filter(item => item.specialOffer === false)
            .map(item => `
                <div class="product-container">
                    <a href="../product_page/product_page.html?id=${item.id}" target="_blank">
                        <img src="../photos/products/${item.id}/1.png" alt="${item.id}">
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

        //koula special offre product ou infos dyalo
        const specialOfferHtml = products
            .filter(item => item.specialOffer === true)
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

        //koula 7aja katmchi lblastha f html page
        productContainer.innerHTML = productsHtml;
        specialOffersContainer.innerHTML = specialOfferHtml;
        sliderContainer0.innerHTML = sliderHtml;
        sliderContainer1.innerHTML = sliderHtml;

    } catch (error) {
        console.error("Error loading store:", error);
    }
}

loadProducts();