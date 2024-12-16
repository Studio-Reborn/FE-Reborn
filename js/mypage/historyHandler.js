/** 
File Name : historyHandler
Description : 마이페이지 전체 내역 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.12.03  이유민      Created     
2024.12.03  이유민      Modified    마이페이지 전체 내역 페이지 추가
2024.12.10  이유민      Modified    중고거래 판매 제품 상태 표시 추가
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
    case "purchase-eco-market":
      nameHTML = "에코 마켓 구매 내역";
      pointerUrl = "/eco-market";
      cardDataUrl = "billing/purchase/eco-market";
      break;
    case "purchase-reborn-remake":
      nameHTML = "리본 리메이크 구매 내역";
      cardDataUrl = "billing/purchase/reborn-remake";
      pointerUrl = "/reborn-remake";
      break;
  }

  const cardData = await axios.get(`${window.API_SERVER_URL}/${cardDataUrl}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  for (let i = 0; i < cardData.data.length; i++) {
    // 첫 번째 줄
    if (name === "sell-pre-loved") {
      explain[0] =
        Number(cardData.data[i].product_price).toLocaleString() + "원";
    } else if (name === "purchase-eco-market") {
      explain[0] = cardData.data[i].market_name;
    } else {
      explain[0] = "리본(Reborn)";
    }

    // 두 번째 줄
    if (name === "sell-pre-loved") {
      explain[1] = cardData.data[i].product_created_at.split("T")[0];
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

  document.getElementById("purchaseName").innerHTML = nameHTML;
  document.getElementById("cardDataContainer").innerHTML = cardDataHTML;
}
