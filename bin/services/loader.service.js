"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = exports.LoaderService = void 0;
/**
 * Loader Service
 *
 * This service is used to render a progress bar in the console.
 *
 */
class LoaderService {
    toUpdate = [];
    constructor(loaders) {
        loaders.forEach(loader => loader.registerService(this));
    }
    /**
     * Trigger the on update callback.
     */
    update() {
        this.toUpdate.forEach(toUpdate => toUpdate());
    }
    /**
     * Register a callback to be called when the loader is updated.
     * @param toUpdate The callback to register.
     */
    onUpdate(toUpdate) {
        this.toUpdate.push(toUpdate);
    }
    toString() {
        return '';
    }
}
exports.LoaderService = LoaderService;
/**
 * Represents a progress bar.
 */
class Loader {
    mainProgressMax;
    stepProgressMax;
    mainProgress = 0;
    stepProgress = 0;
    service;
    constructor(mainProgressMax, stepProgressMax) {
        this.mainProgressMax = mainProgressMax;
        this.stepProgressMax = stepProgressMax;
    }
    /**
     * Update the step progress.
     *
     * if stepProgress is greater or equals than stepProgressMax, the step is finished.
     * The step progress is then reset to 0. And the main progress is updated.
     *
     * @param stepProgress The step progress.
     */
    updateStepProgress(stepProgress) {
        this.stepProgress = stepProgress;
        if (this.stepProgress >= this.stepProgressMax) {
            this.stepProgress = 0;
            this.updateMainProgress(this.mainProgress + 1);
        }
        else
            this.onUpdate();
    }
    /**
     * Update the main progress.
     *
     * if mainProgress is greater or equals than mainProgressMax, the main is finished.
     * The main progress is then reset to 0.
     *
     * @param mainProgress The main progress.
     * @returns true if the main progress is finished.
     */
    updateMainProgress(mainProgress) {
        this.mainProgress = mainProgress;
        this.onUpdate();
        if (this.mainProgress >= this.mainProgressMax) {
            this.mainProgress = 0;
            return true;
        }
        return false;
    }
    /**
     * Register the loader service.
     * @param loaderService The loader service to register.
     */
    registerService(loaderService) {
        this.service = loaderService;
    }
    /**
     * Trigger the on update callback.
     * @param loader The loader that is updated.
     */
    onUpdate() {
        if (this.service)
            this.service.update();
    }
    toString() {
        return '';
    }
}
exports.Loader = Loader;
