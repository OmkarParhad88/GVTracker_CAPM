import cds, { Service, Request } from '@sap/cds'


export class Customer {

	async createCustomer(request: Request) {
		const { ID, name, email } = request.data;
		// Add validation logic here
		await cds.run(INSERT.into('GV_trackerService.CustomerSet').entries({ ID, name, email }));
	}
async getCustomer(request: Request) {
		const { ID } = request.params;
		const customer = await cds.run(SELECT.from('GV_trackerService.CustomerSet').where({ ID }));
		return customer;
	}

	async updateCustomer(request: Request) {
		const { ID, name, email } = request.data;
		// Add validation logic here
		await cds.run(UPDATE('GV_trackerService.CustomerSet').set({ name, email }).where({ ID }));
	}
}