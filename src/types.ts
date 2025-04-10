export interface QueryParams {
  _page?: string;
  _limit?: string;
  _sort?: string;
  _order?: string;

  [ key: string ]: string | undefined;
}

export interface DatabaseItem {
  id: string | number;
  [ key: string ]: any;
}

export interface Database {
  [ collection: string ]: DatabaseItem[];
}