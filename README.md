# 💳 SkipCash Web Integration (Vanilla JS)

This script provides a way to integrate **Apple Pay** with your web application using the [SkipCash] No frameworks required — works with **plain HTML and JavaScript**.

> 📚 For full API reference and backend integration steps, please refer to the [SkipCash Developer Docs](https://dev.skipcash.app/doc/api-integration/).

---

## ✨ Features

- ✅ **No frameworks required** — built for plain HTML + JavaScript.
- 💳 **Apple Pay support** — seamless integration via SkipCash.
- 🔀 **Flexible configuration** — bring your own backend endpoints.
- 🌍 **Supports QA/QAR region** — Qatar Apple Pay integration.
- 🛠️ **Zero dependencies** — lightweight and clean.

---

## 🚀 Getting Started

### 1. Include the SDK in your HTML:

```html
<script src="./skipcash-applepay/skipcash.js"></script>
```

### 2. 🔗 Add apple-pay-sdk.js for non safari browsers support

```html
  <!-- Add this tag to your <header></header> in index.html -->
  <script crossorigin 
    src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js" crossorigin="anonymous"> 
  </script>
```

## Example

```html
<!-- 
*************************************
Please refer to https://dev.skipcash.app/doc/api-integration/ for more information regarding the integration.
*************************************
-->

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VanillaJS</title>
        <script crossorigin 
        src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js" crossorigin="anonymous"> 
        </script>
    </head>

    <body style="height: 90vh;">
        <div
            style="
                width: 100%; height: 100%; display: flex; 
                flex-direction: column; justify-content: center; align-self: center;
                align-items: center;
            "
        >
            <h1>Test Apple Pay</h1>
            <h7>This is project contains vanilla-js code no frameworks used (pure html + js)</h7>
            <!-- Apple Pay Button (is hidden by default as display is none) -->
            <div id="apple-pay-button" style="display: none; margin-top: 1rem;">
                <apple-pay-button
                    buttonstyle="black"
                    onclick="initiatePayment()"
                    type="plain"
                    style="
                        width: 350px;
                        height: 35px;
                        --apple-pay-button-border-radius: 5px;
                        --apple-pay-button-padding: 3px 10px;
                        --apple-pay-button-box-sizing: content-box;
                        display: inline-block;
                        cursor: pointer;
                    "
                />
            </div>
        </div>
        <script src="./skipcash-applepay/skipcash.js"></script>
        <script type="text/javascript">
            function onApplePayCheckSuccess(){console.log("device can pay using apple pay.");document.getElementById("apple-pay-button").style.display = "block";};
            function onApplePayCheckFailure(errorMsg){
                const isApplePayJSAvailable = typeof window.ApplePaySession !== "undefined";
                if(isApplePayJSAvailable){
                    document.getElementById("apple-pay-button").style.display = "block";
                    return;
                }
                console.log(errorMsg);
            };


            function canPayWithApplePay (){
                // first parameters is the merchant id (mid), here for test we're using skipcash sandbox mid (merchant.skipcash.testpackages). 
                skipcash.sdk.canPayWithApple(
                    "", // your merchant id.
                    onApplePayCheckSuccess,
                    onApplePayCheckFailure
                );
            }

            function initiatePayment(){
                console.log("payment is initiated...");        

                const options = {
                    logs: false, // if 'true' you will get logs for each step in the apple pay process for easy debugging.
                    appleUrlValidationEndpoint: "", // used to validate the merchant ownership of the domain  
                    processApplePaymentEndpoint: "", // used to process the payment by calling skipcash API
                    countryCode: "QA", // default
                    currencyCode: "QAR", // default 
                    supportedNetworks: ["visa", "masterCard", "amex"], // through apple pay skipcash currently supports visa, master, amex 
                    merchant: "Your Business Name", // appears at the payment sheet
                    summaries: [ // optional - however if a summary item was passed, total amount should match paymentData amount
                        {label: "Tax", amount: parseFloat("0.50")},
                        {label: "Soda", amount: parseFloat("0.50")}
                    ],
                    paymentData: { // this 'paymentData' object will be sent to your payment creation endpoint as payload
                        firstName: "skipcash",
                        lastName: "test",
                        email: "test@apple.com",
                        phone: "+97412341234",
                        amount: "1.00",
                        transactionId: "sandbox1" // (optional) - should be unqiue, your internal system order id.
                    },
                    headers: { // you can pass your headers if required by your endpoints
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': '' // -> if exists, pass authroization header for your endpoint(s) protection.
                    }
                };

                function onApplePaySuccess(){console.log("Payment was successful.")}
                function onApplePayFailure(errorMsg){console.log(errorMsg);}
                function onApplePayCancelled(){console.log("Payment was cancelled!.");}

                skipcash.sdk.payWithApplePay(options, onApplePaySuccess, onApplePayFailure, onApplePayCancelled);
            }
            document.addEventListener("DOMContentLoaded", function () {
                canPayWithApplePay();
            });
        </script>
    </body>
</html>
```
