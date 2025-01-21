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
*/
let searchValue = undefined;
let sortValue = document.getElementById("userProductSort").value;
let statusValue = "false";

const user_id = window.location.pathname.split("/").pop();
const userPreLovedProductContainer = document.getElementById(
  "userPreLovedProductContainer"
);

window.addEventListener("load", () => {
  getUserInfo(user_id, searchValue, sortValue, statusValue);
});

// 검색값 입력 시
function logInputValue() {
  searchValue = document.getElementById("userProductSearch").value;
  getUserInfo(user_id, searchValue, sortValue, statusValue);
}

// 정렬 변경 시
document
  .getElementById("userProductSort")
  .addEventListener("change", (event) => {
    sortValue = event.target.value;
    getUserInfo(user_id, searchValue, sortValue, statusValue);
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
  getUserInfo(user_id, searchValue, sortValue, statusValue);
}

async function getUserInfo(user_id, searchValue, sortValue, statusValue) {
  let containerHTML = "";

  try {
    // 사용자 정보
    const user = await axios.get(
      `${window.API_SERVER_URL}/users/info/${user_id}`
    );

    document.getElementById(
      "userProfileImageBig"
    ).src = `${window.API_SERVER_URL}/${user.data.profile_image_url}`;
    document.getElementById(
      "userProfileImageSmall"
    ).src = `${window.API_SERVER_URL}/${user.data.profile_image_url}`;
    document.getElementById("userName").innerHTML = user.data.nickname;
    document.getElementById("userDescription").innerHTML =
      user.data.description === ""
        ? "<span style='color: #6c757d'>사용자 소개가 없습니다.</span>"
        : user.data.description;

    // 본인 확인
    // 로컬 스토리지에 토큰 있을 때만 확인함
    if (localStorage.getItem("access_token")) checkMyInfo(user.data.id);

    // 판매 물품 정보
    const products = !searchValue
      ? await axios.get(
          `${window.API_SERVER_URL}/product/pre-loved/user/${user_id}?sort=${sortValue}&status=${statusValue}`
        )
      : await axios.get(
          `${window.API_SERVER_URL}/product/pre-loved/user/${user_id}?sort=${sortValue}&search=${searchValue}&status=${statusValue}`
        );

    for (let i = 0; i < products.data.length; i++) {
      // html
      if (i % 3 === 0) {
        containerHTML += `<div class="card-contents"`;

        i === 0
          ? (containerHTML += `">`)
          : (containerHTML += ` style="margin-top: 47px">`);
      }

      containerHTML += `
              <a href="/pre-loved/${products.data[i].product_id}">
                <div class="card" style="width: 18rem">
                  <img src="${window.API_SERVER_URL}/${products.data[i].product_image[0]}" class="card-img-top" alt="..." style="height: 214px; object-fit: cover" />`;

      if (products.data[i].product_status !== "판매중")
        containerHTML += `<!-- 반투명 오버레이 -->
                      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 214px; 
                          background-color: rgba(255, 255, 255, 0.5);">
                        <span style="font-family: LINESeed-BD; font-size: 30px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #E35D6A">
                        ${products.data[i].product_status}
                        </span>
                      </div>`;

      containerHTML += `<div class="card-body">
            <!-- 판매명이 13글자 이상이면 12글자까지 잘라서 화면에 표시 -->
                <h5 class="card-title">${
                  products.data[i].product_name.length > 12
                    ? products.data[i].product_name.slice(0, 12) + "..."
                    : products.data[i].product_name
                }</h5>
                    <p class="card-text">${Number(
                      products.data[i].product_price
                    ).toLocaleString()}원</p>
                    <p class="card-text" style="color: #6c757d; font-size: 12px">좋아요 ${Number(
                      products.data[i].product_like_cnt
                    ).toLocaleString()}</p>
                  </div>
                </div>
              </a>
        `;

      if (products.data.length % 3 !== 0 && i === products.data.length - 1) {
        containerHTML += `<div class="card" style="width: 18rem; visibility: hidden;"></div>`;

        if (products.data.length % 3 === 1)
          containerHTML += `<div class="card" style="width: 18rem; visibility: hidden;"></div>`;
      }

      if (i % 3 === 2) containerHTML += `</div>`;
    }

    userPreLovedProductContainer.innerHTML = containerHTML;
  } catch (err) {
    console.error(err);
  }
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
