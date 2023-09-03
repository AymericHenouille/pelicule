"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatcherService = void 0;
const analyse_service_1 = require("./analyse.service");
const sorting_service_1 = require("./sorting.service");
class DispatcherService {
    argv;
    constructor(argv) {
        this.argv = argv;
    }
    async dispatch(dispatcher, items, chunk, update) {
        switch (dispatcher) {
            case 'hashing':
                return new analyse_service_1.AnalyseService(this.argv).hashing(items, chunk, update);
            case 'compare':
                return new analyse_service_1.AnalyseService(this.argv).compare(items, chunk, update);
            case 'dating':
                return new analyse_service_1.AnalyseService(this.argv).dating(items, chunk, update);
            case 'sorting':
                return new sorting_service_1.SortingService(this.argv).sorting(items, chunk, update);
            default:
                throw new Error(`Unknown dispatcher: ${dispatcher}`);
        }
    }
}
exports.DispatcherService = DispatcherService;
