/** 
File Name : ecoMarketHandler
Description : 에코마켓 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.21  이유민      Created     
2024.11.21  이유민      Modified    에코마켓 전체 API 연동
2024.12.17  이유민      Modified    코드 리팩토링
2024.12.30  이유민      Modified    디버깅 코드 제거
2025.01.02  이유민      Modified    검색 및 정렬 API 연동
2025.01.18  이유민      Modified    마켓별 후기 수 API 연동
2025.01.23  이유민      Modified    무한 스크롤 추가
*/
let searchValue = undefined;
let sortValue = document.getElementById("marketSort").value;

let debounceTimeout;
const debounceDelay = 500;

let currentPage = 1; // 현재 페이지
let isLoading = false; // 데이터 로드 상태
let hasMoreData = true; // 추가 데이터 여부
const container = document.getElementById("ecoMarketContainer");

window.addEventListener("load", () => {
  // 토큰 없을 경우 버튼 없음
  if (!localStorage.getItem("access_token"))
    document.getElementById("createEcoMarketBtn").style.display = "none";

  readMarketAll(searchValue, sortValue, currentPage);
});

// 검색값 입력 시
async function logInputValue() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    searchValue = document.getElementById("marketSearch").value;
    refreshProducts(searchValue, sortValue);
  }, debounceDelay);
}

// 정렬 변경 시
document
  .getElementById("marketSort")
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
    await readMarketAll(searchValue, sortValue, currentPage);
    isLoading = false; // 로딩 완료
  }
});

// 검색, 정렬 사용 시 html 코드 리셋
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

  await readMarketAll(searchValue, sortValue, currentPage); // 새 데이터 로드

  isLoading = false; // 로딩 완료
}

async function readMarketAll(searchValue, sortValue, page) {
  if (!hasMoreData) return;

  isLoading = true;
  let contentHTML = "";

  try {
    // 마켓 정보
    const markets = !searchValue
      ? await axios.get(
          `${window.API_SERVER_URL}/market?sort=${sortValue}&page=${page}`
        )
      : await axios.get(
          `${window.API_SERVER_URL}/market?sort=${sortValue}&search=${searchValue}&page=${page}`
        );

    if (markets.data.data.length === 0) {
      hasMoreData = false;
      isLoading = false;
      return;
    }

    for (let i = 0; i < markets.data.data.length; i++) {
      const reviews = await axios.get(
        `${window.API_SERVER_URL}/review/market/${markets.data.data[i].id}`
      );

      if (i % 2 === 0)
        contentHTML += '<div class="card-contents" style="gap: 66px">';

      contentHTML += `
        <a href="/eco-market/${markets.data.data[i].id}">
          <div class="card mb-3" style="width: 562px; overflow: hidden; display: flex; flex-direction: column;">
            <div class="row g-0">
              <div class="col-md-4">
                <img src="${window.API_SERVER_URL}/${
        markets.data.data[i].profile_image_url
      }" class="img-fluid rounded-start" alt="마켓커버" style="width: 200px; height: 200px; object-fit: cover;" />
              </div>
              <div class="col-md-8 d-flex flex-column">
                <div class="card-body" style="flex-grow: 1;">
                  <h5 class="card-title">${
                    markets.data.data[i].market_name
                  }</h5>
                  <p class="card-text text-truncate text-wrap">${
                    markets.data.data[i].market_detail
                  }</p>
                </div>
                <p class="card-text" style="text-align: right; margin: 0; padding: 10px;">
                  <small class="text-body-secondary">후기 ${Number(
                    reviews.data.length
                  ).toLocaleString()} 좋아요 ${Number(
        markets.data.data[i].market_likes
      ).toLocaleString()}</small>
                </p>
              </div>
            </div>
          </div>
        </a>
      `;

      if (
        markets.data.data.length % 2 === 1 &&
        i === markets.data.data.length - 1
      )
        contentHTML += `<div class="card mb-3" style="width: 562px; overflow: hidden; display: flex; flex-direction: column; visibility: hidden;"></div>`;

      if (i % 2 === 1 || i === markets.data.data.length - 1)
        contentHTML += "</div>";
    }

    container.innerHTML += contentHTML;
    isLoading = false; // 로드 상태 비활성화
  } catch (err) {
    console.error(err);
  }
}

// 마켓 프로필 이미지 업로드
async function uploadProfileImage() {
  try {
    const fileInput = document.getElementById("ecoMarketProfileImage");
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
        .getElementById("ecoMarketProfileImageId")
        .setAttribute("data-value", response.data.id);

      return;
    }
  } catch (err) {
    console.error(err);
  }
}
