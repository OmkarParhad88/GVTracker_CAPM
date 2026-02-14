sap.ui.define([
    "sap/ui/core/UIComponent",
    "customergiftissue/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("customergiftissue.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {

             // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            //set the local model
            this.setModel(models.createLocalJson(), "zFilterModel");
            // enable routing 
            if(this.getModel()){
                var sPath="/ShoppingMallSet";
                var oModel = this.getModel();
                var othis = this;
                var mParam={
                    success:function(oData,resp){
                        othis.getRouter().initialize();
                        if (oData && oData.results.length > 0) {
                            othis.getModel('zFilterModel').getData().Plant = oData.results[0].Plant;
                            othis.getModel('zFilterModel').getData().PlantName = `${oData.results[0].Plant} - ${oData.results[0].Name}`;
                            othis.getModel('zFilterModel').updateBindings();
                        } else {
                        }
                    },
                    error:function(error){
                    }
                }
                oModel.read(sPath,mParam);
                oModel.setSizeLimit(1000);
            }
            // enable routing
            this.getRouter().initialize();
        }
    });
});