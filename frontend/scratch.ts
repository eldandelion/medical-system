import { computeAvailableActions } from './src/utils/actionUtils';

const ref: any = { status: 'Rejected', extendedData: {} };
console.log('Actions for Rejected (No rejectedBy):', computeAvailableActions(ref, 'Bearer trial_admin'));

const ref4: any = { status: 'AwaitingTriage', extendedData: {} };
console.log('Actions for id=4 AwaitingTriage:', computeAvailableActions(ref4, 'Bearer trial_admin'));
