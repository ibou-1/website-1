//rating system

// 1. YOUR UNIQUE LINK FROM GOOGLE
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGO7efu1Qi0f5ZWlgSja3Dkz7zoeJT0XJOx3J8zt9T4EXUiuWlOEinfa_wZt76Pdrx6w/exec';

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

    for( let i = 0; i < allReviewsDataLength; i++){
      rateSum += allReviewsData[i].rate;
    };
    let rateAv = (rateSum / allReviewsDataLength).toFixed(1);

    const productRateContainer = document.getElementById('product-rate-stars')
    let starPercentageProduct;

    if (allReviewsDataLength === 0){
      rateAv = "(0)";
      starPercentageProduct = 0;
    }else{
      starPercentageProduct = (rateAv / 5) * 100;
      rateAv = "(" + rateAv + "/5)";
    }

    productRateContainer.innerHTML += `
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

async function loadProducts() {
    try {
        const response = await fetch('../products.json');
        const products = await response.json();
        const product = products.find(p => p.id === productId);

        if (!product) {
            document.body.innerHTML = "<h1>Product not found!</h1>";
            return;
        }

        // Fill Text Info
        document.getElementById('product-name').innerText = product.name;
        document.getElementById('product-price').innerHTML = `<p>${product.priceBefore}dh</p>`;
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

    } catch (error) {
        console.error("Error:", error);
    }
}

function updateSlider(activeIndex, total) {
    const showImg = document.getElementById('show-img');
    
    // 1. Measure the box right now
    const width = showImg.offsetWidth; 
    
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