/** 
File Name : detailHandler
Description : 채팅 상세 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.12.05  이유민      Created     
2024.12.05  이유민      Modified    채팅 API 연동
2024.12.17  이유민      Modified    판매자 확인 추가
2024.12.30  이유민      Modified    중고거래 판매 완료 API 연동
2025.02.03  이유민      Modified    서버 아이디 수정
*/
const chat_id = window.location.pathname.split("/").pop();
let message = "";
const chat = document.getElementById("chatContainer");
const chatPreviousContainer = document.getElementById("chatPreviousContainer");
const totalChatContainer = document.getElementById("totalChatContainer");
const chatTitleProductName = document.getElementById("chatTitleProductName");
const chatTitleProductPrice = document.getElementById("chatTitleProductPrice");
const chatOther = document.getElementById("chatOther");
const chatProduct = document.getElementById("chatProduct");
const leftTransBtn = document.getElementById("leftTransBtn");
const rightTransBtn = document.getElementById("rightTransBtn");

window.addEventListener("load", () => {
  // 토큰 없을 경우 버튼 없음
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");
    location.href = "/login";
  }

  loadPreviousMessages(chat_id);
});

async function verify() {
  return await axios.get(`${window.API_SERVER_URL}/auth/verify`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}

// 서버로부터 메시지 수신
socket.on(`${chat_id}`, async (data) => {
  const user = await verify();

  if (data.sender_id === user.data.user_id) {
    message += `
        <p class="message sent">
            ${data.content}
        </p>
    `;
  } else if (data.sender_id === 1) {
    message += `
        <div class="server">
          ${data.content}
        </div>
    `;
  } else {
    message += `
        <p class="message received">
            ${data.content}
        </p>
    `;
  }
  chat.innerHTML = message;

  // 스크롤을 맨 아래로 이동
  totalChatContainer.scrollTop = totalChatContainer.scrollHeight;
});

// 메시지 전송
async function sendMessage() {
  const input = document.getElementById("messageInput");

  if (input.value.trim() === "") {
    return;
  }
  const user = await verify();

  socket.emit("message", {
    chat_id,
    sender_id: user.data.user_id,
    content: input.value,
  });
  input.value = "";
}

// 이전 메시지 조회
async function loadPreviousMessages(chat_id) {
  let previousMessage = "";
  try {
    // 본인 확인
    const user = await verify();

    // 채팅 정보
    const response = await axios.get(
      `${window.API_SERVER_URL}/chat/${chat_id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    // 초기 렌더링
    renderButtons(response, user);

    // 판매 제품 정보
    chatTitleProductName.innerHTML = response.data.chat.product_name;
    chatTitleProductPrice.innerHTML = Number(
      response.data.chat.product_price
    ).toLocaleString();
    chatOther.innerHTML =
      user.data.user_id === response.data.chat.seller_id
        ? response.data.chat.buyer_nickname
        : response.data.chat.seller_nickname;
    chatProduct.addEventListener("click", () => {
      location.href = `/pre-loved/${response.data.chat.product_id}`;
    });

    // 이전 채팅 관련
    if (
      response.data.messages.length === 1 &&
      response.data.messages[0].messages_content === null
    )
      return;

    for (let i = 0; i < response.data.messages.length; i++) {
      if (response.data.messages[i].messages_sender_id === user.data.user_id) {
        previousMessage += `
                <p class="message sent">
                    ${response.data.messages[i].messages_content}
                </p>
            `;
      } else if (response.data.messages[i].messages_sender_id === 1) {
        previousMessage += `
                <div class="server">
                  ${response.data.messages[i].messages_content}
                </div>
            `;
      } else {
        previousMessage += `
                <p class="message received">
                    ${response.data.messages[i].messages_content}
                </p>
            `;
      }

      chatPreviousContainer.innerHTML += previousMessage;
    }

    totalChatContainer.scrollTop = totalChatContainer.scrollHeight;
  } catch (err) {
    console.error(err);
  }
}

// 거래 관련 버튼
function renderButtons(response, user) {
  // 모든 버튼 초기화
  leftTransBtn.style.display = "none";
  rightTransBtn.style.display = "none";

  // 판매자 아닐 경우 버튼 없음
  if (response.data.chat.seller_id !== user.data.user_id) return;

  if (response.data.chat.product_status === "판매중") {
    rightTransBtn.style.display = "flex";
    rightTransBtn.innerHTML = "거래 시작";

    // 판매중 버튼 클릭 이벤트
    rightTransBtn.onclick = async (event) => {
      event.stopPropagation();

      await axios.patch(
        `${window.API_SERVER_URL}/product/pre-loved/${response.data.chat.product_id}`,
        { status: "거래중" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // 상태 업데이트
      response.data.chat.product_status = "거래중";
      renderButtons(response, user);

      // 메시지 전송
      socket.emit("message", {
        chat_id,
        sender_id: 1, // 리본 공식 계정
        content: `${response.data.chat.seller_nickname} 님이 ${response.data.chat.buyer_nickname} 님에게 물품을 판매합니다.`,
      });
    };
  } else if (response.data.chat.product_status === "거래중") {
    leftTransBtn.style.display = "flex";
    leftTransBtn.innerHTML = "거래 취소";
    leftTransBtn.onclick = async (event) => {
      event.stopPropagation();

      await axios.patch(
        `${window.API_SERVER_URL}/product/pre-loved/${response.data.chat.product_id}`,
        { status: "판매중" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // 상태 업데이트
      response.data.chat.product_status = "판매중";
      renderButtons(response, user);

      // 메시지 전송
      socket.emit("message", {
        chat_id,
        sender_id: 1, // 리본 공식 계정
        content: `거래를 취소합니다.`,
      });
    };

    rightTransBtn.style.display = "flex";
    rightTransBtn.innerHTML = "거래 완료";
    rightTransBtn.onclick = async (event) => {
      event.stopPropagation();

      await axios.patch(
        `${window.API_SERVER_URL}/product/pre-loved/${response.data.chat.product_id}`,
        { status: "판매완료" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // buyer_user_id 값 갱신
      await axios.patch(
        `${window.API_SERVER_URL}/product/sold-out/${response.data.chat.product_id}`,
        { buyer_user_id: response.data.chat.buyer_id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // 상태 업데이트
      response.data.chat.product_status = "판매완료";
      renderButtons(response, user);

      // 메시지 전송
      socket.emit("message", {
        chat_id,
        sender_id: 1, // 리본 공식 계정
        content: `거래를 종료합니다.`,
      });
    };
  }
}
