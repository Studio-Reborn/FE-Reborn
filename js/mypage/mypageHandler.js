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
2024.12.10  이유민      Modified    중고거래 판매 제품 상태 표시 추가
2024.12.18  이유민      Modified    관심 상품 및 관심 마켓 추가
*/
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

const likeMarketContainer = document.getElementById("likeMarketContainer");
const likeProductContainer = document.getElementById("likeProductContainer");

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
  try {
    // 프로필
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

    sellPreLoved(); // 중고거래 판매 내역
    buyEcoMarket(); // 에코마켓 구매 내역
    buyRebornRemake(); // 리본 리메이크 구매 내역
    likeProduct(); // 관심 상품
    likeMarket(); // 관심 마켓

    return;
  } catch (err) {
    console.error(err);
  }
}

// 관심 상품
async function likeProduct() {
  let likeProductHTML = "";

  const likes = await axios.get(`${window.API_SERVER_URL}/like/product/my`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (likes.data.length === 0) {
    document.getElementById("nullProductLike").style.display = "block";
    document.getElementById("likeProductAll").style.display = "none";
  }

  const likesData = [
    ...likes.data.preLoved,
    ...likes.data.ecoMarket,
    ...likes.data.rebornRemake,
  ].sort((a, b) => {
    return new Date(b.like_created_at) - new Date(a.like_created_at);
  });

  for (let i = 0; i < likesData.length; i++) {
    if (i > 2) break;

    if (i === 0) likeProductHTML += `<div class="card-contents">`;

    // 제품 링크 관련
    let productLink = "";

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

    // html 코드 관련
    likeProductHTML += `
        <a href="${productLink}">
          <div class="card" style="width: 200px; height: 220px">
            <div style="position: relative; width: 200px; height: 130px;">
              <img src="${window.API_SERVER_URL}/${likesData[i].product_image_url[0]}" class="card-img-top" alt="..." style="width: 100%; height: 100%; object-fit: cover;" />
            `;

    // 어떤 제품인지 표시
    switch (likesData[i].product_type) {
      case "pre-loved":
        likeProductHTML += `<span class="badge text-bg-primary" style="position: absolute; bottom: 10px; left: 10px; z-index: 10; padding: 5px 10px;">중고거래</span>`;
        break;
      case "eco-market":
        likeProductHTML += `<span class="badge text-bg-danger" style="position: absolute; bottom: 10px; left: 10px; z-index: 10; padding: 5px 10px;">에코마켓</span>`;
        break;
      case "reborn-remake":
        likeProductHTML += `<span class="badge text-bg-success" style="position: absolute; bottom: 10px; left: 10px; z-index: 10; padding: 5px 10px;">리메이크</span>`;
        break;
    }

    likeProductHTML += `
            </div>
            <div class="card-body" style="overflow-y: auto; height: 90px;">
                <h5 class="card-title">${likesData[i].product_name}</h5>
              </div>
            </div>
          </a>
    `;

    // 카드 위치 맞춤
    if (likesData.length < 3) {
      if (likesData.length === 2 && i === 1) {
        likeProductHTML += `
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
      `;
      }

      if (likesData.length === 1 && i === 0) {
        likeProductHTML += `
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
      `;
      }
    }

    if (i === likesData.length - 1) likeProductHTML += `</div>`;
  }

  likeProductContainer.innerHTML = likeProductHTML;
}

// 관심 마켓
async function likeMarket() {
  let likeMarketHTML = "";

  const likes = await axios.get(`${window.API_SERVER_URL}/like/market/my`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (likes.data.length === 0) {
    document.getElementById("nullMarketLike").style.display = "block";
    document.getElementById("likeMarketAll").style.display = "none";
  }

  for (let i = 0; i < likes.data.length; i++) {
    if (i > 2) break;

    if (i === 0) likeMarketHTML += `<div class="card-contents">`;

    likeMarketHTML += `
        <a href="/eco-market/${likes.data[i].market_id}">
          <div class="card" style="width: 200px; height: 220px">
            <img src="${window.API_SERVER_URL}/${likes.data[i].market_profile_url}" class="card-img-top" alt="..." style="height: 130px; object-fit: cover" />
            <div class="card-body" style="overflow-y: auto; height: 90px;">
              <h5 class="card-title">${likes.data[i].market_name}</h5>
            </div>
          </div>
        </a>
    `;

    // 카드 위치 맞춤
    if (likes.data.length < 3) {
      if (likes.data.length === 2 && i === 1) {
        likeMarketHTML += `
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
      `;
      }

      if (likes.data.length === 1 && i === 0) {
        likeMarketHTML += `
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
          <div class="card" style="width: 200px; height: 220px; visibility: hidden;">
          </div>
      `;
      }
    }

    if (i === likes.data.length - 1) likeMarketHTML += `</div>`;
  }

  likeMarketContainer.innerHTML = likeMarketHTML;
}

// 중고거래 판매 내역
async function sellPreLoved() {
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
            <img src="${window.API_SERVER_URL}/${preLovedSell.data[i].product_image[0]}" class="img-fluid rounded-start" alt="상품이미지" style="height: 100%;  width: auto; object-fit: cover" />`;

    if (preLovedSell.data[i].product_status !== "판매중") {
      purchasePreLovedHTML += `<!-- 반투명 오버레이 -->
            <div style="position: absolute; top: 0; left: 0; width: 190px; height: 100%; 
                  background-color: rgba(255, 255, 255, 0.5);">
              <span style="font-family: LINESeed-BD; font-size: 20px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #E35D6A">
                ${preLovedSell.data[i].product_status}
              </span>
            </div>`;
    }

    purchasePreLovedHTML += `
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
}

// 에코마켓 구매 내역
async function buyEcoMarket() {
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
}

// 리본 리메이크 구매 내역
async function buyRebornRemake() {
  // const rebornPurchase = await axios.get(
  //   `${window.API_SERVER_URL}/billing/purchase/reborn-remake`,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //     },
  //   }
  // );
  // if (rebornPurchase.data.length === 0) {
  //   document.getElementById("nullEcoMarketPurchase").style.display = "block";
  //   document.getElementById("purchaseRebornAll").style.display = "none"; // 전체보기 비활성화
  // }
  // for (let i = 0; i < rebornPurchase.data.length; i++) {
  //   if (i > 1) break; // 최대 2개 출력
  //   purchaseRebornHTML += `
  //   <a href="/reborn-remake/${rebornPurchase.data[i].product_id}">
  //     <div class="card mb-3" style="width: 738px; height: 191px">
  //       <div class="row g-0" style="height: 100%">
  //         <div class="col-md-4" style="height: 100%">
  //           <img src="${window.API_SERVER_URL}/${
  //     rebornPurchase.data[i].product_image[0]
  //   }" class="img-fluid rounded-start" alt="상품이미지" style="height: 100%;  width: auto; object-fit: cover" />
  //         </div>
  //         <div class="col-md-8" style="left: 0">
  //           <div class="card-body">
  //             <h5 class="card-title">${
  //               rebornPurchase.data[i].product_name
  //             }</h5>
  //             <p class="card-text">
  //               <small class="text-body-secondary">
  //                 리본(Reborn) 배송 <br />
  //                 ${Number(
  //                   rebornPurchase.data[i].product_price
  //                 ).toLocaleString()}원 ${
  //     rebornPurchase.data[i].product_quantity
  //   }개
  //               </small>
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </a>
  // `;
  // }
  // purchaseRebornContainer.innerHTML += purchaseRebornHTML;
}
