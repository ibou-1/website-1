//rating system

// 1. YOUR UNIQUE LINK FROM GOOGLE
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVj_Ta5xcFzSHM2_XSqPRf8I0Iab4dbZCnYbMHg3k97p3dXK08tMANxmDRLYfbou0mJQ/exec';

let allReviewsData = [];
let currentIndex = 0;
const REVIEWS_PER_PAGE = 4;

async function loadReviews() {
  const container = document.getElementById('reviews-container');

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    let data = await response.json();

    // --- THE FIX IS HERE ---
    // We filter the data IMMEDIATELY after fetching it
    // We use 'productId' which was defined at the top of your script
    allReviewsData = data.filter(review => String(review.productId) === String(productId));
    // -----------------------

    // rate average dyal product
    let allReviewsDataLength = allReviewsData.length;
    let rateSum = 0;

    for (let i = 0; i < allReviewsDataLength; i++) {
      rateSum += allReviewsData[i].rate;
    };
    let rateAv = (rateSum / allReviewsDataLength).toFixed(1);

    const productRateContainer = document.getElementById('product-rate-stars')
    let starPercentageProduct;

    if (allReviewsDataLength === 0) {
      rateAv = "(0)";
      starPercentageProduct = 0;
    } else {
      starPercentageProduct = (rateAv / 5) * 100;
      rateAv = "(" + rateAv + "/5)";
    }

    productRateContainer.innerHTML = `
    <div class="stars-outer-product">
      <div class="stars-inner" style="width: ${starPercentageProduct}%"></div>
    </div>
    <div id="rateProductValue">${rateAv}</div>`
    // rate average dyal product end

    container.innerHTML = '';
    currentIndex = 0;

    if (allReviewsData.length === 0) {
      container.innerHTML = '<p>No reviews yet for this product. Be the first!</p>';
      return;
    }

    displayNextBatch();
  } catch (err) {
    console.error("Review Error:", err);
    container.innerHTML = '<p>Could not load reviews.</p>';
  }
}

function displayNextBatch() {
  const container = document.getElementById('reviews-container');
  // Get the next 9 reviews
  const nextBatch = allReviewsData.slice(currentIndex, currentIndex + REVIEWS_PER_PAGE);

  nextBatch.forEach(review => {
    const starPercentage = (review.rate / 5) * 100;
    const reviewCard = `
      <div class="review">
        <div class="customer"><strong>${review.name}</strong></div>
        <div class="comment">${review.comment}</div>
        <div class="stars-outer">
          <div class="stars-inner" style="width: ${starPercentage}%"></div>
        </div>
      </div>
    `;
    container.innerHTML += reviewCard;
  });

  currentIndex += nextBatch.length;
  updateButton();
}

function updateButton() {
  const btn = document.getElementById('show-more-btn');
  if (!btn) return;

  const remaining = allReviewsData.length - currentIndex;

  if (remaining > 0) {
    btn.style.display = 'block';

    // Calculate how many we will show next (either 9 or whatever is left)
    const nextAmount = remaining > 4 ? 4 : remaining;
    btn.innerHTML = `Show <span class="num-highlight">${nextAmount}</span> more`;
  } else {
    btn.style.display = 'none';
  }
}


// 3. FUNCTION TO SUBMIT REVIEWS (Website -> Sheet)
async function submitReview(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('submit-review');
  submitBtn.innerText = "Sending...";
  submitBtn.disabled = true;

  const nameValue = document.getElementById('customer-name').value;
  const commentValue = document.getElementById('comment').value;
  const ratingValue = document.querySelector('input[name="rating"]:checked').value;
  const productId = document.querySelector('input[name="productId"]').value;


  const newReview = {
    name: nameValue,
    comment: commentValue,
    rate: ratingValue,
    productId: productId
  };

  await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(newReview)
  });

  // Reset form and UI
  alert('Review Submitted!');
  document.getElementById('review-form').reset();
  submitBtn.innerText = "Submit Review";
  submitBtn.disabled = false;

  // Wait 2 seconds for Google to process, then refresh the list
  setTimeout(loadReviews, 2000);
}

// 4. START THE ENGINE
document.getElementById('review-form').addEventListener('submit', submitReview);
loadReviews(); // Runs when the page first opens




// ga3 lproducts page b js bach man3awdch html bzf mrrat

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
let products;
let product;
let productName;
let productPriceNumber;

async function loadProducts() {
  let thisProductCategorie;
  try {
    response = await fetch('../products.json');
    products = await response.json();
    product = products.find(p => p.id === productId);
    thisProductCategorie = product.categories;

    if (!product) {
      document.body.innerHTML = "<h1>Product not found!</h1>";
      return;
    }

    // Fill Text Info
    productName = document.getElementById('product-name').innerText = product.name;
    productPriceNumber = product.priceAfter;
    let quantity = document.getElementById('quantity-input').value;
    document.getElementById('product-price-after').innerHTML = `<p>${product.priceAfter * quantity}dh</p>`;
    document.getElementById('product-price-before').innerHTML = `<p><strong>${product.priceBefore * quantity}dh</strong></p>`;

    const form = document.getElementById('form');
    form.insertAdjacentHTML('beforeend', `<input type="hidden" name="productId" value="${product.id}">`);

    const reviews = document.getElementById('reviews');
    reviews.insertAdjacentHTML('beforeend', `<input type="hidden" name="productId" value="${product.id}">`);

    const showImg = document.getElementById('show-img');
    const radioContainer = document.getElementById('radio-inputs-container');
    const thumbContainer = document.getElementById('images-thumbnails');

    // 1. Set the background images dynamically (works for any count: 3, 5, 10...)
    showImg.style.backgroundImage = product.imgs.map(src => `url(${src})`).join(', ');

    // 2. Clear containers and build HTML
    radioContainer.innerHTML = '';
    thumbContainer.innerHTML = '';

    product.imgs.forEach((src, index) => {
      const idNum = index + 1;

      // Create Radio Input
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'images';
      radio.id = `radio-${idNum}`;
      radio.className = 'radio-images';
      if (index === 0) radio.checked = true;

      // This is the "Magic": When clicked, move the background
      radio.addEventListener('change', () => updateSlider(index, product.imgs.length));
      radioContainer.appendChild(radio);

      // Create Thumbnail
      const thumbLabel = document.createElement('label');
      thumbLabel.setAttribute('for', `radio-${idNum}`);
      thumbLabel.innerHTML = `<div id="img-${idNum}"><img src="${src}"></div>`;
      thumbContainer.appendChild(thumbLabel);
    });

    // Initialize the first view
    updateSlider(0, product.imgs.length);
    return thisProductCategorie;

  } catch (error) {
    console.error("Error:", error);
  }
}

function generateStarsHtml(productId, allReviews) {
  const productReviews = allReviews.filter(rev => rev.productId === productId || rev.id === productId);

  if (productReviews.length === 0) {
    return `<div class="more-product-stars-outer"><div class="more-product-stars-inner" style="width: 0%"></div></div>
                <div class="rateMoreProductValue">(0)</div>`;
  }

  const rateSum = productReviews.reduce((acc, curr) => acc + (parseFloat(curr.rate) || 0), 0);
  const rateAv = (rateSum / productReviews.length).toFixed(1);
  const starPercentage = (rateAv / 5) * 100;

  return `
        <div class="more-product-stars-outer">
            <div class="more-product-stars-inner" style="width: ${starPercentage}%"></div>
        </div>
        <div class="rateMoreProductValue">(${rateAv}/5)</div>
    `;
}

//more products section
async function loadMoreProducts(currentCategory) {
  try {
    const [response, sheetResponse] = await Promise.all([
      fetch('../products.json'),
      fetch(GOOGLE_SCRIPT_URL)
    ]);

    const allReviewsData = await sheetResponse.json();

    const allProducts = await response.json();
    const moreProductContainer = document.getElementById('more-products-container');

    // Filter using the category we passed in
    const filteredHtml = allProducts
      .filter(item => item.categories === currentCategory && item.id !== productId)
      .filter(item => item.specialOffer === false) // Added a check to hide the current product from the list
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
                        <div class="more-product-rate">
                            ${generateStarsHtml(item.id, allReviewsData)}
                        </div>
                    </a>
                </div>
            `).join('');

    moreProductContainer.innerHTML += filteredHtml;

    const filtredHtmlSpecialOffers = allProducts
      .filter(item => item.categories === currentCategory && item.id !== productId)
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
                        <div class="offer-discount">${((1 - (item.priceAfter) / (item.priceBefore)) * 100).toFixed(0)}%</div>
                        <div class="more-product-rate">
                            ${generateStarsHtml(item.id, allReviewsData)}
                        </div>
                    </a>
                </div>
                `).join('');
    moreProductContainer.innerHTML += filtredHtmlSpecialOffers;


  } catch (error) {
    console.error("Error loading more products:", error);
  }
}
async function initPage() {
  try {
    // 1. Wait for the main product to load and get its category
    const thisProductCategory = await loadProducts();

    // 2. Now that we HAVE the category, load the "more products" section
    if (thisProductCategory) {
      await loadMoreProducts(thisProductCategory);
    }

    // 3. Load reviews (this was already working but good to keep in order)
    await loadReviews();

  } catch (error) {
    console.error("Initialization failed:", error);
  }
}
// Start everything
initPage();


// bach i7sab qty * price
function updatePrice() {
  let quantity = document.getElementById('quantity-input').value;
  document.getElementById('product-price-after').innerHTML = `<p>${product.priceAfter * quantity}dh</p>`;
  document.getElementById('product-price-before').innerHTML = `<p><strong>${product.priceBefore * quantity}dh</strong></p>`;
}

function updateSlider(activeIndex, total) {
  const showImg = document.getElementById('show-img');

  // 1. Measure the box right now
  const width = showImg.offsetWidth + 1;

  // 2. Force every background image to be EXACTLY the same width as the box
  // Without this, the images stay at their original size while the box resizes
  showImg.style.backgroundSize = `${width}px ${width}px`;

  // 3. Calculate positions (this math now uses the new width)
  let positions = [];
  for (let i = 0; i < total; i++) {
    let x = (i - activeIndex) * width;
    positions.push(`${x}px 0px`);
  }
  showImg.style.backgroundPosition = positions.join(', ');

  // (Keep the thumbnail opacity code here too)
  const allThumbs = document.querySelectorAll('#images-thumbnails img');
  allThumbs.forEach((img, idx) => {
    img.style.opacity = (idx === activeIndex) ? "1" : "0.6";
    img.style.marginTop = (idx === activeIndex) ? "-2px" : "5px";
  });
}

// Ensure it adjusts if user rotates phone or resizes window
window.addEventListener('resize', () => {
  const checked = document.querySelector('input[name="images"]:checked');
  if (checked) {
    const idx = parseInt(checked.id.replace('radio-', '')) - 1;
    const total = document.querySelectorAll('input[name="images"]').length;
    updateSlider(idx, total);
  }
});

loadProducts();

//send form dyal order 3ad thank u page
const form = document.getElementById('contactForm');
const scriptURL = 'https://script.google.com/macros/s/AKfycbz3oLn7vR0eRLiO34k8VyvB6teRUOUSxNkJosUJ9oEiAD0GQdCz659UPL6NMumziJuiyw/exec';
const btn = document.getElementById('order-form-btn');

form.addEventListener('submit', e => {
  e.preventDefault(); // Stop the page from freezing/reloading

  // 1. Visual Feedback: Disable button & change text
  btn.disabled = true;
  btn.innerHTML = "Sending...";
  btn.style.opacity = "0.5";
  btn.style.cursor = "not-allowed";

  //njma3 les info dyal form
  const name = form.querySelector('input[name="name"]').value;
  const city = form.querySelector('input[name="city"]').value;
  const phone = form.querySelector('input[name="phone"]').value;
  const quantity = form.querySelector('input[name="quantity"]').value;


  // 2. Send the data in the background
  fetch(scriptURL, { method: 'POST', body: new FormData(form) })
    .then(response => {
      // 3. Success! Redirect to your thank you page
      window.location.href = `../thank_you_page/thank_you_page.html?id=${productId}&name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}&phone=${phone}&qty=${quantity}&productName=${productName}&productPrice=${productPriceNumber}`;
    })
    .catch(error => {
      // 4. If there's an error, let them try again
      alert("Error! Please try again.");
      btn.disabled = false;
      btn.innerHTML = "Order NOW";
      btn.style.opacity = "1";
      console.error('Error!', error.message);
    });
});