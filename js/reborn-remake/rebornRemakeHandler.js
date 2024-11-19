/** 
File Name : rebornRemakeHandler
Description : 리본 리메이크 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.08  이유민      Created     
2024.11.08  이유민      Modified    리본 리메이크 API 연동
2024.11.12  이유민      Modified    로그인 확인 추가
2024.11.18  이유민      Modified    API 경로 수정
2024.11.19  이유민      Modified    관리자 제품 생성 추가
2024.11.19  이유민      Modified    폴더 구조 변경
2024.11.19  이유민      Modified    링크 추가
*/
window.addEventListener("load", () => {
  rebornRemake();
});

async function rebornRemake() {
  const container = document.getElementById("remakeContainer");
  let contentHTML = "";

  try {
    const products = await axios.get(`${window.API_SERVER_URL}/remake/product`);

    for (let i = 0; i < products.data.length; i++) {
      if (i % 3 === 0) {
        contentHTML += `<div class="card-contents"`;

        i === 0
          ? (contentHTML += `">`)
          : (contentHTML += ` style="margin-top: 47px">`);
      }

      contentHTML += `
        <a href="/reborn-remake/${products.data[i].id}">
          <div class="card" style="width: 18rem">
              <img src="/assets/images/reborn-remake-example.svg" class="card-img-top" alt="..." style="height: 214px; object-fit: cover" />
              <div class="card-body">
                  <h5 class="card-title">${
                    products.data[i].name.length > 12
                      ? products.data[i].name.slice(0, 12) + "..."
                      : products.data[i].name
                  }</h5>
                  <p class="card-text">${products.data[i].matter}</p>
                  <p class="card-text" style="color: #6c757d">${Number(
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

    // 관리자인지 확인
    if (localStorage.getItem("access_token")) {
      const response = await axios.get(`${window.API_SERVER_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // 관리자일 때만 제품 생성 버튼 생김
      if (response.data.id === 1)
        document.getElementById("remakeProductCreateBtn").style.display = "";
    }
  } catch (err) {
    console.log(err);
  }
}

// 모달
function setModalContent(type) {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");

    location.href = "/login";
  }

  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.querySelector(".modal-body");
  const modalContainer = document.getElementById("modalContainer");

  if (type === "recommend") {
    modalTitle.textContent = "제품 추천받기";
    modalBody.innerHTML = `
        <div class="input-group mb-3" style="width: 586px">
          <input type="text" class="form-control" id="recommendInput" placeholder="재료를 적어주세요." aria-label="nickname" />
        </div>
        <div id="recommendResult" style="font-family: LINESeed-RG">
        </div>
        <div style="font-family: LINESeed-RG; font-size: 12px; display: none" id="gray-600">
          * 제품명을 클릭하면 추천 제품 페이지로 이동합니다.
        </div>
      `;
    modalContainer.setAttribute("data-modal-check", "recommend");
  } else if (type === "request") {
    modalTitle.textContent = "제품 요청하기";
    modalBody.innerHTML = `
        <div class="input-group mb-3" style="width: 586px">
          <input type="text" class="form-control" id="requestInput" placeholder="원하는 제품을 요청해주세요." aria-label="nickname" />
        </div>
      `;
    modalContainer.setAttribute("data-modal-check", "request");
  } else if (type === "createRebornRemake") {
    modalTitle.textContent = "리본 리메이크 제품 생성하기";
    modalBody.innerHTML = `
       <!-- 파일 선택-->
        <div class="input-group mb-3" style="width: 586px">
          <input type="file" class="form-control" id="inputGroupFile02" multiple>
          <label class="input-group-text" for="inputGroupFile02">Upload</label>
        </div>

        <!-- 제품명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="remakeProductName" placeholder="제품명">
          <label for="remakeProductName">제품명</label>
        </div>

        <!-- 제품 재료 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="remakeProductMatter" placeholder="제품 재료">
          <label for="remakeProductMatter">제품 재료</label>
        </div>

        <!-- 제품 가격 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="number" class="form-control" id="remakeProductPrice" placeholder="제품가격">
          <label for="remakeProductPrice">제품 가격</label>
        </div>

        <!-- 제품 설명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="remakeProductDetail" placeholder="제품 설명" style="height: 150px"></textarea>
          <label for="remakeProductDetail">제품 설명</label>
        </div>
      `;
    modalContainer.setAttribute(
      "data-modal-check",
      "createRebornRemakeProduct"
    );
  }
}
