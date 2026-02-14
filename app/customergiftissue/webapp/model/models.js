sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
  function (JSONModel, Device) {
    "use strict";

    return {
      /**
       * Provides runtime information for the device the UI5 app is running on as a JSONModel.
       * @returns {sap.ui.model.json.JSONModel} The device model.
       */
      createDeviceModel: function () {
        var oModel = new JSONModel(Device);
        oModel.setDefaultBindingMode("OneWay");
        return oModel;
      },

      createLocalJson: function () {
        var oToday = new Date();
        var sTodayDate =
          oToday.getDate().toString().padStart(2, "0") +
          "/" +
          (oToday.getMonth() + 1).toString().padStart(2, "0") +
          "/" +
          oToday.getFullYear();
        var oCreateData = this.getBlankRequestData();
        var oAddCustomer = this.getAddCustomerBlank();
        var oModel = new JSONModel({
          Create: oCreateData,
          AddCustomer: oAddCustomer,
          TodaysDate: sTodayDate,
          CustBill: [],
          FileResponce: [],
          TotalBillValue: 0,
          HasFile:false,
          Plant: "",
          PlantName: "",
          isVerified: false,
          EmpField: false,
          Email: "",
        });
        return oModel;
      },

      getFrontCam: function () {
        return {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        };
      },

      getBackCam: function () {
        return {
          video: {
            width: { min: 1280, ideal: 1920, max: 3840 },
            height: { min: 720, ideal: 1080, max: 2160 },
            frameRate: { min: 30, ideal: 60, max: 120 },
            facingMode: "environment",
          },
        };
      },

      getBlankRequestData: function () {
        return {
          GvrTyp: "CI",
          Werks: "",
          GvrCustTyp: "MALL",
          GvrEmplyIdNam: "",
          GvrCustMoblNo: "",
          GvrTotlGiftValu: "",
          GvrCseUsrNam: "",
          GvrCustOtp: "",
          GvrCmt: "",
          GvrCampaign: "",
          GVRItemSet: [],
          GVRAttach: [],
          GVRRes: [],
        };
      },

      getAddCustomerBlank: function () {
        return {
          Plant: "",
          MobileNo: "",
          MobCont: "91",
          Title: "",
          CustName: "",
          CustEmail: "",
        };
      },
    };
  }
);
