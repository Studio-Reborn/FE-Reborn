/** 
File Name : historyHandler
Description : 마이페이지 전체 내역 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.12.03  이유민      Created     
2024.12.03  이유민      Modified    마이페이지 전체 내역 페이지 추가
2024.12.10  이유민      Modified    중고거래 판매 제품 상태 표시 추가
2024.12.18  이유민      Modified    관심 상품 및 관심 마켓 추가
2024.12.29  이유민      Modified    작성한 후기 추가
2024.12.29  이유민      Modified    후기 작성하기 버튼 추가
2024.12.30  이유민      Modified    디버깅 코드 제거
2024.12.30  이유민      Modified    중고거래 구매 내역 추가
*/
window.addEventListener("load", () => {
  const pathSegments = window.location.pathname.split("/");
  mypageHistory(pathSegments[3]);
});

async function mypageHistory(name) {
  let nameHTML = "";
  let cardDataUrl = "";
  let cardDataHTML = "";
  let pointerUrl = "";
  let explain = ["", "", ""];

  switch (name) {
    case "sell-pre-loved":
      nameHTML = "중고거래 판매 내역";
      cardDataUrl = "product/pre-loved/my";
      pointerUrl = "/pre-loved";
      break;
    case "purchase-pre-loved":
      nameHTML = "중고거래 구매 내역";
      cardDataUrl = "product/pre-loved/buy";
      pointerUrl = "/pre-loved";
      break;
    case "purchase-eco-market":
      nameHTML = "에코 마켓 구매 내역";
      cardDataUrl = "billing/purchase/eco-market";
      pointerUrl = "/eco-market";
      break;
    case "purchase-reborn-remake":
      nameHTML = "리본 리메이크 구매 내역";
      cardDataUrl = "billing/purchase/reborn-remake";
      pointerUrl = "/reborn-remake";
      break;
    case "like-product":
      nameHTML = "관심 상품";
      cardDataUrl = "like/product/my";
      pointerUrl = "";
      break;
    case "like-market":
      nameHTML = "관심 에코 마켓";
      cardDataUrl = "like/market/my";
      pointerUrl = "/eco-market";
      break;
    case "write-review":
      nameHTML = "작성한 후기";
      cardDataUrl = "review/my";
      break;
  }

  const cardData = await axios.get(`${window.API_SERVER_URL}/${cardDataUrl}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (name === "like-product" || name === "like-market") {
    // 관심 상품, 관심 마켓 관련
    if (name === "like-product") {
      const likesData = [
        ...cardData.data.preLoved,
        ...cardData.data.ecoMarket,
        ...cardData.data.rebornRemake,
      ].sort((a, b) => {
        return new Date(b.like_created_at) - new Date(a.like_created_at);
      });

      cardDataHTML = likeProduct(likesData);
    } else cardDataHTML = likeMarket(cardData.data);
  } else if (name === "write-review") {
    // 작성한 리뷰
    cardDataHTML = writeReview(cardData.data);
  } else {
    // 그 외
    for (let i = 0; i < cardData.data.length; i++) {
      // 첫 번째 줄
      if (name === "sell-pre-loved") {
        explain[0] =
          Number(cardData.data[i].product_price).toLocaleString() + "원";
      } else if (name === "purchase-eco-market") {
        explain[0] = cardData.data[i].market_name;
      } else if (name === "purchase-pre-loved") {
        explain[0] = `${cardData.data[i].seller_nickname} 님 판매`;
      } else {
        explain[0] = "리본(Reborn)";
      }

      // 두 번째 줄
      if (name === "sell-pre-loved") {
        explain[1] = cardData.data[i].product_created_at.split("T")[0];
      } else if (name === "purchase-pre-loved") {
        explain[1] =
          Number(cardData.data[i].product_price).toLocaleString() + "원 ";
      } else {
        explain[1] =
          Number(cardData.data[i].product_price).toLocaleString() +
          "원 " +
          cardData.data[i].product_quantity +
          "개";
      }

      // 세 번째 줄
      if (name === "purchase-eco-market" || name === "purchase-reborn-remake") {
        const orderTime = cardData.data[i].order_created_at
          .substr(0, 16)
          .split("T");
        explain[2] = orderTime[0] + " " + orderTime[1] + " 결제";

        if (name === "purchase-eco-market")
          explain[2] +=
            cardData.data[i].has_review === 0
              ? `<div>
          <button class="global-btn open-modal-btn"
                  data-product-id="${cardData.data[i].product_id}"
                  data-items-id="${cardData.data[i].items_id}"
                  data-bs-toggle="modal" data-bs-target="#modalContainer" onclick="setModalContent('createReview', this)">후기 작성하기</button>
        </div>`
              : "";
      }

      cardDataHTML += `
    <a href="${pointerUrl}/${
        cardData.data[i].market_id ? `${cardData.data[i].market_id}/` : ""
      }${cardData.data[i].product_id}">
            <div class="card mb-3" style="width: 738px; height: 191px">
                <div class="row g-0" style="height: 100%">
                <div class="col-md-4" style="height: 100%">
                    <img src="${window.API_SERVER_URL}/${
        cardData.data[i].product_image[0]
      }" class="img-fluid rounded-start" alt="제품 이미지" style="height: 100%;  width: auto; object-fit: cover" />`;

      if (
        name == "sell-pre-loved" &&
        cardData.data[i].product_status !== "판매중"
      ) {
        cardDataHTML += `<!-- 반투명 오버레이 -->
              <div style="position: absolute; top: 0; left: 0; width: 190px; height: 100%; 
                    background-color: rgba(255, 255, 255, 0.5);">
                <span style="font-family: LINESeed-BD; font-size: 20px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #E35D6A">
                  ${cardData.data[i].product_status}
                </span>
              </div>`;
      }

      cardDataHTML += `</div>
                <div class="col-md-8" style="left: 0">
                    <div class="card-body">
                    <h5 class="card-title">${cardData.data[i].product_name}</h5>
                    <p class="card-text">
                        <small class="text-body-secondary">
                        ${explain[0]} <br />
                        ${explain[1]} <br />
                        ${explain[2]}
                        </small>
                    </p>
                    </div>
                </div>
                </div>
            </div>
        </a>
    `;
    }
  }

  document.getElementById("purchaseName").innerHTML = nameHTML;
  document.getElementById("cardDataContainer").innerHTML = cardDataHTML;
}

// 후기 작성하기 버튼 클릭 관련
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("open-modal-btn")) {
    event.stopPropagation();
    event.preventDefault();
  }
});

// 관심 상품
function likeProduct(likesData) {
  let resultHtml = "";
  let productLink = ""; // 제품 링크 관련

  for (let i = 0; i < likesData.length; i++) {
    if (i % 3 === 0) {
      resultHtml += `<div class="card-contents"`;

      i !== 0
        ? (resultHtml += ` style="margin-top: 30px">`)
        : (resultHtml += `>`);
    }

    switch (likesData[i].product_type) {
      case "pre-loved":
        productLink = `/pre-loved/${likesData[i].product_id}`;
        break;
      case "eco-market":
        productLink = `/eco-market/${likesData[i].market_id}/${likesData[i].product_id}`;
        break;
      case "reborn-remake":
        productLink = `/reborn-remake/${likesData[i].product_id}`;
        break;
    }

    resultHtml += `
      <a href="${productLink}">
        <div class="card" style="width: 200px; height: 220px">
          <div style="position: relative; width: 200px; height: 130px;">
            <img src="${window.API_SERVER_URL}/${likesData[i].product_image_url[0]}" class="card-img-top" alt="제품이미지" style="width: 100%; height: 100%; object-fit: cover;" />
     `;

    // 어떤 제품인지 표시
    switch (likesData[i].product_type) {
      case "pre-loved":
        resultHtml += `<span class="badge text-bg-primary" style="position: absolute; bottom: 10px; left: 10px; z-index: 10; padding: 5px 10px;">중고거래</span>`;
        break;
      case "eco-market":
        resultHtml += `<span class="badge text-bg-danger" style="position: absolute; bottom: 10px; left: 10px; z-index: 10; padding: 5px 10px;">에코마켓</span>`;
        break;
      case "reborn-remake":
        resultHtml += `<span class="badge text-bg-success" style="position: absolute; bottom: 10px; left: 10px; z-index: 10; padding: 5px 10px;">리메이크</span>`;
        break;
    }

    resultHtml += `
          </div>
          <div class="card-body" style="overflow-y: auto; height: 90px;">
            <h5 class="card-title">${likesData[i].product_name}</h5>
          </div>
        </div>
      </a>
    `;

    // 카드 위치 맞춤
    if (likesData.length % 3 !== 0 && i === likesData.length - 1) {
      if (likesData.length % 3 === 2) {
        resultHtml += `
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
      `;
      }

      if (likesData.length % 3 === 1) {
        resultHtml += `
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
      `;
      }
    }

    if (i % 3 === 2 || i === likesData.length - 1) resultHtml += `</div>`;
  }

  return resultHtml;
}

// 관심 마켓
function likeMarket(likesData) {
  let resultHtml = "";

  for (let i = 0; i < likesData.length; i++) {
    if (i % 3 === 0) {
      resultHtml += `<div class="card-contents"`;

      i !== 0
        ? (resultHtml += ` style="margin-top: 30px">`)
        : (resultHtml += `>`);
    }

    resultHtml += `
      <a href="/eco-market/${likesData[i].market_id}">
        <div class="card" style="width: 200px; height: 220px">
          <img src="${window.API_SERVER_URL}/${likesData[i].market_profile_url}" class="card-img-top" alt="..." style="height: 130px; object-fit: cover" />
          <div class="card-body" style="overflow-y: auto; height: 90px;">
            <h5 class="card-title">${likesData[i].market_name}</h5>
          </div>
        </div>
      </a>
    `;

    // 카드 위치 맞춤
    if (likesData.length % 3 !== 0 && i === likesData.length - 1) {
      if (likesData.length % 3 === 2) {
        resultHtml += `
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
      `;
      }

      if (likesData.length % 3 === 1) {
        resultHtml += `
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
      `;
      }
    }

    if (i % 3 === 2 || i === likesData.length - 1) resultHtml += `</div>`;
  }
  return resultHtml;
}

function writeReview(reviewData) {
  let reviewHTML = "";

  for (let i = 0; i < reviewData.length; i++) {
    reviewHTML += `
        <div
          class="review-card"
          style="padding: 15px; border: 1px solid #ddd; border-radius: 10px; margin-bottom: 15px; overflow: hidden; cursor: pointer; transition: max-height 0.3s ease;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <!-- 프로필 및 닉네임 -->
            <div style="display: flex; align-items: center;">
              <img src="${window.API_SERVER_URL}/${
      reviewData[i].product_image_url[0]
    }" alt="상품 이미지" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
              <div>
                <p style="margin: 0; font-family: LINESeed-BD; font-size: 14px;">${
                  reviewData[i].product_name.length > 30
                    ? `${reviewData[i].product_name.slice(0, 30)}...`
                    : reviewData[i].product_name
                }</p>
                <p style="margin: 0; font-family: LINESeed-RG; font-size: 12px; color: #6c757d;">
                  ${Number(reviewData[i].product_price).toLocaleString()}원 (${
      reviewData[i].market_name.length > 20
        ? `${reviewData[i].market_name.slice(0, 20)}...`
        : reviewData[i].market_name
    } 판매)
                </p>
              </div>
            </div>
            <!-- 수정 및 삭제 -->
            <div id="principalCheck" style="gap: 10px; display: flex;">
              <div id="updateReview" style="color: #6c757d; font-size: 13px; font-family: LINESeed-RG; cursor: pointer;" data-review-id="${
                reviewData[i].review_id
              }"
              data-bs-toggle="modal" data-bs-target="#modalContainer" onclick="setModalContent('updateReview', this)">
                수정
              </div>
              <div id="deleteReview" style="color: #6c757d; font-size: 13px; font-family: LINESeed-RG; cursor: pointer;" data-review-id="${
                reviewData[i].review_id
              }"
               data-bs-toggle="modal" data-bs-target="#modalContainer" onclick="setModalContent('deleteReview', this)">
                삭제
              </div>
            </div>
          </div>
          <!-- 리뷰 내용 -->
          <p
            class="review-content"
            style="margin-top: 10px; font-family: LINESeed-RG; font-size: 15px; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
            ${reviewData[i].review_content}
          </p>
        </div>
      `;
  }

  return reviewHTML;
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

  if (type === "createReview") {
    const productId = element.getAttribute("data-product-id");
    const itemsId = element.getAttribute("data-items-id");

    modalTitle.textContent = "리뷰 등록하기";
    modalBody.innerHTML = `
        <!-- 리뷰 내용 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="reviewContent" placeholder="리뷰 내용" style="height: 500px"></textarea>
          <label for="reviewContent">리뷰 내용</label>
        </div>
          `;

    modalSubmitBtn.innerHTML = "등록";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalSubmitBtn.style.display = "flex";
    modalContainer.setAttribute("data-modal-check", "createReview");
    modalContainer.setAttribute("data-product-id", `${productId}`);
    modalContainer.setAttribute("data-items-id", `${itemsId}`);
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
    modalSubmitBtn.style.display = "flex";
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
    modalSubmitBtn.style.display = "flex";
    modalContainer.setAttribute("data-modal-check", "deleteReview");
    modalContainer.setAttribute("data-review-id", reviewId);
  }
}
