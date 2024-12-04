/** 
File Name : mypageHandler
Description : 마이페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.08  이유민      Created     
2024.11.08  이유민      Modified    모달 버튼 제거
2024.11.08  이유민      Modified    툴팁 추가
2024.11.13  이유민      Modified    사용자 정보 가져오기 추가
2024.11.13  이유민      Modified    프로필 이미지 API 연동
2024.11.18  이유민      Modified    API 경로 수정
2024.11.27  이유민      Modified    에코마켓 구매내역 API 연동
2024.12.03  이유민      Modified    리본 리메이크 구매내역 API 연동
2024.12.03  이유민      Modified    중고거래 판매내역 API 연동
2024.12.04  이유민      Modified    API 경로 수정
*/
// 토큰 없을 경우 마이페이지 접근 금지
window.addEventListener("load", () => {
  if (!localStorage.getItem("access_token")) location.href = "/login";

  getUserInfo();
});

// 모달 버튼
document.getElementById("modalSubmitBtn").style.display = "none";

// 툴팁
document.addEventListener("DOMContentLoaded", function () {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
});
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

async function getUserInfo() {
  const userNickname = document.getElementById("userNickname");
  const userProfileImage = document.getElementById("userProfileImage");

  // 중고거래 판매 내역
  const purchasePreLovedContainer = document.getElementById(
    "purchasePreLovedContainer"
  );
  let purchasePreLovedHTML = "";

  // 에코마켓 구매 내역
  const purchaseEcoMarketContainer = document.getElementById(
    "purchaseEcoMarketContainer"
  );
  let purchaseEcoMarketHTML = "";

  // 에코마켓 구매 내역
  const purchaseRebornContainer = document.getElementById(
    "purchaseRebornContainer"
  );
  let purchaseRebornHTML = "";

  try {
    const user = await axios.get(`${window.API_SERVER_URL}/users/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    const profile = await axios.get(`${window.API_SERVER_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    userNickname.innerHTML = user.data.nickname;
    userProfileImage.src = `${window.API_SERVER_URL}/${profile.data.url}`;

    // 중고거래 판매 내역
    const preLovedSell = await axios.get(
      `${window.API_SERVER_URL}/product/pre-loved/my`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    if (preLovedSell.data.length === 0) {
      document.getElementById("nullPreLovedPurchase").style.display = "block";
      document.getElementById("purchasePreLovedAll").style.display = "none"; // 전체보기 활성화
    }

    for (let i = 0; i < preLovedSell.data.length; i++) {
      if (i > 1) break; // 최대 2개 출력

      purchasePreLovedHTML += `
      <a href="/pre-loved/${preLovedSell.data[i].product_id}">
        <div class="card mb-3" style="width: 738px; height: 191px">
          <div class="row g-0" style="height: 100%">
            <div class="col-md-4" style="height: 100%">
              <img src="${window.API_SERVER_URL}/${
        preLovedSell.data[i].product_image[0]
      }" class="img-fluid rounded-start" alt="상품이미지" style="height: 100%;  width: auto; object-fit: cover" />
            </div>
            <div class="col-md-8" style="left: 0">
              <div class="card-body">
                <h5 class="card-title">${preLovedSell.data[i].product_name}</h5>
                <p class="card-text">
                  <small class="text-body-secondary">
                    ${Number(
                      preLovedSell.data[i].product_price
                    ).toLocaleString()}원 <br />
                    ${preLovedSell.data[i].product_created_at.split("T")[0]} 
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </a>
    `;
    }
    purchasePreLovedContainer.innerHTML = purchasePreLovedHTML;

    // 에코마켓 구매 내역
    const ecoMarketPurchase = await axios.get(
      `${window.API_SERVER_URL}/billing/purchase/eco-market`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    if (ecoMarketPurchase.data.length === 0) {
      document.getElementById("nullEcoMarketPurchase").style.display = "block";
      document.getElementById("purchaseEcoMarketAll").style.display = "none"; // 전체보기 비활성화
    }

    for (let i = 0; i < ecoMarketPurchase.data.length; i++) {
      if (i > 1) break; // 최대 2개 출력

      purchaseEcoMarketHTML += `
      <a href="/eco-market/${ecoMarketPurchase.data[i].market_id}/${
        ecoMarketPurchase.data[i].product_id
      }">
        <div class="card mb-3" style="width: 738px; height: 191px">
          <div class="row g-0" style="height: 100%">
            <div class="col-md-4" style="height: 100%">
              <img src="${window.API_SERVER_URL}/${
        ecoMarketPurchase.data[i].product_image[0]
      }" class="img-fluid rounded-start" alt="상품이미지" style="height: 100%;  width: auto; object-fit: cover" />
            </div>
            <div class="col-md-8" style="left: 0">
              <div class="card-body">
                <h5 class="card-title">${
                  ecoMarketPurchase.data[i].product_name
                }</h5>
                <p class="card-text">
                  <small class="text-body-secondary">
                    ${ecoMarketPurchase.data[i].market_name} 배송 <br />
                    ${Number(
                      ecoMarketPurchase.data[i].product_price
                    ).toLocaleString()}원 ${
        ecoMarketPurchase.data[i].product_quantity
      }개
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </a>
    `;
    }
    purchaseEcoMarketContainer.innerHTML = purchaseEcoMarketHTML;

    // 리본 리메이크 구매 내역
    const rebornPurchase = await axios.get(
      `${window.API_SERVER_URL}/billing/purchase/reborn-remake`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    if (rebornPurchase.data.length === 0) {
      document.getElementById("nullEcoMarketPurchase").style.display = "block";
      document.getElementById("purchaseRebornAll").style.display = "none"; // 전체보기 비활성화
    }

    for (let i = 0; i < rebornPurchase.data.length; i++) {
      if (i > 1) break; // 최대 2개 출력

      purchaseRebornHTML += `
      <a href="/reborn-remake/${rebornPurchase.data[i].product_id}">
        <div class="card mb-3" style="width: 738px; height: 191px">
          <div class="row g-0" style="height: 100%">
            <div class="col-md-4" style="height: 100%">
              <img src="${window.API_SERVER_URL}/${
        rebornPurchase.data[i].product_image[0]
      }" class="img-fluid rounded-start" alt="상품이미지" style="height: 100%;  width: auto; object-fit: cover" />
            </div>
            <div class="col-md-8" style="left: 0">
              <div class="card-body">
                <h5 class="card-title">${
                  rebornPurchase.data[i].product_name
                }</h5>
                <p class="card-text">
                  <small class="text-body-secondary">
                    리본(Reborn) 배송 <br />
                    ${Number(
                      rebornPurchase.data[i].product_price
                    ).toLocaleString()}원 ${
        rebornPurchase.data[i].product_quantity
      }개
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </a>
    `;
    }
    purchaseRebornContainer.innerHTML += purchaseRebornHTML;

    return;
  } catch (err) {
    console.error(err);
  }
}
