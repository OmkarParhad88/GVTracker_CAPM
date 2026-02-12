using { GV_tracker as my } from '../db/schema.cds';

@path : '/service/GV_trackerService'
service GV_trackerService
{
}

annotate GV_trackerService with @requires :
[
    'authenticated-user'
];
