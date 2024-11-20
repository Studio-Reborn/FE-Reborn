/** 
File Name : modalHandler
Description : 모달 핸들러
Author : 이유민

History
Date        Author      Status      Description
2024.11.07  이유민      Created     
2024.11.07  이유민      Modified    중고거래 물품 등록 API 연동
2024.11.07  이유민      Modified    리본 리메이크 제품 추천 API 연동
2024.11.07  이유민      Modified    리본 리메이크 제품 요청 API 연동
2024.11.08  이유민      Modified    토스트 메시지 추가
2024.11.12  이유민      Modified    물건 등록 시 헤더 추가
2024.11.12  이유민      Modified    제품 요청 시 헤더 추가
2024.11.18  이유민      Modified    API 경로 수정
2024.11.19  이유민      Modified    중고거래 물품 수정 및 삭제 API 연동
2024.11.19  이유민      Modified    리본 리메이크 제품 생성 API 연동
2024.11.19  이유민      Modified    리본 리메이크 제품 수정 및 삭제 API 연동
2024.11.20  이유민      Modified    제품 이미지 업로드 API 연동
*/
document
  .getElementById("modalSubmitBtn")
  .addEventListener("click", async function () {
    const modalCheck = document
      .getElementById("modalContainer")
      .getAttribute("data-modal-check");

    if (modalCheck === "createProduct") {
      // pre-loved 물건 등록
      const name = document.getElementById("productName").value;
      const price = document.getElementById("productPrice").value;
      const detail = document
        .getElementById("productDetail")
        .value.replace(/\n/g, "<br>");

      if (!name || !price || !detail) {
        alert("입력하지 않은 값이 있습니다.");
        return;
      }
      const product_image_id = Number(
        document
          .getElementById("preLovedProductImagesId")
          .getAttribute("data-value")
      );

      try {
        await axios.post(
          `${window.API_SERVER_URL}/product`,
          { product_image_id, name, price, detail, theme: "user" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        //  모달 닫기
        var modal = bootstrap.Modal.getInstance(
          document.getElementById("modalContainer")
        );
        modal.hide();

        // 정보 최신화
        preLoved();

        // 입력칸 초기화
        document.getElementById("productName").value = "";
        document.getElementById("productPrice").value = "";
        document.getElementById("productDetail").value = "";
        document
          .getElementById("preLovedProductImagesId")
          .setAttribute("data-value", "0");

        // 토스트 메시지
        var toast = new bootstrap.Toast(
          document.getElementById("productRequestToast")
        );
        toast.show();
      } catch (err) {
        console.log(err);
      }
    } else if (
      modalCheck === "updatePreLoved" ||
      modalCheck === "deletePreLoved"
    ) {
      // pre-loved 물건 수정 또는 삭제
      const id = window.location.pathname.split("/").pop();

      try {
        if (modalCheck === "updatePreLoved") {
          // 물건 수정 시
          const name = document.getElementById("productNameNew").value;
          const price = document.getElementById("productPriceNew").value;
          const detail = document
            .getElementById("productDetailNew")
            .value.replace(/\n/g, "<br>");
          const product_image_id = Number(
            document
              .getElementById("preLovedProductImagesIdNew")
              .getAttribute("data-value-new")
          );

          const response = await axios.patch(
            `${window.API_SERVER_URL}/product/${id}`,
            {
              product_image_id,
              name,
              price,
              detail,
              theme: "user",
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }
          );

          alert(response.data.message);
          location.href = `/pre-loved/${id}`;
        } else {
          // 물건 삭제 시
          const response = await axios.delete(
            `${window.API_SERVER_URL}/product/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }
          );

          alert(response.data.message);
          location.href = `/pre-loved`;
        }
      } catch (err) {
        console.log(err);
      }
    } else if (modalCheck === "recommend") {
      // reborn-remake 제품 추천
      const thing = document.getElementById("recommendInput").value;
      const resultText = document.getElementById("recommendResult");
      const noticeText = document.getElementById("gray-600");

      if (!thing) {
        alert("입력하지 않은 값이 있습니다.");
        return;
      }

      try {
        const response = await axios.get(`${window.API_SERVER_URL}/remake`, {
          params: {
            thing,
          },
        });

        resultText.innerHTML = `리메이크 추천 제품 : ${response.data.theme}<br />
        추천 이유 : ${response.data.reason}<br />`;
        noticeText.style.display = "block";
      } catch (err) {
        console.log(err);
      }
    } else if (modalCheck === "request") {
      // reborn-remake 제품 요청
      const remake_product = document.getElementById("requestInput").value;

      try {
        const response = await axios.post(
          `${window.API_SERVER_URL}/remake/request`,
          {
            remake_product,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        //  모달 닫기
        var modal = bootstrap.Modal.getInstance(
          document.getElementById("modalContainer")
        );
        modal.hide();

        // 토스트 메시지
        var toast = new bootstrap.Toast(
          document.getElementById("productRequestToast")
        );
        toast.show();
      } catch (err) {
        console.log(err);
      }
    } else if (modalCheck === "createRebornRemakeProduct") {
      // reborn-remake 제품 생성
      const name = document.getElementById("remakeProductName").value;
      const matter = document.getElementById("remakeProductMatter").value;
      const price = document.getElementById("remakeProductPrice").value;
      const detail = document
        .getElementById("remakeProductDetail")
        .value.replace(/\n/g, "<br>");

      try {
        await axios.post(`${window.API_SERVER_URL}/remake/product`, {
          name,
          matter,
          price,
          detail,
        });

        alert("리본 리메이크 제품이 성공적으로 등록되었습니다.");
        location.href = "/reborn-remake";
      } catch (err) {
        console.log(err);
      }
    } else if (
      modalCheck === "updateRemakeProduct" ||
      modalCheck === "deleteRemakeProduct"
    ) {
      // reborn-remake 제품 수정 및 삭제
      const id = window.location.pathname.split("/").pop();

      try {
        // reborn-remake 제품 수정 시
        if (modalCheck === "updateRemakeProduct") {
          const name = document.getElementById("remakeProductNameNew").value;
          const matter = document.getElementById(
            "remakeProductMatterNew"
          ).value;
          const price = document.getElementById("remakeProductPriceNew").value;
          const detail = document
            .getElementById("remakeProductDetailNew")
            .value.replace(/\n/g, "<br>");

          const response = await axios.patch(
            `${window.API_SERVER_URL}/remake/product/${id}`,
            { name, matter, price, detail },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }
          );
          alert(response.data.message);
          location.href = `/reborn-remake/${id}`;

          return;
        }

        // reborn-remake 제품 삭제 시
        const response = await axios.delete(
          `${window.API_SERVER_URL}/remake/product/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        alert(response.data.message);
        location.href = `/reborn-remake`;

        return;
      } catch (err) {
        console.log(err);
      }
    }
  });
