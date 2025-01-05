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
*/
let searchValue = undefined;
let sortValue = document.getElementById("marketSort").value;

window.addEventListener("load", () => {
  // 토큰 없을 경우 버튼 없음
  if (!localStorage.getItem("access_token"))
    document.getElementById("createEcoMarketBtn").style.display = "none";

  readMarketAll(searchValue, sortValue);
});

// 검색값 입력 시
function logInputValue() {
  searchValue = document.getElementById("marketSearch").value;
  readMarketAll(searchValue, sortValue);
}

// 정렬 변경 시
document.getElementById("marketSort").addEventListener("change", (event) => {
  sortValue = event.target.value;
  readMarketAll(searchValue, sortValue);
});

async function readMarketAll(searchValue, sortValue) {
  const container = document.getElementById("ecoMarketContainer");
  let contentHTML = "";

  try {
    // 마켓 정보
    const markets = !searchValue
      ? await axios.get(`${window.API_SERVER_URL}/market?sort=${sortValue}`)
      : await axios.get(
          `${window.API_SERVER_URL}/market?sort=${sortValue}&search=${searchValue}`
        );

    for (let i = 0; i < markets.data.length; i++) {
      if (i % 2 === 0)
        contentHTML += '<div class="card-contents" style="gap: 66px">';

      contentHTML += `
        <a href="/eco-market/${markets.data[i].id}">
          <div class="card mb-3" style="width: 562px; overflow: hidden; display: flex; flex-direction: column;">
            <div class="row g-0">
              <div class="col-md-4">
                <img src="${window.API_SERVER_URL}/${
        markets.data[i].profile_image_url
      }" class="img-fluid rounded-start" alt="마켓커버" style="width: 200px; height: 200px; object-fit: cover;" />
              </div>
              <div class="col-md-8 d-flex flex-column">
                <div class="card-body" style="flex-grow: 1;">
                  <h5 class="card-title">${markets.data[i].market_name}</h5>
                  <p class="card-text text-truncate text-wrap">${
                    markets.data[i].market_detail
                  }</p>
                </div>
                <p class="card-text" style="text-align: right; margin: 0; padding: 10px;">
                  <small class="text-body-secondary">후기 2,829 좋아요 ${Number(
                    markets.data[i].market_likes
                  ).toLocaleString()}</small>
                </p>
              </div>
            </div>
          </div>
        </a>
      `;

      if (markets.data.length % 2 === 1 && i === markets.data.length - 1)
        contentHTML += `<div class="card mb-3" style="width: 562px; overflow: hidden; display: flex; flex-direction: column; visibility: hidden;"></div>`;

      if (i % 2 === 1 || i === markets.data.length - 1) contentHTML += "</div>";
    }

    container.innerHTML = contentHTML;
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
