//costumer infos paragraphe
const costumerName = document.getElementById('costumer-name');
const costumerPhone = document.getElementById('costumer-phone');
//costumer infos recap
const recapCostumerName = document.getElementById('recap-costumer-name-span');
const recapCostumerPhone = document.getElementById('recap-costumer-phone-span');
const recapCostumerCity = document.getElementById('recap-costumer-city-span');
//product infos
const recapProductImg = document.getElementById("recap-product-img");
const recapProductName = document.getElementById("recap-product-name-span");
const recapProductQty = document.getElementById("recap-product-quantity-span");
const recapProductPrice = document.getElementById("recap-product-price-span");

//htmls
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
//dyla costumer
const namehtml = urlParams.get('name');
const cityhtml = urlParams.get('city');
const phonehtml = urlParams.get('phone');
//dyal product
const productNamehtml = urlParams.get('productName');
const productQtyhtml = urlParams.get('qty');
const productPricehtml = urlParams.get('productPrice') * productQtyhtml + "dh";
const productImgHtml = `<img src="../photos/products/${productId}/1.png" alt="${productId}">`

//
//dyal paragraphes
costumerName.innerHTML = namehtml;
costumerPhone.innerHTML = phonehtml;
//dyal recap
recapCostumerName.innerHTML = namehtml;
recapCostumerPhone.innerHTML = phonehtml;
recapCostumerCity.innerHTML = cityhtml;

recapProductName.innerHTML = productNamehtml;
recapProductQty.innerHTML = productQtyhtml;
recapProductPrice.innerHTML = productPricehtml;
recapProductImg.innerHTML = productImgHtml;