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
2024.11.26  이유민      Modified    API 경로 수정
2024.12.02  이유민      Modified    라디오버튼 status 연동
2024.12.04  이유민      Modified    API 경로 수정
2024.12.10  이유민      Modified    제품 상태 표시 추가
2024.12.16  이유민      Modified    좋아요 연동
2024.12.16  이유민      Modified    좋아요 수 연동
2024.12.17  이유민      Modified    코드 리팩토링
*/
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productDetail = document.getElementById("productDetail");
const userName = document.getElementById("sellUserName");
const userProfile = document.getElementById("sellUserProfile");
const productStatus = document.getElementById("productStatus");
const productStatusOverlay = document.getElementById("productStatusOverlay");
const likeImg = document.getElementById("likeImg");
const likesNumber = document.getElementById("likesNumber");

// 제품 데이터 객체로 사용하기 위함
const productData = {
  name: "",
  price: 0,
  detail: "",
  imageId: 0,
  status: "",
  seller_id: 0,
};

window.addEventListener("load", () => {
  const id = window.location.pathname.split("/").pop();

  readProductData(id);
  productLike(id);
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
  try {
    // 제품 정보 가져오기
    const product = await axios.get(
      `${window.API_SERVER_URL}/product/pre-loved/info/${id}`
    );

    productName.innerHTML = product.data.name;
    productPrice.innerHTML = `${Number(product.data.price).toLocaleString()}원`;
    productDetail.innerHTML = product.data.detail;

    if (product.data.status !== "판매중") {
      productStatusOverlay.style.display = "block";
      productStatus.innerHTML = product.data.status;
    }

    // 객체에 값 넣기
    productData.name = product.data.name;
    productData.price = product.data.price;
    productData.detail = product.data.detail;
    productData.imageId = product.data.product_image_id;
    productData.status = product.data.status;

    // 제품 판매자 정보 가져오기
    const user = await axios.get(
      `${window.API_SERVER_URL}/users/info/${product.data.user_id}`
    );
    const profile = await axios.get(
      `${window.API_SERVER_URL}/profile/${user.data.profile_image_id}`
    );

    userName.innerHTML = user.data.nickname;
    userProfile.src = `${window.API_SERVER_URL}/${profile.data.url}`;
    productData.seller_id = user.data.id;

    // 상품 이미지
    const productImages = await axios.get(
      `${window.API_SERVER_URL}/product-image/${product.data.product_image_id}`
    );
    imageList = productImages.data.url;
    mainImage.src = `${window.API_SERVER_URL}/${imageList[0]}`;

    // 로그인 상태일 때, 제품 판매자와 본인 확인하기
    if (localStorage.getItem("access_token")) {
      const check = await axios.get(`${window.API_SERVER_URL}/users/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // 판매자 본인일 때
      if (product.data.user_id === check.data.id) {
        document.getElementById("principalCheck").style.display = "flex";
      } else {
        document.getElementById("chatBar").style.display = "flex";
      }
    } else {
      document.getElementById("chatBar").style.display = "flex";
    }

    return;
  } catch (err) {
    console.log(err);
  }
}

async function productLike(id) {
  try {
    if (localStorage.getItem("access_token")) {
      // 좋아요 버튼 관련
      const likes = await axios.get(
        `${window.API_SERVER_URL}/like/product/user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!likes.data) {
        likeImg.src = `${window.location.origin}/assets/icons/heart.svg`;
      } else {
        likeImg.src = `${window.location.origin}/assets/icons/heart-fill.svg`;
      }

      likeImg.addEventListener("click", async () => {
        await axios.post(
          `${window.API_SERVER_URL}/like/product`,
          { product_id: id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        location.reload(true);
      });
    }

    // 좋아요 수 관련
    const likesAll = await axios.get(
      `${window.API_SERVER_URL}/like/product/all/${id}`
    );

    likesNumber.innerHTML = `${Number(likesAll.data.length).toLocaleString()}`;
  } catch (err) {
    console.error(err);
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

        <!-- 거래 상태 -->
        <label for="productStatusGroup" class="form-label" style="font-family: LINESeed-RG">거래 상태 선택</label>
        <div id="productStatusGroup" class="form-check-group d-flex align-items-center mb-3" style="gap: 20px; width: 586px; font-family: LINESeed-RG">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="productStatus" id="statusOnSale" value="판매중">
            <label class="form-check-label" for="statusOnSale">
              판매중
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="productStatus" id="statusReser" value="거래중">
            <label class="form-check-label" for="statusReser">
              거래중
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="productStatus" id="statusSoldOut" value="판매완료">
            <label class="form-check-label" for="statusSoldOut">
              판매완료
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="productStatus" id="statusHidden" value="숨김">
            <label class="form-check-label" for="statusHidden">
              숨김
            </label>
          </div>
        </div>
      `;
    document.getElementById("productDetailNew").innerHTML =
      productData.detail.replace(/<br>/g, "\n");
    modalSubmitBtn.innerHTML = "수정";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalContainer.setAttribute("data-modal-check", "updatePreLoved");

    // 라디오버튼 checked 관련
    document.querySelector(
      `input[name="productStatus"][value="${productData.status}"]`
    ).checked = true;

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

// 채팅방 생성
async function createChat() {
  try {
    const chat = await axios.post(
      `${window.API_SERVER_URL}/chat`,
      {
        product_id: window.location.pathname.split("/").pop(),
        seller_id: productData.seller_id,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    location.href = `/chat/${chat.data.id}`;
  } catch (err) {
    console.error(err);
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
