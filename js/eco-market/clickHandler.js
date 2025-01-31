/** 
File Name : clickHandler
Description : 에코마켓 마켓 정보 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.21  이유민      Created     
2024.11.21  이유민      Modified    에코마켓 전체 API 연동
2024.11.22  이유민      Modified    모달 추가
2024.11.26  이유민      Modified    API 경로 수정
2024.12.04  이유민      Modified    API 경로 수정
2024.12.17  이유민      Modified    좋아요 API 연동
2024.12.30  이유민      Modified    예외 처리 코드 수정
2025.01.05  이유민      Modified    검색 및 정렬 API 연동
2025.01.07  이유민      Modified    마켓별 후기 조회 API 연동
2025.01.08  이유민      Modified    후기 수 API 연동
2025.01.10  이유민      Modified    후기 UI 수정
2025.01.18  이유민      Modified    API 경로 수정
2025.01.19  이유민      Modified    좋아요 코드 리팩토링
2025.01.21  이유민      Modified    UI 수정
2025.01.23  이유민      Modified    무한 스크롤 추가
2025.01.31  이유민      Modified    이미지 경로 수정
*/
const id = window.location.pathname.split("/").pop();

const marketLikeNum = document.getElementById("marketLikeNum");
const likeImg = document.getElementById("likeImg");

let searchValue = undefined;
let sortValue = document.getElementById("marketProductSort").value;

let debounceTimeout;
const debounceDelay = 500;

let currentPage = 1; // 현재 페이지
let isLoading = false; // 데이터 로드 상태
let hasMoreData = true; // 추가 데이터 여부

let profileImageId = 0;

const container = document.getElementById("ecoMarketProductContainer");

window.addEventListener("load", async () => {
  await Promise.all([
    readMarketInfo(id),
    readMarketProducts(id, searchValue, sortValue, currentPage),
    marketLike(id),
    marketReviewAll(id),
  ]);
});

// 검색값 입력 시
async function logInputValue() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    searchValue = document.getElementById("marketProductSearch").value;
    refreshProducts(searchValue, sortValue);
  }, debounceDelay);
}

// 정렬 변경 시
document
  .getElementById("marketProductSort")
  .addEventListener("change", async (event) => {
    sortValue = event.target.value;
    await refreshProducts(searchValue, sortValue);
  });

// 무한 스크롤 관련
window.addEventListener("scroll", async () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (
    scrollTop + clientHeight >= scrollHeight - 100 &&
    hasMoreData &&
    !isLoading
  ) {
    isLoading = true; // 로딩 시작
    currentPage++; // 다음 페이지 증가
    await readMarketProducts(id, searchValue, sortValue, currentPage);
    isLoading = false; // 로딩 완료
  }
});

// 검색, 정렬, 판매중 사용 시 html 코드 리셋
async function refreshProducts(searchValue, sortValue) {
  if (isLoading) return;

  currentPage = 1; // 페이지 초기화
  hasMoreData = true; // 추가 데이터 플래그 초기화
  isLoading = true; // 로딩 상태 초기화
  container.innerHTML = ""; // 기존 컨텐츠 비우기

  window.scrollTo({
    top: 0,
    behavior: "smooth", // 부드럽게 스크롤
  });

  await readMarketProducts(id, searchValue, sortValue, currentPage); // 새 데이터 로드

  isLoading = false; // 로딩 완료
}

async function readMarketInfo(id) {
  try {
    // 마켓 정보 관련
    const info = await axios.get(`${window.API_SERVER_URL}/market/info/${id}`);

    document.getElementById("marketName").innerHTML = info.data.market_name;
    document.getElementById("marketDetail").innerHTML = info.data.market_detail;

    // 프로필 이미지 관련
    const profile = await axios.get(
      `${window.API_SERVER_URL}/profile/${info.data.profile_image_id}`
    );

    document.getElementById(
      "marketProfileImageBig"
    ).src = `${window.IMAGE_SERVER_URL}${profile.data.url}`;
    document.getElementById(
      "marketProfileImageSmall"
    ).src = `${window.IMAGE_SERVER_URL}${profile.data.url}`;

    profileImageId = profile.data.id;

    // 로그인 상태일 때, 마켓주인과 본인 확인하기
    if (localStorage.getItem("access_token")) {
      const check = await axios.get(`${window.API_SERVER_URL}/users/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // 본인이 마켓 주인일 경우 수정, 삭제 글자 표시
      if (info.data.user_id === check.data.id)
        document.getElementById("principalCheck").style.display = "flex";
    }
  } catch (err) {
    console.error(err);
  }
}

async function readMarketProducts(id, searchValue, sortValue, page) {
  if (!hasMoreData) return;

  isLoading = true;

  let containerHTML = "";
  let marketProductAllCnt = 0;

  try {
    // 마켓의 판매 제품
    const products = !searchValue
      ? await axios.get(
          `${window.API_SERVER_URL}/product/eco-market/market/${id}?sort=${sortValue}&page=${page}`
        )
      : await axios.get(
          `${window.API_SERVER_URL}/product/eco-market/market/${id}?sort=${sortValue}&search=${searchValue}&page=${page}`
        );

    if (products.data.data.length === 0) {
      hasMoreData = false; // 더 이상 데이터가 없으면 플래그 변경
      isLoading = false;
      return;
    }

    for (let i = 0; i < products.data.data.length; i++) {
      marketProductAllCnt += Number(products.data.data[i].product_review_cnt);
      // html
      if (i % 3 === 0) {
        containerHTML += `<div class="card-contents"`;

        currentPage === 1 && i === 0
          ? (containerHTML += `">`)
          : (containerHTML += ` style="margin-top: 47px">`);
      }

      containerHTML += `
        <a href="/eco-market/${id}/${products.data.data[i].id}">
          <div class="card" style="width: 18rem">
            <img src="${window.IMAGE_SERVER_URL}${
        products.data.data[i].product_image_url[0]
      }" class="card-img-top" alt="..." style="height: 214px; object-fit: cover" />
            <div class="card-body">
              <h5 class="card-title">${
                products.data.data[i].name.length > 12
                  ? products.data.data[i].name.slice(0, 12) + "..."
                  : products.data.data[i].name
              }</h5>
              <p class="card-text">${Number(
                products.data.data[i].price
              ).toLocaleString()}원</p>
              <p class="card-text" style="color: #6c757d; font-size: 12px">후기 ${Number(
                products.data.data[i].product_review_cnt
              ).toLocaleString()} 좋아요 ${Number(
        products.data.data[i].product_like_cnt
      ).toLocaleString()}</p>
            </div>
          </div>
        </a>
      `;

      if (
        products.data.data.length % 3 !== 0 &&
        i === products.data.data.length - 1
      ) {
        containerHTML += `<div class="card" style="width: 18rem; visibility: hidden;"></div>`;

        if (products.data.data.length % 3 === 1)
          containerHTML += `<div class="card" style="width: 18rem; visibility: hidden;"></div>`;
      }

      if (i % 3 === 2) containerHTML += `</div>`;
    }

    container.innerHTML += containerHTML;
    isLoading = false; // 로드 상태 비활성화
    // document.getElementById("marketReviewNum").innerHTML =
    //   marketProductAllCnt.toLocaleString();
  } catch (err) {
    console.error(err);
  }
}

async function marketLike(id) {
  try {
    if (localStorage.getItem("access_token")) {
      // 좋아요 버튼 관련
      const likes = await axios.get(
        `${window.API_SERVER_URL}/like/market/user/${id}`,
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
    }

    // 좋아요 수 관련
    const likesAll = await axios.get(
      `${window.API_SERVER_URL}/like/market/all/${id}`
    );

    marketLikeNum.innerHTML = `${Number(
      likesAll.data.length
    ).toLocaleString()}`;
  } catch (err) {
    console.error(err);
  }
}

async function likeImageClick() {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");
    location.href = "/login";
    return;
  }

  await axios.post(
    `${window.API_SERVER_URL}/like/market`,
    { market_id: id },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );

  location.reload(true);
}

// 마켓 전체 후기
async function marketReviewAll(id) {
  let reviewHTML = "";
  let check = "";
  const reviewContainer = document.getElementById("reviewContainer");
  try {
    const reviews = await axios.get(
      `${window.API_SERVER_URL}/review/market/${id}`
    );

    // 로그인 상태일 때, 제품 판매자와 본인 확인하기
    if (localStorage.getItem("access_token")) {
      // 본인 정보 가져오기
      check = await axios.get(`${window.API_SERVER_URL}/users/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    }

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
      <div id="productProfile" style="display: flex; align-items: center;" data-location-link="${id}/${
          reviews.data[i].product_id
        }">
        <img src="${window.API_SERVER_URL}/${
          reviews.data[i].product_image_url[0]
        }" alt="프로필 이미지" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
        <div>
          <p style="margin: 0; font-family: LINESeed-BD; font-size: 14px;">${
            reviews.data[i].product_name.length >= 20
              ? reviews.data[i].product_name.slice(0, 20) + "..."
              : reviews.data[i].product_name
          }</p>
          <p style="margin: 0; font-family: LINESeed-RG; font-size: 12px; color: #6c757d;">
          <span style="font-family: LINESeed-BD">${
            reviews.data[i].user_nickname.length >= 15
              ? reviews.data[i].user_nickname.slice(0, 15) + "..."
              : reviews.data[i].user_nickname
          }</span>님 작성 | 
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
  } catch (err) {
    console.error(err);
  }
}

// 카드 클릭 이벤트
document.addEventListener("click", (event) => {
  const card = event.target.closest(".review-card");
  if (
    card &&
    !event.target.closest("#updateReview, #deleteReview, #productProfile")
  ) {
    toggleCard(card);
  }

  if (card && event.target.closest("#productProfile")) {
    const dataLink = event.target
      .closest("#productProfile")
      .getAttribute("data-location-link");

    location.href = `/eco-market/${dataLink}`;
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

// 탭 관련
function showTab(tabId) {
  const tabs = document.querySelectorAll(".tabContent");
  tabs.forEach((tab) => (tab.style.display = "none")); // 모든 탭 숨기기

  document.getElementById(tabId).style.display = "block"; // 선택한 탭 보여주기

  // 선택한 탭 강조 스타일 적용
  const tabButtons = document.querySelectorAll(".tabButtons li");
  tabButtons.forEach((button) => {
    button.style.backgroundColor = "#D1E7DD"; // 비활성화된 탭 색상
    button.style.borderBottom = "1px solid #D1E7DD"; // 경계 강조
  });
  document.getElementById(tabId + "Button").style.backgroundColor = "#fff"; // 활성화된 탭 색상
  document.getElementById(tabId + "Button").style.borderBottom = "none"; // 활성화된 탭 경계 제거
}

// 기본적으로 첫 번째 탭 활성화
showTab("productTab");

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

  if (type === "createMarketProduct") {
    // 마켓 물건 등록
    modalTitle.textContent = "마켓 물건 등록하기";
    modalBody.innerHTML = `
        <!-- 파일 선택-->
        <div class="input-group mb-3" style="width: 586px">
          <input type="file" class="form-control" id="marketProductImages" multiple>
          <label class="input-group-text" for="marketProductImages">Upload</label>
          <span id="marketProductImagesId" style="display: none" data-value=""></span>
        </div>

        <!-- 제품명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="marketProductName" placeholder="제품명">
          <label for="marketProduct">제품명</label>
        </div>

        <!-- 제품 가격 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="number" class="form-control" id="marketProductPrice" placeholder="제품가격">
          <label for="marketProductPrice">제품 가격</label>
        </div>

        <!-- 제품 설명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="marketProductDetail" placeholder="제품 설명" style="height: 150px"></textarea>
          <label for="marketProductDetail">제품 설명</label>
        </div>

        <!-- 제품 수량 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="number" class="form-control" id="marketProductQuantity" placeholder="제품 수량" value="10000">
          <label for="marketProductQuantity">제품 수량</label>
        </div>
        `;
    modalSubmitBtn.innerHTML = "등록";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalContainer.setAttribute("data-modal-check", "createMarketProduct");

    // 물건 이미지 업로드 관련
    document
      .getElementById("marketProductImages")
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
            .getElementById("marketProductImagesId")
            .setAttribute("data-value", result.id);

          return;
        } catch (err) {
          console.error(err);
        }
      });
  } else if (type === "updateMarket") {
    // 마켓 정보 수정
    modalTitle.textContent = "마켓 정보 수정하기";
    modalBody.innerHTML = `
        <!-- 파일 선택-->
        <div class="input-group mb-3" style="width: 586px">
          <input type="file" class="form-control" id="ecoMarketProfileImageNew" onchange="uploadProfileImage()">
          <label class="input-group-text" for="ecoMarketProfileImageNew">Upload</label>
          <span id="ecoMarketProfileImageNewId" style="display: none" data-value="${profileImageId}"></span>
        </div>

        <!-- 마켓명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="ecoMarketNameNew" placeholder="마켓명" value="${
            document.getElementById("marketName").innerHTML
          }">
          <label for="ecoMarketNameNew">마켓명</label>
        </div>

        <!-- 마켓 설명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="ecoMarketDetailNew" placeholder="마켓 설명" style="height: 150px">${document
            .getElementById("marketDetail")
            .innerHTML.replace(/<br>/g, "\n")}</textarea>
          <label for="ecoMarketDetailNew">마켓 설명</label>
        </div>
        `;
    modalSubmitBtn.innerHTML = "수정";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalContainer.setAttribute("data-modal-check", "updateEcoMarketInfo");
  } else if (type === "deleteMarket") {
    modalTitle.textContent = "마켓 삭제 요청하기";
    modalBody.innerHTML = `
        <div style="font-family: LINESeed-RG; font-size: 15px; padding: 30px; border: 2px solid #ff6b6b; border-radius: 10px; background-color: #fff5f5; color: #333; text-align: center;">
            <div style="font-family: 'LINESeed-BD', sans-serif; font-size: 30px; margin-bottom: 20px; color: #e63946;">
                마켓을 삭제하시겠습니까?
            </div>    
            <div style="font-size: 15px; line-height: 1.6;">
                <p style="margin: 0 0 10px;">
                    🚨 <strong style="color: #e63946;">경고</strong> 🚨
                </p>
                <p style="margin: 0 0 10px;">
                    마켓 삭제 요청은 관리자의 확인 후 최종 처리됩니다.<br />
                    삭제 요청을 제출하시면, 관리자가 요청을 검토하여 문제가 없을 경우<br />
                    <strong style="color: #d90429;">마켓이 영구적으로 삭제됩니다.</strong>
                </p>
                <p style="margin: 0;">
                    삭제 요청은 <strong style="color: #d90429;">철회할 수 없으며,</strong><br />
                    삭제된 마켓은 <strong style="color: #d90429;">복구할 수 없으니</strong> 신중히 결정해주세요.
                </p>
            </div>
        </div>
        `;
    modalSubmitBtn.innerHTML = "삭제";
    modalSubmitBtn.style.backgroundColor = "#E35D6A";
    modalContainer.setAttribute("data-modal-check", "deleteRequestEcoMarket");
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

// 마켓 프로필 이미지 업로드
async function uploadProfileImage() {
  try {
    const fileInput = document.getElementById("ecoMarketProfileImageNew");
    const file = fileInput.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${window.API_SERVER_URL}/upload/profile/eco-market`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      document
        .getElementById("ecoMarketProfileImageNewId")
        .setAttribute("data-value", response.data.id);
      profileImageId = response.data.id;

      return;
    }
  } catch (err) {
    console.error(err);
  }
}
