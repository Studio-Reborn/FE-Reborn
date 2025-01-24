/** 
File Name : preLovedHandler
Description : 중고거래 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.08  이유민      Created     
2024.11.08  이유민      Modified    중고거래 물품 조회 API 연동
2024.11.12  이유민      Modified    로그인 확인 추가
2024.11.18  이유민      Modified    API 경로 수정
2024.11.18  이유민      Modified    개별 제품 클릭 시 이동 경로 변경
2024.11.18  이유민      Modified    폴더 구조 변경
2024.11.19  이유민      Modified    Number 명시
2024.11.19  이유민      Modified    제품명 최대 12글자 표시
2024.11.20  이유민      Modified    제품 이미지 업로드 API 연동
2024.11.20  이유민      Modified    제품 이미지 조회 API 연동
2024.11.22  이유민      Modified    카드 정렬 추가
2024.11.26  이유민      Modified    API 경로 수정
2024.12.10  이유민      Modified    제품 상태 표시 추가
2024.12.30  이유민      Modified    예외 처리 코드 수정
2025.01.02  이유민      Modified    검색 및 정렬 API 연동
2025.01.08  이유민      Modified    판매중 제품만 보기 API 연동
2025.01.09  이유민      Modified    오류 수정
2025.01.22  이유민      Modified    무한 스크롤 추가
*/
let searchValue = undefined;
let sortValue = document.getElementById("preLovedSort").value;
let statusValue = "false";
let debounceTimeout;
const debounceDelay = 500;

let currentPage = 1; // 현재 페이지
let isLoading = false; // 데이터 로드 상태
let hasMoreData = true; // 추가 데이터 여부
const container = document.getElementById("productContainer");

window.addEventListener("load", async () => {
  // 로그인 안 한 경우 생성 버튼 나타나지 않음
  if (!localStorage.getItem("access_token"))
    document.getElementById("preLovedProductCreateBtn").style.display = "none";

  await preLoved(searchValue, sortValue, statusValue, currentPage);
});

// 검색값 입력 시
async function logInputValue() {
  clearTimeout(debounceTimeout); // 기존 타이머 클리어
  debounceTimeout = setTimeout(() => {
    searchValue = document.getElementById("preLovedSearch").value;
    refreshProducts(searchValue, sortValue, statusValue); // 일정 시간 후에만 호출
  }, debounceDelay); // debounceDelay에 설정한 시간만큼 지연 후 호출
}

// 정렬 변경 시
document
  .getElementById("preLovedSort")
  .addEventListener("change", async (event) => {
    sortValue = event.target.value;
    await refreshProducts(searchValue, sortValue, statusValue);
  });

// 판매중 제품만 보기 관련
async function toggleAvailableProductsButton() {
  const button = document.getElementById("onlyAvailableButton");

  // 전체로 돌릴 때
  if (statusValue === "true") {
    button.style.backgroundColor = "#FFFFFF";
    button.style.color = "#000000";
    button.style.border = "1px solid #dedede";
    button.setAttribute("data-active", "false");
  } else {
    // 판매중으로 돌릴 때
    button.style.backgroundColor = "#479f76";
    button.style.border = "1px solid #479f76";
    button.style.color = "#FFFFFF";
    button.setAttribute("data-active", "true");
  }

  statusValue = button.getAttribute("data-active");
  await refreshProducts(searchValue, sortValue, statusValue);
}

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
    await preLoved(searchValue, sortValue, statusValue, currentPage);
    isLoading = false; // 로딩 완료
  }
});

// 검색, 정렬, 판매중 사용 시 html 코드 리셋
async function refreshProducts(searchValue, sortValue, statusValue) {
  if (isLoading) return;

  currentPage = 1; // 페이지 초기화
  hasMoreData = true; // 추가 데이터 플래그 초기화
  isLoading = true; // 로딩 상태 초기화
  container.innerHTML = ""; // 기존 컨텐츠 비우기

  window.scrollTo({
    top: 0,
    behavior: "smooth", // 부드럽게 스크롤
  });

  await preLoved(searchValue, sortValue, statusValue, currentPage); // 새 데이터 로드

  isLoading = false; // 로딩 완료
}

// 제품 데이터 가져오기
async function preLoved(searchValue, sortValue, statusValue, page) {
  if (!hasMoreData) return;

  isLoading = true;
  let contentHTML = "";

  try {
    const products = !searchValue
      ? await axios.get(
          `${window.API_SERVER_URL}/product/pre-loved?sort=${sortValue}&status=${statusValue}&page=${page}`
        )
      : await axios.get(
          `${window.API_SERVER_URL}/product/pre-loved?sort=${sortValue}&search=${searchValue}&status=${statusValue}&page=${page}`
        );

    if (products.data.products.length === 0) {
      hasMoreData = false; // 더 이상 데이터가 없으면 플래그 변경
      isLoading = false;
      return;
    }

    for (let i = 0; i < products.data.products.length; i++) {
      const productImages = await axios.get(
        `${window.API_SERVER_URL}/product-image/${products.data.products[i].product_image_id}`
      );

      if (i % 3 === 0) {
        contentHTML += `<div class="card-contents"`;

        currentPage === 1 && i === 0
          ? (contentHTML += `">`)
          : (contentHTML += ` style="margin-top: 47px">`);
      }

      contentHTML += `
      <a href="/pre-loved/${products.data.products[i].id}">
        <div class="card" style="width: 18rem">
          <img
            src="${window.API_SERVER_URL}/${productImages.data.url[0]}"
            class="card-img-top"
            alt="..."
            style="height: 214px; object-fit: cover"
          />`;

      if (products.data.products[i].status !== "판매중")
        contentHTML += `<!-- 반투명 오버레이 -->
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 214px; 
              background-color: rgba(255, 255, 255, 0.5);">
            <span style="font-family: LINESeed-BD; font-size: 30px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #E35D6A">
            ${products.data.products[i].status}
            </span>
          </div>`;

      contentHTML += `<div class="card-body">
          <!-- 판매명이 13글자 이상이면 12글자까지 잘라서 화면에 표시 -->
            <h5 class="card-title">${
              products.data.products[i].name.length > 12
                ? products.data.products[i].name.slice(0, 12) + "..."
                : products.data.products[i].name
            }</h5>
            <p class="card-text">${Number(
              products.data.products[i].price
            ).toLocaleString()}원</p>
          </div>
        </div>
      </a>
      `;

      if (
        products.data.products.length % 3 !== 0 &&
        i === products.data.products.length - 1
      ) {
        contentHTML += `<div class="card" style="width: 18rem; visibility: hidden;"></div>`;

        if (products.data.products.length % 3 === 1)
          contentHTML += `<div class="card" style="width: 18rem; visibility: hidden;"></div>`;
      }

      if (i % 3 === 2 || i === products.data.products.length - 1)
        contentHTML += `</div>`;
    }

    container.innerHTML += contentHTML;
    isLoading = false; // 로드 상태 비활성화
  } catch (err) {
    console.error(err);
  }
}

// 물건 이미지 업로드 관련
document
  .getElementById("preLovedProductImages")
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
        .getElementById("preLovedProductImagesId")
        .setAttribute("data-value", result.id);

      return;
    } catch (err) {
      console.error(err);
    }
  });

function createModal() {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");

    location.href = "/login";
  }
}
