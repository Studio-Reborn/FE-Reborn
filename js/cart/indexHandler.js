/** 
File Name : indexlHandler
Description : 내 채팅 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2025.01.16  이유민      Created     
2025.01.16  이유민      Modified    장바구니 API 연동
2025.01.17  이유민      Modified    결제 시 사용될 세션 코드 추가
*/
const cartContainer = document.getElementById("cartContainer");
const totalPriceContainer = document.getElementById("totalPriceContainer");
let totalPrice = 0; // 결제 총 금액
let productArr = [];

window.addEventListener("load", () => {
  // 토큰 없을 경우 버튼 없음
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");
    location.href = "/login";
  }

  readMyCart();
});

async function readMyCart() {
  let cartHTML = "";
  try {
    const items = await axios.get(`${window.API_SERVER_URL}/cart/item`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    for (let i = 0; i < items.data.length; i++) {
      totalPrice +=
        Number(items.data[i].product_price) *
        Number(items.data[i].item_quantity);

      productArr.push({
        product_id: items.data[i].product_id,
        product_cnt: items.data[i].item_quantity,
        product_price: Number(items.data[i].product_price),
        category: items.data[i].market_id === "Reborn" ? "reborn" : "",
      });

      cartHTML += `
        <div class="cart-item" 
        data-product-link="${items.data[i].market_id}/${
        items.data[i].product_id
      }" 
        style="cursor: pointer">
            <img src="${window.API_SERVER_URL}/${
        items.data[i].product_image_url[0]
      }" class="cart-item-image" alt="상품 이미지">
            <div class="cart-item-details">
            <p class="cart-item-title">${
              items.data[i].product_name.length > 25
                ? items.data[i].product_name.slice(0, 25) + "..."
                : items.data[i].product_name
            }</p>
            <p class="cart-item-price">${Number(
              items.data[i].product_price
            ).toLocaleString()}원</p>
            </div>
            <div class="cart-item-controls" style="margin-right: 5px">
                <div class="input-group" style="width: 120px;">
                    <button class="btn btn-outline-secondary" type="button" onclick="decreaseQuantity(event)" data-item-id="${
                      items.data[i].item_id
                    }" 
                    data-item-price="${
                      items.data[i].product_price
                    }" style="font-family: LINESeed-RG">-</button>
                    <input type="text" class="form-control text-center" id="quantityInput" value="${Number(
                      items.data[i].item_quantity
                    )}" style="font-family: LINESeed-RG; outline: none; box-shadow: none;" readonly />
                    <button class="btn btn-outline-secondary" type="button" onclick="increaseQuantity(event)" data-item-id="${
                      items.data[i].item_id
                    }"
                    data-item-price="${
                      items.data[i].product_price
                    }" style="font-family: LINESeed-RG">+</button>
                </div>
            </div>
            <button type="button" class="global-btn" style="width: 57px; background-color: #E35D6A;" onclick="deleteCartItem(${
              items.data[i].item_id
            })">삭제</button>
        </div>
        `;
    }

    cartContainer.innerHTML = cartHTML;
    totalPriceContainer.innerHTML = totalPrice.toLocaleString();
  } catch (err) {
    console.error(err);
  }
}

// 아이템 클릭 이벤트
document.addEventListener("click", (event) => {
  const item = event.target.closest(".cart-item");

  if (
    item &&
    event.target.closest(".cart-item-image, .cart-item-title, .cart-item-price")
  ) {
    const dataLink = item.getAttribute("data-product-link");

    if (dataLink.split("/")[0] === "Reborn")
      location.href = `/reborn-remake/${dataLink.split("/")[1]}`;
    else location.href = `/eco-market/${dataLink}`;
  }
});

// 갯수 증가 감소 관련
function decreaseQuantity(event) {
  const inputElement = event.target.nextElementSibling;
  let currentValue = parseInt(inputElement.value);

  if (currentValue > 1) {
    inputElement.value = currentValue - 1;

    // 데이터 수정
    updateCartItem(event.target.getAttribute("data-item-id"), currentValue - 1);

    // 총 결제금액 수정
    totalPrice -= Number(event.target.getAttribute("data-item-price"));
    totalPriceContainer.innerHTML = totalPrice.toLocaleString();
  }
}

function increaseQuantity(event) {
  const inputElement = event.target.previousElementSibling;
  let currentValue = parseInt(inputElement.value);

  inputElement.value = currentValue + 1;

  // 데이터 수정
  updateCartItem(event.target.getAttribute("data-item-id"), currentValue + 1);

  // 총 결제금액 수정
  totalPrice += Number(event.target.getAttribute("data-item-price"));
  totalPriceContainer.innerHTML = totalPrice.toLocaleString();
}

// 데이터 업데이트
async function updateCartItem(itemId, quantity) {
  await axios.patch(
    `${window.API_SERVER_URL}/cart/item/${itemId}`,
    { quantity },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );
}

// 데이터 삭제
async function deleteCartItem(itemId) {
  const check = confirm("아이템을 장바구니에서 삭제하시겠습니까?");

  if (check) {
    await axios.delete(`${window.API_SERVER_URL}/cart/item/${itemId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    location.reload(true);
  }
}

document
  .getElementById("cartProductPayments")
  .addEventListener("click", async () => {
    await axios.post(`/api/save-session-data`, {
      dataType: "productData",
      data: productArr,
    });

    window.location.href = "/payments";
  });
