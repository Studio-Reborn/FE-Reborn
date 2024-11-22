/** 
File Name : preLovedClickHandler
Description : 중고거래 제품 상세 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.18  이유민      Created     
2024.11.18  이유민      Modified    상품 개별 조회 API 연동
2024.11.19  이유민      Modified    상품 수정 API 연동
2024.11.19  이유민      Modified    상품 삭제 API 연동
2024.11.20  이유민      Modified    상품 이미지 수정 API 연동
2024.11.21  이유민      Modified    이미지 모달창 추가
*/
// 제품 데이터 객체로 사용하기 위함
const productData = {
  name: "",
  price: 0,
  detail: "",
  imageId: 0,
};

window.addEventListener("load", () => {
  const id = window.location.pathname.split("/").pop();

  readProductData(id);
});

// 상품 이미지 관련
let imageList = [];
let currentIndex = 0;

const mainImage = document.getElementById("mainPreLovedProductImage");
const caretLeftBtn = document.getElementById("caretLeftBtn");
const caretRightBtn = document.getElementById("caretRightBtn");

caretLeftBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
  mainImage.src = `${window.API_SERVER_URL}/${imageList[currentIndex]}`;
});

caretRightBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % imageList.length;
  mainImage.src = `${window.API_SERVER_URL}/${imageList[currentIndex]}`;
});

// 정보 읽기
async function readProductData(id) {
  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const productDetail = document.getElementById("productDetail");
  const userName = document.getElementById("sellUserName");
  const userProfile = document.getElementById("sellUserProfile");
  try {
    // 제품 정보 가져오기
    const product = await axios.get(
      `${window.API_SERVER_URL}/product/details/${id}`
    );

    productName.innerHTML = product.data.name;
    productPrice.innerHTML = `${Number(product.data.price).toLocaleString()}원`;
    productDetail.innerHTML = product.data.detail;

    // 객체에 값 넣기
    productData.name = product.data.name;
    productData.price = product.data.price;
    productData.detail = product.data.detail;
    productData.imageId = product.data.product_image_id;

    // 제품 판매자 정보 가져오기
    const user = await axios.get(
      `${window.API_SERVER_URL}/users/${product.data.user_id}`
    );
    const profile = await axios.get(
      `${window.API_SERVER_URL}/profile/${user.data.profile_image_id}`
    );

    userName.innerHTML = user.data.nickname;
    userProfile.src = `${window.API_SERVER_URL}/${profile.data.url}`;

    // 상품 이미지
    const productImages = await axios.get(
      `${window.API_SERVER_URL}/product-image/${product.data.product_image_id}`
    );
    imageList = productImages.data.url;
    mainImage.src = `${window.API_SERVER_URL}/${imageList[0]}`;

    // 로그인 상태일 때, 제품 판매자와 본인 확인하기
    if (localStorage.getItem("access_token")) {
      const check = await axios.get(`${window.API_SERVER_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // 판매자 본인일 때
      if (product.data.user_id === check.data.id) {
        // console.log("본인!");
        document.getElementById("principalCheck").style.display = "flex";
      }
    }

    return;
  } catch (err) {
    console.log(err);
  }
}

function setModalContent(type) {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");

    location.href = "/login";
  }

  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.querySelector(".modal-body");
  const modalContainer = document.getElementById("modalContainer");
  const modalSubmitBtn = document.getElementById("modalSubmitBtn");

  if (type === "update") {
    modalTitle.textContent = "내 물건 수정하기";
    modalBody.innerHTML = `
       <!-- 파일 선택-->
        <div class="input-group mb-3" style="width: 586px">
          <input type="file" class="form-control" id="preLovedProductImagesNew" multiple>
          <label class="input-group-text" for="preLovedProductImagesNew">Upload</label>
          <span id="preLovedProductImagesIdNew" style="display: none" data-value-new="${productData.imageId}"></span>
        </div>

        <!-- 제품명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="productNameNew" placeholder="제품명" value="${productData.name}">
          <label for="floatingInput">제품명</label>
        </div>

        <!-- 제품 가격 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="number" class="form-control" id="productPriceNew" placeholder="제품가격" value="${productData.price}">
          <label for="floatingInput">제품 가격</label>
        </div>

        <!-- 제품 설명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="productDetailNew" placeholder="제품 설명" style="height: 150px"></textarea>
          <label for="productDetailNew">제품 설명</label>
        </div>
      `;
    document.getElementById("productDetailNew").innerHTML =
      productData.detail.replace(/<br>/g, "\n");
    modalSubmitBtn.innerHTML = "수정";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalContainer.setAttribute("data-modal-check", "updatePreLoved");

    // 물건 이미지 업로드 관련
    document
      .getElementById("preLovedProductImagesNew")
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
            .getElementById("preLovedProductImagesIdNew")
            .setAttribute("data-value-new", result.id);

          return;
        } catch (err) {
          console.error(err);
        }
      });
  } else if (type === "delete") {
    modalTitle.textContent = "내 물건 삭제하기";
    modalBody.innerHTML = `
      <div style="font-family: LINESeed-BD; font-size: 30px; text-align: center">물건을 삭제하시겠습니까?</div>
      `;
    modalSubmitBtn.innerHTML = "삭제";
    modalSubmitBtn.style.backgroundColor = "#E35D6A";
    modalContainer.setAttribute("data-modal-check", "deletePreLoved");
  }
}

// 이미지 클릭 시 크게 보이도록 하는 함수
function openModal(imageSrc) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  // 모달 이미지 src 설정
  modalImage.src = imageSrc;

  // 모달 보이기
  modal.style.display = "flex";
}

// 이미지 모달 닫기
function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
}

// ESC 키로 이미지 모달 닫기
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});
