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
2024.11.21  이유민      Modified    에코마켓 마켓 추가 API 연동
2024.11.21  이유민      Modified    에코마켓 물품 추가 API 연동
2024.11.22  이유민      Modified    에코마켓 API 연동
2024.11.22  이유민      Modified    리본 리메이크 제품 이미지 업로드 API 연동
2024.11.26  이유민      Modified    API 경로 수정
2024.12.02  이유민      Modified    라디오버튼 status 추가
*/
document
  .getElementById("modalSubmitBtn")
  .addEventListener("click", async function () {
    const modalCheck = document
      .getElementById("modalContainer")
      .getAttribute("data-modal-check");

    try {
      if (modalCheck === "createProduct") {
        // CASE: pre-loved 물건 등록
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

        await axios.post(
          `${window.API_SERVER_URL}/product/pre-loved`,
          { product_image_id, name, price, detail },
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
          .setAttribute("data-value", "");

        // 토스트 메시지
        var toast = new bootstrap.Toast(
          document.getElementById("productRequestToast")
        );
        toast.show();

        return;
      } else if (
        modalCheck === "updatePreLoved" ||
        modalCheck === "deletePreLoved"
      ) {
        // CASE: pre-loved 물건 수정 또는 삭제
        const id = window.location.pathname.split("/").pop();

        if (modalCheck === "updatePreLoved") {
          // CASE: 물건 수정 시
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
          const status = document.querySelector(
            'input[name="productStatus"]:checked'
          ).value;

          const response = await axios.patch(
            `${window.API_SERVER_URL}/product/pre-loved/${id}`,
            {
              product_image_id,
              name,
              price,
              detail,
              status,
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
            `${window.API_SERVER_URL}/product/pre-loved/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }
          );

          alert(response.data.message);
          location.href = `/pre-loved`;
        }

        return;
      } else if (modalCheck === "recommend") {
        // CASE: reborn-remake 제품 추천
        const thing = document.getElementById("recommendInput").value;
        const resultText = document.getElementById("recommendResult");
        const noticeText = document.getElementById("gray-600");

        if (!thing) {
          alert("입력하지 않은 값이 있습니다.");
          return;
        }

        const response = await axios.get(`${window.API_SERVER_URL}/remake`, {
          params: {
            thing,
          },
        });

        resultText.innerHTML = `리메이크 추천 제품 : ${response.data.theme}<br />
        추천 이유 : ${response.data.reason}<br />`;
        noticeText.style.display = "block";

        return;
      } else if (modalCheck === "request") {
        // CASE: reborn-remake 제품 요청
        const remake_product = document.getElementById("requestInput").value;

        await axios.post(
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

        return;
      } else if (modalCheck === "createRebornRemakeProduct") {
        // reborn-remake 제품 생성
        const name = document.getElementById("remakeProductName").value;
        const matter = document.getElementById("remakeProductMatter").value;
        const price = document.getElementById("remakeProductPrice").value;
        const detail = document
          .getElementById("remakeProductDetail")
          .value.replace(/\n/g, "<br>");
        const product_image_id = document
          .getElementById("remakeProductImagesId")
          .getAttribute("data-value");

        await axios.post(`${window.API_SERVER_URL}/remake/product`, {
          product_image_id,
          name,
          matter,
          price,
          detail,
        });

        alert("리본 리메이크 제품이 성공적으로 등록되었습니다.");
        location.href = "/reborn-remake";

        return;
      } else if (
        modalCheck === "updateRemakeProduct" ||
        modalCheck === "deleteRemakeProduct"
      ) {
        // CASE: reborn-remake 제품 수정 및 삭제
        const id = window.location.pathname.split("/").pop();

        // CASE: reborn-remake 제품 수정 시
        if (modalCheck === "updateRemakeProduct") {
          const name = document.getElementById("remakeProductNameNew").value;
          const matter = document.getElementById(
            "remakeProductMatterNew"
          ).value;
          const price = document.getElementById("remakeProductPriceNew").value;
          const detail = document
            .getElementById("remakeProductDetailNew")
            .value.replace(/\n/g, "<br>");
          const product_image_id = document
            .getElementById("remakeProductImagesIdNew")
            .getAttribute("data-value");

          const response = await axios.patch(
            `${window.API_SERVER_URL}/remake/product/${id}`,
            { product_image_id, name, matter, price, detail },
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

        // CASE: reborn-remake 제품 삭제 시
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
      } else if (modalCheck === "createEcoMarket") {
        // CASE: eco-market 마켓 등록
        const market_name = document.getElementById("ecoMarketName").value;
        const market_detail = document
          .getElementById("ecoMarketDetail")
          .value.replace(/\n/g, "<br>");
        const profile_image_id = document
          .getElementById("ecoMarketProfileImageId")
          .getAttribute("data-value");

        if (!market_name || !market_detail || !profile_image_id) {
          alert("입력하지 않은 값이 있습니다.");
          return;
        }

        await axios.post(
          `${window.API_SERVER_URL}/market`,
          {
            profile_image_id,
            market_name,
            market_detail,
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

        // 입력칸 초기화
        document.getElementById("ecoMarketName").value = "";
        document.getElementById("ecoMarketDetail").value = "";
        document
          .getElementById("ecoMarketProfileImageId")
          .setAttribute("data-value", "");

        // 토스트 메시지
        var toast = new bootstrap.Toast(
          document.getElementById("productRequestToast")
        );
        toast.show();

        return;
      } else if (modalCheck === "updateEcoMarketInfo") {
        // CASE: eco-market 마켓 수정
        const id = window.location.pathname.split("/").pop();

        const market_name = document.getElementById("ecoMarketNameNew").value;
        const market_detail = document
          .getElementById("ecoMarketDetailNew")
          .value.replace(/\n/g, "<br>");
        const profile_image_id = document
          .getElementById("ecoMarketProfileImageNewId")
          .getAttribute("data-value");

        await axios.patch(
          `${window.API_SERVER_URL}/market/info/${id}`,
          {
            profile_image_id,
            market_name,
            market_detail,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        alert("마켓 정보가 성공적으로 변경되었습니다.");
        location.reload(true);

        return;
      } else if (modalCheck === "deleteRequestEcoMarket") {
        // CASE: eco-market 마켓 삭제 요청
        const id = window.location.pathname.split("/").pop();

        await axios.patch(
          `${window.API_SERVER_URL}/market/request/${id}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        alert("마켓 삭제 요청이 전달되었습니다.");
        location.href = "/eco-market";

        return;
      } else if (modalCheck === "createMarketProduct") {
        // CASE: eco-market 물건 등록
        const market_id = window.location.pathname.split("/").pop();
        const name = document.getElementById("marketProductName").value;
        const price = document.getElementById("marketProductPrice").value;
        const detail = document
          .getElementById("marketProductDetail")
          .value.replace(/\n/g, "<br>");
        const product_image_id = Number(
          document
            .getElementById("marketProductImagesId")
            .getAttribute("data-value")
        );
        const quantity = document.getElementById("marketProductQuantity").value;

        if (!name || !price || !detail || !quantity) {
          alert("입력하지 않은 값이 있습니다.");
          return;
        }

        await axios.post(
          `${window.API_SERVER_URL}/product/eco-market/${market_id}`,
          {
            product_image_id,
            name,
            price,
            detail,
            quantity,
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

        // 입력칸 초기화
        document.getElementById("marketProductName").value = "";
        document.getElementById("marketProductPrice").value = "";
        document.getElementById("marketProductDetail").value = "";
        document
          .getElementById("marketProductImagesId")
          .setAttribute("data-value", "0");
        document.getElementById("marketProductQuantity").value = "";

        alert("물품이 성공적으로 등록되었습니다.");
        location.reload(true);

        return;
      } else if (modalCheck === "updateMarketProduct") {
        // CASE: eco-market 물건 수정
        const id = window.location.pathname.split("/").pop();
        const name = document.getElementById("marketProductNameNew").value;
        const price = document.getElementById("marketProductPriceNew").value;
        const detail = document
          .getElementById("marketProductDetailNew")
          .value.replace(/\n/g, "<br>");
        const product_image_id = Number(
          document
            .getElementById("marketProductImagesIdNew")
            .getAttribute("data-value")
        );
        const quantity = document.getElementById(
          "marketProductQuantityNew"
        ).value;
        const status = document.querySelector(
          'input[name="productStatus"]:checked'
        ).value;

        await axios.patch(
          `${window.API_SERVER_URL}/product/eco-market/${id}`,
          {
            product_image_id,
            name,
            price,
            detail,
            quantity,
            status,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        alert("마켓 물품이 성공적으로 변경되었습니다.");
        location.reload(true);

        return;
      } else if (modalCheck === "deleteMarketProduct") {
        const pathSegments = window.location.pathname.split("/");
        const market_id = parseInt(pathSegments[2], 10);
        const id = parseInt(pathSegments[3], 10);

        await axios.delete(
          `${window.API_SERVER_URL}/product/eco-market/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        alert("마켓 물품이 성공적으로 삭제되었습니다.");
        location.href = `/eco-market/${market_id}`;

        return;
      }
    } catch (err) {
      console.error(err);
    }
  });
