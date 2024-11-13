/** 
File Name : preLovedHandler
Description : 중고거래 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.08  이유민      Created     
2024.11.08  이유민      Modified    중고거래 물품 조회 API 연동
*/

async function preLoved() {
  const container = document.getElementById("productContainer");
  let contentHTML = "";

  try {
    const products = await axios.get(
      `http://localhost:4000/product?theme=user`
    );

    for (let i = 0; i < products.data.length; i++) {
      if (i % 3 === 0) {
        contentHTML += `<div class="card-contents"`;

        i === 0
          ? (contentHTML += `">`)
          : (contentHTML += ` style="margin-top: 47px">`);
      }

      contentHTML += `
      <a href="/pre-loved/click">
        <div class="card" style="width: 18rem">
          <img
            src="/assets/images/pre-loved-example.svg"
            class="card-img-top"
            alt="..."
            style="height: 214px; object-fit: cover"
          />
          <div class="card-body">
            <h5 class="card-title">${products.data[i].name}</h5>
            <p class="card-text">${products.data[
              i
            ].price.toLocaleString()}원</p>
          </div>
        </div>
      </a>
      `;

      if (i % 3 === 2 || i === products.data.length - 1)
        contentHTML += `</div>`;
    }

    container.innerHTML = contentHTML;
  } catch (err) {
    console.log(err);
  }
}

window.preLoved = preLoved;
window.onload = preLoved;
