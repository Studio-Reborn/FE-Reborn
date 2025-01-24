/** 
File Name : indexlHandler
Description : 내 채팅 페이지 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.12.09  이유민      Created     
2024.12.09  이유민      Modified    내 채팅 API 연동
2024.12.30  이유민      Modified    디버깅 코드 제거
2025.01.19  이유민      Modified    채팅 이미지 코드 리팩토링
*/
const myChatContainer = document.getElementById("myChatContainer");
const newChatList = JSON.parse(localStorage.getItem("newChats")) || [];
let myChatHTML = "";

window.addEventListener("load", () => {
  // 토큰 없을 경우 버튼 없음
  if (!localStorage.getItem("access_token")) {
    alert("로그인 후 이용 가능합니다.");
    location.href = "/login";
  }

  getMyChatAll();
});

async function verify() {
  return await axios.get(`${window.API_SERVER_URL}/auth/verify`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}

async function getMyChatAll() {
  const myInfo = await verify();

  const myChat = await axios.get(`${window.API_SERVER_URL}/chat`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  for (let i = 0; i < myChat.data.length; i++) {
    myChatHTML += `
    <a href="/chat/${myChat.data[i].chat_id}">
            <div class="card mb-3" style="width: 738px; height: 200px">
                <div class="row g-0" style="height: 100%">
                    <div class="col-md-4" style="height: 100%;">
                        <img src="${window.API_SERVER_URL}/${
      myChat.data[i].product_image[0]
    }" class="img-fluid rounded-start" alt="상품 이미지" style="height: 100%; width: 100%; object-fit: cover;" />
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                          <div style="position: relative; display: inline-block;">
                            <h5 class="card-title">${
                              myInfo.data.user_id === myChat.data[i].seller_id
                                ? myChat.data[i].buyer_nickname
                                : myChat.data[i].seller_nickname
                            }</h5>
                            <span style="display: ${
                              newChatList.includes(myChat.data[i].chat_id)
                                ? "inline-block"
                                : "none"
                            }; position: absolute; top: -3px; right: -10px; width: 12px; height: 12px; background-color: #FFCD39; border-radius: 50%;"></span>
                          </div>
                            <p class="card-text">
                                <small class="text-body-secondary">
                                    ${myChat.data[i].product_name}<br />
                                    ${Number(
                                      myChat.data[i].product_price
                                    ).toLocaleString()}원<br />
                                    최근 대화 : ${
                                      myChat.data[i].latest_created_at.split(
                                        "T"
                                      )[0]
                                    }
                                </small>
                                <!-- 버튼 -->
                                <div>
                                    <button type="button" class="global-btn" style="font-size: 16px; background-color: #E35D6A" onclick="deleteMyChat(event, '${
                                      myChat.data[i].chat_id
                                    }');">
                                        삭제
                                    </button>
                                </div>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
  </a>
    `;
  }

  myChatContainer.innerHTML = myChatHTML;
}

async function deleteMyChat(event, chat_id) {
  event.preventDefault();
  const check = confirm("채팅을 삭제하시겠습니까?");

  if (check) {
    try {
      await axios.delete(`${window.API_SERVER_URL}/chat/${chat_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      alert("채팅이 성공적으로 삭제되었습니다.");
      location.reload(true);
    } catch (err) {
      console.error(err);
    }
  }
}
