/** 
File Name : indexHandler
Description : 결제 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.25  이유민      Created     
2024.11.25  이유민      Modified    결제 API 연동
2024.11.26  이유민      Modified    API 경로 수정
2024.11.28  이유민      Modified    리본 리메이크 결제 API 연동
2025.01.17  이유민      Modified    결제 코드 리팩토링
2025.01.17  이유민      Modified    장바구니 결제 시 장바구니 아이템 삭제 추가
2025.01.19  이유민      Modified    전화번호 입력 코드 리팩토링
2025.01.31  이유민      Modified    이미지 경로 수정
*/
// 토큰 없을 경우 접근 금지
window.addEventListener("load", () => {
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");
    location.href = "/login";
  }

  readProductInfo();
});

// 토스페이먼츠 관련 변수
const clientKey = window.TOSS_CLIENT_KEY;

let amount = {
  currency: "KRW",
  value: 0,
};
let selectedPaymentMethod = null;

const paymentsProductContainer = document.getElementById(
  "paymentsProductContainer"
);
const paymentsTotalPrice = document.getElementById("paymentsTotalPrice");

// 데이터 불러오기
async function readProductInfo() {
  let productInfoHTML = "";
  try {
    // 세션
    const session = await axios.get(
      `/api/get-session-data?dataType=productData`
    );

    for (let i = 0; i < session.data.length; i++) {
      // 제품 정보
      const info =
        session.data[i].category === "reborn"
          ? await axios.get(
              `${window.API_SERVER_URL}/remake/product/${session.data[i].product_id}`
            )
          : await axios.get(
              `${window.API_SERVER_URL}/product/eco-market/info/${session.data[i].product_id}`
            );

      amount.value += Number(info.data.price) * session.data[i].product_cnt;

      productInfoHTML += `
        <div class="card mb-3" style="width: 738px; height: 245px">
          <div class="row g-0" style="height: 100%">
            <div class="col-md-4" style="height: 100%">
              <img src="${window.IMAGE_SERVER_URL}${
        info.data.product_image_url[0]
      }" class="img-fluid rounded-start" alt="..." style="width: 100%; height: 100%; object-fit: cover" />
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title" style="font-family: LINESeed-BD">${
                  info.data.name
                }</h5>
                <p class="card-text">
                  <small class="text-body-secondary" style="font-family: LINESeed-RG">
                    <div>${info.data.market_name} 배송</div>
                    <div>
                      ${Number(
                        info.data.price
                      ).toLocaleString()}원 <span id="productCount">${
        session.data[i].product_cnt
      }</span>개
                    </div>
                    <!-- <div id="productOption">두꺼운 코스터</div> -->
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    paymentsProductContainer.innerHTML = productInfoHTML;
    paymentsTotalPrice.innerHTML = Number(amount.value).toLocaleString();

    return;
  } catch (err) {
    console.error(err);
  }
}

// 토스페이먼츠 관련 함수
// ------  SDK 초기화 ------
const customerKey = generateRandomString();
const tossPayments = TossPayments(clientKey);
const payment = tossPayments.payment({
  customerKey,
});

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
}

// ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
async function requestPayment() {
  const name = document.getElementById("orderName").value;
  const phone = document.getElementById("orderPhone").value;
  const postcode = document.getElementById("sample6_postcode").value;
  const address = document.getElementById("sample6_address").value;
  const detail_address = document.getElementById("sample6_detailAddress").value;
  const extra_address = document.getElementById("sample6_extraAddress").value;

  if (!name || !phone || !postcode || !address) {
    alert("입력하지 않은 정보가 있습니다.");
    return;
  }

  try {
    // 세션
    const session = await axios.get(
      `/api/get-session-data?dataType=productData`
    );

    let amountCheck = 0;
    let purchaseProductsInfo = [];

    for (let i = 0; i < session.data.length; i++) {
      // 가격 맞는지 확인
      const product =
        session.data[i].category === "reborn"
          ? await axios.get(
              `${window.API_SERVER_URL}/remake/product/${session.data[i].product_id}`
            )
          : await axios.get(
              `${window.API_SERVER_URL}/product/eco-market/info/${session.data[i].product_id}`
            );

      amountCheck +=
        Number(product.data.price) * Number(session.data[i].product_cnt);

      purchaseProductsInfo.push({
        product_id: product.data.id,
        product_name: product.data.name,
        market_id:
          session.data[i].category === "reborn" ? "" : product.data.market_id,
        market_name: product.data.market_name,
        product_price: product.data.price,
        quantity: session.data[i].product_cnt,
        product_image: product.data.product_image_url[0],
      });

      if (i === session.data.length - 1 && amountCheck !== amount.value) {
        alert("오류가 발생했습니다. 이전 페이지로 이동합니다.");
        history.go(-1);

        return;
      }
    }

    // 세션에 구매내역 저장
    await axios.post("/api/save-session-data", {
      dataType: "purchaseData",
      data: {
        product_info: purchaseProductsInfo,
        name,
        phone,
        postcode,
        address,
        detail_address,
        extra_address,
        page: session.data[0].page ? "cart" : "",
      },
    });

    // 결제
    const orderName =
      purchaseProductsInfo.length > 1
        ? `${purchaseProductsInfo[0].product_name} 외 ${
            purchaseProductsInfo.length - 1
          }건`
        : `${purchaseProductsInfo[0].product_name}`;

    switch (selectedPaymentMethod) {
      case "CARD":
        await payment.requestPayment({
          method: "CARD", // 카드 및 간편결제
          amount,
          orderId: generateRandomString(),
          orderName,
          successUrl: window.location.origin + "/payments/success", // 결제 요청이 성공하면 리다이렉트되는 URL
          failUrl: window.location.origin + "/payments/fail", // 결제 요청이 실패하면 리다이렉트되는 URL
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
          card: {
            useEscrow: false,
            flowMode: "DEFAULT",
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
      case "TRANSFER":
        await payment.requestPayment({
          method: "TRANSFER", // 계좌이체 결제
          amount,
          orderId: generateRandomString(),
          orderName,
          successUrl: window.location.origin + "/payments/success",
          failUrl: window.location.origin + "/payments/fail",
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
          transfer: {
            cashReceipt: {
              type: "소득공제",
            },
            useEscrow: false,
          },
        });
      case "VIRTUAL_ACCOUNT":
        await payment.requestPayment({
          method: "VIRTUAL_ACCOUNT", // 가상계좌 결제
          amount,
          orderId: generateRandomString(),
          orderName,
          successUrl: window.location.origin + "/payments/success",
          failUrl: window.location.origin + "/payments/fail",
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
          virtualAccount: {
            cashReceipt: {
              type: "소득공제",
            },
            useEscrow: false,
            validHours: 24,
          },
        });
      case "MOBILE_PHONE":
        await payment.requestPayment({
          method: "MOBILE_PHONE", // 휴대폰 결제
          amount,
          orderId: generateRandomString(),
          orderName,
          successUrl: window.location.origin + "/payments/success",
          failUrl: window.location.origin + "/payments/fail",
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
        });
      case "CULTURE_GIFT_CERTIFICATE":
        await payment.requestPayment({
          method: "CULTURE_GIFT_CERTIFICATE", // 문화상품권 결제
          amount,
          orderId: generateRandomString(),
          orderName,
          successUrl: window.location.origin + "/payments/success",
          failUrl: window.location.origin + "/payments/fail",
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
        });
    }
  } catch (err) {
    console.error(err);
  }
}

function generateRandomString() {
  return window.btoa(Math.random()).slice(0, 20);
}

// 주소지 관련 함수
function sample6_execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function (data) {
      // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

      // 각 주소의 노출 규칙에 따라 주소를 조합한다.
      // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
      var addr = ""; // 주소 변수
      var extraAddr = ""; // 참고항목 변수

      //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
      if (data.userSelectedType === "R") {
        // 사용자가 도로명 주소를 선택했을 경우
        addr = data.roadAddress;
      } else {
        // 사용자가 지번 주소를 선택했을 경우(J)
        addr = data.jibunAddress;
      }

      // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
      if (data.userSelectedType === "R") {
        // 법정동명이 있을 경우 추가한다. (법정리는 제외)
        // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        // 건물명이 있고, 공동주택일 경우 추가한다.
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }
        // 조합된 참고항목을 해당 필드에 넣는다.
        document.getElementById("sample6_extraAddress").value = extraAddr;
      } else {
        document.getElementById("sample6_extraAddress").value = "";
      }

      // 우편번호와 주소 정보를 해당 필드에 넣는다.
      document.getElementById("sample6_postcode").value = data.zonecode;
      document.getElementById("sample6_address").value = addr;
      // 커서를 상세주소 필드로 이동한다.
      document.getElementById("sample6_detailAddress").focus();
    },
  }).open();
}

function formatPhoneNumber(input) {
  // 숫자만 추출
  const numbers = input.value.replace(/\D/g, "");

  // 형식 지정
  const formatted = numbers.replace(
    /(\d{3})(\d{3,4})?(\d{4})?/,
    (match, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join("-")
  );

  // 포맷된 값 적용
  input.value = formatted;
}
