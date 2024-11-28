/** 
File Name : rebornRemakeClickHandler
Description : 리본 리메이크 제품 상세 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.19  이유민      Created     
2024.11.19  이유민      Modified    리본 리메이크 API 연동
2024.11.22  이유민      Modified    상품 이미지 API 연동
2024.11.28  이유민      Modified    결제 API 연동
*/
const productData = {
  name: "",
  price: 0,
  detail: "",
  matter: "",
  imageId: 0,
  id: 0,
};

window.addEventListener("load", () => {
  const id = window.location.pathname.split("/").pop();

  readProductData(id);
});

// 상품 이미지 관련
let imageList = [];
let currentIndex = 0;

const mainImage = document.getElementById("mainRemakeProductImage");
const caretLeftBtn = document.getElementById("caretLeftBtn");
const caretRightBtn = document.getElementById("caretRightBtn");

caretLeftBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
  mainImage.src = `${window.API_SERVER_URL}/${imageList[currentIndex]}`;
});

caretRightBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % imageList.length;
  mainImage.src = `${window.API_SERVER_URL}/${imageList[currentIndex]}`;
});

// 정보
async function readProductData(id) {
  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const productDetail = document.getElementById("productDetail");
  try {
    // 제품 정보 가져오기
    const product = await axios.get(
      `${window.API_SERVER_URL}/remake/product/${id}`
    );

    imageList = product.data.product_image_url;
    mainImage.src = `${window.API_SERVER_URL}/${imageList[0]}`;

    productName.innerHTML = product.data.name;
    productPrice.innerHTML = `${Number(product.data.price).toLocaleString()}원`;
    productDetail.innerHTML = product.data.detail;

    // 객체에 값 넣기
    productData.name = product.data.name;
    productData.price = product.data.price;
    productData.detail = product.data.detail;
    productData.matter = product.data.matter;
    productData.id = product.data.id;
    productData.imageId = product.data.product_image_id;

    // 결제바 관련
    document.getElementById("totalAmount").innerHTML = `총 금액 ${Number(
      product.data.price * totalCnt
    ).toLocaleString()}원`;

    // 관리자인지 확인
    if (localStorage.getItem("access_token")) {
      const response = await axios.get(`${window.API_SERVER_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // 관리자일 때만 제품 생성 버튼 생김
      if (response.data.id === 1)
        document.getElementById("remakePrincipalCheck").style.display = "flex";
    }

    return;
  } catch (err) {
    console.log(err);
  }
}

// 결제 하단바 관련
let totalCnt = 1; // 구매 수량

function decreaseQuantity() {
  const quantityInput = document.getElementById("quantityInput");
  let quantity = parseInt(quantityInput.value, 10);
  if (quantity > 1) {
    quantity--;
    quantityInput.value = quantity;

    // 하단바 가격
    totalCnt--;
    document.getElementById("totalAmount").innerHTML = `총 금액 ${Number(
      productData.price * totalCnt
    ).toLocaleString()}원`;
  }
}

function increaseQuantity() {
  const quantityInput = document.getElementById("quantityInput");
  let quantity = parseInt(quantityInput.value, 10);
  quantity++;
  quantityInput.value = quantity;

  // 하단바 가격
  totalCnt++;
  document.getElementById("totalAmount").innerHTML = `총 금액 ${Number(
    productData.price * totalCnt
  ).toLocaleString()}원`;
}

document.getElementById("orderBtn").addEventListener("click", async () => {
  try {
    await axios.post(`/api/save-session-data`, {
      dataType: "productData",
      data: {
        product_id: productData.id,
        product_cnt: totalCnt,
        product_price: productData.price,
        category: "reborn",
      },
    });

    window.location.href = "/payments";
  } catch (err) {
    console.error(err);
  }
});

// 모달
function setModalContent(type) {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");

    location.href = "/login";
  }

  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.querySelector(".modal-body");
  const modalContainer = document.getElementById("modalContainer");
  const modalSubmitBtn = document.getElementById("modalSubmitBtn");

  if (type === "updateRemakeProduct") {
    modalTitle.textContent = "리본 리메이크 제품 수정하기";
    modalBody.innerHTML = `
       <!-- 파일 선택-->
        <div class="input-group mb-3" style="width: 586px">
          <input type="file" class="form-control" id="remakeProductImagesNew" onchange="productImagesUpload(event)" multiple>
          <label class="input-group-text" for="remakeProductImagesNew">Upload</label>
          <span id="remakeProductImagesIdNew" style="display: none" data-value="${productData.imageId}"></span>
        </div>

        <!-- 제품명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="remakeProductNameNew" placeholder="제품명" value="${productData.name}">
          <label for="remakeProductNameNew">제품명</label>
        </div>

        <!-- 제품 재료 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="remakeProductMatterNew" placeholder="제품 재료" value="${productData.matter}">
          <label for="remakeProductMatterNew">제품 재료</label>
        </div>

        <!-- 제품 가격 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="number" class="form-control" id="remakeProductPriceNew" placeholder="제품가격" value="${productData.price}">
          <label for="remakeProductPriceNew">제품 가격</label>
        </div>

        <!-- 제품 설명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="remakeProductDetailNew" placeholder="제품 설명" style="height: 150px"></textarea>
          <label for="remakeProductDetailNew">제품 설명</label>
        </div>
        `;
    document.getElementById("remakeProductDetailNew").innerHTML =
      productData.detail.replace(/<br>/g, "\n");
    modalSubmitBtn.innerHTML = "수정";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalContainer.setAttribute("data-modal-check", "updateRemakeProduct");
  } else if (type === "deleteRemakeProduct") {
    modalTitle.textContent = "리본 리메이크 제품 삭제하기";
    modalBody.innerHTML = `
        <div style="font-family: LINESeed-BD; font-size: 30px; text-align: center">물건을 삭제하시겠습니까?</div>
        `;
    modalSubmitBtn.innerHTML = "삭제";
    modalSubmitBtn.style.backgroundColor = "#E35D6A";
    modalContainer.setAttribute("data-modal-check", "deleteRemakeProduct");
  }
}

// 물품 이미지 업로드
async function productImagesUpload(event) {
  const files = event.target.files;

  if (files.length === 0) {
    alert("파일을 선택해주세요.");
    return;
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  try {
    const response = await fetch(
      `${window.API_SERVER_URL}/upload/product-image`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      alert("파일 업로드에 오류가 발생했습니다.");
      return;
    }

    const result = await response.json();

    document
      .getElementById("remakeProductImagesIdNew")
      .setAttribute("data-value", result.id);
    productData.imageId = result.id;
  } catch (err) {
    console.error("파일 업로드 중 오류 발생:", err);
  }
}

// 이미지 클릭 시 크게 보이도록 하는 함수
function openModal(imageSrc) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  // 모달 이미지 src 설정
  modalImage.src = imageSrc;

  // 모달 보이기
  modal.style.display = "flex";
}

// 이미지 모달 닫기
function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
}

// ESC 키로 이미지 모달 닫기
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});
