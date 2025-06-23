const https = require("https");
const querystring = require("querystring");

exports.handler = async function(event, context) {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbW91bnQiOjIwMDAsInNlcnZpY2VUeXBlIjoiQXBwIFN1YnNjcmlwdGlvbiIsIm1zaXNkbiI6Ijk2NDc4MzUwNzc4OTMiLCJvcmRlcklkIjoiOTY0NzcwMDUzMzQwNS1vcmRlcjAwMSIsInJlZGlyZWN0VXJsIjoiaHR0cHM6Ly9lb2tvbTYyc29rdTFpazYubS5waXBlZHJlYW0ubmV0IiwiaWF0IjoxNzE5MTU5MDAwLCJleHAiOjE3MTkxNzM0MDB9.uYut0Ofu7w1VZFt2LtR59KvgyUJkX1zVld5A82h1_qI";
  const merchantId = "5ffacf6612b5777c6d44266f";

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

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = "";

      res.on("data", chunk => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve({
            statusCode: 200,
            body: JSON.stringify({
              transaction_url: `https://test.zaincash.iq/transaction/pay?id=${json.id}`
            })
          });
        } catch (err) {
          resolve({ statusCode: 500, body: "Failed to parse response" });
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
