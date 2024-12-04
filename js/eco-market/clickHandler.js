/** 
File Name : clickHandler
Description : 에코마켓 마켓 정보 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.21  이유민      Created     
2024.11.21  이유민      Modified    에코마켓 전체 API 연동
2024.11.22  이유민      Modified    모달 추가
2024.11.26  이유민      Modified    API 경로 수정
2024.12.04  이유민      Modified    API 경로 수정
*/
window.addEventListener("load", () => {
  const id = window.location.pathname.split("/").pop();

  readMarketInfo(id);
  readMarketProducts(id);
});

let profileImageId = 0;

async function readMarketInfo(id) {
  try {
    // 마켓 정보 관련
    const info = await axios.get(`${window.API_SERVER_URL}/market/${id}`);

    document.getElementById("marketName").innerHTML = info.data.market_name;
    document.getElementById("marketDetail").innerHTML = info.data.market_detail;

    // 프로필 이미지 관련
    const profile = await axios.get(
      `${window.API_SERVER_URL}/profile/${info.data.profile_image_id}`
    );

    document.getElementById(
      "marketProfileImageBig"
    ).src = `${window.API_SERVER_URL}/${profile.data.url}`;
    document.getElementById(
      "marketProfileImageSmall"
    ).src = `${window.API_SERVER_URL}/${profile.data.url}`;

    profileImageId = profile.data.id;

    // 로그인 상태일 때, 마켓주인과 본인 확인하기
    if (localStorage.getItem("access_token")) {
      const check = await axios.get(`${window.API_SERVER_URL}/users/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // 본인이 마켓 주인일 경우 수정, 삭제 글자 표시
      if (info.data.user_id === check.data.id)
        document.getElementById("principalCheck").style.display = "flex";
    }
  } catch (err) {
    console.error(err);
  }
}

async function readMarketProducts(id) {
  const container = document.getElementById("ecoMarketProductContainer");
  let containerHTML = "";

  try {
    // 마켓의 판매 제품
    const products = await axios.get(
      `${window.API_SERVER_URL}/product/eco-market/market/${id}`
    );

    for (let i = 0; i < products.data.length; i++) {
      // 제품 이미지
      const productImage = await axios.get(
        `${window.API_SERVER_URL}/product-image/${products.data[i].product_image_id}`
      );

      // html
      if (i % 3 === 0) containerHTML += `<div class="card-contents">`;

      containerHTML += `
        <a href="/eco-market/${id}/${products.data[i].id}">
          <div class="card" style="width: 18rem">
            <img src="${window.API_SERVER_URL}/${
        productImage.data.url[0]
      }" class="card-img-top" alt="..." style="height: 214px; object-fit: cover" />
            <div class="card-body">
              <h5 class="card-title">${products.data[i].name}</h5>
              <p class="card-text">${Number(
                products.data[i].price
              ).toLocaleString()}원</p>
              <p class="card-text" style="color: #6c757d; font-size: 12px">후기 654</p>
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

    container.innerHTML = containerHTML;
  } catch (err) {
    console.error(err);
  }
}

// 모달 함수
function setModalContent(type) {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");

    location.href = "/login";
  }

  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.querySelector(".modal-body");
  const modalContainer = document.getElementById("modalContainer");
  const modalSubmitBtn = document.getElementById("modalSubmitBtn");

  if (type === "createMarketProduct") {
    // 마켓 물건 등록
    modalTitle.textContent = "마켓 물건 등록하기";
    modalBody.innerHTML = `
        <!-- 파일 선택-->
        <div class="input-group mb-3" style="width: 586px">
          <input type="file" class="form-control" id="marketProductImages" multiple>
          <label class="input-group-text" for="marketProductImages">Upload</label>
          <span id="marketProductImagesId" style="display: none" data-value=""></span>
        </div>

        <!-- 제품명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="marketProductName" placeholder="제품명">
          <label for="marketProduct">제품명</label>
        </div>

        <!-- 제품 가격 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="number" class="form-control" id="marketProductPrice" placeholder="제품가격">
          <label for="marketProductPrice">제품 가격</label>
        </div>

        <!-- 제품 설명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="marketProductDetail" placeholder="제품 설명" style="height: 150px"></textarea>
          <label for="marketProductDetail">제품 설명</label>
        </div>

        <!-- 제품 수량 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="number" class="form-control" id="marketProductQuantity" placeholder="제품 수량">
          <label for="marketProductQuantity">제품 수량</label>
        </div>
        `;
    modalSubmitBtn.innerHTML = "등록";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalContainer.setAttribute("data-modal-check", "createMarketProduct");

    // 물건 이미지 업로드 관련
    document
      .getElementById("marketProductImages")
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
            .getElementById("marketProductImagesId")
            .setAttribute("data-value", result.id);

          return;
        } catch (err) {
          console.error(err);
        }
      });
  } else if (type === "updateMarket") {
    // 마켓 정보 수정
    modalTitle.textContent = "마켓 정보 수정하기";
    modalBody.innerHTML = `
        <!-- 파일 선택-->
        <div class="input-group mb-3" style="width: 586px">
          <input type="file" class="form-control" id="ecoMarketProfileImageNew" onchange="uploadProfileImage()">
          <label class="input-group-text" for="ecoMarketProfileImageNew">Upload</label>
          <span id="ecoMarketProfileImageNewId" style="display: none" data-value="${profileImageId}"></span>
        </div>

        <!-- 마켓명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="ecoMarketNameNew" placeholder="마켓명" value="${
            document.getElementById("marketName").innerHTML
          }">
          <label for="ecoMarketNameNew">마켓명</label>
        </div>

        <!-- 마켓 설명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="ecoMarketDetailNew" placeholder="마켓 설명" style="height: 150px">${document
            .getElementById("marketDetail")
            .innerHTML.replace(/<br>/g, "\n")}</textarea>
          <label for="ecoMarketDetailNew">마켓 설명</label>
        </div>
        `;
    modalSubmitBtn.innerHTML = "수정";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalContainer.setAttribute("data-modal-check", "updateEcoMarketInfo");
  } else if (type === "deleteMarket") {
    modalTitle.textContent = "마켓 삭제 요청하기";
    modalBody.innerHTML = `
        <div style="font-family: LINESeed-RG; font-size: 15px; padding: 30px; border: 2px solid #ff6b6b; border-radius: 10px; background-color: #fff5f5; color: #333; text-align: center;">
            <div style="font-family: 'LINESeed-BD', sans-serif; font-size: 30px; margin-bottom: 20px; color: #e63946;">
                마켓을 삭제하시겠습니까?
            </div>    
            <div style="font-size: 15px; line-height: 1.6;">
                <p style="margin: 0 0 10px;">
                    🚨 <strong style="color: #e63946;">경고</strong> 🚨
                </p>
                <p style="margin: 0 0 10px;">
                    마켓 삭제 요청은 관리자의 확인 후 최종 처리됩니다.<br />
                    삭제 요청을 제출하시면, 관리자가 요청을 검토하여 문제가 없을 경우<br />
                    <strong style="color: #d90429;">마켓이 영구적으로 삭제됩니다.</strong>
                </p>
                <p style="margin: 0;">
                    삭제 요청은 <strong style="color: #d90429;">철회할 수 없으며,</strong><br />
                    삭제된 마켓은 <strong style="color: #d90429;">복구할 수 없으니</strong> 신중히 결정해주세요.
                </p>
            </div>
        </div>
        `;
    modalSubmitBtn.innerHTML = "삭제";
    modalSubmitBtn.style.backgroundColor = "#E35D6A";
    modalContainer.setAttribute("data-modal-check", "deleteRequestEcoMarket");
  }
}

// 마켓 프로필 이미지 업로드
async function uploadProfileImage() {
  try {
    const fileInput = document.getElementById("ecoMarketProfileImageNew");
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
        .getElementById("ecoMarketProfileImageNewId")
        .setAttribute("data-value", response.data.id);
      profileImageId = response.data.id;

      return;
    }
  } catch (err) {
    console.log(err);
  }
}
