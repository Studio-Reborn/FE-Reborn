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
2024.11.22  이유민      Modified    카드 정렬 추가
2024.11.22  이유민      Modified    상품 이미지 업로드 API 연동
2024.11.22  이유민      Modified    상품 요청 모달 디자인 변경
2024.12.04  이유민      Modified    API 경로 수정
2024.12.17  이유민      Modified    코드 리팩토링
2025.01.22  이유민      Modified    무한 스크롤 추가
*/
let currentPage = 1; // 현재 페이지
let isLoading = false; // 데이터 로드 상태
let hasMoreData = true; // 추가 데이터 여부
const container = document.getElementById("remakeContainer");

window.addEventListener("load", async () => {
  // 관리자인지 확인
  if (localStorage.getItem("access_token")) {
    const response = await axios.get(`${window.API_SERVER_URL}/users/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    // 관리자일 때만 제품 생성 버튼 생김
    if (response.data.role === "admin")
      document.getElementById("remakeProductCreateBtn").style.display = "";
  }

  await rebornRemake(currentPage);
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
    await rebornRemake(currentPage);
    isLoading = false; // 로딩 완료
  }
});

async function rebornRemake(page) {
  if (!hasMoreData) return;

  isLoading = true;
  let contentHTML = "";

  try {
    const products = await axios.get(
      `${window.API_SERVER_URL}/remake/product?page=${page}`
    );

    if (products.data.products.length === 0) {
      hasMoreData = false; // 더 이상 데이터가 없으면 플래그 변경
      isLoading = false;
      return;
    }

    for (let i = 0; i < products.data.products.length; i++) {
      // html
      if (i % 3 === 0) {
        contentHTML += `<div class="card-contents"`;

        currentPage === 1 && i === 0
          ? (contentHTML += `>`)
          : (contentHTML += ` style="margin-top: 47px">`);
      }

      contentHTML += `
        <a href="/reborn-remake/${products.data.products[i].id}">
          <div class="card" style="width: 18rem">
              <img src="${window.API_SERVER_URL}/${
        products.data.products[i].product_image_url[0]
      }" class="card-img-top" alt="..." style="height: 214px; object-fit: cover" />
              <div class="card-body">
                  <h5 class="card-title">${
                    products.data.products[i].name.length > 12
                      ? products.data.products[i].name.slice(0, 12) + "..."
                      : products.data.products[i].name
                  }</h5>
                  <p class="card-text">${products.data.products[i].matter}</p>
                  <p class="card-text" style="color: #6c757d">${Number(
                    products.data.products[i].price
                  ).toLocaleString()}원</p>
              </div>
          </div>
        </a>
        `;

      if (
        products.data.products.length % 3 !== 0 &&
        i === products.data.products.length - 1
      ) {
        contentHTML += `<div class="card" style="width: 18rem; visibility: hidden;"></div>`;

        if (products.data.products.length % 3 === 1)
          contentHTML += `<div class="card" style="width: 18rem; visibility: hidden;"></div>`;
      }

      if (i % 3 === 2 || i === products.data.products.length - 1)
        contentHTML += `</div>`;
    }

    container.innerHTML += contentHTML;
    isLoading = false; // 로드 상태 비활성화
  } catch (err) {
    console.error(err);
  }
}

// 모달
function setModalContent(type) {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");

    location.href = "/login";
    return;
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
        <div style="font-family: LINESeed-RG; font-size: 15px; padding: 30px; border: 2px solid #479F76; border-radius: 10px; background-color: #e0f5e3; color: #333; text-align: center;">
          <div style="font-size: 15px; line-height: 1.6;">
            <p style="margin: 0 0 10px;">
              💚 <strong style="color: #479F76;">감사합니다!</strong> 💚
            </p>
            <p style="margin: 0 0 10px;">
              원하시는 리본 리사이클 제품이 목록에 없을 경우,<br />
              고객님의 요청을 바탕으로 최대한 빠르게 제품을 추가할 수 있도록 노력하겠습니다.<br />
              단, 모든 요청이 반드시 처리되는 것은 아니니, 참고 부탁드립니다.
            </p>
            <p style="margin: 0;">
              제품 요청에 대해 감사드리며,<br />
              더 나은 서비스를 제공하기 위해 계속해서 노력하겠습니다.
            </p>
          </div>
        </div>

        <div class="input-group mb-3" style="width: 586px; padding-top: 15px">
          <input type="text" class="form-control" id="requestInput" placeholder="원하는 제품을 요청해주세요." aria-label="nickname" />
        </div>
      `;
    modalContainer.setAttribute("data-modal-check", "request");
  } else if (type === "createRebornRemake") {
    modalTitle.textContent = "리본 리메이크 제품 생성하기";
    modalBody.innerHTML = `
       <!-- 파일 선택-->
        <div class="input-group mb-3" style="width: 586px">
          <input type="file" class="form-control" id="remakeProductImages" onchange="productImagesUpload(event)" multiple>
          <label class="input-group-text" for="remakeProductImages">Upload</label>
          <span id="remakeProductImagesId" style="display: none" data-value=""></span>
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

// 물품 이미지 업로드
async function productImagesUpload(event) {
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
      .getElementById("remakeProductImagesId")
      .setAttribute("data-value", result.id);
  } catch (err) {
    console.error("파일 업로드 중 오류 발생:", err);
  }
}
