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
*/
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
  }
}

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
        <div class="card" style="width: 18rem">
            <img src="/assets/images/reborn-remake-example.svg" class="card-img-top" alt="..." style="height: 214px; object-fit: cover" />
            <div class="card-body">
                <h5 class="card-title">${products.data[i].name}</h5>
                <p class="card-text">${products.data[i].matter}</p>
                <p class="card-text" style="color: #6c757d">${products.data[i].price}원</p>
            </div>
        </div>
        `;

      if (i % 3 === 2 || i === products.data.length - 1)
        contentHTML += `</div>`;
    }

    container.innerHTML = contentHTML;
  } catch (err) {
    console.log(err);
  }
}

window.onload = rebornRemake;
