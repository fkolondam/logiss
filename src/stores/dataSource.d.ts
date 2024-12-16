declare module '@/stores/dataSource' {
  import { Store } from 'pinia';

  interface DataSourceStore {
    provider: {
      fetch: (type: string, options?: any) => Promise<any>;
    };
    switchDataSource: (sourceType: string) => Promise<void>;
  }

  export const useDataSourceStore: () => DataSourceStore;
}
