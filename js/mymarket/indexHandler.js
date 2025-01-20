/** 
File Name : indexHandler
Description : 내 마켓 핸들러
Author : 이유민

History
Date        Author      Status      Description
2025.01.18  이유민      Created     
2025.01.18  이유민      Modified    내 마켓 추가
2025.01.18  이유민      Modified    디버깅 코드 제거
2025.01.19  이유민      Modified    상점 디테일 추가
*/
window.addEventListener("load", () => {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 사용 가능합니다.");
    location.href = "/login";
  }

  myMarket();
});

async function myMarket() {
  const myMarketContainer = document.getElementById("myMarketContainer");
  let myMarketHTML = "";

  const markets = await axios.get(`${window.API_SERVER_URL}/market/my`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (markets.data.length === 0) {
    document.getElementById("nullMyMarket").style.display = "flex";
    return;
  }

  for (let i = 0; i < markets.data.length; i++) {
    if (i % 2 === 0)
      myMarketHTML += `
          <div style="display: flex; flex-wrap: wrap; gap: 60px; justify-content: center; margin-bottom: 40px;">
        `;

    myMarketHTML += `
          <div style="border: 1px solid #ddd; border-radius: 8px; width: 280px; padding: 16px; text-align: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h3 style="font-family: LINESeed-BD; font-size: 24px; margin-bottom: 8px;">${
              markets.data[i].market_name.length > 10
                ? markets.data[i].market_name.slice(0, 10) + "..."
                : markets.data[i].market_name
            }</h3>
            ${
              markets.data[i].market_is_verified === 0
                ? '<b style="font-family: LINESeed-RG; font-size: 16px; color: #E35D6A; margin: 4px 0;">오픈 전</b>'
                : ""
            }

            ${
              markets.data[i].market_is_deletion === 1
                ? '<b style="font-family: LINESeed-RG; font-size: 16px; color: #E35D6A; margin: 4px 0;">삭제 요청</b>'
                : ""
            }
            <p style="font-family: LINESeed-RG; font-size: 16px; color: #6c757d; margin: 4px 0;">배송 전 제품 수: <b>${Number(
              markets.data[i].before_delivery_count
            ).toLocaleString()}개</b></p>
            <p style="font-family: LINESeed-RG; font-size: 16px; color: #6c757d; margin: 4px 0;">현재 판매 중: <b>${Number(
              markets.data[i].product_count
            ).toLocaleString()}개</b></p>
            <a href="/mymarket/${markets.data[i].market_id}">
              <button class="global-btn" style="margin-top: 16px; cursor: pointer;">
                마켓 관리
              </button>
            </a>
          </div>
      `;

    if (markets.data.length % 2 === 1 && i === markets.data.length - 1)
      myMarketHTML += `<div style="border: 1px solid #ddd; border-radius: 8px; width: 280px; padding: 16px; text-align: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); visibility: hidden;"></div>`;

    if (i % 2 === 1 || i === markets.data.length - 1) myMarketHTML += `</div>`;
  }

  myMarketContainer.innerHTML = myMarketHTML;
}
