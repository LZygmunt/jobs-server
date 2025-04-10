import type { Request } from '@tinyhttp/app';
import type { DatabaseItem, QueryParams } from '../types.js';

interface ProcessedCollection {
  data: DatabaseItem[];
  totalCount: number;
}

export const processCollection = ( collection: DatabaseItem[], req: Request ): ProcessedCollection => {
  const { _page, _limit, _sort, _order, _per_page, ...filters } = req.query as QueryParams;

  let results: DatabaseItem[] = [ ...collection ];

  Object.keys( filters ).forEach( ( key ) => {
    results = results.filter( ( item ) => {
      // Obsługa filtrów z _like (częściowe dopasowanie)
      if ( key.endsWith( '_like' ) ) {
        const actualKey = key.replace( '_like', '' );
        const filterValue = filters[ key ];
        return filterValue
          ? String( item[ actualKey ] ).toLowerCase().includes( String( filterValue ).toLowerCase() )
          : true;
      }
      // Filtry dokładne
      const filterValue = filters[ key ];
      return filterValue ? String( item[ key ] ) === String( filterValue ) : true;
    } );
  } );

  if ( _sort ) {
    const order: number = _order === 'desc' ? -1 : 1;
    results.sort( ( a, b ) => {
      if ( a[ _sort ] < b[ _sort ] ) {
        return -1 * order;
      }
      if ( a[ _sort ] > b[ _sort ] ) {
        return 1 * order;
      }
      return 0;
    } );
  }

  const page: number = _page ? parseInt( _page ) : 1;
  const LIMIT = _per_page ?? _limit;
  const limit: number = LIMIT ? parseInt( LIMIT ) : results.length;
  const startIndex: number = (
    page - 1
  ) * limit;
  const endIndex: number = page * limit;

  const totalCount: number = results.length;

  return {
    data: results.slice( startIndex, endIndex ),
    totalCount,
  };
};

export default processCollection