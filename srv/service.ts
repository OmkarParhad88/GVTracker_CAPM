// import cds from '@sap/cds';

// class GV_trackerService extends LCAPApplicationService {
//     async init() {

//         this.before('CREATE', 'CustomerSet', async (request) => {
//             await customerset_Logic(request);
//         });

//         return super.init();
//     }
// }


// module.exports = {
//     GV_trackerService
// };


// import cds, { Service, Request } from '@sap/cds'
// import { Customer } from './code/customer'

// export = cds.service.impl(function (this: Service) {
//     const LOG = cds.log('gv_tracker')

//     // this.before('CREATE', 'CustomerSet', async (request: Request) => {
//     //     await Customer
//     // });
// })