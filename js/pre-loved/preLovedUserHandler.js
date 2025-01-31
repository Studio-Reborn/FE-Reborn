/** 
File Name : preLovedUserHandler
Description : 일반 사용자 정보 조회
Author : 이유민

History
Date        Author      Status      Description
2025.01.07  이유민      Created     
2025.01.07  이유민      Modified    일반 사용자 정보 조회 추가
2025.01.08  이유민      Modified    판매 물품 좋아요 API 연동
2025.01.09  이유민      Modified    검색, 정렬 및 판매중인 제품만 API 연동
2025.01.21  이유민      Modified    UI 수정
2025.01.23  이유민      Modified    무한 스크롤 추가
2025.01.31  이유민      Modified    이미지 경로 수정
*/
let searchValue = undefined;
let sortValue = document.getElementById("userProductSort").value;
let statusValue = "false";

let debounceTimeout;
const debounceDelay = 500;

let currentPage = 1; // 현재 페이지
let isLoading = false; // 데이터 로드 상태
let hasMoreData = true; // 추가 데이터 여부

const user_id = window.location.pathname.split("/").pop();
const userPreLovedProductContainer = document.getElementById(
  "userPreLovedProductContainer"
);

window.addEventListener("load", async () => {
  await Promise.all([
    getUserInfo(user_id),
    readProductsInfo(searchValue, sortValue, statusValue, currentPage),
  ]);
});

// 검색값 입력 시
async function logInputValue() {
  clearTimeout(debounceTimeout); // 기존 타이머 클리어
  debounceTimeout = setTimeout(() => {
    searchValue = document.getElementById("userProductSearch").value;
    refreshProducts(searchValue, sortValue, statusValue);
  }, debounceDelay);
}

// 정렬 변경 시
document
  .getElementById("userProductSort")
  .addEventListener("change", (event) => {
    sortValue = event.target.value;
    refreshProducts(searchValue, sortValue, statusValue);
  });

// 판매중 제품만 보기 관련
function toggleAvailableProductsButton() {
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
  refreshProducts(searchValue, sortValue, statusValue);
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
    await readProductsInfo(searchValue, sortValue, statusValue, currentPage);
    isLoading = false; // 로딩 완료
  }
});

// 검색, 정렬, 판매중 사용 시 html 코드 리셋
async function refreshProducts(searchValue, sortValue, statusValue) {
  if (isLoading) return;

  currentPage = 1; // 페이지 초기화
  hasMoreData = true; // 추가 데이터 플래그 초기화
  isLoading = true; // 로딩 상태 초기화
  userPreLovedProductContainer.innerHTML = ""; // 기존 컨텐츠 비우기

  window.scrollTo({
    top: 0,
    behavior: "smooth", // 부드럽게 스크롤
  });

  await readProductsInfo(searchValue, sortValue, statusValue, currentPage); // 새 데이터 로드
  isLoading = false; // 로딩 완료
}

async function getUserInfo() {
  try {
    // 사용자 정보
    const user = await axios.get(
      `${window.API_SERVER_URL}/users/info/${user_id}`
    );

    document.getElementById(
      "userProfileImageBig"
    ).src = `${window.IMAGE_SERVER_URL}${user.data.profile_image_url}`;
    document.getElementById(
      "userProfileImageSmall"
    ).src = `${window.IMAGE_SERVER_URL}${user.data.profile_image_url}`;
    document.getElementById("userName").innerHTML = user.data.nickname;
    document.getElementById("userDescription").innerHTML =
      user.data.description === ""
        ? "<span style='color: #6c757d'>사용자 소개가 없습니다.</span>"
        : user.data.description;

    // 본인 확인
    // 로컬 스토리지에 토큰 있을 때만 확인함
    if (localStorage.getItem("access_token")) checkMyInfo(user.data.id);
  } catch (err) {
    console.error(err);
  }
}

async function readProductsInfo(searchValue, sortValue, statusValue, page) {
  if (!hasMoreData) return;

  isLoading = true;
  let containerHTML = "";

  // 판매 물품 정보
  const products = !searchValue
    ? await axios.get(
        `${window.API_SERVER_URL}/product/pre-loved/user/${user_id}?sort=${sortValue}&status=${statusValue}&page=${page}`
      )
    : await axios.get(
        `${window.API_SERVER_URL}/product/pre-loved/user/${user_id}?sort=${sortValue}&search=${searchValue}&status=${statusValue}&page=${page}`
      );

  if (products.data.data.length === 0) {
    hasMoreData = false; // 더 이상 데이터가 없으면 플래그 변경
    isLoading = false;
    return;
  }

  for (let i = 0; i < products.data.data.length; i++) {
    // html
    if (i % 3 === 0) {
      containerHTML += `<div class="card-contents"`;

      currentPage === 1 && i === 0
        ? (containerHTML += `">`)
        : (containerHTML += ` style="margin-top: 47px">`);
    }

    containerHTML += `
          <a href="/pre-loved/${products.data.data[i].product_id}">
            <div class="card" style="width: 18rem">
              <img src="${window.IMAGE_SERVER_URL}${products.data.data[i].product_image[0]}" class="card-img-top" alt="..." style="height: 214px; object-fit: cover" />`;

    if (products.data.data[i].product_status !== "판매중")
      containerHTML += `<!-- 반투명 오버레이 -->
                  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 214px; 
                      background-color: rgba(255, 255, 255, 0.5);">
                    <span style="font-family: LINESeed-BD; font-size: 30px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #E35D6A">
                    ${products.data.data[i].product_status}
                    </span>
                  </div>`;

    containerHTML += `<div class="card-body">
        <!-- 판매명이 13글자 이상이면 12글자까지 잘라서 화면에 표시 -->
            <h5 class="card-title">${
              products.data.data[i].product_name.length > 12
                ? products.data.data[i].product_name.slice(0, 12) + "..."
                : products.data.data[i].product_name
            }</h5>
                <p class="card-text">${Number(
                  products.data.data[i].product_price
                ).toLocaleString()}원</p>
                <p class="card-text" style="color: #6c757d; font-size: 12px">좋아요 ${Number(
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

  userPreLovedProductContainer.innerHTML += containerHTML;
  isLoading = false; // 로드 상태 비활성화
}

async function checkMyInfo(user_id) {
  const userUpdate = document.getElementById("userInfoUpdate");

  // user_id는 현재 페이지의 주인 id 의미함
  // check는 로그인한 사람
  const check = await axios.get(`${window.API_SERVER_URL}/users/my`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (user_id === check.data.id) userUpdate.style.display = "flex";

  userUpdate.addEventListener("click", () => {
    location.href = "/mypage/update";
  });
}
