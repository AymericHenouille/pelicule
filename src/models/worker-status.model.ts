export type Dispatcher = 'analyse' | 'compare';

export type WorkerData<T, A> = { items: T[], chunk: T[], job: Dispatcher, argv: A };