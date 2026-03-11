const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEdnShYHSX1mPwt63dswxG-_ezGaVl47c5kCQ1HqaVJtPGRtrNwv2r5pmalg3yKmRDdw/exec';

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
            fetch('products.json'),
            fetch(GOOGLE_SCRIPT_URL)
        ]);

        const products = await prodResponse.json();
        const allReviewsData = await sheetResponse.json();

        const productContainer = document.getElementById('products');
        const specialOffersContainer = document.getElementById('special-offers');
        const sliderContainer0 = document.getElementsByClassName('all-sliders')[0];
        const sliderContainer1 = document.getElementsByClassName('all-sliders')[1];

        const sliderHtml = products.map(item => `
            <div class="slide">
                <img src="photos/products/${item.id}/1.png" alt="${item.id}">
            </div>
        `).join('');

        const productsHtml = products
            .filter(item => item.specialOffer === false)
            .map(item => `
                <div class="product-container">
                    <a href="product_page.html?id=${item.id}" target="_blank">
                        <img src="photos/products/${item.id}/1.png" alt="${item.id}">
                        <div class="product-name">${item.name}</div>
                        <div class="product-price">${item.priceBefore}dh</div>
                        <button>Add to cart</button>
                        <div class="product-rate">
                            ${generateStarsHtml(item.id, allReviewsData)}
                        </div>
                    </a>
                </div>
            `).join('');

        const specialOfferHtml = products
            .filter(item => item.specialOffer === true)
            .map(item => `
                <div class="offer-item">
                    <a href="product_page.html?id=${item.id}" target="_blank">
                        <img src="photos/products/${item.id}/1.png" alt="${item.id}">
                        <div class="offer-name">${item.name}</div>
                        <div class="price-before">${item.priceBefore}dh</div>
                        <div class="price-after">${(item.priceBefore * (1 - item.discount)).toFixed(2)}dh</div>
                        <div class="offer-discount">${(item.discount * 100).toFixed(0)}%</div>
                        <div class="product-rate">
                            ${generateStarsHtml(item.id, allReviewsData)}
                        </div>
                    </a>
                </div>
            `).join('');

        if(productContainer) productContainer.innerHTML = productsHtml;
        if(specialOffersContainer) specialOffersContainer.innerHTML = specialOfferHtml;
        if(sliderContainer0) sliderContainer0.innerHTML = sliderHtml;
        if(sliderContainer1) sliderContainer1.innerHTML = sliderHtml;
        
    } catch (error) {
        console.error("Error loading store:", error);
    }
}

loadProducts();