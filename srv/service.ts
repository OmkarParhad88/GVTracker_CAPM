import cds, { Service, Request } from '@sap/cds';

export = cds.service.impl(async function (this: Service) {
    this.before('CREATE', 'GVHeaderSet', async (req: Request) => {
        const { assignGiftVouchers } = req.data;

        if (assignGiftVouchers && Array.isArray(assignGiftVouchers)) {
            for (const voucher of assignGiftVouchers) {
                const quantity = voucher.quantity;
                const giftVoucher_ID = voucher.giftVoucher_ID || (voucher.giftVoucher && voucher.giftVoucher.ID);

                if (quantity && giftVoucher_ID) {
                    // Update the GiftVoucher quantity in the database
                    await cds.update('GV_tracker.GiftVoucher')
                        .set `quantity = quantity - ${quantity}`
                        .where({ ID: giftVoucher_ID });
                }
            }
        }
    });
});