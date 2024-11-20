/** 
File Name : rebornRemakeClickHandler
Description : 리본 리메이크 제품 상세 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.19  이유민      Created     
2024.11.19  이유민      Modified    리본 리메이크 API 연동
*/
const productData = {
  name: "",
  price: 0,
  detail: "",
  matter: "",
};

window.addEventListener("load", () => {
  const id = window.location.pathname.split("/").pop();

  readProductData(id);
});

async function readProductData(id) {
  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const productDetail = document.getElementById("productDetail");
  try {
    // 제품 정보 가져오기
    const product = await axios.get(
      `${window.API_SERVER_URL}/remake/product/${id}`
    );

    productName.innerHTML = product.data.name;
    productPrice.innerHTML = `${Number(product.data.price).toLocaleString()}원`;
    productDetail.innerHTML = product.data.detail;

    // 객체에 값 넣기
    productData.name = product.data.name;
    productData.price = product.data.price;
    productData.detail = product.data.detail;
    productData.matter = product.data.matter;

    // 관리자인지 확인
    if (localStorage.getItem("access_token")) {
      const response = await axios.get(`${window.API_SERVER_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // 관리자일 때만 제품 생성 버튼 생김
      if (response.data.id === 1)
        document.getElementById("remakePrincipalCheck").style.display = "flex";
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

  if (type === "updateRemakeProduct") {
    modalTitle.textContent = "리본 리메이크 제품 수정하기";
    modalBody.innerHTML = `
       <!-- 파일 선택-->
        <div class="input-group mb-3" style="width: 586px">
          <input type="file" class="form-control" id="inputGroupFile02" multiple>
          <label class="input-group-text" for="inputGroupFile02">Upload</label>
        </div>

        <!-- 제품명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="remakeProductNameNew" placeholder="제품명" value="${productData.name}">
          <label for="remakeProductNameNew">제품명</label>
        </div>

        <!-- 제품 재료 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="text" class="form-control" id="remakeProductMatterNew" placeholder="제품 재료" value="${productData.matter}">
          <label for="remakeProductMatterNew">제품 재료</label>
        </div>

        <!-- 제품 가격 -->
        <div class="form-floating mb-3" style="width: 586px">
          <input type="number" class="form-control" id="remakeProductPriceNew" placeholder="제품가격" value="${productData.price}">
          <label for="remakeProductPriceNew">제품 가격</label>
        </div>

        <!-- 제품 설명 -->
        <div class="form-floating mb-3" style="width: 586px">
          <textarea class="form-control" id="remakeProductDetailNew" placeholder="제품 설명" style="height: 150px"></textarea>
          <label for="remakeProductDetailNew">제품 설명</label>
        </div>
        `;
    document.getElementById("remakeProductDetailNew").innerHTML =
      productData.detail.replace(/<br>/g, "\n");
    modalSubmitBtn.innerHTML = "수정";
    modalSubmitBtn.style.backgroundColor = "#479F76";
    modalContainer.setAttribute("data-modal-check", "updateRemakeProduct");
  } else if (type === "deleteRemakeProduct") {
    modalTitle.textContent = "리본 리메이크 제품 삭제하기";
    modalBody.innerHTML = `
        <div style="font-family: LINESeed-BD; font-size: 30px; text-align: center">물건을 삭제하시겠습니까?</div>
        `;
    modalSubmitBtn.innerHTML = "삭제";
    modalSubmitBtn.style.backgroundColor = "#E35D6A";
    modalContainer.setAttribute("data-modal-check", "deleteRemakeProduct");
  }
}
