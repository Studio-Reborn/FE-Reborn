/** 
File Name : productHandler
Description : 에코마켓 제품 상세 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.21  이유민      Created     
2024.11.21  이유민      Modified    에코마켓 전체 API 연동
2024.11.22  이유민      Modified    모달 추가
2024.11.22  이유민      Modified    이미지 모달창 추가
2024.11.25  이유민      Modified    하단바 가격 연동
2024.11.25  이유민      Modified    세션에 제품 정보 저장 추가
2024.11.26  이유민      Modified    본인 확인 추가
2024.11.26  이유민      Modified    API 경로 수정
2024.11.28  이유민      Modified    코드 리팩토링
2024.12.02  이유민      Modified    라디오버튼 status 연동
2024.12.04  이유민      Modified    API 경로 수정
2024.12.17  이유민      Modified    제품 id 타입 수정
2024.12.17  이유민      Modified    좋아요 API 연동
2024.12.19  이유민      Modified    후기 API 연동
2024.12.28  이유민      Modified    후기 수정 및 삭제 API 연동
*/
const likeImg = document.getElementById("likeImg");
const likesNumber = document.getElementById("likesNumber");
const reviewContainer = document.getElementById("reviewContainer");
const reviewsNumber = document.getElementById("reviewsNumber");

window.addEventListener("load", () => {
  const pathSegments = window.location.pathname.split("/");
  const market_id = parseInt(pathSegments[2], 10);
  const id = pathSegments[3];

  readProductInfo(market_id, id);
  productLike(id);
  productReview(id);
});

// 제품 데이터 객체로 사용하기 위함
const productData = {
  name: "",
  price: 0,
  detail: "",
  imageId: 0,
  id: 0,
  quantity: 0,
  status: "",
};

// 구매 수량
let totalCnt = 1;

// 상품 이미지 관련
let imageList = [];
let currentIndex = 0;

const mainImage = document.getElementById("marketProductImages");
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

async function readProductInfo(market_id, id) {
  try {
    // 상품 정보
    const info = await axios.get(
      `${window.API_SERVER_URL}/product/eco-market/info/${id}`
    );

    document.getElementById("marketName").innerHTML = info.data.market_name;
    document.getElementById(
      "ecoMarketLink"
    ).href = `/eco-market/${info.data.market_id}`;

    document.getElementById(
      "marketProfile"
    ).src = `${window.API_SERVER_URL}/${info.data.market_profile_url}`;

    document.getElementById("marketProductName").innerHTML = info.data.name;
    document.getElementById("marketProductPrice").innerHTML = `${Number(
      info.data.price
    ).toLocaleString()}원`;
    document.getElementById("marketProductDetail").innerHTML = info.data.detail;

    imageList = info.data.product_image_url;
    document.getElementById(
      "marketProductImages"
    ).src = `${window.API_SERVER_URL}/${imageList[0]}`;

    // 객체에 값 저장
    productData.name = info.data.name;
    productData.price = info.data.price;
    productData.detail = info.data.detail;
    productData.imageId = info.data.product_image_id;
    productData.id = info.data.id;
    productData.quantity = info.data.quantity;
    productData.status = info.data.status;

    // 하단바 가격
    document.getElementById("totalAmount").innerHTML = `총 금액 ${Number(
      info.data.price * totalCnt
    ).toLocaleString()}원`;

    // 로그인 상태일 때, 제품 판매자와 본인 확인하기
    if (localStorage.getItem("access_token")) {
      // 본인 정보 가져오기
      const check = await axios.get(`${window.API_SERVER_URL}/users/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // 판매자 본인일 때
      if (info.data.market_user_id === check.data.id) {
        document.getElementById("principalCheck").style.display = "flex";
      }
    }

    return;
  } catch (err) {
    console.error(err);
  }
}

// 좋아요
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
          }</p>
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
    console.log(reviews.data);

    reviewContainer.innerHTML = reviewHTML;
    reviewsNumber.innerHTML = Number(reviews.data.length).toLocaleString();
  } catch (err) {
    console.error(err);
  }
}

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

// 하단바
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
      },
    });

    window.location.href = "/payments";
  } catch (err) {
    console.error(err);
  }
});

// 모달 함수
async function setModalContent(type, element) {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");

    location.href = "/login";
  }

  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.querySelector(".modal-body");
  const modalContainer = document.getElementById("modalContainer");
  const modalSubmitBtn = document.getElementById("modalSubmitBtn");

  if (type === "updateMarketProduct") {
    modalTitle.textContent = "마켓 물건 정보 수정하기";
    modalBody.innerHTML = `
        <!-- 파일 선택-->
        <div class="input-group mb-3" style="width: 586px">
          <input type="file" class="form-control" id="marketProductImagesNew" multiple>
          <label class="input-group-text" for="marketProductImagesNew">Upload</label>
          <span id="marketProductImagesIdNew" style="display: none" data-value="${productData.imageId}"></span>
        </div>

        <!-- 제품명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="marketProductNameNew" placeholder="제품명" value="${productData.name}">
          <label for="marketProductNew">제품명</label>
        </div>

        <!-- 제품 가격 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="number" class="form-control" id="marketProductPriceNew" placeholder="제품가격" value="${productData.price}">
          <label for="marketProductPriceNew">제품 가격</label>
        </div>

        <!-- 제품 설명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="marketProductDetailNew" placeholder="제품 설명" style="height: 150px">${productData.detail}</textarea>
          <label for="marketProductDetailNew">제품 설명</label>
        </div>

        <!-- 제품 수량 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="number" class="form-control" id="marketProductQuantityNew" placeholder="제품 수량" value="${productData.quantity}">
          <label for="marketProductQuantityNew">제품 수량</label>
        </div>

        <!-- 판매 상태 -->
        <label for="productStatusGroup" class="form-label" style="font-family: LINESeed-RG">판매 상태 선택</label>
        <div id="productStatusGroup" class="form-check-group d-flex align-items-center mb-3" style="gap: 20px; width: 586px; font-family: LINESeed-RG">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="productStatus" id="statusOnSale" value="판매중">
            <label class="form-check-label" for="statusOnSale">
              판매중
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="productStatus" id="statusOut" value="품절">
            <label class="form-check-label" for="statusOut">
              품절
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="productStatus" id="statusStop" value="판매중단">
            <label class="form-check-label" for="statusStop">
              판매중단
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="productStatus" id="statusHidden" value="숨김">
            <label class="form-check-label" for="statusHidden">
              숨김
            </label>
          </div>
        </div>
          `;
    document.getElementById("marketProductDetailNew").innerHTML =
      productData.detail.replace(/<br>/g, "\n");
    modalSubmitBtn.innerHTML = "수정";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalContainer.setAttribute("data-modal-check", "updateMarketProduct");

    // 라디오버튼 checked 관련
    document.querySelector(
      `input[name="productStatus"][value="${productData.status}"]`
    ).checked = true;

    // 물건 이미지 업로드 관련
    document
      .getElementById("marketProductImagesNew")
      .addEventListener("change", async (event) => {
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
            .getElementById("marketProductImagesIdNew")
            .setAttribute("data-value", result.id);

          return;
        } catch (err) {
          console.error(err);
        }
      });
  } else if (type === "deleteMarketProduct") {
    modalTitle.textContent = "마켓 물건 삭제하기";
    modalBody.innerHTML = `
      <div style="font-family: LINESeed-BD; font-size: 30px; text-align: center">물건을 삭제하시겠습니까?</div>
      `;
    modalSubmitBtn.innerHTML = "삭제";
    modalSubmitBtn.style.backgroundColor = "#E35D6A";
    modalContainer.setAttribute("data-modal-check", "deleteMarketProduct");
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
