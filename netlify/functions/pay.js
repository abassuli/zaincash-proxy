const https = require("https");
const querystring = require("querystring");
const jwt = require("jsonwebtoken"); // تأكد تكون مثبتة

exports.handler = async function(event, context) {
  // ✅ بيانات التاجر التجريبية من الوثائق
  const merchantId = "5ffacf6612b5777c6d44266f";
  const msisdn = "9647835077893"; // رقم محفظة التاجر (وليس الزبون)
  const secret = "$2y$10$hBbAZo2GfSSvyqAyV2SaqOfYewgYpfR1O19gIh4SqyGWdmySZYPuS";

  // ⏱ الوقت الحالي والانتهاء بعد 4 ساعات
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 4 * 60 * 60;

  // 🧾 بيانات العملية
  const payload = {
    amount: 2000, // لازم أكثر من 250
    serviceType: "Test Payment",
    msisdn: msisdn,
    orderId: "order_" + Date.now(),
    redirectUrl: "https://eokom62soku1ik6.m.pipedream.net", // غيّره لاحقًا إذا تريد
    iat: iat,
    exp: exp
  };

  // 🔐 توليد التوكن
  const token = jwt.sign(payload, secret, { algorithm: "HS256" });

  // 📦 تجهيز البيانات للإرسال
  const postData = querystring.stringify({
    token,
    merchantId,
    lang: "en"
  });

  const options = {
    hostname: "test.zaincash.iq",
    path: "/transaction/init",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length
    }
  };

  // 🔁 تنفيذ الطلب
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = "";

      res.on("data", chunk => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          console.log("ZainCash response:", json);

          if (json.id) {
            resolve({
              statusCode: 200,
              body: JSON.stringify({
                transaction_url: `https://test.zaincash.iq/transaction/pay?id=${json.id}`
              })
            });
          } else {
            resolve({
              statusCode: 500,
              body: JSON.stringify({
                error: "No id returned from ZainCash",
                rawResponse: json
              })
            });
          }
        } catch (err) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to parse response", details: err.message, rawBody: body })
          });
        }
      });
    });

    req.on("error", error => {
      reject({ statusCode: 500, body: error.toString() });
    });

    req.write(postData);
    req.end();
  });
};
