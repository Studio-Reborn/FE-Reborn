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
2024.12.04  이유민      Modified    API 경로 수정
2024.12.18  이유민      Modified    좋아요 API 연동
2024.12.30  이유민      Modified    예외 처리 코드 수정
2025.01.07  이유민      Modified    후기 API 연동
2025.01.10  이유민      Modified    후기 UI 수정
2025.01.16  이유민      Modified    장바구니 API 연동
2025.01.17  이유민      Modified    결제 코드 리팩토링
*/
const productData = {
  name: "",
  price: 0,
  detail: "",
  matter: "",
  imageId: 0,
  id: 0,
};

const id = window.location.pathname.split("/").pop();

window.addEventListener("load", () => {
  readProductData(id);
  productLike(id);
  productReview(id);
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
      const response = await axios.get(`${window.API_SERVER_URL}/users/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.data.role === "admin")
        document.getElementById("remakePrincipalCheck").style.display = "flex";
    }

    return;
  } catch (err) {
    console.error(err);
  }
}

// 좋아요 관련
async function productLike(id) {
  try {
    if (localStorage.getItem("access_token")) {
      // 좋아요 버튼 관련
      const likes = await axios.get(
        `${window.API_SERVER_URL}/like/product/user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!likes.data) {
        likeImg.src = `${window.location.origin}/assets/icons/heart.svg`;
      } else {
        likeImg.src = `${window.location.origin}/assets/icons/heart-fill.svg`;
      }

      likeImg.addEventListener("click", async () => {
        await axios.post(
          `${window.API_SERVER_URL}/like/product`,
          { product_id: id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        location.reload(true);
      });
    }

    // 좋아요 수 관련
    const likesAll = await axios.get(
      `${window.API_SERVER_URL}/like/product/all/${id}`
    );

    likesNumber.innerHTML = `${Number(likesAll.data.length).toLocaleString()}`;
  } catch (err) {
    console.error(err);
  }
}

// 후기
async function productReview(id) {
  let reviewHTML = "";
  let check = "";
  try {
    // 로그인 상태일 때, 제품 판매자와 본인 확인하기
    if (localStorage.getItem("access_token")) {
      // 본인 정보 가져오기
      check = await axios.get(`${window.API_SERVER_URL}/users/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    }

    const reviews = await axios.get(
      `${window.API_SERVER_URL}/review/product/${id}`
    );

    if (reviews.data.length === 0) {
      document.getElementById("nullReview").style.display = "block";
    } else {
      for (let i = 0; i < reviews.data.length; i++) {
        reviewHTML += `
  <div 
    class="review-card" 
    style="padding: 15px; border: 1px solid #ddd; border-radius: 10px; margin-bottom: 15px; overflow: hidden; cursor: pointer; transition: max-height 0.3s ease;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <!-- 프로필 및 닉네임 -->
      <div style="display: flex; align-items: center;">
        <img src="${window.API_SERVER_URL}/${
          reviews.data[i].user_profile_url
        }" alt="프로필 이미지" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
        <div>
          <p style="margin: 0; font-family: LINESeed-BD; font-size: 14px;">${
            reviews.data[i].user_nickname
          }<span style="font-family: LINESeed-RG">님</span></p>
          <p style="margin: 0; font-family: LINESeed-RG; font-size: 12px; color: #6c757d;">
            ${reviews.data[i].review_created_at.split("T")[0]}
            ${
              reviews.data[i].review_created_at !==
              reviews.data[i].review_updated_at
                ? `<span>수정됨</span>`
                : ""
            }
          </p>
        </div>
      </div>

      <!-- 수정 및 삭제 -->
      ${
        localStorage.getItem("access_token") &&
        reviews.data[i].user_id === check.data.id
          ? `<div id="principalCheck" style="gap: 10px; display: flex;">
              <div id="updateReview" style="color: #6c757d; font-size: 13px; font-family: LINESeed-RG; cursor: pointer;" data-review-id="${reviews.data[i].review_id}"
              data-bs-toggle="modal" data-bs-target="#modalContainer" onclick="setModalContent('updateReview', this)">
                수정
              </div>
              <div id="deleteReview" style="color: #6c757d; font-size: 13px; font-family: LINESeed-RG; cursor: pointer;" data-review-id="${reviews.data[i].review_id}"
               data-bs-toggle="modal" data-bs-target="#modalContainer" onclick="setModalContent('deleteReview', this)">
                삭제
              </div>
            </div>`
          : ""
      }
    </div>

    <!-- 리뷰 내용 -->
    <p 
      class="review-content" 
      style="margin-top: 10px; font-family: LINESeed-RG; font-size: 15px; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
      ${reviews.data[i].review_content}
    </p>
  </div>
`;
      }
    }

    reviewContainer.innerHTML = reviewHTML;
    reviewsNumber.innerHTML = Number(reviews.data.length).toLocaleString();
  } catch (err) {
    console.error(err);
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

// 장바구니 버튼
document.getElementById("cartBtn").addEventListener("click", async () => {
  await axios.post(
    `${window.API_SERVER_URL}/cart`,
    {
      product_id: id,
      quantity: Number(document.getElementById("quantityInput").value),
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );
  alert("장바구니에 추가되었습니다.");
});

// 결제 버튼
document.getElementById("orderBtn").addEventListener("click", async () => {
  try {
    await axios.post(`/api/save-session-data`, {
      dataType: "productData",
      data: [
        {
          product_id: productData.id,
          product_cnt: totalCnt,
          product_price: productData.price,
          category: "reborn",
        },
      ],
    });

    window.location.href = "/payments";
  } catch (err) {
    console.error(err);
  }
});

// 카드 클릭 이벤트
document.addEventListener("click", (event) => {
  const card = event.target.closest(".review-card");
  if (card && !event.target.closest("#updateReview, #deleteReview")) {
    toggleCard(card);
  }
});

// 리뷰 토글 함수
function toggleCard(card) {
  const content = card.querySelector(".review-content");

  if (card.style.maxHeight === "none") {
    // 줄이기 상태
    content.style.display = "-webkit-box";
    content.style.webkitLineClamp = "5";
    card.style.maxHeight = "200px";
  } else {
    // 펼치기 상태
    content.style.display = "block";
    card.style.maxHeight = "none";
  }
}

// 모달
async function setModalContent(type, element) {
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
  } else if (type === "updateReview") {
    const reviewId = element.getAttribute("data-review-id");

    const response = await axios.get(
      `${window.API_SERVER_URL}/review/info/${reviewId}`
    );

    modalTitle.textContent = "리뷰 수정하기";
    modalBody.innerHTML = `
        <!-- 리뷰 내용 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="reviewContentNew" placeholder="리뷰 내용" style="height: 500px"></textarea>
          <label for="reviewContentNew">리뷰 내용</label>
        </div>
          `;

    document.getElementById("reviewContentNew").innerHTML =
      response.data.content.replace(/<br>/g, "\n");

    modalSubmitBtn.innerHTML = "수정";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalContainer.setAttribute("data-modal-check", "updateReview");
    modalContainer.setAttribute("data-review-id", reviewId);
  } else if (type === "deleteReview") {
    const reviewId = element.getAttribute("data-review-id");

    modalTitle.textContent = "리뷰 삭제하기";
    modalBody.innerHTML = `
      <div style="font-family: LINESeed-BD; font-size: 30px; text-align: center">리뷰를 삭제하시겠습니까?</div>
      `;
    modalSubmitBtn.innerHTML = "삭제";
    modalSubmitBtn.style.backgroundColor = "#E35D6A";
    modalContainer.setAttribute("data-modal-check", "deleteReview");
    modalContainer.setAttribute("data-review-id", reviewId);
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
