const skipcash = {
	network: {
		/**
		 * /
		 * @param {string} endpoint
		 * @param {object} headers
		 * @param {any} onSuccess
		 * @param {any} onError
		 */
		onRequest: function(endpoint, headers, payload, onSuccess, onError){
			return new Promise(function (resolve, reject) {
				fetch(endpoint, {method: "POST", headers: headers, body: JSON.stringify(payload)})
				.then(
					(response)=>{
						if (response.status === 200) {
							return response.json();
						} else {
							throw new Error(`Request to ${endpoint} failed with status code -> ${response.status}`);
						}
					}
				).then(
					(data) => {
						onSuccess && onSuccess(data);
						resolve(data);
				  	}
				).catch((error)=>{
					onError && onError(error);
					reject(error);
				})
			});
		} 
	},
	sdk: {
		/**
		 * /
		 * @param {string} merchantIdentifier
		 * @param {any} onSuccess
		 * @param {any} onError
		 */
		canPayWithApple: function (merchantIdentifier, onSuccess, onError) {

			if (!window.ApplePaySession) {
				if (onError != null) onError("Apple payment services is not available.");
				return;
			}

			if (!window.ApplePaySession.canMakePayments()) {
				if (onError != null) onError("Apple pay isn't supported or it's not enabled on this device.");
				return;
			}

			var promise =
				window.ApplePaySession.canMakePaymentsWithActiveCard(
					merchantIdentifier
				);

			promise.then(function (canMakePayments) {
				if (canMakePayments) {
					if (onSuccess != null) onSuccess();
				} else {
					if (onError != null) onError("This device can't make apple pay payment.");
				}
			});
		},

		/**
		 * /
		 * @param {any} options
		 * logs: bool - true: show logs, false: hide logs
		 * countryCode: string - country code of the amount currency
		 * currencyCode: string - currency code of the amount
		 * supportedNetworks: string - payment processing networks visa, masterCard, discover, amex...etc
		 * merchant : string - optional, merchant name
		 * paymentData: object - contains the data of the user to be used to created a new payment
		 * createPaymentEndpoint: string - merchant endpoint to create skipcash payments, 
		 * appleUrlValidationEndpoint: string - merchant endpoint to validate the merchant session for apple, 
		 * processApplePaymentEndpoint: string - merchant endpoint to process the payment by skipcash,
		 * headers: object - headers for the merchant's endpoint if required
		 */

		payWithApplePay: async function (options, onSuccess, onError, onCancel) {
			var merchantName = options.merchant ? options.merchant : "SkipCash";

			options.logs ? console.log("options ---> ", options) : null;

			options.logs ? console.log("merchant name ---> ", merchantName) : null;

			var request = {
				countryCode: options.countryCode,
				currencyCode: options.currencyCode,
				supportedNetworks: options.supportedNetworks,
				merchantCapabilities: ["supports3DS"],
				lineItems: options.summaries,
				total: { label: merchantName, amount: parseFloat(options.paymentData["amount"])},
			};

			var session = new ApplePaySession(12, request);

			options.logs ? console.log("apple session ---> ", session) : null;

			session.begin();

			session.onvalidatemerchant = function (event) {

				options.logs ? console.log("validationURL ---> ", event.validationURL) : null;

				if (!options.createPaymentEndpoint) {
					session.abort();
					onError("No endpoint url was provided for 'createPaymentEndpoint'.");
					return;
				}

				if (!options.appleUrlValidationEndpoint) {
					session.abort();
					onError("No endpoint url was provided for 'appleUrlValidationEndpoint'.");
					return;
				}

				try{
					skipcash.network.onRequest(
						options.createPaymentEndpoint,
						options.headers,
						{paymentData: options.paymentData},
						function(data) {
							options.logs ? console.log("new payment was created ---> ", data) : null;
							options.id = data.resultObj.id;
							skipcash.network.onRequest(
								options.appleUrlValidationEndpoint,
								options.headers,
								{url: event.validationURL},
								function(merchantSession){
									session.completeMerchantValidation(merchantSession);
								},
								function(error){
									session.completePayment(ApplePaySession.STATUS_FAILURE);
									onError(error);
								}
							);
						},
						function(error) {
							session.abort();
							onError(error);
						}
					);
				} catch (error) {
					session.abort();
					onError(error);
				}

			};

			session.onpaymentauthorized = async (e) => {
				var token = e.payment.token;

				skipcash.network.onRequest(
					options.processApplePaymentEndpoint,
					options.headers,
					{token,paymentId: options.id},
					function(data){
						if (data &&  data.resultObj && data.resultObj.isSuccess) {
							session.completePayment(ApplePaySession.STATUS_SUCCESS);
							onSuccess("Payment was successful.");
						} else {
							session.completePayment(ApplePaySession.STATUS_FAILURE);
							onError("Payment failed.")
						}
					},
					function(error){
						onError(error);
					}
				);
			};

			session.oncancel = () => {
				onCancel();
			};
		},
	},
};
