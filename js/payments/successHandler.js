/** 
File Name : successHandler
Description : 결제 성공 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.25  이유민      Created     
2024.11.25  이유민      Modified    결제 API 연동
2024.11.28  이유민      Modified    리본 리메이크 결제 API 연동
2025.01.17  이유민      Modified    결제 코드 리팩토링
2025.01.17  이유민      Modified    장바구니 결제 시 장바구니 아이템 삭제 추가
2025.01.18  이유민      Modified    name 및 phone 추가
2025.01.19  이유민      Modified    쇼핑 계속하기 연동
2025.01.31  이유민      Modified    이미지 경로 수정
*/
window.addEventListener("load", () => {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");
    location.href = "/login";

    return;
  }

  confirm();
});

const urlParams = new URLSearchParams(window.location.search);
const purchaseProductsContainer = document.getElementById(
  "purchaseProductsContainer"
);

async function confirm() {
  const paymentKey = urlParams.get("paymentKey");
  const orderId = urlParams.get("orderId");
  const amount = urlParams.get("amount");
  let order_items = [];
  let purchaseHTML = "";

  try {
    const session = await axios.get(
      `/api/get-session-data?dataType=purchaseData`
    );

    if (!session.data) {
      alert("접근할 수 없습니다.");
      history.go(-1);
      return;
    }

    for (let i = 0; i < session.data.product_info.length; i++) {
      order_items.push({
        product_id: session.data.product_info[i].product_id,
        quantity: Number(session.data.product_info[i].quantity),
        price: Number(session.data.product_info[i].product_price),
        category:
          session.data.product_info[i].market_id === "" ? "reborn" : "market",
      });

      const cardHref =
        session.data.product_info[i].market_id === ""
          ? `/reborn-remake/${session.data.product_info[i].product_id}`
          : `/eco-market/${session.data.product_info[i].market_id}/${session.data.product_info[i].product_id}`;

      purchaseHTML += `
      <a href="${cardHref}">
        <div class="card mb-3" style="width: 738px; height: 245px">
          <div class="row g-0" style="height: 100%">
            <div class="col-md-4" style="height: 100%">
              <img src="${window.IMAGE_SERVER_URL}${
        session.data.product_info[i].product_image
      }" class="img-fluid rounded-start" alt="..." style="width: 100%; height: 100%; object-fit: cover" />
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${
                  session.data.product_info[i].product_name
                }</h5>
                <p class="card-text">
                  <small class="text-body-secondary" style="font-family: LINESeed-RG">
                    <div>${session.data.product_info[i].market_name} 배송</div>
                    <div>
                      ${Number(
                        session.data.product_info[i].product_price
                      ).toLocaleString()}원 ${
        session.data.product_info[i].quantity
      }개
                    </div>
                    <!-- <div id="productOption">두꺼운 코스터</div> -->
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </a>
      `;
    }

    // 결제
    await axios.post(
      `${window.API_SERVER_URL}/billing`,
      {
        orderId,
        amount,
        paymentKey,
        postcode: session.data.postcode,
        address: session.data.address,
        detail_address: session.data.detail_address,
        extra_address: session.data.extra_address,
        order_items,
        name: session.data.name,
        phone: session.data.phone,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    // 장바구니 결제 시 장바구니 데이터 삭제
    if (session.data.page === "cart") {
      await axios.delete(`${window.API_SERVER_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    }

    // 입력 정보 화면 표시
    document.getElementById(
      "purchaseUserName"
    ).innerHTML = `${session.data.name}`;
    document.getElementById(
      "purchasePhone"
    ).innerHTML = `${session.data.phone}`;
    document.getElementById(
      "purchaseAddress"
    ).innerHTML = `(${session.data.postcode}) ${session.data.address} ${session.data.detail_address} ${session.data.extra_address}`;

    // 카드(구매제품) 정보
    purchaseProductsContainer.innerHTML = purchaseHTML;

    return;
  } catch (err) {
    console.error(err);
  }
}

function goShopping() {
  history.go(-3);
}
