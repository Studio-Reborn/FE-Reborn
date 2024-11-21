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
*/
window.addEventListener("load", () => {
  preLoved();
});

async function preLoved() {
  // 로그인 안 한 경우 생성 버튼 나타나지 않음
  if (!localStorage.getItem("access_token"))
    document.getElementById("preLovedProductCreateBtn").style.display = "none";

  const container = document.getElementById("productContainer");
  let contentHTML = "";

  try {
    const products = await axios.get(
      `${window.API_SERVER_URL}/product?theme=user`
    );

    for (let i = 0; i < products.data.length; i++) {
      const productImages = await axios.get(
        `${window.API_SERVER_URL}/product-image/${products.data[i].product_image_id}`
      );

      if (i % 3 === 0) {
        contentHTML += `<div class="card-contents"`;

        i === 0
          ? (contentHTML += `">`)
          : (contentHTML += ` style="margin-top: 47px">`);
      }

      contentHTML += `
      <a href="/pre-loved/${products.data[i].id}">
        <div class="card" style="width: 18rem">
          <img
            src="${window.API_SERVER_URL}/${productImages.data.url[0]}"
            class="card-img-top"
            alt="..."
            style="height: 214px; object-fit: cover"
          />
          <div class="card-body">
          <!-- 판매명이 13글자 이상이면 12글자까지 잘라서 화면에 표시 -->
            <h5 class="card-title">${
              products.data[i].name.length > 12
                ? products.data[i].name.slice(0, 12) + "..."
                : products.data[i].name
            }</h5>
            <p class="card-text">${Number(
              products.data[i].price
            ).toLocaleString()}원</p>
          </div>
        </div>
      </a>
      `;

      if (i % 3 === 2 || i === products.data.length - 1)
        contentHTML += `</div>`;
    }

    container.innerHTML = contentHTML;
  } catch (err) {
    console.log(err);
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
