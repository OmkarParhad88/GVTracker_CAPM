using {GV_tracker as my} from '../db/schema.cds';

// using {Countries} from '@sap/cds/common';

service GV_trackerService {
    @cds.redirection.target
    entity CustomerSet     as projection on my.Customer;

    @cds.redirection.target
    entity GVHeaderSet     as projection on my.GVHeader;

    @cds.redirection.target
    @readonly
    entity GiftVoucherSet  as projection on my.GiftVoucher;

    @cds.redirection.target
    @readonly
    entity MallCampaignSet as projection on my.MallCampaign;

    @cds.redirection.target
    @readonly
    entity ShoppingMallSet as projection on my.ShoppingMall;

    @cds.redirection.target
    @readonly
    entity CustTypes       as projection on my.CustTypes;

    @cds.redirection.target
    @readonly
    entity GVRTypes        as projection on my.GVRTypes;

    @cds.redirection.targetj
    @readonly
    entity GiftTypes       as projection on my.GiftTypes;

    @cds.redirection.target
    @readonly
    entity FileTypes       as projection on my.fileTypes;

    @cds.redirection.target
    @readonly
    entity Salutations     as projection on my.Salutations;
}

annotate GV_trackerService with @requires: ['authenticated-user'];
