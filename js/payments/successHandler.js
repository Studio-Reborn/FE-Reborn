/** 
File Name : successHandler
Description : 결제 성공 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.25  이유민      Created     
2024.11.25  이유민      Modified    결제 API 연동
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

async function confirm() {
  const paymentKey = urlParams.get("paymentKey");
  const orderId = urlParams.get("orderId");
  const amount = urlParams.get("amount");
  let order_items = [];

  try {
    const session = await axios.get(
      `/api/get-session-data?dataType=purchaseData`
    );

    // order_items 관련
    const items = await axios.get(`/api/get-session-data?dataType=productData`);
    order_items.push({
      product_id: items.data.product_id,
      quantity: items.data.product_cnt,
      price: Number(items.data.product_price),
    });

    if (!session.data) {
      alert("접근할 수 없습니다.");
      history.go(-1);
      return;
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
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    // 화면 표시
    document.getElementById(
      "purchaseUserName"
    ).innerHTML = `${session.data.name}`;
    document.getElementById(
      "purchasePhone"
    ).innerHTML = `${session.data.phone}`;
    document.getElementById(
      "purchaseAddress"
    ).innerHTML = `(${session.data.postcode}) ${session.data.address} ${session.data.detail_address} ${session.data.extra_address}`;

    // 카드 정보
    const info = await axios.get(
      `${window.API_SERVER_URL}/product/eco-market/info/${items.data.product_id}`
    );
    document.getElementById("purchaseTitle").innerHTML = info.data.name;
    document.getElementById("purchasePrice").innerHTML = Number(
      info.data.price
    ).toLocaleString();
    document.getElementById("purchaseCount").innerHTML = items.data.product_cnt;

    const image = await axios.get(
      `${window.API_SERVER_URL}/product-image/${info.data.product_image_id}`
    );
    document.getElementById(
      "purchaseImage"
    ).src = `${window.API_SERVER_URL}/${image.data.url[0]}`;

    return;
  } catch (err) {
    console.error(err);
  }
}
